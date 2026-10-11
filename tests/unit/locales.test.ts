import assert from 'node:assert/strict'
import { test } from 'node:test'

import { formatDate, negotiateLocale, otherLocale, searchRewrite } from '../../src/lib/locales'

test('otherLocale gives the second locale, or null with one', () => {
  assert.equal(otherLocale('no'), 'en')
  assert.equal(otherLocale('en'), 'no')
})

test('negotiateLocale: own code, aliases, English for the rest, default when empty', () => {
  assert.equal(negotiateLocale('nb-NO,nb;q=0.9,en;q=0.8'), 'no')
  assert.equal(negotiateLocale('nn'), 'no')
  assert.equal(negotiateLocale('en-US,en'), 'en')
  assert.equal(negotiateLocale('de-DE'), 'en')
  assert.equal(negotiateLocale(''), 'no')
  assert.equal(negotiateLocale(null), 'no')
})

test('searchRewrite matches each locale only with its own segment', () => {
  assert.deepEqual(searchRewrite('/no/sok'), { locale: 'no' })
  assert.deepEqual(searchRewrite('/en/search/'), { locale: 'en' })
  assert.equal(searchRewrite('/en/sok'), null)
  assert.equal(searchRewrite('/no/sok/extra'), null)
})

test('formatDate uses the locale and the site time zone', () => {
  assert.equal(formatDate('2026-10-11T22:30:00Z', 'no'), '12. oktober 2026')
  assert.equal(formatDate('2026-10-11T10:00:00Z', 'en'), '11 October 2026')
})
