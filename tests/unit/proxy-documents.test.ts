import assert from 'node:assert/strict'
import { test } from 'node:test'

import { NextRequest } from 'next/server'
import { getRedirectUrl, isRewrite, unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'

import { config, proxy } from '../../src/proxy'

// An old site's documents (brochures, price lists) are linked from other sites and old e-mails.
// A redirect in the CMS must reach them; a document without one is left to the static files.
const REDIRECTS = [
  { from: '/wp-content/uploads/2020/brochure.pdf', to: '/api/documents/file/brochure.pdf', site: null, permanent: true },
  { from: '/files/Prisliste.XLSX', to: '/no/priser', site: null, permanent: true },
]
globalThis.fetch = (async (url: string) => {
  assert.match(String(url), /\/next\/redirects$/)
  return new Response(JSON.stringify(REDIRECTS), { headers: { 'content-type': 'application/json' } })
}) as typeof fetch

const run = (path: string) => proxy(new NextRequest(new URL(path, 'http://www.example.com'), { headers: { host: 'www.example.com' } }))

test('document paths reach the proxy; assets and media still do not', () => {
  const matches = (url: string) => unstable_doesMiddlewareMatch({ config, url })
  for (const p of ['/wp-content/uploads/2020/brochure.pdf', '/files/Prisliste.XLSX', '/docs/report.docx', '/a.pptx', '/b.zip', '/c.csv'])
    assert.equal(matches(p), true, p)
  for (const p of ['/brand/logo.svg', '/media/brochure.pdf', '/_next/static/x.js', '/fonts/a.woff2', '/llms.txt', '/hero.jpg'])
    assert.equal(matches(p), false, p)
})

// The API reaches the proxy only for the size check on form submissions (src/proxy.ts), whatever
// the path's encoding; every other API request passes on untouched.
test('an API request reaches the proxy and passes on untouched', async () => {
  assert.equal(unstable_doesMiddlewareMatch({ config, url: '/api/documents/file/brochure.pdf' }), true)
  const res = await run('/api/documents/file/brochure.pdf')
  assert.equal(res.headers.get('x-middleware-next'), '1')
})

test('an old PDF with a redirect in the CMS is redirected permanently', async () => {
  const res = await run('/wp-content/uploads/2020/brochure.pdf')
  assert.equal(res.status, 308)
  assert.equal(getRedirectUrl(res), 'http://www.example.com/api/documents/file/brochure.pdf')
})

test('other document types follow their redirect too', async () => {
  const res = await run('/files/Prisliste.XLSX')
  assert.equal(res.status, 308)
  assert.equal(getRedirectUrl(res), 'http://www.example.com/no/priser')
})

test('a document without a redirect passes through untouched, never into a page route', async () => {
  const res = await run('/docs/report.pdf')
  assert.equal(getRedirectUrl(res), null)
  assert.equal(isRewrite(res), false)
  assert.equal(res.headers.get('x-middleware-next'), '1')
})

test('a page path is still rewritten to its site', async () => {
  const res = await run('/no/om-oss')
  assert.equal(isRewrite(res), true)
})
