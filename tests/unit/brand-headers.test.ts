import assert from 'node:assert/strict'
import { test } from 'node:test'

import nextConfig from '../../next.config'

// Logos and icons in public/brand/ come from the old site and are served from the same origin
// as /admin. Opened directly, an SVG there must not run script or load anything.
test('files under /brand/ get a CSP that runs nothing and sandboxes the document', async () => {
  const rules = (await nextConfig.headers?.()) ?? []
  const brand = rules.find((r) => r.source === '/brand/:path*')
  assert.ok(brand, JSON.stringify(rules.map((r) => r.source)))
  const csp = brand.headers.find((h) => h.key === 'Content-Security-Policy')?.value ?? ''
  for (const part of ["default-src 'none'", "style-src 'unsafe-inline'", 'sandbox']) assert.ok(csp.includes(part), csp)
  assert.ok(rules.some((r) => r.source === '/:path*' && r.headers.some((h) => h.key === 'X-Content-Type-Options')), 'the site-wide headers stay')
})
