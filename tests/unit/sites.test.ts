import assert from 'node:assert/strict'
import { test } from 'node:test'

import { DEFAULT_SITE, SINGLE_SITE, siteFromHost, siteHref, siteOrigin } from '../../src/lib/sites'

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
