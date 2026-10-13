// Drafts Site Kit's site/theme.json from the old site's CSS: brand, text and background colours,
// fonts, radius and logo. Colours are then adjusted (only ever darkened) until every pair Site
// Kit checks reaches 4.5:1, and each change is noted, so `pnpm kit:theme-check` passes as is.
import fs from 'node:fs'
import path from 'node:path'
import { load } from './html.js'
import { get as defaultGet } from './net.js'

/** Mirrors PAIRS in site-kit src/lib/theme.ts. */
export const PAIRS = [
  ['ink', 'background'], ['ink', 'muted'], ['ink', 'tint'],
  ['brandText', 'background'], ['brandText', 'muted'],
  ['brandDark', 'tint'],
  ['white', 'ink'], ['white', 'brandDark'], ['white', 'brandText'], ['white', 'brand'],
  ['highlight', 'background'],
  ['tint', 'ink'], ['tint', 'brandDark'],
]
const DEFAULTS = { ink: '#14213d', brand: '#2a6fdb', muted: '#f4f5f7', background: '#ffffff', highlight: '#b0144f' }
const MAX_CSS = 2 * 1024 * 1024
const MAX_PIECE = 4096

/**
 * The CSS as rules, found in linear time: split once on }, then each piece on { (the last part
 * holds the declarations, the one before it the selector, so rules inside @media count too) and
 * the declarations on ;. Selectors and declarations longer than MAX_PIECE are left out.
 */
function cssRules(css) {
  const rules = []
  for (const block of css.split('}')) {
    const parts = block.split('{')
    if (parts.length < 2) continue
    const selector = parts[parts.length - 2]
    const decls = []
    for (const d of parts[parts.length - 1].split(';')) {
      const i = d.indexOf(':')
      if (i !== -1 && d.length <= MAX_PIECE) decls.push([d.slice(0, i).trim(), d.slice(i + 1).trim()])
    }
    rules.push({ selector: selector.length <= MAX_PIECE ? selector : '', decls })
  }
  return rules
}

