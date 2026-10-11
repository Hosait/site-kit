/**
 * Downloads one media file named in a site plan. Plans can be written by an AI from a crawled
 * site, so every URL is untrusted: https only, port 443, public addresses only (checked when
 * connecting, so a second DNS answer cannot point elsewhere), at most 3 redirects and 25 MB.
 */
import dns from 'node:dns'
import https from 'node:https'
import net from 'node:net'

export const MAX_MEDIA_BYTES = 25 * 1024 * 1024

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
    const v = ip.toLowerCase()
    if (v === '::' || v === '::1') return false
    const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(v)
    if (mapped) return isPublicAddress(mapped[1])
    if (/^f[cd]/.test(v) || /^fe[89ab]/.test(v) || /^ff/.test(v)) return false
    return true
  }
  return false
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

export async function fetchMedia(url: string, opts: FetchOptions = {}): Promise<{ data: Buffer; mimetype: string; name: string }> {
  const { redirects = 3, deadlineMs = 120_000, request = https.get } = opts
  const u = new URL(url)
  if (u.protocol !== 'https:') throw new Error(`${url}: only https media can be imported`)
  if (u.port && u.port !== '443') throw new Error(`${url}: only the standard https port`)
  // An IP address in the URL never reaches the lookup, so it is checked here (URL has already
  // turned decimal and hex forms into dotted ones).
  const host = u.hostname.replace(/^\[|\]$/g, '')
  if (net.isIP(host) && !isPublicAddress(host)) throw privateError(url, host)
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
      res.on('end', () =>
        done(resolve, { data: Buffer.concat(chunks), mimetype: String(res.headers['content-type'] || 'application/octet-stream').split(';')[0].trim(), name }),
      )
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
