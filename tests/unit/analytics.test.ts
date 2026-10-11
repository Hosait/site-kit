import assert from 'node:assert/strict'
import { test } from 'node:test'

import { cleanPath, deviceFrom, isBot, sourceFrom } from '../../src/lib/analytics/classify'
import { CONSENT_VERSION, isVisitorId, parseConsent, readCookie, serializeConsent } from '../../src/lib/analytics/consent'

const own = ['example.com', 'example-two.com', 'example-three.com', 'kit-demo.hosait.com']
const none = new URLSearchParams()

test('enhetstype fra User-Agent', () => {
  assert.equal(deviceFrom('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148'), 'mobile')
  assert.equal(deviceFrom('Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/120 Mobile Safari/537.36'), 'mobile')
  assert.equal(deviceFrom('Mozilla/5.0 (Linux; Android 13; SM-X700) Chrome/120 Safari/537.36'), 'tablet')
  assert.equal(deviceFrom('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)'), 'tablet')
  assert.equal(deviceFrom('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36'), 'desktop')
  assert.equal(deviceFrom('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120', '?1'), 'mobile')
})

test('roboter og verktøy telles ikke', () => {
  assert.ok(isBot('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'))
  assert.ok(isBot('Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/120.0 Safari/537.36'))
  assert.ok(isBot('curl/8.4.0'))
  assert.ok(isBot(''))
  assert.ok(!isBot('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'))
})

test('trafikkilde: søk, sosiale medier, henvisning, direkte og egne domener', () => {
  assert.deepEqual(sourceFrom('https://www.google.no/', none, own), { channel: 'search', source: 'Google', medium: null, campaign: null })
  assert.equal(sourceFrom('https://www.linkedin.com/feed/', none, own).source, 'LinkedIn')
  assert.equal(sourceFrom('https://lnkd.in/abc', none, own).channel, 'social')
  assert.equal(sourceFrom('https://m.facebook.com/', none, own).source, 'Facebook')
  assert.deepEqual(sourceFrom('https://www.fagbladet.no/artikkel', none, own), {
    channel: 'referral',
    source: 'fagbladet.no',
    medium: null,
    campaign: null,
  })
  assert.equal(sourceFrom('', none, own).channel, 'direct')
  // Installasjonens andre nettsteder og staging regnes ikke som kilde.
  assert.equal(sourceFrom('https://www.example-two.com/no', none, own).channel, 'direct')
  assert.equal(sourceFrom('https://two.kit-demo.hosait.com/no', none, own).channel, 'direct')
})

test('trafikkilde: UTM-parametre vinner over henvisningen', () => {
  const utm = new URLSearchParams('utm_source=linkedin&utm_medium=paid&utm_campaign=opus-2026')
  assert.deepEqual(sourceFrom('https://www.google.com/', utm, own), { channel: 'campaign', source: 'linkedin', medium: 'paid', campaign: 'opus-2026' })
  assert.equal(sourceFrom(null, new URLSearchParams('utm_source=nyhetsbrev&utm_medium=email'), own).channel, 'email')
  assert.equal(sourceFrom(null, new URLSearchParams('gclid=abc'), own).source, 'Google Ads')
})

test('sti uten spørrestreng og skråstrek til slutt', () => {
  assert.equal(cleanPath('/no/katalog/opus/?utm_source=x#top'), '/no/katalog/opus')
  assert.equal(cleanPath('/'), '/')
})

test('samtykke-informasjonskapsel: lese, skrive, gammel versjon avvises', () => {
  const c = { version: CONSENT_VERSION, statistics: true, id: 'abcDEF123_-x', at: 1791465318877 }
  const raw = serializeConsent(c)
  assert.deepEqual(parseConsent(raw), c)
  assert.equal(parseConsent(raw.replace(/^v\d+/, 'v0')), null)
  assert.equal(parseConsent('v1.2.x.1'), null)
  assert.equal(parseConsent(null), null)
  assert.equal(readCookie(`a=1; site-consent=${encodeURIComponent(raw)}; b=2`, 'site-consent'), raw)
  assert.ok(isVisitorId('HWNeB6-KTsFvFjsFx9Z1qw'))
  assert.ok(!isVisitorId('kort'))
  assert.ok(!isVisitorId('<script>alert(1)</script>xxxxxxxx'))
})

test('månedsfilter: gyldig måned, forskyvning over årsskifte', async () => {
  const { monthStart, parseFilters, shiftMonth } = await import('../../src/lib/analytics/reports')
  assert.equal(parseFilters({ month: '2026-09' }).month, '2026-09')
  assert.equal(parseFilters({ month: '2026-13' }).month, null)
  assert.equal(parseFilters({ month: "2026-09'; drop table x" }).month, null)
  assert.equal(parseFilters({ days: '999' }).days, 30)
  assert.equal(monthStart('2026-01', -1), '2025-12-01')
  assert.equal(monthStart('2026-12', 1), '2027-01-01')
  assert.equal(shiftMonth('2026-03', -12), '2025-03')
})
