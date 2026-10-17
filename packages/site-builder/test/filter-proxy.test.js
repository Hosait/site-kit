import assert from 'node:assert/strict'
import http from 'node:http'
import { test } from 'node:test'

import { connectTarget, startFilterProxy } from '../src/filter-proxy.js'
import { serve } from './server.js'

// Bjørn's review of #8: the browser's route check sees only the first address of a redirect, and
// the browser resolves names itself. Its only way out is now this proxy, which resolves each name
// when it connects and refuses a private address (src/filter-proxy.js).

/** A request through the proxy in absolute form, as a browser sends it to an HTTP proxy. */
const auth = (proxy) => (proxy.username ? { 'proxy-authorization': 'Basic ' + Buffer.from(`${proxy.username}:${proxy.password}`).toString('base64') } : {})
function viaProxy(proxyUrl, target, headers = {}) {
  const p = new URL(proxyUrl)
  return new Promise((ok, fail) => {
    const req = http.request({ host: p.hostname, port: p.port, method: 'GET', path: target, headers: { host: new URL(target).host, ...headers } }, (res) => {
      let body = ''
      res.on('data', (c) => (body += c))
      res.on('end', () => ok({ status: res.statusCode, body }))
    })
    req.on('error', fail)
    req.end()
  })
}

/** A CONNECT through the proxy: its status, and the tunnel when it is open. */
function connectVia(proxyUrl, hostPort, headers = {}) {
  const p = new URL(proxyUrl)
  return new Promise((ok, fail) => {
    const req = http.request({ host: p.hostname, port: p.port, method: 'CONNECT', path: hostPort, headers })
    req.on('connect', (res, socket) => ok({ status: res.statusCode, socket }))
    req.on('error', fail)
    req.end()
  })
}

const portOf = (url) => new URL(url).port

test('only the new site\'s own host and port may be private: the proxy forwards to it and refuses every other private address', async () => {
  const site = await serve({ '/': { body: 'new site' } })
  const internal = await serve({ '/secret': { body: 'secret' } })
  const proxy = await startFilterProxy({ allow: { host: '127.0.0.1', port: portOf(site.url) } })
  try {
    assert.deepEqual(await viaProxy(proxy.url, `${site.url}/`, auth(proxy)), { status: 200, body: 'new site' })
    for (const target of [`${internal.url}/secret`, `http://localhost:${portOf(internal.url)}/secret`, 'http://169.254.169.254/latest/meta-data/']) {
      assert.equal((await viaProxy(proxy.url, target, auth(proxy))).status, 403, target)
    }
    assert.deepEqual(internal.requests, [])
  } finally { await proxy.close(); await site.close(); await internal.close() }
})

test('without --allow-private, the new site on a private address is refused too', async () => {
  const site = await serve({ '/': { body: 'new site' } })
  const proxy = await startFilterProxy({ allow: null })
  try {
    assert.equal((await viaProxy(proxy.url, `${site.url}/`, auth(proxy))).status, 403)
    assert.deepEqual(site.requests, [])
  } finally { await proxy.close(); await site.close() }
})

test('a name is resolved when the proxy connects, so one that turns private (DNS rebinding) is refused; so is a non-standard port', async () => {
  const asked = []
  const lookup = (host, _o, cb) => { asked.push(host); cb(null, [{ address: '127.0.0.1', family: 4 }]) }
  const internal = await serve({ '/': { body: 'internal' } })
  const proxy = await startFilterProxy({ allow: null, lookup })
  try {
    assert.equal((await viaProxy(proxy.url, 'http://fjordlys.example/', auth(proxy))).status, 403)
    assert.deepEqual(asked, ['fjordlys.example'])
    assert.equal((await viaProxy(proxy.url, 'http://93.184.216.34:8080/', auth(proxy))).status, 403, 'only ports 80 and 443 off the new site')
    assert.deepEqual(internal.requests, [])
  } finally { await proxy.close(); await internal.close() }
})

