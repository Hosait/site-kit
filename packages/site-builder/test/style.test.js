import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { containerWidths, rem, spacingScale, style, tokensFrom, typeToken } from '../src/style.js'

// Lengths and values as Site Kit's theme check accepts them (src/lib/theme-tokens.ts).
const LENGTH = /^\d+(\.\d+)?(px|rem)$/
const SIGNED = /^-?\d+(\.\d+)?(px|rem|em)$/
const LINE_HEIGHT = /^\d+(\.\d+)?(px|rem)?$/

const probe = (over = {}) => ({
  type: {
    display: { size: 64, lineHeight: 67.2, weight: 700, letterSpacing: -2.56, transform: 'none' },
    h2: { size: 48, lineHeight: 56, weight: 650, letterSpacing: 0, transform: 'none' },
    body: { size: 17, lineHeight: 27.2, weight: 400, letterSpacing: 0, transform: 'none' },
  },
  containers: [[1152, 6], [1408, 3], [704, 2]],
  textWidth: 640,
  sections: [{ tag: 'section', paddingTop: 64, paddingBottom: 64 }, { tag: 'section', paddingTop: 96, paddingBottom: 96 }, { tag: 'div', fullWidth: true, paddingTop: 64, paddingBottom: 63 }, { tag: 'div', fullWidth: false, paddingTop: 8, paddingBottom: 20 }],
  button: { paddingX: 24, paddingY: 10, weight: 500, transform: 'uppercase', borderWidth: 1, radius: 5 },
  card: { radius: 8, blur: 6, borderWidth: 0, shadow: true },
  linkUnderline: true,
  header: { height: 80, sticky: true },
  width: 1440,
  ...over,
})
const mobile = () => probe({ type: { display: { size: 40, lineHeight: 42, weight: 700, letterSpacing: -1.6, transform: 'none' }, h2: { size: 48, lineHeight: 56, weight: 650, letterSpacing: 0, transform: 'none' } } })

test('rem always has a leading digit', () => {
  assert.equal(rem(5), '0.3125rem')
  assert.equal(rem(1152), '72rem')
})

test('a heading becomes a typography token in the units the kit accepts', () => {
  const t = typeToken(probe().type.display, mobile().type.display)
  assert.deepEqual(t, { size: '4rem', sizeMobile: '2.5rem', lineHeight: '1.05', weight: 700, letterSpacing: '-0.04em' })
  assert.equal(typeToken(probe().type.h2, mobile().type.h2).sizeMobile, undefined) // same size on mobile
  assert.equal(typeToken(probe().type.h2).weight, 700) // 650 rounds to a step of 100
})

test('container widths: the widest common one is wide, the most common narrower one is content', () => {
  assert.deepEqual(containerWidths([[1152, 6], [1408, 3], [704, 2]]), { content: 1152, wide: 1408 })
  assert.deepEqual(containerWidths([[1200, 9]]), { content: 1200, wide: 1200 })
  assert.deepEqual(containerWidths([[1200, 9], [1600, 1]]), { content: 1200, wide: 1200 }) // a single odd box is not a container
  assert.deepEqual(containerWidths([]), {})
})

test('the spacing scale is the most common paddings, smallest first', () => {
  assert.deepEqual(spacingScale([64, 64, 96, 96, 63, 4, 12]), { m: '4rem', l: '6rem' })
  assert.deepEqual(spacingScale([40, 64, 96, 128, 200]), { s: '2.5rem', m: '4rem', l: '6rem', xl: '8rem' })
  assert.deepEqual(spacingScale([]), {})
})

