import assert from 'node:assert/strict'
import { test } from 'node:test'

import { fetchMedia, isPublicAddress } from '../../src/lib/site-plan/fetch-media'

test('isPublicAddress refuses private, loopback, link-local, CGNAT, multicast and mapped addresses', () => {
  for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '224.0.0.1', '::1', '::', 'fc00::1', 'fd12::1', 'fe80::1', '::ffff:127.0.0.1', '::ffff:10.0.0.1'])
    assert.equal(isPublicAddress(ip), false, ip)
  for (const ip of ['8.8.8.8', '172.32.0.1', '151.101.1.69', '2606:4700::1111', '::ffff:8.8.8.8'])
    assert.equal(isPublicAddress(ip), true, ip)
})

test('fetchMedia refuses http and other ports before connecting', async () => {
  await assert.rejects(fetchMedia('http://example.com/a.jpg'), /only https/)
  await assert.rejects(fetchMedia('https://example.com:8443/a.jpg'), /standard https port/)
})

test('fetchMedia refuses a host that resolves to a private address', async () => {
  await assert.rejects(fetchMedia('https://localhost/a.jpg'), (e: NodeJS.ErrnoException) => e.code === 'EPRIVATE')
})

// --- Review fixes ---------------------------------------------------------
import { EventEmitter } from 'node:events'

import { mediaName } from '../../src/lib/site-plan/fetch-media'

test('IP-literal hosts are checked too: private literals are refused before connecting', async () => {
  for (const u of ['https://127.0.0.1/a.jpg', 'https://10.255.255.1/a.jpg', 'https://[::1]/a.jpg', 'https://2130706433/a.jpg', 'https://0x7f.1/a.jpg', 'https://169.254.169.254/latest'])
    await assert.rejects(fetchMedia(u), (e: NodeJS.ErrnoException) => e.code === 'EPRIVATE', u)
})

test('a file name that is not valid percent-encoding is kept as it is instead of throwing', () => {
  assert.equal(mediaName(new URL('https://x.no/a%ZZ.jpg')), 'a%ZZ.jpg')
  assert.equal(mediaName(new URL('https://x.no/bilde%20av%20fjord.jpg')), 'bilde av fjord.jpg')
  assert.equal(mediaName(new URL('https://x.no/')), 'file')
})

test('a download that never finishes is stopped by the overall deadline', async () => {
  const request = (() => {
    const r = new EventEmitter() as EventEmitter & { destroy: (e?: Error) => void }
    r.destroy = (e?: Error) => { r.emit('error', e) }
    return r
  }) as never
  await assert.rejects(fetchMedia('https://example.com/a.jpg', { deadlineMs: 50, request }), /took longer/)
})
