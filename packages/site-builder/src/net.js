// One GET at a time, safely: never follows redirects (the caller decides), never reads more than
// maxBytes, and by default refuses hosts that resolve to private addresses. The address is
// checked in the lookup used to connect, so a second DNS answer cannot point elsewhere.
import dns from 'node:dns'
import http from 'node:http'
import https from 'node:https'
import net from 'node:net'
import zlib from 'node:zlib'

export const USER_AGENT = 'HosaitSiteBuilder/0.1 (+https://hosait.com)'

// IPv6 ranges that are never a public website: unspecified, loopback, unique local, link-local,
// site-local and multicast.
const PRIVATE6 = new net.BlockList()
PRIVATE6.addAddress('::', 'ipv6')
PRIVATE6.addAddress('::1', 'ipv6')
for (const [prefix, bits] of [['fc00::', 7], ['fe80::', 10], ['fec0::', 10], ['ff00::', 8]]) PRIVATE6.addSubnet(prefix, bits, 'ipv6')
// IPv6 forms that carry an IPv4 address, and the byte it starts at: IPv4-mapped, IPv4-compatible,
// NAT64 and 6to4. The IPv4 rules decide for them.
const CARRIES_IPV4 = [['::ffff:0:0', 96, 12], ['::', 96, 12], ['64:ff9b::', 96, 12], ['2002::', 16, 2]].map(([prefix, bits, at]) => {
  const list = new net.BlockList()
  list.addSubnet(prefix, bits, 'ipv6')
  return { list, at }
})

/** The 16 bytes of an address net.isIPv6 accepts, without a zone. */
function ipv6Bytes(ip) {
  let s = ip
  const dotted = /(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(s)
  if (dotted) {
    const [a, b, c, d] = dotted.slice(1).map(Number)
    s = s.slice(0, dotted.index) + ((a << 8) | b).toString(16) + ':' + ((c << 8) | d).toString(16)
  }
  const [head, tail] = s.split('::')
  const h = head ? head.split(':') : []
  const t = tail ? tail.split(':') : []
  const groups = tail === undefined ? h : [...h, ...Array(8 - h.length - t.length).fill('0'), ...t]
  return groups.flatMap((g) => [parseInt(g, 16) >> 8, parseInt(g, 16) & 255])
}

/** @param {string} ip */
export function isPublicAddress(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number)
    if (a === 0 || a === 10 || a === 127 || a >= 224) return false
    if (a === 100 && b >= 64 && b <= 127) return false
    if (a === 169 && b === 254) return false
    if (a === 172 && b >= 16 && b <= 31) return false
    if (a === 192 && (b === 168 || b === 0)) return false
    if (a === 198 && (b === 18 || b === 19)) return false
    return true
  }
  if (net.isIPv6(ip)) {
    const v = ip.split('%')[0]
    if (PRIVATE6.check(v, 'ipv6')) return false
    for (const { list, at } of CARRIES_IPV4) if (list.check(v, 'ipv6')) return isPublicAddress(ipv6Bytes(v).slice(at, at + 4).join('.'))
    return true
  }
  return false
}

export function publicOnlyLookup(hostname, options, callback) {
  dns.lookup(hostname, { all: true }, (err, addresses) => {
    if (err) return callback(err)
    if (!addresses.length || addresses.some((a) => !isPublicAddress(a.address))) {
      return callback(Object.assign(new Error(`${hostname} resolves to a private address`), { code: 'EPRIVATE' }))
    }
    if (options && options.all) return callback(null, addresses)
    callback(null, addresses[0].address, addresses[0].family)
  })
}

const privateError = (url, what) => Object.assign(new Error(`${url}: ${what} is a private address`), { code: 'EPRIVATE' })

/**
 * @param {string} url
 * @param {{ maxBytes?: number, timeoutMs?: number, deadlineMs?: number, allowPrivate?: boolean, accept?: string }} [opts]
 * @returns {Promise<{ status: number, headers: import('node:http').IncomingHttpHeaders, body: Buffer, truncated: boolean }>}
 */
export function get(url, { maxBytes = 2 * 1024 * 1024, timeoutMs = 15000, deadlineMs = 30000, allowPrivate = false, accept = '*/*' } = {}) {
  let u
  try { u = new URL(url) } catch { return Promise.reject(new Error(`${url}: not a URL`)) }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return Promise.reject(new Error(`${url}: only http and https`))
  if (!allowPrivate && u.port && u.port !== (u.protocol === 'https:' ? '443' : '80')) return Promise.reject(new Error(`${url}: only standard ports`))
  // An IP address in the URL never reaches the lookup, so it is checked here (URL has
  // already turned decimal and hex forms into dotted ones).
  const host = u.hostname.replace(/^\[|\]$/g, '')
  if (!allowPrivate && net.isIP(host) && !isPublicAddress(host)) return Promise.reject(privateError(url, host))
  const mod = u.protocol === 'https:' ? https : http
  return new Promise((resolve, reject) => {
    let settled = false
    let timer
    const done = (fn, v) => { if (settled) return; settled = true; clearTimeout(timer); fn(v) }
    const options = { headers: { 'User-Agent': USER_AGENT, Accept: accept, 'Accept-Encoding': 'gzip, br' }, timeout: timeoutMs }
    if (!allowPrivate) options.lookup = publicOnlyLookup
    const req = mod.get(u, options, (res) => {
      const enc = String(res.headers['content-encoding'] || '')
      const stream = enc.includes('br') ? res.pipe(zlib.createBrotliDecompress()) : enc.includes('gzip') ? res.pipe(zlib.createGunzip()) : res
      const chunks = []
      let size = 0
      let truncated = false
      const finish = () => done(resolve, { status: res.statusCode || 0, headers: res.headers, body: Buffer.concat(chunks), truncated })
      const fail = (e) => (truncated ? finish() : done(reject, e))
      stream.on('data', (c) => {
        if (truncated) return
        size += c.length
        if (size > maxBytes) {
          truncated = true
          chunks.push(c.subarray(0, c.length - (size - maxBytes)))
          res.destroy()
          if (stream !== res) stream.destroy()
          finish()
        } else chunks.push(c)
      })
      stream.on('end', finish)
      stream.on('error', fail)
      // pipe() does not pass the response's own errors on to the decompressor.
      res.on('aborted', () => fail(new Error(`${url}: connection closed early`)))
      res.on('error', fail)
      res.on('close', () => { if (!res.complete) fail(new Error(`${url}: connection closed early`)) })
    })
    // Belt and braces: whatever was resolved, the address actually connected to must be public.
    if (!allowPrivate) {
      req.on('socket', (s) => s.once('connect', () => {
        if (s.remoteAddress && !isPublicAddress(s.remoteAddress)) req.destroy(privateError(url, s.remoteAddress))
      }))
    }
    timer = setTimeout(() => req.destroy(new Error(`${url}: took longer than ${deadlineMs / 1000} s`)), deadlineMs)
    req.on('timeout', () => req.destroy(new Error(`${url}: timed out`)))
    req.on('error', (e) => done(reject, e))
  })
}