test('tokens from measured pages pass the kit patterns', () => {
  const { tokens, buttonRadius } = tokensFrom([{ desktop: probe(), mobile: mobile() }, { desktop: probe(), mobile: mobile() }])
  assert.equal(buttonRadius, '0.3125rem')
  assert.deepEqual(tokens.containers, { content: '72rem', wide: '88rem', text: '40rem' })
  assert.deepEqual(tokens.spacing, { m: '4rem', l: '6rem' }) // the inner div's 8/20 px is not section spacing
  assert.deepEqual(tokens.button, { paddingX: '1.5rem', paddingY: '0.625rem', weight: 500, transform: 'uppercase', borderWidth: '1px' })
  assert.deepEqual(tokens.card, { radius: '0.5rem', shadow: 'md' })
  assert.deepEqual(tokens.link, { underline: true })
  for (const t of Object.values(tokens.typography)) {
    for (const k of ['size', 'sizeMobile']) if (t[k]) assert.match(t[k], LENGTH)
    if (t.letterSpacing) assert.match(t.letterSpacing, SIGNED)
    if (t.lineHeight) assert.match(t.lineHeight, LINE_HEIGHT)
    assert.ok(t.weight % 100 === 0)
  }
  for (const v of [...Object.values(tokens.containers), ...Object.values(tokens.spacing), tokens.button.paddingX, tokens.card.radius]) assert.match(v, LENGTH)
})

test('a round button radius stays a pill', () => {
  assert.equal(tokensFrom([{ desktop: probe({ button: { paddingX: 24, paddingY: 10, weight: 500, transform: 'none', borderWidth: 0, radius: 9999 } }) }]).buttonRadius, '9999px')
})

function fakeBrowser(results) {
  const calls = { goto: [] }
  const browser = {
    async newContext({ viewport }) {
      return {
        async route() {}, async routeWebSocket() {}, async close() {},
        async newPage() {
          let url
          return {
            setDefaultTimeout() {}, setDefaultNavigationTimeout() {}, async close() {},
            async goto(u) { url = u; calls.goto.push(u) },
            async waitForLoadState() {},
            async evaluate(fn) { if (fn.name === 'PROBE') return results(url, viewport) },
          }
        },
      }
    },
    async close() {},
  }
  return { calls, launchBrowser: async () => browser }
}

function folder({ draft } = {}) {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'style-'))
  fs.writeFileSync(path.join(out, 'inventory.json'), JSON.stringify({ version: 1, source: 'http://127.0.0.1:9/', pages: [] }))
  fs.writeFileSync(path.join(out, 'extract.json'), JSON.stringify({ pages: [{ url: 'http://127.0.0.1:9/about', template: 'tA' }], templates: [{ id: 'tA', examples: ['http://127.0.0.1:9/about'] }] }))
  if (draft) fs.writeFileSync(path.join(out, 'theme.draft.json'), JSON.stringify(draft))
  return out
}

test('style measures home and one page per template, and merges tokens into the theme draft', async () => {
  const out = folder({ draft: { theme: { colors: { ink: '#111111' }, radius: { button: '9999px', card: '1rem' } }, notes: ['ink darkened'] } })
  const fake = fakeBrowser((url, vp) => (vp.width > 500 ? probe() : mobile()))
  const r = await style(out, { allowPrivate: true, launchBrowser: fake.launchBrowser })
  assert.deepEqual(fake.calls.goto, ['http://127.0.0.1:9/', 'http://127.0.0.1:9/', 'http://127.0.0.1:9/about', 'http://127.0.0.1:9/about'])
  assert.equal(r.templates.tA.sections.length, 4)
  const draft = JSON.parse(fs.readFileSync(path.join(out, 'theme.draft.json'), 'utf8'))
  assert.equal(draft.theme.colors.ink, '#111111') // the colours from `theme` are kept
  assert.equal(draft.theme.radius.button, '0.3125rem')
  assert.equal(draft.theme.typography.display.size, '4rem')
  assert.ok(draft.notes.includes('ink darkened') && draft.notes.some((n) => n.startsWith('style: Header: 80px high')))
  assert.ok(fs.existsSync(path.join(out, 'style.json')))
})

test('style without a browser says so', async () => {
  const noBrowser = async () => { throw Object.assign(new Error('none'), { code: 'NO_PLAYWRIGHT' }) }
  await assert.rejects(style(folder(), { allowPrivate: true, launchBrowser: noBrowser }), /style needs a browser/)
})
