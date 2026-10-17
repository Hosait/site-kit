import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { contrast, PAIRS, parseColor, theme, themeFromCss, toHex } from '../src/theme.js'
import { serve } from './server.js'

const problems = (c) => PAIRS.filter(([f, b]) => contrast(f === 'white' ? '#ffffff' : c[f], b === 'white' ? '#ffffff' : c[b]) < 4.5)

test('colours parse from hex, short hex and rgb()', () => {
  assert.equal(toHex(parseColor('#abc')), '#aabbcc')
  assert.equal(toHex(parseColor('rgb(228, 0, 43)')), '#e4002b')
  assert.equal(parseColor('var(--x)'), null)
  assert.ok(Math.abs(contrast('#000000', '#ffffff') - 21) < 0.01)
})

test('brand comes from a --primary custom property; ink and background from body; every pair passes 4.5:1', () => {
  const css = ':root{--color-primary:#e4002b;--radius:6px}body{color:#222;background:#fff;font-family:Inter,sans-serif}h1,h2{font-family:"Merriweather",serif}a{color:#e4002b}.btn{background-color:#e4002b;border-radius:4px}.box{background:#f2f2f2}'
  const html = '<html><head><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Merriweather" rel="stylesheet"></head><body><header><a class="logo" href="/"><img src="/img/logo.svg" width="120" height="40" alt="Acme logo"></a></header></body></html>'
  const r = themeFromCss(css, html, 'https://acme.no/')
  assert.equal(r.theme.colors.ink, '#222222')
  assert.equal(r.theme.colors.background, '#ffffff')
  assert.deepEqual(problems(r.theme.colors), [])
  assert.deepEqual([r.fonts.body, r.fonts.heading], ['Inter', 'Merriweather'])
  assert.deepEqual(r.fonts.googleFonts, ['Inter', 'Merriweather'])
  assert.deepEqual(r.theme.logo, { src: 'https://acme.no/img/logo.svg', width: 120, height: 40 })
  assert.equal(r.theme.radius.button, '4px')
})

// Every Site Kit site showed the same /favicon.ico; the old site's own icon is kept instead. A
// raster icon comes first: Safari shows no SVG favicon, and an SVG can carry script.
test('the old site\'s icon: the largest raster icon (an apple-touch-icon counts as 180), an SVG only without one, else /favicon.ico', () => {
  const icon = (links) => themeFromCss('', `<html><head>${links}</head><body></body></html>`, 'https://acme.no/om')
  assert.deepEqual(icon('<link rel="icon" href="/f-32.png" sizes="32x32"><link rel="icon" href="/f.svg" type="image/svg+xml">').theme.icon, { src: 'https://acme.no/f-32.png' })
  assert.deepEqual(icon('<link rel="icon" href="/f.svg" type="image/svg+xml">').theme.icon, { src: 'https://acme.no/f.svg' })
  assert.deepEqual(icon('<link rel="icon" href="/f-32.png" sizes="32x32"><link rel="icon" href="/f-192.png" sizes="192x192">').theme.icon, { src: 'https://acme.no/f-192.png' })
  assert.deepEqual(icon('<link rel="shortcut icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple.png">').theme.icon, { src: 'https://acme.no/apple.png' })
  const none = icon('')
  assert.deepEqual(none.theme.icon, { src: 'https://acme.no/favicon.ico' })
  assert.ok(none.notes.some((n) => /favicon\.ico/.test(n)))
  assert.deepEqual(icon('<link rel="icon" href="data:image/png;base64,AAAA">').theme.icon, { src: 'https://acme.no/favicon.ico' })
})

test('a light brand colour is darkened until white text reads on it, and the change is noted', () => {
  const r = themeFromCss(':root{--brand:#ffd400}body{color:#111;background:#fff}', '<html><body></body></html>', 'https://x.no/')
  assert.deepEqual(problems(r.theme.colors), [])
  assert.ok(r.notes.some((n) => /brand/.test(n) && /#ffd400/.test(n)))
})

test('no CSS at all still gives a theme that passes, using the kit defaults', () => {
  const r = themeFromCss('', '<html><body></body></html>', 'https://x.no/')
  assert.deepEqual(problems(r.theme.colors), [])
  assert.equal(r.theme.colors.background, '#ffffff')
})

test('theme(dir) reads the cached home page, fetches its stylesheets and writes theme.draft.json', async () => {
  const s = await serve({ '/site.css': { headers: { 'content-type': 'text/css' }, body: ':root{--primary:#0b5394}body{color:#1a1a1a;background:#ffffff}' } })
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'theme-'))
  try {
    fs.mkdirSync(path.join(dir, 'raw'))
    fs.writeFileSync(path.join(dir, 'raw', 'home.html'), `<html><head><link rel="stylesheet" href="${s.url}/site.css"></head><body></body></html>`)
    fs.writeFileSync(path.join(dir, 'inventory.json'), JSON.stringify({ version: 1, source: s.url + '/', pages: [{ url: s.url + '/', status: 200, file: 'raw/home.html' }] }))
    const r = await theme(dir, { allowPrivate: true })
    assert.equal(r.theme.colors.brand, '#0b5394')
    assert.ok(fs.existsSync(path.join(dir, 'theme.draft.json')))
  } finally { await s.close() }
})

// --- Hardening ------------------------------------------------------------
test('custom properties and font families are read in linear time, also from rules inside @media', () => {
  for (const css of ['--' + '-'.repeat(40_000), '}' + 'body '.repeat(20_000)]) {
    const t = Date.now()
    themeFromCss(css, '<html><body></body></html>', 'https://x.no/')
    assert.ok(Date.now() - t < 1000, `took ${Date.now() - t} ms for ${css.slice(0, 12)}…`)
  }
  const r = themeFromCss('@media screen{:root{--brand-main:#0b5394}body{font-family:"Source Sans",sans-serif}}', '<html><body></body></html>', 'https://x.no/')
  assert.equal(r.theme.colors.brand, '#0b5394')
  assert.equal(r.fonts.body, 'Source Sans')
})

test('a logo src that is not a web address (invalid, or an inline data: image) is skipped with a note', () => {
  for (const src of ['http://[bad', 'data:image/png;base64,iVBORw0KGgo=']) {
    const r = themeFromCss('', `<html><body><header><img src="${src}" alt="Acme logo"></header></body></html>`, 'https://acme.no/')
    assert.equal(r.theme.logo, null, src)
    assert.ok(r.notes.some((n) => /logo/.test(n)), src)
  }
})

test('a Google Fonts family with a malformed % escape is skipped with a note, and the run goes on', () => {
  const html = '<html><head><link href="https://fonts.googleapis.com/css2?family=Inter&family=%E0%A4%A&family=Open+Sans" rel="stylesheet"></head><body></body></html>'
  const r = themeFromCss('', html, 'https://x.no/')
  assert.deepEqual(r.fonts.googleFonts, ['Inter', 'Open Sans'])
  assert.ok(r.notes.some((n) => /Google Fonts/.test(n)), JSON.stringify(r.notes))
})
