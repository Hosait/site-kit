// qc: the parity gate before a rebuilt site moves to its domain. Every old page is read on the new
// site and scored for content (text, headings, images, links, title and meta), the menu and footer
// once, the page and document counts, and old/new screenshots pixel by pixel. Writes qc.json,
// qc.md and qc.html; passes only when every score meets its threshold or the difference is listed
// in qc.accept.json (agreed with the customer).
import fs from 'node:fs'
import path from 'node:path'

import { check, defaultLaunch, openBrowser, pathOf, pool, reason, slug, withGuardedPage } from './compare.js'
import { extractPage } from './extract.js'
import { decode } from './html.js'
import { get as netGet } from './net.js'
import { headingScore, linkListScore, matchImages, matchLinks, metaProblems, textSimilarity, visualScore } from './qc-score.js'
import { qcHtml, qcMarkdown } from './qc-report.js'

export const DEFAULT_THRESHOLDS = Object.freeze({ text: 0.98, headings: 1, images: 1, links: 1, nav: 1, footer: 1, visual: 0.95 })
export const KINDS = ['missing', 'text', 'headings', 'images', 'links', 'meta', 'visual-desktop', 'visual-mobile', 'nav', 'footer', 'count-pages', 'count-documents']
const VIEWPORTS = [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]
const MAX_HEIGHT = 8000
const PAGE_TIMEOUT_MS = 45_000
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const pct = (x) => `${Math.floor(x * 1000) / 10} %`

/** qc.config.json (optional): thresholds and per-site masks (CSS selectors hidden before screenshots). */
export function readConfig(out) {
  const file = path.join(out, 'qc.config.json')
  const cfg = fs.existsSync(file) ? readJson(file) : {}
  const thresholds = { ...DEFAULT_THRESHOLDS }
  for (const [k, v] of Object.entries(cfg.thresholds ?? {})) {
    if (!(k in DEFAULT_THRESHOLDS) || typeof v !== 'number' || v < 0 || v > 1) throw new Error(`qc.config.json: thresholds.${k} must be one of ${Object.keys(DEFAULT_THRESHOLDS).join(', ')} with a number from 0 to 1`)
    thresholds[k] = v
  }
  const masks = { old: [], new: [] }
  for (const side of ['old', 'new']) {
    const list = cfg.masks?.[side] ?? []
    if (!Array.isArray(list) || list.some((s) => typeof s !== 'string' || !s.trim() || s.length > 200)) throw new Error(`qc.config.json: masks.${side} must be a list of CSS selectors`)
    masks[side] = list
  }
  return { thresholds, masks }
}

/** qc.accept.json (optional): [{ page: "/path" or "*", kind, reason }], differences the customer accepted. */
export function readAccepted(out) {
  const file = path.join(out, 'qc.accept.json')
  if (!fs.existsSync(file)) return []
  const list = readJson(file)
  if (!Array.isArray(list)) throw new Error('qc.accept.json must be a list of { page, kind, reason }')
  list.forEach((a, i) => {
    if (typeof a?.page !== 'string' || !(a.page === '*' || a.page.startsWith('/'))) throw new Error(`qc.accept.json[${i}].page must be a path or "*"`)
    if (!KINDS.includes(a.kind)) throw new Error(`qc.accept.json[${i}].kind must be one of ${KINDS.join(', ')}`)
    if (typeof a.reason !== 'string' || !a.reason.trim()) throw new Error(`qc.accept.json[${i}].reason is required: what the customer agreed to`)
  })
  return list
}

/** Marks each problem accepted (with the reason) when qc.accept.json lists it. */
export function applyAccepted(problems, page, accepted) {
  return problems.map((p) => {
    const a = accepted.find((x) => x.kind === p.kind && (x.page === '*' || x.page === page))
    return a ? { ...p, accepted: a.reason } : p
  })
}

/** Content problems of one page against its thresholds. */
export function scorePage(oldPage, newPage, { thresholds, moved, oldOrigin, newOrigin, expectedPath }) {
  const scores = {
    text: textSimilarity(oldPage.mainHtml ?? '', newPage.mainHtml ?? ''),
    headings: headingScore(oldPage.headings ?? [], newPage.headings ?? []),
    images: matchImages(oldPage.images ?? [], newPage.images ?? []),
    links: matchLinks(oldPage.links ?? [], newPage.links ?? [], { oldOrigin, newOrigin, moved }),
  }
  const problems = []
  if (scores.text < thresholds.text) problems.push({ kind: 'text', detail: `${pct(scores.text)} of the words match (needs ${pct(thresholds.text)})` })
  if (scores.headings.score < thresholds.headings) problems.push({ kind: 'headings', detail: `missing or out of order: ${scores.headings.missing.slice(0, 5).join(' | ') || '–'}${scores.headings.extra.length ? `; extra: ${scores.headings.extra.slice(0, 5).join(' | ')}` : ''}` })
  if (scores.images.score < thresholds.images) problems.push({ kind: 'images', detail: `${scores.images.missing.length} not found: ${scores.images.missing.slice(0, 5).join(', ')}` })
  if (scores.links.score < thresholds.links) problems.push({ kind: 'links', detail: `${scores.links.missing.length} not found: ${scores.links.missing.slice(0, 5).join(', ')}` })
  for (const m of metaProblems(oldPage, newPage, { expectedPath })) problems.push({ kind: 'meta', detail: m })
  return { scores: { text: scores.text, headings: scores.headings.score, images: scores.images.score, links: scores.links.score }, problems }
}

