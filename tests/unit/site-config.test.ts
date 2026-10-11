import assert from 'node:assert/strict'
import { test } from 'node:test'

import { siteConfig } from '../../site/config'
import { STRINGS } from '../../src/lib/i18n'
import { checkSiteConfig, type SiteConfigInput } from '../../src/lib/site-config'
import { STRING_LOCALES } from '../../src/lib/string-locales'

const clone = (): SiteConfigInput => structuredClone(siteConfig) as unknown as SiteConfigInput

test('the shipped config passes', () => {
  assert.deepEqual(checkSiteConfig(clone(), ['no', 'en']), [])
})

test('STRING_LOCALES lists exactly the locales i18n.ts has strings for', () => {
  assert.deepEqual(Object.keys(STRINGS).sort(), [...STRING_LOCALES].sort())
})

test('three locales are refused', () => {
  const c = clone()
  c.locales.de = { ...c.locales.en, label: 'Deutsch' }
  assert.ok(checkSiteConfig(c, ['no', 'en', 'de']).some((p) => p.startsWith('locales: use one or two')))
})

test('a locale without visitor strings is refused', () => {
  const c = clone()
  delete c.locales.no
  c.locales.sv = { ...c.locales.en, label: 'Svenska' }
  c.defaultLocale = 'sv'
  for (const s of Object.values(c.sites)) s.articleBase.sv = 'nyheter'
  for (const v of Object.values(c.documentTypes)) v.sv = 'x'
  for (const v of Object.values(c.articleKinds)) v.sv = 'x'
  assert.ok(checkSiteConfig(c, ['no', 'en']).includes('locale "sv" has no visitor strings in src/lib/i18n.ts'))
})

test('a default locale outside the list is refused', () => {
  const c = clone()
  c.defaultLocale = 'fr'
  assert.ok(checkSiteConfig(c, ['no', 'en']).includes('defaultLocale "fr" is not in locales'))
})

test('an origin with a path or http is refused', () => {
  const c = clone()
  c.sites.main.origin = 'http://www.example.com/x'
  assert.ok(checkSiteConfig(c, ['no', 'en']).some((p) => p.includes('origin must be https://host')))
})

test('a time zone that is not a plain IANA name is refused (it reaches SQL)', () => {
  const c = clone()
  c.timezone = "Europe/Oslo'; drop table x; --"
  assert.ok(checkSiteConfig(c, ['no', 'en']).includes('timezone must be an IANA name such as Europe/Oslo'))
})

test('a textSearch value that is not a plain config name is refused (it reaches SQL)', () => {
  const c = clone()
  c.locales.en.textSearch = "english'::regconfig; --"
  assert.ok(checkSiteConfig(c, ['no', 'en']).some((p) => p.startsWith('locale "en": textSearch')))
})
