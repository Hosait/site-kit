import assert from 'node:assert/strict'
import { test } from 'node:test'

import theme from '../../site/theme.json'
import { checkTheme, contrastRatio, themeToCss, validateTheme } from '../../src/lib/theme'

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