/** Requests a page in full (permanent redirects already resolved by check()). */
async function fetchHtml(url, { get, allowPrivate }) {
  const r = await get(url, { allowPrivate, accept: 'text/html,application/xhtml+xml' })
  if (r.status !== 200) throw new Error(`${url} answered ${r.status}`)
  return decode(r.body, r.headers['content-type'])
}

/** Locations in the new site's sitemap (one level of sitemap index followed, same origin only). */
async function sitemapCount(origin, { get, allowPrivate }) {
  const locs = async (url) => {
    const r = await get(url, { allowPrivate, maxBytes: 5 * 1024 * 1024 })
    if (r.status !== 200) throw new Error(`${url} answered ${r.status}`)
    const xml = r.body.toString('utf8')
    return { index: /<sitemapindex/i.test(xml), locs: [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]) }
  }
  const top = await locs(`${origin}/sitemap.xml`)
  if (!top.index) return new Set(top.locs).size
  const all = new Set()
  for (const child of top.locs.filter((u) => new URL(u, origin).origin === origin)) for (const l of (await locs(new URL(child, origin).href)).locs) all.add(l)
  return all.size
}

async function apiCount(origin, collection, { get, allowPrivate }) {
  const r = await get(`${origin}/api/${collection}?limit=1&depth=0`, { allowPrivate, accept: 'application/json' })
  if (r.status !== 200) throw new Error(`/api/${collection} answered ${r.status}`)
  const n = JSON.parse(r.body.toString('utf8')).totalDocs
  if (!Number.isInteger(n)) throw new Error(`/api/${collection} gave no totalDocs`)
  return n
}

// Run in the page: hide cookie and consent banners (fixed or sticky, not the header) and the
// configured masks, then report the document height and where each h1–h3 is.
const PREPARE = (masks) => {
  const banner = /cookie|consent|informasjonskapsl|samtykke|gdpr/i
  const known = ['#CybotCookiebotDialog', '#onetrust-consent-sdk', '#usercentrics-root', '.cc-window', '#cookie-law-info-bar', '.cky-consent-container', '#cmplz-cookiebanner-container', '#moove_gdpr_cookie_info_bar']
  for (const el of document.querySelectorAll('body *')) {
    const pos = getComputedStyle(el).position
    if ((pos === 'fixed' || pos === 'sticky') && el.tagName !== 'HEADER' && !el.querySelector('nav')) {
      const text = `${el.id} ${el.getAttribute('class') ?? ''} ${el.getAttribute('aria-label') ?? ''} ${(el.textContent ?? '').slice(0, 400)}`
      if (banner.test(text)) el.style.setProperty('display', 'none', 'important')
    }
  }
  for (const sel of [...known, ...masks]) {
    try { for (const el of document.querySelectorAll(sel)) el.style.setProperty('visibility', 'hidden', 'important') } catch {}
  }
  const height = Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight ?? 0)
  const boxes = [...document.querySelectorAll('h1, h2, h3')]
    .filter((h) => h.getClientRects().length)
    .map((h) => ({ text: (h.textContent ?? '').trim().slice(0, 200), y: h.getBoundingClientRect().top + scrollY }))
    .filter((b) => b.text)
  return { height, boxes }
}

/** One full-page screenshot with animations off, lazy images loaded and banners hidden. */
async function capture(browser, url, viewport, file, { guard, timeoutMs, masks }) {
  return withGuardedPage(browser, viewport, { guard, timeoutMs }, async (page) => {
    await page.goto(url, { waitUntil: 'load' })
    await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' })
    // Scroll through once so lazy images load, then back to the top.
    await page.evaluate(async () => {
      for (let y = 0; y < Math.min(document.documentElement.scrollHeight, 8000); y += innerHeight) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)) }
      scrollTo(0, 0)
    })
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
    await page.evaluate(() => document.fonts?.ready)
    const { height, boxes } = await page.evaluate(PREPARE, masks)
    const h = Math.max(1, Math.min(height, MAX_HEIGHT))
    await page.screenshot({ path: file, fullPage: true, animations: 'disabled', clip: { x: 0, y: 0, width: viewport.width, height: h } })
    return { boxes, truncated: height > MAX_HEIGHT }
  })
}

