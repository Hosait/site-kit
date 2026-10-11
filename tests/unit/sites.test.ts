import assert from 'node:assert/strict'
import { test } from 'node:test'

import { DEFAULT_SITE, SINGLE_SITE, SITES, siteFromHost, siteHref, siteOrigin } from '../../src/lib/sites'

// Hosts and origin come from site/config.ts, so these tests hold for the demo and for a customer's domain.
const { hosts, origin } = SITES[DEFAULT_SITE]

test('the demo is one site called main', () => {
  assert.equal(DEFAULT_SITE, 'main')
  assert.equal(SINGLE_SITE, true)
})

test('production hosts map to the site, unknown hosts to null', () => {
  for (const host of hosts) assert.equal(siteFromHost(host), DEFAULT_SITE, host)
  assert.equal(siteFromHost(`${hosts[0].toUpperCase()}:443`), DEFAULT_SITE)
  assert.equal(siteFromHost('unknown.invalid'), null)
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
  assert.equal(siteOrigin(DEFAULT_SITE), origin)
  delete process.env.SITE_ORIGINS
})
