import assert from 'node:assert/strict'
import { test } from 'node:test'
import zlib from 'node:zlib'

import { get, isPublicAddress } from '../src/net.js'
import { serve } from './server.js'

test('isPublicAddress refuses private, loopback, link-local and mapped addresses', () => {
  for (const ip of ['127.0.0.1', '10.0.0.1', '192.168.0.1', '172.20.1.1', '169.254.169.254', '100.100.0.1', '::1', 'fd00::1', 'fe80::1', '::ffff:192.168.1.1'])
    assert.equal(isPublicAddress(ip), false, ip)
  for (const ip of ['1.1.1.1', '2606:4700::1111']) assert.equal(isPublicAddress(ip), true, ip)
})

test('a local host is refused unless allowPrivate is set', async () => {
  await assert.rejects(get('http://localhost/'), (e) => e.code === 'EPRIVATE')
  const site = await serve({ '/': { body: '<p>hi</p>' } })
  try {
    const r = await get(site.url + '/', { allowPrivate: true })
    assert.equal(r.status, 200)
    assert.equal(r.body.toString(), '<p>hi</p>')
  } finally { await site.close() }
})

test('redirects are returned, not followed; gzip is decoded; bodies are capped', async () => {
  const site = await serve({
    '/old': { status: 301, headers: { location: '/new' } },
    '/zip': { headers: { 'content-encoding': 'gzip' }, body: zlib.gzipSync('<p>packed</p>') },
    '/big': { body: 'x'.repeat(3 * 1024 * 1024) },
  })
  try {
    const r = await get(site.url + '/old', { allowPrivate: true })
    assert.deepEqual([r.status, r.headers.location], [301, '/new'])
    assert.equal((await get(site.url + '/zip', { allowPrivate: true })).body.toString(), '<p>packed</p>')
    const big = await get(site.url + '/big', { allowPrivate: true, maxBytes: 1024 * 1024 })
    assert.equal(big.truncated, true)
    assert.equal(big.body.length, 1024 * 1024)
  } finally { await site.close() }
})

test('only http and https', async () => {
  await assert.rejects(get('ftp://example.com/x'), /only http and https/)
})

// --- Review fixes ---------------------------------------------------------
import http from 'node:http'

test('IP-literal hosts are checked too: private literals are refused before connecting', async () => {
  for (const u of ['http://127.0.0.1/', 'http://[::1]/', 'http://2130706433/', 'http://0x7f.1/', 'http://169.254.169.254/latest', 'https://10.255.255.1/'])
    await assert.rejects(get(u), (e) => e.code === 'EPRIVATE', u)
})

function rawServer(handler) {
  const server = http.createServer(handler)
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ url: `http://127.0.0.1:${server.address().port}`, close: () => { server.closeAllConnections?.(); return new Promise((r) => server.close(r)) } })))
}

test('a gzip response whose connection drops mid-body rejects instead of hanging', async () => {
  const s = await rawServer((req, res) => {
    res.writeHead(200, { 'content-encoding': 'gzip', 'content-type': 'text/html' })
    res.write(zlib.gzipSync('<p>' + 'x'.repeat(50000) + '</p>').subarray(0, 40))
    setTimeout(() => res.socket.destroy(), 30)
  })
  try {
    await assert.rejects(get(s.url + '/', { allowPrivate: true, deadlineMs: 5000 }), /closed early|aborted|unexpected end/i)
  } finally { await s.close() }
})

test('a response that never ends is stopped by the overall deadline', async () => {
  const s = await rawServer((req, res) => { res.writeHead(200, { 'content-type': 'text/html' }); res.write('<p>slow') })
  try {
    await assert.rejects(get(s.url + '/', { allowPrivate: true, deadlineMs: 200 }), /took longer/)
  } finally { await s.close() }
})