export function parseColor(v) {
  const s = String(v).trim().toLowerCase()
  let m = /^#([0-9a-f]{3,8})$/.exec(s)
  if (m) {
    let h = m[1]
    if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split('').map((c) => c + c).join('')
    if (h.length !== 6 && h.length !== 8) return null
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) }
  }
  m = /^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/.exec(s)
  if (m) return { r: +m[1], g: +m[2], b: +m[3] }
  if (s === 'white') return { r: 255, g: 255, b: 255 }
  if (s === 'black') return { r: 0, g: 0, b: 0 }
  return null
}
export const toHex = (c) => '#' + [c.r, c.g, c.b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('')
function luminance(hex) {
  const { r, g, b } = parseColor(hex)
  const f = (x) => { const v = x / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
const saturation = (c) => { const max = Math.max(c.r, c.g, c.b); const min = Math.min(c.r, c.g, c.b); return max === 0 ? 0 : (max - min) / max }
const darken = (hex, t) => { const c = parseColor(hex); return toHex({ r: c.r * (1 - t), g: c.g * (1 - t), b: c.b * (1 - t) }) }
const mix = (a, b, t) => { const x = parseColor(a); const y = parseColor(b); return toHex({ r: x.r + (y.r - x.r) * t, g: x.g + (y.g - x.g) * t, b: x.b + (y.b - x.b) * t }) }
/** Darken in 5% steps until `hex` reaches 4.5:1 against every colour in `against`. */
function darkenUntil(hex, against) {
  let c = hex
  for (let i = 0; i < 40 && against.some((b) => contrast(c, b) < 4.5); i++) c = darken(c, 0.05)
  return c
}

/** @param {string} css @param {string} html @param {string} baseUrl */
export function themeFromCss(css, html, baseUrl) {
  const notes = []
  const counts = { text: new Map(), bg: new Map(), any: new Map() }
  const add = (map, hex) => map.set(hex, (map.get(hex) || 0) + 1)
  let brand = null
  let radius = null
  const rules = cssRules(css)
  for (const { decls } of rules) {
    for (const [name, value] of decls) {
      if (brand || !name.startsWith('--')) continue
      const c = parseColor(value)
      if (c && /primary|brand|accent|main/i.test(name) && saturation(c) > 0.35) brand = toHex(c)
    }
  }
  for (const m of css.matchAll(/(?:^|[;{\s])(color|background-color|background|border-color|fill)\s*:\s*([^;}]+)/g)) {
    const c = parseColor(m[2].split(/\s+/)[0])
    if (!c) continue
    const hex = toHex(c)
    add(counts.any, hex)
    add(m[1] === 'color' ? counts.text : counts.bg, hex)
  }
  for (const m of css.matchAll(/border-radius\s*:\s*([\d.]+(px|rem|em))/g)) { radius ??= m[1] }
  const top = (map, pred) => [...map].filter(([h]) => pred(h)).sort((a, b) => b[1] - a[1])[0]?.[0]
  const sat = (h) => saturation(parseColor(h)) > 0.35 && luminance(h) > 0.02 && luminance(h) < 0.9
  const background = top(counts.bg, (h) => luminance(h) > 0.85) ?? DEFAULTS.background
  // Text colour: dark and not saturated, so a dark brand-coloured link is never taken for it.
  let ink = top(counts.text, (h) => luminance(h) < 0.25 && saturation(parseColor(h)) < 0.35) ?? DEFAULTS.ink
  brand ??= top(counts.any, sat) ?? DEFAULTS.brand
  const muted = top(counts.bg, (h) => h !== background && luminance(h) > 0.8 && saturation(parseColor(h)) < 0.1) ?? DEFAULTS.muted
  let highlight = top(counts.any, (h) => sat(h) && h !== brand) ?? DEFAULTS.highlight

  const original = { brand, ink, highlight }
  const tint = mix(brand, '#ffffff', 0.85)
  ink = darkenUntil(ink, [background, muted, tint, '#ffffff'])
  brand = darkenUntil(brand, ['#ffffff'])
  const brandText = darkenUntil(brand, [background, muted, '#ffffff'])
  const brandDark = darkenUntil(darken(brand, 0.3), [tint, '#ffffff'])
  highlight = darkenUntil(highlight, [background])
  for (const [k, v] of Object.entries({ brand, ink, highlight })) if (v !== original[k]) notes.push(`${k} darkened from ${original[k]} to ${v} for 4.5:1 contrast`)

  const $ = load(html)
  const families = (sel) => {
    const re = new RegExp(`\\b(?:${sel})\\b`)
    for (const { selector, decls } of rules) {
      const family = re.test(selector) && decls.find(([name]) => name === 'font-family')
      if (family) return family[1].split(',')[0].replace(/["']/g, '').trim()
    }
    return null
  }
  // A family name that cannot be decoded (a malformed % escape) is skipped with one note.
  let undecodable = false
  const family = (raw) => { try { return decodeURIComponent(raw).replace(/\+/g, ' ') } catch { undecodable = true; return null } }
  const googleFonts = [...new Set($('link[href*="fonts.googleapis.com"]').toArray().map((l) => [...String($(l).attr('href')).matchAll(/family=([^:&]+)/g)].map((m) => family(m[1]))).flat().filter(Boolean))]
  if (undecodable) notes.push('a font family in a Google Fonts link has a malformed % escape and was skipped')
  const logoEl = $('header img, a[class*=logo] img, img[class*=logo], img[alt*=logo i], img[src*=logo i]').first()
  let logo = null
  if (logoEl.length) {
    // Only a web address goes into theme.json: not an invalid src, and not an inline data: image.
    let src = null
    try { src = new URL(String(logoEl.attr('src')), baseUrl) } catch { /* noted below */ }
    if (src?.protocol === 'http:' || src?.protocol === 'https:') logo = { src: src.toString(), width: Number(logoEl.attr('width')) || null, height: Number(logoEl.attr('height')) || null }
    else notes.push('logo skipped: its src is not a web address (for example an inline data: image); add public/brand/logo.svg by hand')
  } else notes.push('no logo found: add public/brand/logo.svg by hand')

  return {
    theme: {
      colors: { ink, brand, brandText, brandDark, tint, muted, highlight, background },
      radius: { button: radius ?? '9999px', card: '1rem' },
      logo,
    },
    fonts: { body: families('body|html'), heading: families('h1|h2') ?? families('body|html'), googleFonts },
    notes,
  }
}

/** @param {string} dir @param {{ get?: typeof defaultGet, allowPrivate?: boolean }} [opts] */
export async function theme(dir, opts = {}) {
  const get = opts.get ?? defaultGet
  const inventory = JSON.parse(fs.readFileSync(path.join(dir, 'inventory.json'), 'utf8'))
  const home = inventory.pages.find((p) => p.status === 200 && p.file && new URL(p.url).pathname === new URL(inventory.source).pathname) ?? inventory.pages.find((p) => p.status === 200 && p.file)
  const html = home ? fs.readFileSync(path.join(dir, home.file), 'utf8') : ''
  const $ = load(html)
  let css = $('style').toArray().map((s) => $(s).text()).join('\n')
  for (const href of $('link[rel="stylesheet"][href]').toArray().slice(0, 10).map((l) => String($(l).attr('href')))) {
    if (css.length > MAX_CSS) break
    try {
      const r = await get(new URL(href, home?.url ?? inventory.source).toString(), { allowPrivate: opts.allowPrivate, maxBytes: MAX_CSS - css.length, accept: 'text/css' })
      if (r.status === 200) css += '\n' + r.body.toString('utf8')
    } catch { /* a stylesheet that cannot be read only makes the draft less exact */ }
  }
  const result = themeFromCss(css, html, home?.url ?? inventory.source)
  fs.writeFileSync(path.join(dir, 'theme.draft.json'), JSON.stringify(result, null, 2))
  return result
}
