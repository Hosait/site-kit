import assert from 'node:assert/strict'
import { test } from 'node:test'

import { siteFromHost, siteHref, siteOrigin } from '../../src/lib/sites'

test('produksjonsdomener', () => {
  assert.equal(siteFromHost('www.spilka.com'), 'industri')
  assert.equal(siteFromHost('spilka-sbs.com'), 'sbs')
  assert.equal(siteFromHost('www.spilka-dws.com:443'), 'dws')
  assert.equal(siteFromHost('ukjent.no'), null)
})

test('underdomener av test-adressen (STAGING_HOST)', () => {
  process.env.STAGING_HOST = 'spilka.hosait.com'
  assert.equal(siteFromHost('sbs.spilka.hosait.com'), 'sbs')
  assert.equal(siteFromHost('dws.spilka.hosait.com'), 'dws')
  assert.equal(siteFromHost('spilka.hosait.com'), null) // standard = industri i proxy
  assert.equal(siteFromHost('evil.spilka.hosait.com'), null)
  assert.equal(siteHref('sbs', 'industri', '/no'), 'https://sbs.spilka.hosait.com/no')
  assert.equal(siteHref('industri', 'dws', '/en'), 'https://spilka.hosait.com/en')
  delete process.env.STAGING_HOST
  assert.equal(siteHref('sbs', 'industri', '/no'), '/no?site=sbs')
})

test('siteOrigin på staging bruker eget underdomene (canonical, hreflang, sitemap)', () => {
  process.env.STAGING_HOST = 'spilka.hosait.com'
  process.env.NEXT_PUBLIC_SERVER_URL = 'https://spilka.hosait.com'
  assert.equal(siteOrigin('industri'), 'https://spilka.hosait.com')
  assert.equal(siteOrigin('sbs'), 'https://sbs.spilka.hosait.com')
  assert.equal(siteOrigin('dws'), 'https://dws.spilka.hosait.com')
  delete process.env.STAGING_HOST
  process.env.NEXT_PUBLIC_SERVER_URL = 'http://localhost:3100'
  assert.equal(siteOrigin('sbs'), 'http://localhost:3100')
  Reflect.deleteProperty(process.env, 'NEXT_PUBLIC_SERVER_URL')
})
