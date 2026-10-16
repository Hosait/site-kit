import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { test } from 'node:test'

import { DEFAULT_SITE, isProduction, SINGLE_SITE, siteFromHost, siteHref, siteOrigin } from '../../src/lib/sites'

test('the demo is one site called main', () => {
  assert.equal(DEFAULT_SITE, 'main')
  assert.equal(SINGLE_SITE, true)
})

test('production hosts map to the site, unknown hosts to null', () => {
  assert.equal(siteFromHost('www.example.com'), 'main')
  assert.equal(siteFromHost('EXAMPLE.com:443'), 'main')
  assert.equal(siteFromHost('other.no'), null)
})

test('staging: the default site lives on the staging host itself', () => {
  process.env.STAGING_HOST = 'kit-demo.hosait.com'
  process.env.NEXT_PUBLIC_SERVER_URL = 'https://kit-demo.hosait.com'
  assert.equal(siteOrigin('main'), 'https://kit-demo.hosait.com')
  assert.equal(siteFromHost('main.kit-demo.hosait.com'), null)
  assert.equal(siteHref('main', 'main', '/no'), '/no')
  delete process.env.STAGING_HOST
  Reflect.deleteProperty(process.env, 'NEXT_PUBLIC_SERVER_URL')
})

test('production origins come from the config', () => {
  process.env.SITE_ORIGINS = 'production'
  assert.equal(siteOrigin('main'), 'https://www.example.com')
  delete process.env.SITE_ORIGINS
})

// Hosait sets HOSAIT_URL to the project's verified own domain, else its hosait.com address.
// Nobody has to set SITE_ORIGINS when the site moves to its domain.
test('without SITE_ORIGINS, the site is in production once Hosait serves it on one of its own hosts', () => {
  process.env.HOSAIT_URL = 'https://www.example.com'
  assert.equal(isProduction(), true)
  assert.equal(siteOrigin('main'), 'https://www.example.com')
  process.env.HOSAIT_URL = 'https://example.com'
  assert.equal(isProduction(), true)
  delete process.env.HOSAIT_URL
})

test('without SITE_ORIGINS, the site stays staging on its hosait.com address, locally, or with a broken address', () => {
  for (const url of ['https://kit-demo.hosait.com', '', 'not a url', 'https://www.example.com.evil.test']) {
    process.env.HOSAIT_URL = url
    assert.equal(isProduction(), false, url)
  }
  delete process.env.HOSAIT_URL
  assert.equal(isProduction(), false)
})

test('an explicit SITE_ORIGINS always wins over the address', () => {
  process.env.HOSAIT_URL = 'https://www.example.com'
  process.env.SITE_ORIGINS = 'staging'
  assert.equal(isProduction(), false)
  process.env.HOSAIT_URL = 'https://kit-demo.hosait.com'
  process.env.SITE_ORIGINS = 'production'
  assert.equal(isProduction(), true)
  delete process.env.SITE_ORIGINS
  delete process.env.HOSAIT_URL
})

test('only src/lib/sites.ts reads SITE_ORIGINS, so every production switch follows isProduction()', () => {
  const readers = execFileSync('git', ['grep', '-l', 'process.env.SITE_ORIGINS', '--', 'src'], { encoding: 'utf8' })
    .split('\n').filter(Boolean)
  assert.deepEqual(readers, ['src/lib/sites.ts'])
})