test('CONNECT (HTTPS, secure WebSockets): the new site is tunnelled, other private addresses are refused', async () => {
  const site = await serve({ '/': { body: 'new site' } })
  const internal = await serve({ '/': { body: 'internal' } })
  const proxy = await startFilterProxy({ allow: { host: '127.0.0.1', port: portOf(site.url) } })
  try {
    const open = await connectVia(proxy.url, `127.0.0.1:${portOf(site.url)}`, auth(proxy))
    assert.equal(open.status, 200)
    const answer = await new Promise((ok) => {
      let text = ''
      open.socket.on('data', (c) => { text += c; if (text.includes('new site')) { open.socket.destroy(); ok(text) } })
      open.socket.write(`GET / HTTP/1.1\r\nHost: 127.0.0.1:${portOf(site.url)}\r\nConnection: close\r\n\r\n`)
    })
    assert.match(answer, /^HTTP\/1\.1 200/)
    for (const target of [`127.0.0.1:${portOf(internal.url)}`, '169.254.169.254:443', '10.0.0.5:443']) {
      const refused = await connectVia(proxy.url, target, auth(proxy))
      assert.equal(refused.status, 403, target)
      refused.socket.destroy()
    }
    assert.deepEqual(internal.requests, [])
  } finally { await proxy.close(); await site.close(); await internal.close() }
})

test('a plain WebSocket upgrade is refused, and close() stops the proxy', async () => {
  const site = await serve({ '/': { body: 'new site' } })
  const proxy = await startFilterProxy({ allow: { host: '127.0.0.1', port: portOf(site.url) } })
  const ws = await viaProxy(proxy.url, `${site.url}/socket`, { ...auth(proxy), connection: 'Upgrade', upgrade: 'websocket', 'sec-websocket-version': '13', 'sec-websocket-key': 'dGhlIHNhbXBsZSBub25jZQ==' })
  assert.equal(ws.status, 403)
  await proxy.close()
  await assert.rejects(viaProxy(proxy.url, `${site.url}/`, auth(proxy)))
  await site.close()
})

// Bjørn's review of #8, round 3.
test('the proxy asks for its own random password, so another local process cannot use it', async () => {
  const site = await serve({ '/': { body: 'new site' } })
  const proxy = await startFilterProxy({ allow: { host: '127.0.0.1', port: portOf(site.url) } })
  try {
    assert.match(proxy.username, /^[a-z0-9]{8,}$/)
    assert.ok(proxy.password.length >= 32)
    assert.equal((await viaProxy(proxy.url, `${site.url}/`)).status, 407)
    assert.equal((await viaProxy(proxy.url, `${site.url}/`, { 'proxy-authorization': 'Basic ' + Buffer.from('x:y').toString('base64') })).status, 407)
    const tunnel = await connectVia(proxy.url, `127.0.0.1:${portOf(site.url)}`)
    assert.equal(tunnel.status, 407)
    tunnel.socket.destroy()
    assert.equal((await viaProxy(proxy.url, `${site.url}/`, auth(proxy))).status, 200)
    assert.deepEqual(site.requests, ['/'])
  } finally { await proxy.close(); await site.close() }
})

test('CONNECT keeps the port it names: port 80 stays 80', () => {
  assert.deepEqual(connectTarget('fjordlys.no:80'), { host: 'fjordlys.no', port: '80' })
  assert.deepEqual(connectTarget('Fjordlys.NO:443'), { host: 'fjordlys.no', port: '443' })
  assert.deepEqual(connectTarget('[::1]:8443'), { host: '::1', port: '8443' })
  assert.equal(connectTarget('no-port'), null)
})

test('the proxy caps the number of connections and how long one may stay open', async () => {
  const site = await serve({ '/': { body: 'new site' } })
  const proxy = await startFilterProxy({ allow: { host: '127.0.0.1', port: portOf(site.url) }, maxConnections: 3, maxConnectionMs: 300 })
  try {
    const open = []
    for (let i = 0; i < 3; i++) open.push(await connectVia(proxy.url, `127.0.0.1:${portOf(site.url)}`, auth(proxy)))
    assert.deepEqual(open.map((t) => t.status), [200, 200, 200])
    await assert.rejects(connectVia(proxy.url, `127.0.0.1:${portOf(site.url)}`, auth(proxy)), 'a fourth connection is refused')
    const closed = await Promise.all(open.map((t) => new Promise((ok) => { const at = Date.now(); t.socket.on('close', () => ok(Date.now() - at)); t.socket.resume() })))
    assert.ok(closed.every((ms) => ms < 2000), `closed after ${closed} ms`)
  } finally { await proxy.close(); await site.close() }
})
