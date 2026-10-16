// Checks the new site against the old one before the domain moves: every old address that
// answered 200 must answer 200 on the new site, or 301/308 there to a page that does. So must every
// document (PDFs and the like) that still answers 200 on the old site. Then, if Playwright is
// installed, old and new screenshots side by side (home page and one per template).
import fs from 'node:fs'
import path from 'node:path'

import { startFilterProxy } from './filter-proxy.js'
import { get as netGet, publicOnlyLookup } from './net.js'

const MOVED = [301, 308]
const TEMPORARY = [302, 303, 307]
const MAX_HOPS = 3
const CONCURRENCY = 4
const MAX_PAGES = 12
const MAX_HEIGHT = 4000
const VIEWPORTS = [['desktop', { width: 1280, height: 800 }], ['mobile', { width: 390, height: 844 }]]
const NO_PLAYWRIGHT = 'Screenshots skipped: Playwright is not available (pnpm exec playwright install chromium).'
const PAGE_TIMEOUT_MS = 30_000
/** The browser always runs with its sandbox; if it cannot start with it, there are no screenshots. */
export const LAUNCH = Object.freeze({ chromiumSandbox: true })
const reason = (e) => (e.code === 'EPRIVATE' ? `${e.message}. Use --allow-private only for your own local or intranet sites.` : e.message)
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const pathOf = (url) => { const u = new URL(url); return u.pathname + u.search }
const resolve = (location, base) => { try { return location ? new URL(location, base) : null } catch { return null } }
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
async function defaultLaunch(options) {
  let playwright
  try { playwright = await import('@playwright/test') } catch (e) { throw Object.assign(e, { code: 'NO_PLAYWRIGHT' }) }
  return playwright.chromium.launch(options)
}

/**
 * Whether the browser may make a request: http(s) to a public address, or the page's own data:
 * and blob: content. A private address only for the new site's own origin, and only with
 * --allow-private; never for the old site or anything else (metadata services, the intranet).
 * It sees only the first address of a redirect; the filtering proxy (src/filter-proxy.js) checks
 * every connection the browser makes.
 * @param {string} url @param {{ newOrigin: string, allowPrivate: boolean, lookup?: typeof publicOnlyLookup, cache?: Map<string, Promise<boolean>> }} opts
 */
export async function allowRequest(url, { newOrigin, allowPrivate, lookup = publicOnlyLookup, cache }) {
  let u
  try { u = new URL(url) } catch { return false }
  if (u.protocol === 'data:' || u.protocol === 'blob:') return true
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return false
  if (allowPrivate && u.origin === newOrigin) return true
  const host = u.hostname.replace(/^\[|\]$/g, '')
  const ask = () => new Promise((ok) => lookup(host, {}, (e) => ok(!e)))
  if (!cache) return ask()
  if (!cache.has(host)) cache.set(host, ask())
  return cache.get(host)
}

/** Every old address that answered 200, in all languages, once per path and query. */
function oldAddresses(out) {
  const seen = new Map()
  for (const byLang of Object.values(readJson(path.join(out, 'urls.json'))))
    for (const entries of Object.values(byLang))
      for (const e of entries) if (e.status === 200 && !seen.has(pathOf(e.url))) seen.set(pathOf(e.url), e.url)
  return [...seen.values()]
}

/** The crawl's documents on the old site's own origin, once per path and query. */
function oldDocuments(out) {
  const inv = readJson(path.join(out, 'inventory.json'))
  const origin = new URL(inv.source).origin
  const seen = new Map()
  for (const d of inv.documents ?? []) if (new URL(d.url).origin === origin && !seen.has(pathOf(d.url))) seen.set(pathOf(d.url), d.url)
  return [...seen.values()]
}

