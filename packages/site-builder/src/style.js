// style: measures the old site's look in a real browser (computed styles of headings, body text,
// containers, section spacing, buttons, cards and links) on the home page and one page per
// template, at desktop and mobile width. Writes style.json (the measurements, and per template the
// sections' boxes for the map step) and adds Site Kit theme tokens to theme.draft.json.
import fs from 'node:fs'
import path from 'node:path'

import { defaultLaunch, openBrowser, pathOf, withGuardedPage } from './compare.js'

const VIEWPORTS = [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]
const MAX_PAGES = 8
const PAGE_TIMEOUT_MS = 30_000
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))

// Runs in the page. Plain numbers (px) and strings only; the node side turns them into tokens.
const PROBE = () => {
  const px = (v) => parseFloat(v) || 0
  const W = innerWidth
  const visible = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'
  const inFixed = (el) => { for (let e = el; e && e !== document.body; e = e.parentElement) { const p = getComputedStyle(e).position; if (p === 'fixed') return true } return false }
  const root = document.querySelector('main') ?? document.body
  const mode = (items, key = JSON.stringify) => {
    const counts = new Map()
    for (const it of items) { const k = key(it); counts.set(k, { it, n: (counts.get(k)?.n ?? 0) + 1 }) }
    return [...counts.values()].sort((a, b) => b.n - a.n)[0]?.it ?? null
  }
  const text = (el) => {
    const cs = getComputedStyle(el)
    return { size: px(cs.fontSize), lineHeight: cs.lineHeight === 'normal' ? null : px(cs.lineHeight), weight: Number(cs.fontWeight) || 400, letterSpacing: cs.letterSpacing === 'normal' ? 0 : px(cs.letterSpacing), transform: cs.textTransform }
  }
  const type = {}
  for (const [key, sel] of [['display', 'h1'], ['h2', 'h2'], ['h3', 'h3'], ['h4', 'h4']]) {
    const els = [...root.querySelectorAll(sel)].filter((e) => visible(e) && !inFixed(e))
    if (els.length) type[key] = mode(els.map(text))
  }
  const paras = [...root.querySelectorAll('p')].filter((p) => visible(p) && !inFixed(p) && (p.textContent ?? '').trim().length > 80)
  if (paras.length) type.body = mode(paras.map(text))

  // Containers: centred blocks that are narrower than the window; text: the width of long paragraphs.
  const centred = []
  for (const el of root.querySelectorAll('div, section, article, main > *')) {
    if (centred.length > 600) break
    const r = el.getBoundingClientRect()
    if (r.width < 320 || r.width > W - 24 || r.height < 40) continue
    if (Math.abs(r.left - (W - r.right)) <= 2 && getComputedStyle(el).maxWidth !== 'none') centred.push(Math.round(r.width))
  }
  const containers = [...centred.reduce((m, w) => m.set(w, (m.get(w) ?? 0) + 1), new Map())].sort((a, b) => b[1] - a[1]).slice(0, 6)
  const textWidth = paras.length ? mode(paras.map((p) => Math.round(p.getBoundingClientRect().width)), String) : null

  // Sections: the children of main (or of its single wrapper), with their spacing and background.
  let box = root
  while (box.children.length === 1 && box.firstElementChild.children.length) box = box.firstElementChild
  const sections = [...box.children].filter(visible).slice(0, 60).map((el) => {
    const cs = getComputedStyle(el)
    const first = el.firstElementChild ? getComputedStyle(el.firstElementChild) : null
    const r = el.getBoundingClientRect()
    const inner = [...el.querySelectorAll('div')].find((d) => { const b = d.getBoundingClientRect(); return b.width > 200 && b.width < r.width - 24 && Math.abs(b.left - r.left - (r.right - b.right)) <= 2 })
    return {
      tag: el.tagName.toLowerCase(),
      y: Math.round(r.top + scrollY),
      height: Math.round(r.height),
      paddingTop: px(cs.paddingTop) || (first ? px(first.paddingTop) : 0),
      paddingBottom: px(cs.paddingBottom) || (first ? px(first.paddingBottom) : 0),
      background: cs.backgroundColor,
      backgroundImage: cs.backgroundImage !== 'none',
      fullWidth: r.width >= W - 2,
      innerWidth: inner ? Math.round(inner.getBoundingClientRect().width) : null,
      heading: (el.querySelector('h1, h2, h3')?.textContent ?? '').trim().slice(0, 120),
    }
  })

  // Buttons: links and buttons that look like one (a class, or a filled background with padding).
  const candidates = [...document.querySelectorAll('a, button')].filter((el) => visible(el) && !inFixed(el) && !el.closest('nav') && (el.textContent ?? '').trim())
  const classed = candidates.filter((el) => /\b(btn|button|cta)\b/i.test(el.getAttribute('class') ?? ''))
  const btnEls = classed.length ? classed : candidates.filter((el) => { const cs = getComputedStyle(el); return cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent' && px(cs.paddingLeft) >= 8 })
  const button = btnEls.length ? mode(btnEls.map((el) => { const cs = getComputedStyle(el); return { paddingX: px(cs.paddingLeft), paddingY: px(cs.paddingTop), weight: Number(cs.fontWeight) || 400, transform: cs.textTransform, borderWidth: px(cs.borderTopWidth), radius: px(cs.borderTopLeftRadius) } })) : null

  // Cards: repeated siblings with a shadow, a border or a rounded box.
  const cards = []
  for (const el of root.querySelectorAll('*')) {
    if (cards.length > 200) break
    const cls = el.getAttribute('class')
    if (!cls || !el.parentElement) continue
    const twins = [...el.parentElement.children].filter((s) => s.getAttribute('class') === cls).length
    if (twins < 2) continue
    const cs = getComputedStyle(el)
    if (cs.boxShadow === 'none' && px(cs.borderTopWidth) === 0 && px(cs.borderTopLeftRadius) === 0) continue
    const blur = cs.boxShadow === 'none' ? 0 : px((cs.boxShadow.match(/(-?[\d.]+px)/g) ?? [])[2] ?? '0')
    cards.push({ radius: px(cs.borderTopLeftRadius), blur, borderWidth: px(cs.borderTopWidth), shadow: cs.boxShadow !== 'none' })
  }
  const card = cards.length ? mode(cards) : null

  const link = paras.map((p) => p.querySelector('a')).find(Boolean)
  const header = document.querySelector('header')
  const hcs = header ? getComputedStyle(header) : null
  return {
    type,
    containers,
    textWidth,
    sections,
    button,
    card,
    linkUnderline: link ? getComputedStyle(link).textDecorationLine.includes('underline') : null,
    header: header ? { height: Math.round(header.getBoundingClientRect().height), sticky: hcs.position === 'sticky' || hcs.position === 'fixed' } : null,
    width: W,
  }
}

const round = (n, d = 4) => Number(n.toFixed(d))
/** px → rem, always with a leading digit (0.3125rem): kit:theme-check refuses «.3125rem». */
export const rem = (n) => `${round(n / 16)}rem`
const weight = (w) => Math.min(900, Math.max(100, Math.round(w / 100) * 100))
const mostCommon = (values) => {
  const counts = new Map()
  for (const v of values.filter((x) => x !== null && x !== undefined)) { const k = JSON.stringify(v); counts.set(k, { v, n: (counts.get(k)?.n ?? 0) + 1 }) }
  return [...counts.values()].sort((a, b) => b.n - a.n)[0]?.v ?? null
}

/** One heading or body style as a Site Kit typography token. */
export function typeToken(desktop, mobile) {
  if (!desktop) return null
  const t = { size: rem(desktop.size) }
  if (mobile && Math.abs(mobile.size - desktop.size) >= 1) t.sizeMobile = rem(mobile.size)
  if (desktop.lineHeight) t.lineHeight = String(round(desktop.lineHeight / desktop.size, 3))
  t.weight = weight(desktop.weight)
  if (desktop.letterSpacing) t.letterSpacing = `${round(desktop.letterSpacing / desktop.size, 3)}em`
  if (['uppercase', 'lowercase', 'capitalize'].includes(desktop.transform)) t.transform = desktop.transform
  return t
}

/**
 * Container widths from [width, count] pairs: wide is the widest common one, content the most
 * common one at least 60 % of it (narrower ones are text columns). One width gives both.
 */
export function containerWidths(pairs) {
  const counts = new Map()
  for (const [w, n] of pairs) counts.set(w, (counts.get(w) ?? 0) + n)
  if (!counts.size) return {}
  const top = Math.max(...counts.values())
  const common = [...counts].filter(([, n]) => n >= Math.max(2, top * 0.2))
  const pool = common.length ? common : [...counts]
  const wide = Math.max(...pool.map(([w]) => w))
  const narrower = pool.filter(([w]) => w < wide && w >= wide * 0.6).sort((a, b) => b[1] - a[1])
  return { content: narrower[0]?.[0] ?? wide, wide }
}

/** The section spacing scale: up to four of the most common section paddings, smallest first. */
export function spacingScale(paddings) {
  const counts = new Map()
  for (const p of paddings) if (p >= 16) { const k = Math.round(p / 4) * 4; counts.set(k, (counts.get(k) ?? 0) + 1) }
  const top = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => k).sort((a, b) => a - b)
  const keys = top.length === 1 ? ['m'] : top.length === 2 ? ['m', 'l'] : top.length === 3 ? ['s', 'm', 'l'] : ['s', 'm', 'l', 'xl']
  return Object.fromEntries(top.map((v, i) => [keys[i], rem(v)]))
}

/** Site Kit theme tokens from the measured pages ({ desktop, mobile } probe results per page). */
export function tokensFrom(measured) {
  const pick = (vp, f) => mostCommon(measured.map((m) => m[vp] && f(m[vp])))
  const typography = {}
  for (const key of ['body', 'display', 'h2', 'h3', 'h4']) {
    const t = typeToken(pick('desktop', (p) => p.type[key]), pick('mobile', (p) => p.type[key]))
    if (t) typography[key] = t
  }
  const tokens = { typography }
  const { content, wide } = containerWidths(measured.flatMap((m) => m.desktop?.containers ?? []))
  const textWidth = pick('desktop', (p) => p.textWidth)
  tokens.containers = {}
  if (content) tokens.containers.content = rem(content)
  if (wide && wide !== content) tokens.containers.wide = rem(wide)
  if (textWidth && (!content || textWidth < content - 64)) tokens.containers.text = rem(textWidth)
  // Section spacing from full-width or <section> blocks only: inner elements' padding is not it.
  const spacing = spacingScale(measured.flatMap((m) => (m.desktop?.sections ?? []).filter((s) => s.fullWidth || s.tag === 'section').flatMap((s) => [s.paddingTop, s.paddingBottom])))
  if (Object.keys(spacing).length) tokens.spacing = spacing
  const b = pick('desktop', (p) => p.button)
  if (b) {
    tokens.button = { paddingX: rem(b.paddingX), paddingY: rem(b.paddingY), weight: weight(b.weight) }
    if (['uppercase', 'lowercase', 'capitalize'].includes(b.transform)) tokens.button.transform = b.transform
    if (b.borderWidth) tokens.button.borderWidth = `${round(b.borderWidth, 2)}px`
  }
  const c = pick('desktop', (p) => p.card)
  if (c) tokens.card = { radius: rem(c.radius), shadow: !c.shadow ? 'none' : c.blur <= 3 ? 'sm' : c.blur <= 8 ? 'md' : 'lg', ...(c.borderWidth ? { borderWidth: `${round(c.borderWidth, 2)}px` } : {}) }
  const underline = pick('desktop', (p) => p.linkUnderline)
  if (underline !== null) tokens.link = { underline }
  return { tokens, buttonRadius: b ? (b.radius >= 999 ? '9999px' : rem(b.radius)) : null }
}

/** The home page and the first page of each template, at most 8. */
function stylePages(out, inventory) {
  const urls = [inventory.source]
  const exFile = path.join(out, 'extract.json')
  if (fs.existsSync(exFile)) for (const t of readJson(exFile).templates ?? []) urls.push(t.examples[0])
  const seen = new Set()
  return urls.filter((u) => u && !seen.has(pathOf(u)) && seen.add(pathOf(u))).slice(0, MAX_PAGES)
}

/**
 * @param {string} out a crawl folder (inventory.json; extract.json for one page per template)
 * @param {{ allowPrivate?: boolean, budgetMs?: number, log?: (s: string) => void, launchBrowser?: Function, lookup?: Function }} opts
 */
export async function style(out, { allowPrivate = false, budgetMs = 5 * 60_000, log = () => {}, launchBrowser = defaultLaunch, lookup } = {}) {
  const deadline = Date.now() + budgetMs
  const inventory = readJson(path.join(out, 'inventory.json'))
  const origin = new URL(inventory.source).origin
  const extract = fs.existsSync(path.join(out, 'extract.json')) ? readJson(path.join(out, 'extract.json')) : { pages: [] }
  const templateOf = new Map((extract.pages ?? []).map((p) => [pathOf(p.url), p.template]))
  const notes = []
  // The old site is the site being read here, so --allow-private applies to it.
  const opened = await openBrowser({ origin, allowPrivate, launchBrowser, lookup })
  if (opened.skipped) throw new Error(`${opened.skipped} style needs a browser.`)
  const measured = []
  try {
    for (const url of stylePages(out, inventory)) {
      const m = { url, template: templateOf.get(pathOf(url)) ?? null }
      for (const [vp, viewport] of VIEWPORTS) {
        if (Date.now() >= deadline) { notes.push(`Stopped at the time budget after ${measured.length} pages.`); break }
        log(`style ${pathOf(url)} (${vp})`)
        try {
          m[vp] = await withGuardedPage(opened.browser, viewport, { guard: opened.guard, timeoutMs: Math.min(PAGE_TIMEOUT_MS, deadline - Date.now()) }, async (page) => {
            await page.goto(url, { waitUntil: 'load' })
            await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
            await page.evaluate(() => document.fonts?.ready)
            return page.evaluate(PROBE)
          })
        } catch (e) { notes.push(`${url} (${vp}): ${String(e.message).split('\n')[0]}`) }
      }
      if (m.desktop) measured.push(m)
      if (Date.now() >= deadline) break
    }
  } finally { await opened.close() }
  if (!measured.length) throw new Error(`No page could be measured: ${notes.join('; ')}`)

  const { tokens, buttonRadius } = tokensFrom(measured)
  const header = mostCommon(measured.map((m) => m.desktop.header))
  if (header) notes.push(`Header: ${header.height}px high${header.sticky ? ', stays at the top when scrolling' : ''}. Site Kit's header layout is set in site/styles.css when it must differ.`)
  const templates = {}
  for (const m of measured) if (m.template && !templates[m.template]) templates[m.template] = { url: m.url, sections: m.desktop.sections }
  const result = { version: 1, source: inventory.source, measuredAt: new Date().toISOString(), tokens, buttonRadius, templates, pages: measured, notes }
  fs.writeFileSync(path.join(out, 'style.json'), JSON.stringify(result, null, 2))

  // Merge into theme.draft.json (written by `theme`), or start one with the tokens alone.
  const draftFile = path.join(out, 'theme.draft.json')
  const draft = fs.existsSync(draftFile) ? readJson(draftFile) : { theme: {}, notes: ['theme.draft.json had no colours yet: run theme for colours, fonts and the logo.'] }
  draft.theme = { ...draft.theme, ...tokens }
  if (buttonRadius) draft.theme.radius = { ...(draft.theme.radius ?? { card: '1rem' }), button: buttonRadius }
  draft.notes = [...(draft.notes ?? []).filter((n) => !n.startsWith('style:')), ...notes.map((n) => `style: ${n}`)]
  fs.writeFileSync(draftFile, JSON.stringify(draft, null, 2))
  return result
}
