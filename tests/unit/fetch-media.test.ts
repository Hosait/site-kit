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