/** Runs fn on every item, 4 at a time; the answers keep the items' order. */
async function pool(items, fn) {
  const answers = new Array(items.length)
  let next = 0
  async function worker() {
    while (next < items.length) {
      const i = next++
      answers[i] = await fn(items[i])
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  return answers
}

/** Requests the old address on the new site and follows at most 3 permanent redirects there. */
async function check(old, origin, allowPrivate, get) {
  const target = origin + pathOf(old)
  const row = (status, final, note) => ({ old, target, status, final, ok: status === 200, note })
  let url = target
  try {
    for (let hop = 0; ; hop++) {
      const r = await get(url, { allowPrivate, maxBytes: 16 * 1024, accept: 'text/html,application/xhtml+xml' })
      const reached = hop ? url : undefined
      if (!MOVED.includes(r.status) && !TEMPORARY.includes(r.status)) return row(r.status, reached)
      const next = resolve(r.headers.location, url)
      if (!next) return row(r.status, reached, 'bad Location header')
      if (TEMPORARY.includes(r.status)) return row(r.status, next.toString(), `temporary redirect (${r.status})`)
      if (next.origin !== origin) return row(r.status, next.toString(), 'leaves the new site')
      if (hop === MAX_HOPS) return row(r.status, next.toString(), 'too many redirects')
      url = next.toString()
    }
  } catch (e) {
    return row(0, undefined, reason(e))
  }
}

/** File name part from a path: home for /, else the segments joined with -, [a-z0-9-] only. */
function slug(p, used) {
  const base = p.split('/').filter(Boolean).join('-').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-/, '').slice(0, 60).replace(/-$/, '') || 'home'
  let name = base
  for (let i = 2; used.has(name); i++) name = `${base.slice(0, 60 - String(i).length - 1)}-${i}`
  used.add(name)
  return name
}

/** The home page and the first page of each template, at most 12. */
function shotPages(out, origin, notes) {
  const urls = [readJson(path.join(out, 'inventory.json')).source]
  const exFile = path.join(out, 'extract.json')
  if (fs.existsSync(exFile)) urls.push(...readJson(exFile).templates.map((t) => t.examples[0]))
  else notes.push('extract.json not found: only the home page was screenshotted (run extract first).')
  const seen = new Set()
  const used = new Set()
  return urls
    .filter((u) => !seen.has(pathOf(u)) && seen.add(pathOf(u)))
    .slice(0, MAX_PAGES)
    .map((u) => ({ page: pathOf(u), slug: slug(new URL(u).pathname, used), old: u, new: origin + pathOf(u) }))
}

async function snap(browser, url, viewport, file, { guard, timeoutMs }) {
  // Every request the page makes goes through the address check, and every connection through the
  // filtering proxy the browser was started with; no service workers, downloads or WebSockets.
  const context = await browser.newContext({ viewport, serviceWorkers: 'block', acceptDownloads: false })
  try {
    await context.route('**/*', async (route) => ((await guard(route.request().url())) ? route.continue() : route.abort('blockedbyclient')))
    if (context.routeWebSocket) await context.routeWebSocket(/.*/, (ws) => ws.close())
    const page = await context.newPage()
    page.setDefaultTimeout(timeoutMs)
    page.setDefaultNavigationTimeout(timeoutMs)
    try {
      await page.goto(url)
      await page.screenshot({ path: file, fullPage: true, clip: { x: 0, y: 0, width: viewport.width, height: MAX_HEIGHT } })
    } finally { await page.close() }
  } finally { await context.close() }
}

/** Rejects (EPRIVATE) when the host is or resolves to a private address, as the fetcher would. */
function publicHost(origin) {
  const host = new URL(origin).hostname.replace(/^\[|\]$/g, '')
  return new Promise((ok, fail) => publicOnlyLookup(host, {}, (e) => (e ? fail(e) : ok())))
}

/** @returns {Promise<{ shots: object[], pairs?: object[], skipped?: string }>} */
async function screenshots(out, { origin, allowPrivate, launchBrowser, log, notes, deadline, lookup }) {
  // The browser resolves the new site's name itself: it may not reach what the fetcher refuses.
  if (!allowPrivate) {
    try { await publicHost(origin) } catch (e) { return { shots: [], skipped: `Screenshots skipped: ${reason(e)}` } }
  }
  // The browser's only way out: every request, loopback included, goes through the filtering
  // proxy, which allows a private address only for the new site's own host and port.
  const site = new URL(origin)
  const proxy = await startFilterProxy({ allow: allowPrivate ? { host: site.hostname, port: site.port || (site.protocol === 'https:' ? '443' : '80') } : null })
  let browser
  try { browser = await launchBrowser({ ...LAUNCH, proxy: { server: proxy.url, bypass: '<-loopback>' } }) } catch (e) {
    await proxy.close()
    if (e.code === 'NO_PLAYWRIGHT') return { shots: [], skipped: NO_PLAYWRIGHT }
    return { shots: [], skipped: `Screenshots skipped: the browser could not start with its sandbox (${String(e.message).split('\n')[0]}). It is never run without one.` }
  }
  const cache = new Map()
  const guard = (url) => allowRequest(url, { newOrigin: origin, allowPrivate, lookup, cache })
  const pairs = []
  try {
    const pages = shotPages(out, origin, notes)
    fs.mkdirSync(path.join(out, 'shots'), { recursive: true })
    shots: for (const p of pages) {
      log(`screenshots ${p.page}`)
      for (const [name, viewport] of VIEWPORTS) {
        const pair = { page: p.page, viewport: name, old: null, new: null, oldUrl: p.old, newUrl: p.new }
        for (const side of ['old', 'new']) {
          const left = deadline - Date.now()
          if (left <= 0) {
            notes.push(`Screenshots stopped at the time budget; ${pairs.length} pairs were taken.`)
            if (pair.old || pair.new) pairs.push(pair)
            break shots
          }
          const file = `shots/${p.slug}-${name}-${side}.png`
          try { await snap(browser, p[side], viewport, path.join(out, file), { guard, timeoutMs: Math.min(PAGE_TIMEOUT_MS, left) }); pair[side] = file } catch (e) { notes.push(`Screenshot of ${p[side]} (${name}) failed: ${e.message.split('\n')[0]}`) }
        }
        pairs.push(pair)
      }
    }
  } finally {
    await browser.close().catch(() => {})
    await proxy.close()
  }
  return { shots: pairs.map(({ page, viewport, old, new: n }) => ({ page, viewport, old, new: n })), pairs }
}

function html(newBase, pairs) {
  const fig = (label, url, file) => `<figure><figcaption>${label}: ${esc(url)}</figcaption>${file ? `<img src="${esc(file)}" alt="${label} site">` : '<p class="none">No screenshot</p>'}</figure>`
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Compare with ${esc(newBase)}</title>
<style>
body{font:14px/1.4 system-ui,sans-serif;margin:24px;color:#222;background:#fff}
section{margin:0 0 40px}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}
figure{margin:0}
figcaption{margin:0 0 6px;color:#555;word-break:break-all}
img{max-width:100%;border:1px solid #ccc}
.none{padding:40px;border:1px dashed #ccc;text-align:center;color:#777}
</style></head><body>
<h1>Compare with ${esc(newBase)}</h1>
<p>Old site left, new site right.</p>
${pairs.map((p) => `<section><h2>${esc(p.page)} · ${esc(p.viewport)}</h2><div class="pair">${fig('Old', p.oldUrl, p.old)}${fig('New', p.newUrl, p.new)}</div></section>`).join('\n')}
</body></html>
`
}

function markdown(newBase, results, documents, skipped, notes) {
  const lines = [`# Compare with ${newBase}`, '']
  const section = (rows, what) => {
    const bad = rows.filter((r) => !r.ok)
    lines.push(`${rows.length} old ${what} checked: ${rows.length - bad.length} OK, ${bad.length} fail.`, '')
    for (const r of bad) lines.push(`- ${r.status} ${pathOf(r.old)} → ${r.final ?? r.target}${r.note ? ` (${r.note})` : ''}`)
    if (bad.length) lines.push('')
  }
  section(results, 'addresses')
  if (documents.length) section(documents, 'documents')
  lines.push('## Screenshots', '', skipped ?? 'Old and new, desktop and mobile, side by side: [compare.html](compare.html)', '')
  const other = notes.filter((n) => n !== skipped)
  if (other.length) lines.push('## Notes', '', ...other.map((n) => `- ${n}`), '')
  return lines.join('\n')
}

/**
 * @param {string} out a crawl folder (urls.json, inventory.json, optionally extract.json)
 * --allow-private applies to the new site only: the old site's addresses and documents are always
 * fetched as public. budgetMs bounds the whole run: the address and document checks, then the
 * screenshots (each page also times out at 30 s).
 * @param {{ newBase: string, allowPrivate?: boolean, log?: (s: string) => void, launchBrowser?: (options: object) => Promise<any>, get?: typeof netGet, budgetMs?: number, lookup?: typeof publicOnlyLookup }} opts
 */
export async function compare(out, { newBase, allowPrivate = false, log = () => {}, launchBrowser = defaultLaunch, get = netGet, budgetMs = 10 * 60_000, lookup }) {
  const deadline = Date.now() + budgetMs
  const over = () => Date.now() >= deadline
  const origin = new URL(newBase).origin
  const notes = []
  // After the budget no new check starts; the ones running finish.
  const checked = async (old) => {
    if (over()) return null
    const r = await check(old, origin, allowPrivate, get)
    log(`${r.status} ${r.target}${r.final ? ` → ${r.final}` : ''}${r.note ? ` (${r.note})` : ''}`)
    return r
  }
  const addresses = oldAddresses(out)
  const results = (await pool(addresses, checked)).filter(Boolean)
  if (results.length < addresses.length) notes.push(`Stopped at the time budget: ${results.length} of ${addresses.length} old addresses were checked. Run compare again with a larger --budget.`)
  // The crawl does not fetch documents, so each is first asked for on the old site (16 KB at most);
  // only one that answers 200 there is judged on the new site.
  const docs = oldDocuments(out)
  const before = await pool(docs, (d) => (over() ? null : get(d, { allowPrivate: false, maxBytes: 16 * 1024 }).then((r) => r.status, reason)))
  const documents = (await pool(docs.filter((_, i) => before[i] === 200), checked)).filter(Boolean)
  const asked = before.filter((b) => b !== null).length
  if (asked < docs.length || documents.length < before.filter((b) => b === 200).length) notes.push(`Stopped at the time budget: ${documents.length} of ${docs.length} old documents were checked.`)
  const broken = docs.flatMap((d, i) => (before[i] === 200 || before[i] === null ? [] : [`${pathOf(d)} (${before[i]})`]))

  if (broken.length) notes.push(`${broken.length} documents did not work on the old site either and were not checked: ${broken.slice(0, 10).join(', ')}${broken.length > 10 ? ', …' : ''}`)
  let shot
  // Screenshots never fail the command.
  try { shot = await screenshots(out, { origin, allowPrivate, launchBrowser, log, notes, deadline, lookup }) } catch (e) { shot = { shots: [], skipped: `Screenshots skipped: ${e.message}` } }
  if (shot.skipped) notes.push(shot.skipped)
  if (shot.pairs) fs.writeFileSync(path.join(out, 'compare.html'), html(newBase, shot.pairs))

  fs.writeFileSync(path.join(out, 'compare.json'), JSON.stringify({ newBase, checkedAt: new Date().toISOString(), results, documents, shots: shot.shots, notes }, null, 2))
  fs.writeFileSync(path.join(out, 'compare.md'), markdown(newBase, results, documents, shot.skipped, notes))
  return { results, documents, shots: shot.shots, notes }
}
