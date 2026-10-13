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

// --- Second review ---------------------------------------------------------
import { sniffMediaType } from '../../src/lib/site-plan/fetch-media'

test('IPv6 forms that carry a private IPv4 address, and deprecated site-local addresses, are refused', () => {
  for (const ip of ['::ffff:7f00:1', '::7f00:1', '::0.0.0.1', '64:ff9b::7f00:1', '64:ff9b::a00:1', '2002:7f00:1::1', '2002:a00:1::', 'fec0::1', 'feff::1', 'ff02::1'])
    assert.equal(isPublicAddress(ip), false, ip)
  for (const ip of ['64:ff9b::808:808', '2002:808:808::1', '2001:4860:4860::8888', '2606:4700::1111', '::ffff:808:808'])
    assert.equal(isPublicAddress(ip), true, ip)
})

const bytes = (...parts: (string | number[])[]) => Buffer.concat(parts.map((p) => (typeof p === 'string' ? Buffer.from(p, 'latin1') : Buffer.from(p))))

test('the file type is read from the first bytes, and only images, video and PDF are allowed', () => {
  const cases: [Buffer, string | null][] = [
    [bytes([0xff, 0xd8, 0xff, 0xe0], 'JFIF'), 'image/jpeg'],
    [bytes([0x89], 'PNG\r\n\x1a\n', 'rest'), 'image/png'],
    [bytes('GIF89a...'), 'image/gif'],
    [bytes('RIFF', [1, 2, 3, 4], 'WEBPVP8 '), 'image/webp'],
    [bytes([0, 0, 0, 28], 'ftypavif', [0, 0, 0, 0]), 'image/avif'],
    [bytes([0, 0, 0, 24], 'ftypisom', [0, 0, 0, 0]), 'video/mp4'],
    [bytes([0x1a, 0x45, 0xdf, 0xa3], 'webm'), 'video/webm'],
    [bytes('%PDF-1.7\n'), 'application/pdf'],
    [bytes('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), null],
    [bytes('<!doctype html><html></html>'), null],
    [bytes('PK', [3, 4], 'zip'), null],
    [Buffer.alloc(0), null],
  ]
  for (const [b, want] of cases) assert.equal(sniffMediaType(b), want, `${b.toString('latin1', 0, 12)} → ${want}`)
})

/** A fake https.get that answers 200 with the given body and headers. */
function answering(body: Buffer, headers: Record<string, string>) {
  return ((_u: URL, _o: unknown, cb: (res: unknown) => void) => {
    const req = new EventEmitter() as EventEmitter & { destroy: (e?: Error) => void }
    req.destroy = (e?: Error) => { req.emit('error', e) }
    const res = Object.assign(new EventEmitter(), { statusCode: 200, headers, resume() {}, destroy() {} })
    setImmediate(() => {
      cb(res)
      res.emit('data', body)
      res.emit('end')
    })
    return req
  }) as never
}

test("a server's Content-Type does not decide: an SVG sent as image/png is refused, a PNG sent as octet-stream is a PNG", async () => {
  const svg = bytes('<svg xmlns="http://www.w3.org/2000/svg"></svg>')
  await assert.rejects(fetchMedia('https://example.com/a.png', { request: answering(svg, { 'content-type': 'image/png' }) }), /a\.png: not an allowed file type/)
  const png = bytes([0x89], 'PNG\r\n\x1a\n', 'rest')
  const got = await fetchMedia('https://example.com/b', { request: answering(png, { 'content-type': 'application/octet-stream' }) })
  assert.equal(got.mimetype, 'image/png')
})

test('SIIT, Teredo, local-use NAT64 and documentation IPv6 ranges are refused', () => {
  for (const ip of ['::ffff:0:7f00:1', '::ffff:0:808:808', '2001::1', '2001:0:4136:e378:8000:63bf:3fff:fdd2', '64:ff9b:1::1', '2001:db8::1'])
    assert.equal(isPublicAddress(ip), false, ip)
  for (const ip of ['2001:4860:4860::8888', '2001:1::1', '64:ff9b::808:808'])
    assert.equal(isPublicAddress(ip), true, ip)
})

test('a URL of a type the import refuses is refused before connecting', async () => {
  await assert.rejects(fetchMedia('https://example.com/files/a.docx'), /download it into seed\//)
})