/** Pages to screenshot: the home page and up to 3 examples per template, or every page. */
function shotPaths(extracted, home, { allPages, maxShots }) {
  const paths = allPages ? extracted.pages.map((p) => p.path) : [home, ...extracted.templates.flatMap((t) => t.examples.slice(0, 3).map((u) => new URL(u).pathname))]
  return [...new Set(paths)].slice(0, maxShots)
}

/**
 * @param {string} out a crawl folder after extract (extract.json, inventory.json, urls.json)
 * @param {{ newBase: string, allowPrivate?: boolean, allPages?: boolean, maxShots?: number, budgetMs?: number, log?: (s: string) => void, get?: typeof netGet, launchBrowser?: Function, lookup?: Function }} opts
 */
export async function qc(out, { newBase, allowPrivate = false, allPages = false, maxShots = 40, budgetMs = 20 * 60_000, log = () => {}, get = netGet, launchBrowser = defaultLaunch, lookup }) {
  const deadline = Date.now() + budgetMs
  const over = () => Date.now() >= deadline
  const exFile = path.join(out, 'extract.json')
  if (!fs.existsSync(exFile)) throw new Error('qc needs extract.json in the crawl folder: run extract first')
  const extracted = readJson(exFile)
  const inventory = readJson(path.join(out, 'inventory.json'))
  const { thresholds, masks } = readConfig(out)
  const accepted = readAccepted(out)
  const oldOrigin = new URL(inventory.source).origin
  const newOrigin = new URL(newBase).origin
  const notes = []

  // 1. Where each old page is on the new site (200, or permanent redirects to a 200).
  const resolved = (await pool(extracted.pages, async (p) => (over() ? null : { p, r: await check(p.url, newOrigin, allowPrivate, get) }))).filter(Boolean)
  const moved = new Map(resolved.filter(({ r }) => r.ok && r.final).map(({ p, r }) => [p.path.replace(/\/+$/, '') || '/', pathOf(r.final).replace(/\/+$/, '') || '/']))

  // 2. Content, page by page.
  const pages = await pool(resolved, async ({ p, r }) => {
    const base = { path: p.path, old: p.url, new: r.final ?? r.target, template: p.template }
    if (!r.ok) return { ...base, problems: [{ kind: 'missing', detail: `answers ${r.status}${r.note ? ` (${r.note})` : ''}` }] }
    if (over()) return { ...base, problems: [], unchecked: true }
    try {
      const html = await fetchHtml(base.new, { get, allowPrivate })
      const fresh = extractPage(html, base.new)
      const scored = scorePage(p, fresh, { thresholds, moved, oldOrigin, newOrigin, expectedPath: pathOf(base.new) })
      log(`content ${p.path}: ${scored.problems.length ? scored.problems.map((x) => x.kind).join(', ') : 'ok'}`)
      return { ...base, ...scored, fresh }
    } catch (e) {
      return { ...base, problems: [{ kind: 'missing', detail: reason(e) }] }
    }
  })
  if (resolved.length < extracted.pages.length || pages.some((p) => p.unchecked)) notes.push('Stopped at the time budget before every page was checked. Run qc again with a larger --budget.')

  // 3. The menu and footer, and the counts. extract keeps the site's most common menu and footer;
  // each is compared with the new version of an old page that had exactly that one (on a site in
  // two languages, a page in the same language).
  const site = { problems: [] }
  const oldByPath = new Map(extracted.pages.map((p) => [p.path, p]))
  const pageWith = (pick) => {
    const want = JSON.stringify(pick(extracted) ?? null)
    return pages.find((p) => p.fresh && JSON.stringify(pick(oldByPath.get(p.path) ?? {}) ?? null) === want) ?? pages.find((p) => p.fresh)
  }
  const navPage = pageWith((x) => x.nav)
  const footerPage = pageWith((x) => x.footer?.links)
  if (navPage) {
    site.nav = linkListScore(extracted.nav ?? [], navPage.fresh.nav ?? [], { oldOrigin, newOrigin, moved })
    site.footer = linkListScore(extracted.footer?.links ?? [], footerPage.fresh.footer?.links ?? [], { oldOrigin, newOrigin, moved })
    if (site.nav.score < thresholds.nav) site.problems.push({ kind: 'nav', detail: `menu items not found (compared on ${navPage.path}): ${site.nav.missing.slice(0, 8).join(' | ')}` })
    if (site.footer.score < thresholds.footer) site.problems.push({ kind: 'footer', detail: `footer links not found (compared on ${footerPage.path}): ${site.footer.missing.slice(0, 8).join(' | ')}` })
  }
  site.counts = { pages: { old: extracted.pages.length }, documents: { old: (inventory.documents ?? []).filter((d) => new URL(d.url).origin === oldOrigin).length }, images: { old: (inventory.media ?? []).length } }
  const count = async (key, fn) => { try { site.counts[key].new = await fn() } catch (e) { notes.push(`Could not count ${key} on the new site: ${reason(e)}`) } }
  await count('pages', () => sitemapCount(newOrigin, { get, allowPrivate }))
  await count('documents', () => apiCount(newOrigin, 'documents', { get, allowPrivate }))
  await count('images', () => apiCount(newOrigin, 'media', { get, allowPrivate }))
  for (const key of ['pages', 'documents']) {
    const c = site.counts[key]
    if (c.new === undefined) site.problems.push({ kind: `count-${key}`, detail: `could not be counted on the new site` })
    else if (c.new !== c.old) site.problems.push({ kind: `count-${key}`, detail: `old site ${c.old}, new site ${c.new}` })
  }
  site.problems = applyAccepted(site.problems, '*', accepted)

  // 4. Screenshots, old and new, scored pixel by pixel.
  const byPath = new Map(pages.map((p) => [p.path, p]))
  const homePath = new URL(inventory.source).pathname
  const wanted = shotPaths(extracted, homePath, { allPages, maxShots }).map((p) => byPath.get(p)).filter((p) => p?.fresh)
  let shotsDone = 0
  if (!over() && wanted.length) {
    const opened = await openBrowser({ origin: newOrigin, allowPrivate, launchBrowser, lookup })
    if (opened.skipped) notes.push(`${opened.skipped} Visual parity was not checked, so qc cannot pass.`)
    else {
      const dir = path.join(out, 'shots', 'qc')
      fs.mkdirSync(dir, { recursive: true })
      const used = new Set()
      try {
        shots: for (const page of wanted) {
          const name = slug(page.path, used)
          page.visual = {}
          for (const [vp, viewport] of VIEWPORTS) {
            if (over()) { notes.push(`Screenshots stopped at the time budget after ${shotsDone} pages.`); break shots }
            log(`screenshots ${page.path} (${vp})`)
            const files = { old: `shots/qc/${name}-${vp}-old.png`, new: `shots/qc/${name}-${vp}-new.png`, diff: `shots/qc/${name}-${vp}-diff.png` }
            try {
              const opts = { guard: opened.guard, timeoutMs: Math.min(PAGE_TIMEOUT_MS, deadline - Date.now()) }
              const a = await capture(opened.browser, page.old, viewport, path.join(out, files.old), { ...opts, masks: masks.old })
              const b = await capture(opened.browser, page.new, viewport, path.join(out, files.new), { ...opts, masks: masks.new })
              const v = visualScore(fs.readFileSync(path.join(out, files.old)), fs.readFileSync(path.join(out, files.new)), { oldBoxes: a.boxes, newBoxes: b.boxes })
              fs.writeFileSync(path.join(out, files.diff), v.diff)
              page.visual[vp] = { similarity: v.similarity, ...files, truncated: a.truncated || b.truncated }
              if (v.similarity < thresholds.visual) page.problems.push({ kind: `visual-${vp}`, detail: `${pct(v.similarity)} of the pixels match (needs ${pct(thresholds.visual)})` })
            } catch (e) {
              page.problems.push({ kind: `visual-${vp}`, detail: `screenshot failed: ${String(e.message).split('\n')[0]}` })
            }
          }
          shotsDone++
        }
      } finally { await opened.close() }
    }
  }
  if (shotsDone < wanted.length && !notes.some((n) => n.startsWith('Screenshots stopped'))) notes.push(`Screenshots taken for ${shotsDone} of ${wanted.length} pages.`)

  // 5. Accepted differences, the verdict, and the reports.
  for (const p of pages) { p.problems = applyAccepted(p.problems, p.path, accepted); delete p.fresh }
  const open = (list) => list.filter((x) => !x.accepted)
  for (const p of pages) p.pass = !p.unchecked && open(p.problems).length === 0
  const complete = resolved.length === extracted.pages.length && !pages.some((p) => p.unchecked) && shotsDone === wanted.length && wanted.length > 0
  const pass = complete && pages.every((p) => p.pass) && open(site.problems).length === 0
  const result = { newBase, checkedAt: new Date().toISOString(), pass, complete, thresholds, summary: { pages: pages.length, passing: pages.filter((p) => p.pass).length, screenshotted: shotsDone }, site, pages, notes }
  fs.writeFileSync(path.join(out, 'qc.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(path.join(out, 'qc.md'), qcMarkdown(result))
  fs.writeFileSync(path.join(out, 'qc.html'), qcHtml(result))
  return result
}
