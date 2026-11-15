import assert from 'node:assert/strict'
import { test } from 'node:test'

import theme from '../../site/theme.json'
import { themeToCss, validateTheme } from '../../src/lib/theme'
import { checkSiteStyles, tokenProblems, tokensToCss } from '../../src/lib/theme-tokens'

test('without tokens the theme CSS is only the custom properties, as before', () => {
  const css = themeToCss(validateTheme(theme))
  assert.match(css, /^:root\{[^}]*\}$/)
})

test('valid tokens pass and become CSS', () => {
  const tokens = {
    typography: {
      h2: { size: '3rem', sizeMobile: '2rem', lineHeight: '1.2', weight: 600, letterSpacing: '-0.02em', transform: 'none' },
      body: { size: '17px', lineHeight: '1.6' },
    },
    containers: { content: '70rem' },
    spacing: { m: '4rem' },
    button: { paddingX: '2rem', weight: 700, transform: 'uppercase' },
    card: { radius: '0px', shadow: 'md' },
    link: { underline: true },
    styleClasses: [{ name: 'site-quiet', label: 'Rolig' }],
  }
  assert.deepEqual(tokenProblems(tokens), [])
  const css = tokensToCss(tokens as never)
  assert.match(css, /:root\{--container-content:70rem;--space-m:4rem;\}/)
  assert.match(css, /\.t-h2\{font-size:2rem;line-height:1\.2;font-weight:600;letter-spacing:-0\.02em;text-transform:none;\}/)
  assert.match(css, /body\{font-size:17px;line-height:1\.6;\}/)
  assert.match(css, /@media \(min-width:48rem\)\{\.t-h2\{font-size:3rem;\}\}$/)
  assert.match(css, /\.btn\{padding:0\.625rem 2rem;font-weight:700;text-transform:uppercase;\}/)
  assert.match(css, /\.kit-card\{border-radius:0px;box-shadow:0 4px/)
  assert.match(css, /main a:not\(\.btn\):not\(\.link-arrow\)\{text-decoration:underline;\}/)
})

test('a size without sizeMobile applies at every width', () => {
  const css = tokensToCss({ typography: { h3: { size: '2rem' } } })
  assert.equal(css, '.t-h3{font-size:2rem;}')
})

test('tokens refuse anything that could leave the style tag or is not a known value', () => {
  const problems = tokenProblems({
    typography: { h2: { size: '3rem;}</style>', weight: 650, transform: 'blink' }, h7: { size: '1rem' } },
    containers: { wide: '100vw' },
    button: { paddingX: 'calc(1px)' },
    card: { shadow: '0 0 0 red' },
    link: { underline: 'yes' },
    styleClasses: [{ name: 'hidden', label: 'x' }, { name: 'site-a', label: '' }, { name: 'site-a', label: 'A' }],
  })
  for (const expected of [
    'typography.h2.size',
    'typography.h2.weight',
    'typography.h2.transform',
    'typography.h7 is not one of',
    'containers.wide',
    'button.paddingX',
    'card.shadow',
    'link.underline',
    'styleClasses[0].name',
    'styleClasses[1].label',
    'styleClasses[2].name «site-a» is listed twice',
  ])
    assert.ok(problems.some((p) => p.startsWith(expected)), `${expected} in ${problems.join(' | ')}`)
})

test('validateTheme runs the token checks too', () => {
  const bad = { ...structuredClone(theme), typography: { h2: { size: 'big' } } }
  assert.throws(() => validateTheme(bad), /typography\.h2\.size/)
})

test('site/styles.css may not load anything from elsewhere', () => {
  assert.deepEqual(checkSiteStyles('.site-quiet { background: #faf7f2 url(/brand/paper.webp); }\n/* a note about @import */'.replace('@import', 'imports')), [])
  const cases: [string, RegExp][] = [
    ['@import "x.css";', /@import/],
    ['.a { background: url(https://evil.example/x.png) }', /url\(\) to another site/],
    ['.a { background: url(//evil.example/x.png) }', /url\(\) to another site/],
    ['.a { background: u/**/rl(//evil.example/x.png) }', /url\(\) to another site/],
    ['.a { content: "/*"; } @import "x.css"; /* */', /@import/],
    ['.a { background: image-set("a.png" 1x) }', /image-set/],
    ['.a { width: expression(alert(1)) }', /script-in-CSS/],
    ['.a { content: "\\40 import" }', /backslash/],
  ]
  for (const [css, re] of cases) assert.ok(checkSiteStyles(css).some((p) => re.test(p)), `${css} → ${checkSiteStyles(css).join(' | ')}`)
  assert.match(checkSiteStyles('a{}'.repeat(20_000)).join(' '), /larger than 50 KB/)
})
