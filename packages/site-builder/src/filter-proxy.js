// The screenshot browser's only way out (compare). Chromium is started with this as the proxy for
// every request, loopback included, so it never resolves a name itself: the proxy resolves each
// name when it connects and refuses a private address. A redirect, an iframe, fetch, a WebSocket
// or a name that turns private (DNS rebinding) cannot reach the intranet or a metadata service.
// Only the new site's own host and port may be private, and only when `allow` names them
// (--allow-private). Off the new site, only ports 80 and 443, as the fetcher (net.js).
import crypto from 'node:crypto'
import dns from 'node:dns'
import http from 'node:http'
import net from 'node:net'

import { isPublicAddress } from './net.js'

const STANDARD = new Set(['80', '443'])
const IDLE_MS = 30_000
const FORBIDDEN = 'HTTP/1.1 403 Forbidden\r\nContent-Length: 0\r\nConnection: close\r\n\r\n'
const ASK_PASSWORD = 'HTTP/1.1 407 Proxy Authentication Required\r\nProxy-Authenticate: Basic realm="compare"\r\nContent-Length: 0\r\nConnection: close\r\n\r\n'

/** Host (lower case, without IPv6 brackets) and port of a CONNECT target, as written; port 80 stays 80. */
export function connectTarget(target) {
  const m = /^\[([^\]]+)\]:(\d{1,5})$/.exec(target) ?? /^([^:[\]]+):(\d{1,5})$/.exec(target)
  return m ? { host: m[1].toLowerCase(), port: m[2] } : null
}

/** Host (without IPv6 brackets, lower case) and port of an absolute URL or a CONNECT target. */
function target(u, defaultPort) {
  return { host: u.hostname.replace(/^\[|\]$/g, '').toLowerCase(), port: u.port || defaultPort }
}

/**
 * Only the browser compare starts may use it (a random user name and password, passed to
 * Playwright), at most `maxConnections` at a time, each for at most `maxConnectionMs`.
 * @param {{ allow?: { host: string, port: string } | null, lookup?: typeof dns.lookup, maxConnections?: number, maxConnectionMs?: number }} [opts]
 * @returns {Promise<{ url: string, username: string, password: string, close: () => Promise<void> }>}
 */
export async function startFilterProxy({ allow = null, lookup = dns.lookup, maxConnections = 64, maxConnectionMs = 120_000 } = {}) {
  const username = crypto.randomBytes(6).toString('hex')
  const password = crypto.randomBytes(24).toString('hex')
  const expected = Buffer.from(`Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`)
  const authorized = (req) => {
    const got = Buffer.from(String(req.headers['proxy-authorization'] ?? ''))
    return got.length === expected.length && crypto.timingSafeEqual(got, expected)
  }
  const isNewSite = (t) => !!allow && t.host === allow.host.replace(/^\[|\]$/g, '').toLowerCase() && t.port === String(allow.port)
  // Why the browser may not go there before anything is resolved, or null. An address in the URL
  // never reaches the lookup, so it is checked here.
  const refused = (t) => {
    if (isNewSite(t)) return null
    if (!STANDARD.has(t.port)) return 'only ports 80 and 443'
    if (net.isIP(t.host) && !isPublicAddress(t.host)) return 'a private address'
    return null
  }
  // A dns.lookup for http.request and net.connect that refuses a private answer, except for the new site.
  const lookupFor = (t) => (hostname, options, cb) =>
    lookup(hostname, { all: true }, (err, addresses) => {
      if (err) return cb(err)
      if (!addresses.length || (!isNewSite(t) && addresses.some((a) => !isPublicAddress(a.address)))) {
        return cb(Object.assign(new Error(`${hostname} resolves to a private address`), { code: 'EPRIVATE' }))
      }
      if (options && options.all) return cb(null, addresses)
      cb(null, addresses[0].address, addresses[0].family)
    })

  const sockets = new Set()
  const server = http.createServer((req, res) => {
    if (!authorized(req)) return res.writeHead(407, { 'proxy-authenticate': 'Basic realm="compare"' }).end()
    let u
    try { u = new URL(req.url ?? '') } catch { return res.writeHead(400).end() }
    if (u.protocol !== 'http:') return res.writeHead(400).end()
    const t = target(u, '80')
    if (refused(t)) return res.writeHead(403, { 'content-type': 'text/plain' }).end('Blocked by the screenshot proxy')
    const headers = { ...req.headers }
    delete headers['proxy-connection']
    delete headers['proxy-authorization']
    const out = http.request({ host: t.host, port: Number(t.port), method: req.method, path: u.pathname + u.search, headers, lookup: lookupFor(t), agent: false, timeout: IDLE_MS }, (r) => {
      res.writeHead(r.statusCode ?? 502, r.headers)
      r.pipe(res)
    })
    out.on('timeout', () => out.destroy(new Error('timeout')))
    out.on('error', (e) => { if (res.headersSent) res.destroy(); else res.writeHead(e.code === 'EPRIVATE' ? 403 : 502).end() })
    req.pipe(out)
  })
  // HTTPS and secure WebSockets: a tunnel to a checked address. The proxy never sees inside it.
  server.on('connect', (req, socket, head) => {
    if (!authorized(req)) return socket.end(ASK_PASSWORD)
    const t = connectTarget(req.url ?? '')
    if (!t || refused(t)) return socket.end(FORBIDDEN)
    let open = false
    const up = net.connect({ host: t.host, port: Number(t.port), lookup: lookupFor(t) }, () => {
      open = true
      socket.write('HTTP/1.1 200 Connection Established\r\n\r\n')
      if (head?.length) up.write(head)
      up.pipe(socket)
      socket.pipe(up)
    })
    up.setTimeout(IDLE_MS, () => up.destroy())
    up.on('error', () => (open ? socket.destroy() : socket.end(FORBIDDEN)))
    socket.on('error', () => up.destroy())
    socket.on('close', () => up.destroy())
  })
  // A plain WebSocket (ws://) is not opened: compare closes WebSockets anyway.
  server.on('upgrade', (_req, socket) => socket.end(FORBIDDEN))
  server.maxConnections = maxConnections
  server.on('connection', (s) => {
    sockets.add(s)
    const limit = setTimeout(() => s.destroy(), maxConnectionMs)
    s.on('close', () => { sockets.delete(s); clearTimeout(limit) })
  })

  await new Promise((ok, fail) => server.listen(0, '127.0.0.1', ok).on('error', fail))
  const { port } = /** @type {import('node:net').AddressInfo} */ (server.address())
  return {
    url: `http://127.0.0.1:${port}`,
    username,
    password,
    close: () => new Promise((ok) => { server.close(() => ok()); for (const s of sockets) s.destroy() }),
  }
}
