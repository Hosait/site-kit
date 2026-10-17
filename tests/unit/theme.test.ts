import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import theme from '../../site/theme.json'
import { checkIconFile, checkTheme, contrastRatio, siteIcon, themeToCss, validateTheme } from '../../src/lib/theme'

test('contrastRatio matches the WCAG formula', () => {
  assert.equal(Math.round(contrastRatio('#000000', '#ffffff') * 10) / 10, 21)
  assert.equal(Math.round(contrastRatio('#767676', '#ffffff') * 100) / 100, 4.54)
})

test('the shipped theme is valid and passes AA for every text pair', () => {
  assert.deepEqual(checkTheme(validateTheme(theme)), [])
})

test('validateTheme refuses anything that could break out of the style tag', () => {
  const bad = structuredClone(theme) as Record<string, any>
  bad.colors.ink = 'red;}</style><script>'
  bad.radius.button = '1em; color: red'
  assert.throws(() => validateTheme(bad), /colors\.ink[\s\S]*radius\.button/)
})

test('themeToCss writes one custom property per token', () => {
  const css = themeToCss(validateTheme(theme))
  assert.match(css, /^:root\{/)
  assert.match(css, /--color-brand-text:#[0-9a-f]{6};/i)
  assert.match(css, /--radius-button:[0-9.]+(px|rem);/)
})

test('checkTheme names the failing pair', () => {
  const low = validateTheme({ ...theme, colors: { ...theme.colors, brandText: '#9ab8e8' } })
  assert.ok(checkTheme(low).some((p) => p.startsWith('brandText on background')))
})

test('checkTheme checks every pair the components use (form errors, skip link, dark-section links)', () => {
  const t = validateTheme(theme)
  for (const [key, value, pair] of [
    ['highlight', '#ff6b6b', 'highlight on background'],
    ['brand', '#8fb4ff', 'white on brand'],
    ['tint', '#44506a', 'tint on ink'],
  ] as const) {
    const problems = checkTheme({ ...t, colors: { ...t.colors, [key]: value } })
    assert.ok(problems.some((p) => p.startsWith(pair)), `${pair}: ${problems.join('; ')}`)
  }
})

// The site's icon (favicon) comes from the old site and lives in public/brand/; without one the
// kit's own /favicon.ico is used.
test('theme.json may name an icon in /brand/, and the site uses it', () => {
  const base = JSON.parse(readFileSync('site/theme.json', 'utf8'))
  for (const src of ['/brand/icon.png', '/brand/icon.svg', '/brand/favicon.ico', '/brand/icon.webp']) assert.equal(siteIcon(validateTheme({ ...base, icon: { src } })), src)
  for (const src of ['/icon.png', 'https://x.no/icon.png', '/brand/../x.png', '/brand/icon.gif'])
    assert.throws(() => validateTheme({ ...base, icon: { src } }), /icon\.src/, src)
  assert.equal(siteIcon(validateTheme(base)), '/favicon.ico')
  const layout = readFileSync('src/app/(frontend)/[site]/[locale]/layout.tsx', 'utf8')
  assert.match(layout, /icons: \{ icon: siteIcon\(THEME\) \}/)
})

// The icon is downloaded from the old site by the agent, not by site-builder's checked fetcher,
// and /brand/ is served from the same origin as /admin: kit:theme-check checks the file itself.
test('checkIconFile: a small icon whose bytes match its type passes', () => {
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(100)])
  const ico = Buffer.concat([Buffer.from([0, 0, 1, 0, 1, 0]), Buffer.alloc(100)])
  const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP'), Buffer.alloc(20)])
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#2a6fdb"/></svg>')
  assert.deepEqual([checkIconFile(png, 'png'), checkIconFile(ico, 'ico'), checkIconFile(webp, 'webp'), checkIconFile(svg, 'svg')], [[], [], [], []])
})

test('checkIconFile: too large, the wrong type, or an SVG with script or outside links is refused', () => {
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(100)])
  assert.match(checkIconFile(Buffer.concat([png, Buffer.alloc(101 * 1024)]), 'png').join(), /larger than 100 KB/)
  assert.match(checkIconFile(Buffer.from('<html>not an icon</html>'), 'png').join(), /not a png/)
  assert.match(checkIconFile(png, 'ico').join(), /not a ico/)
  for (const bad of [
    '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><div/></foreignObject></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)"><circle r="4"/></a></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"><image href="https://tracker.example/x.png"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><use xlink:href="//evil.example/s.svg#a"/></svg>',
    '<?xml version="1.0"?><!DOCTYPE svg [<!ENTITY x "y">]><svg xmlns="http://www.w3.org/2000/svg"/>',
  ]) assert.ok(checkIconFile(Buffer.from(bad), 'svg').length > 0, bad)
})

test('kit:theme-check checks the icon file that theme.json names', () => {
  const script = readFileSync('scripts/kit/theme-check.ts', 'utf8')
  assert.match(script, /checkIconFile/)
})

