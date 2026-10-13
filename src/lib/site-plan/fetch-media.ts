/**
 * Downloads one media file named in a site plan. Plans can be written by an AI from a crawled
 * site, so every URL is untrusted: https only, port 443, public addresses only (checked when
 * connecting, so a second DNS answer cannot point elsewhere), at most 3 redirects and 25 MB.
 * The file type is read from the file's first bytes, not from the server's Content-Type, and
 * only images, video and PDF are accepted.
 */
import dns from 'node:dns'
import https from 'node:https'
import net from 'node:net'

export const MAX_MEDIA_BYTES = 25 * 1024 * 1024

const ALLOWED_TYPES = 'JPEG, PNG, WebP, GIF, AVIF, MP4, WebM or PDF'
// File types the import never takes from a URL; they go into seed/ as local files instead.
// By a URL's extension: documents the import takes only from seed/, and types it never imports.
const LOCAL_ONLY = new Set(['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'dwg'])
const NOT_IMPORTED = new Set(['odt', 'ods', 'odp', 'rtf', 'csv', 'txt', 'mov', 'avi', 'mkv', 'wmv', 'htm', 'html', 'json', 'xml'])
const MP4_BRANDS = new Set(['isom', 'iso2', 'iso5', 'iso6', 'mp41', 'mp42', 'avc1', 'M4V ', 'dash'])

/** The media type from a file's first bytes, or null when it is not one Site Kit imports. */
export function sniffMediaType(b: Buffer): string | null {
  const at = (offset: number, s: string) => b.length >= offset + s.length && b.toString('latin1', offset, offset + s.length) === s
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg'
  if (at(0, '\x89PNG\r\n\x1a\n')) return 'image/png'
  if (at(0, 'GIF87a') || at(0, 'GIF89a')) return 'image/gif'
  if (at(0, 'RIFF') && at(8, 'WEBP')) return 'image/webp'
  if (at(4, 'ftyp')) {
    const brand = b.toString('latin1', 8, 12)
    if (brand === 'avif' || brand === 'avis') return 'image/avif'
    if (MP4_BRANDS.has(brand)) return 'video/mp4'
  }
  if (b.length >= 4 && b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return 'video/webm'
  if (at(0, '%PDF-')) return 'application/pdf'
  return null
}

export function isPublicAddress(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number)
    if (a === 0 || a === 10 || a === 127 || a >= 224) return false
    if (a === 100 && b >= 64 && b <= 127) return false // carrier-grade NAT
    if (a === 169 && b === 254) return false // link-local
    if (a === 172 && b >= 16 && b <= 31) return false
    if (a === 192 && (b === 168 || b === 0)) return false
    if (a === 198 && (b === 18 || b === 19)) return false // benchmarking
    return true
  }
  if (net.isIPv6(ip)) {
    const h = ipv6Hextets(ip)
    const v4 = (hi: number, lo: number) => `${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`
    const zero = (from: number, to: number) => h.slice(from, to).every((x) => x === 0)
    if (zero(0, 8) || (zero(0, 7) && h[7] === 1)) return false // :: and ::1
    // Forms that carry an IPv4 address: the IPv4 rules decide.
    if (zero(0, 5) && h[5] === 0xffff) return isPublicAddress(v4(h[6], h[7])) // ::ffff:a.b.c.d
    if (zero(0, 6)) return isPublicAddress(v4(h[6], h[7])) // ::a.b.c.d (compatible)
    if (h[0] === 0x64 && h[1] === 0xff9b && zero(2, 6)) return isPublicAddress(v4(h[6], h[7])) // NAT64 64:ff9b::/96
    if (h[0] === 0x2002) return isPublicAddress(v4(h[1], h[2])) // 6to4 2002::/16
    if (zero(0, 4) && h[4] === 0xffff && h[5] === 0) return false // SIIT ::ffff:0:0:0/96
    if (h[0] === 0x64 && h[1] === 0xff9b && h[2] === 1) return false // local-use NAT64 64:ff9b:1::/48
    if (h[0] === 0x2001 && (h[1] === 0 || h[1] === 0xdb8)) return false // Teredo 2001::/32, documentation 2001:db8::/32
    if ((h[0] & 0xfe00) === 0xfc00) return false // unique local fc00::/7
    if ((h[0] & 0xffc0) === 0xfe80 || (h[0] & 0xffc0) === 0xfec0) return false // link-local, site-local
    if ((h[0] & 0xff00) === 0xff00) return false // multicast
    return true
  }
  return false
}

/** The eight 16-bit groups of an IPv6 address (a trailing dotted IPv4 part included). */
function ipv6Hextets(ip: string): number[] {
  let s = ip.toLowerCase().split('%')[0]
  const dotted = /(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(s)
  if (dotted) {
    const [a, b, c, d] = dotted.slice(1).map(Number)
    s = s.slice(0, dotted.index) + `${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`
  }
  const [head, tail] = s.split('::')
  const part = (x: string | undefined) => (x ? x.split(':').map((g) => parseInt(g, 16)) : [])
  const left = part(head)
  const right = part(tail)
  return tail === undefined ? left : [...left, ...new Array(8 - left.length - right.length).fill(0), ...right]
}

// Node calls this with { all: true } when it wants every address (happy eyeballs).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function publicOnlyLookup(hostname: string, options: any, callback: any): void {
  dns.lookup(hostname, { all: true }, (err, addresses) => {
    if (err) return callback(err)
    const list = addresses as dns.LookupAddress[]
    if (!list.length || list.some((a) => !isPublicAddress(a.address))) {
      return callback(Object.assign(new Error(`${hostname} resolves to a private address`), { code: 'EPRIVATE' }))
    }
    if (options && options.all) return callback(null, list)
    callback(null, list[0].address, list[0].family)
  })
}

/** The file name in a URL, decoded when it is valid percent-encoding and kept as it is otherwise. */
export function mediaName(u: URL): string {
  const raw = u.pathname.split('/').pop() || 'file'
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

type FetchOptions = { redirects?: number; deadlineMs?: number; request?: typeof https.get }
const privateError = (url: string, what: string) => Object.assign(new Error(`${url}: ${what} is a private address`), { code: 'EPRIVATE' })

/**
 * Why the import would refuse this media URL before connecting, or null. Also used by
 * kit:check-plan, so a plan learns it before anything is uploaded.
 */
export function mediaUrlProblem(url: string): { message: string; private?: boolean } | null {
  let u: URL
  try {
    u = new URL(url)
  } catch {
    return { message: 'not a valid URL' }
  }
  if (u.protocol !== 'https:') return { message: 'only https media can be imported' }
  if (u.port && u.port !== '443') return { message: 'only the standard https port' }
  // An IP address in the URL never reaches the lookup, so it is checked here (URL has already
  // turned decimal and hex forms into dotted ones).
  const host = u.hostname.replace(/^\[|\]$/g, '')
  if (net.isIP(host) && !isPublicAddress(host)) return { message: `${host} is a private address`, private: true }
  const ext = /\.([a-z0-9]{1,5})$/i.exec(u.pathname)?.[1]?.toLowerCase()
  if (ext === 'svg' || ext === 'svgz') return { message: 'SVG is not imported; put the logo in public/brand/ by hand' }
  if (ext && LOCAL_ONLY.has(ext)) return { message: `a .${ext} file cannot be imported from a URL; download it into seed/media/ and list it under documents` }
  if (ext && NOT_IMPORTED.has(ext)) return { message: `a .${ext} file is not a type Site Kit imports (media: JPEG, PNG, WebP, GIF, AVIF, MP4 or WebM; documents: PDF, Word, Excel, PowerPoint, zip or DWG)` }
  return null
}

export async function fetchMedia(url: string, opts: FetchOptions = {}): Promise<{ data: Buffer; mimetype: string; name: string }> {
  const { redirects = 3, deadlineMs = 120_000, request = https.get } = opts
  const problem = mediaUrlProblem(url)
  if (problem) throw Object.assign(new Error(`${url}: ${problem.message}`), problem.private ? { code: 'EPRIVATE' } : {})
  const u = new URL(url)
  const name = mediaName(u)
  return new Promise((resolve, reject) => {
    let settled = false
    const done = <T,>(fn: (v: T) => void, v: T) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      fn(v)
    }
    const req = request(u, { lookup: publicOnlyLookup as never, headers: { 'User-Agent': 'SiteKit-seed/1.0' }, timeout: 30_000 }, (res) => {
      const status = res.statusCode ?? 0
      if (status >= 300 && status < 400 && res.headers.location) {
        res.resume()
        if (redirects <= 0) return done(reject, new Error(`${url}: too many redirects`))
        return done(resolve, fetchMedia(new URL(res.headers.location, u).toString(), { ...opts, redirects: redirects - 1 }) as never)
      }
      if (status !== 200) {
        res.resume()
        return done(reject, new Error(`${url}: HTTP ${status}`))
      }
      if (Number(res.headers['content-length'] || 0) > MAX_MEDIA_BYTES) {
        res.destroy()
        return done(reject, new Error(`${url}: larger than 25 MB`))
      }
      const chunks: Buffer[] = []
      let size = 0
      res.on('data', (c: Buffer) => {
        size += c.length
        if (size > MAX_MEDIA_BYTES) {
          res.destroy()
          done(reject, new Error(`${url}: larger than 25 MB`))
        } else chunks.push(c)
      })
      res.on('end', () => {
        const data = Buffer.concat(chunks)
        const mimetype = sniffMediaType(data)
        if (!mimetype) return done(reject, new Error(`${url}: not an allowed file type (${ALLOWED_TYPES})`))
        done(resolve, { data, mimetype, name })
      })
      res.on('error', (e: Error) => done(reject, e))
    })
    // Whatever was resolved, the address actually connected to must be public.
    req.on('socket', (s: import('node:net').Socket) =>
      s.once('connect', () => {
        if (s.remoteAddress && !isPublicAddress(s.remoteAddress)) req.destroy(privateError(url, s.remoteAddress))
      }),
    )
    // An overall limit: the socket timeout only notices silence, not a host that drips bytes.
    const timer = setTimeout(() => req.destroy(new Error(`${url}: took longer than ${deadlineMs / 1000} s`)), deadlineMs)
    req.on('timeout', () => req.destroy(new Error(`${url}: timed out`)))
    req.on('error', (e: Error) => done(reject, e))
  })
}
