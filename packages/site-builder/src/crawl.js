// Crawl one website politely and cache its HTML: robots.txt, same site (www/apex count as
// one), sitemap first, then links; a page cap, a time budget, two workers and a pause between
// requests.
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

import { detect } from './detect.js'
import { decode, language, load, title } from './html.js'
import { get as defaultGet } from './net.js'
import { parseRobots } from './robots.js'

export const IMAGE = /\.(jpe?g|png|gif|webp|svg|avif|ico|bmp|tiff?)$/i
const DOCUMENT = /\.(pdf|docx?|xlsx?|pptx?|zip|csv|txt|mp4|mov|webm)$/i
export const SKIP = /\.(css|js|mjs|json|xml|rss|atom|woff2?|ttf|otf|eot|map)$/i
export const MAX_SITEMAPS = 50
const SITEMAP_PATHS = ['/sitemap.xml', '/sitemap_index.xml', '/sitemap-index.xml']
const MAX_MEDIA = 5000
const MAX_DOCUMENTS = 2000
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex')

/** @param {string} a @param {string} b */
export function sameSite(a, b) {
  const bare = (h) => h.toLowerCase().replace(/^www\./, '')
  return bare(a) === bare(b)
}

/** @param {string} href @param {string} base @returns {string|null} */
export function normalize(href, base) {
  let u
  try { u = new URL(href, base) } catch { return null }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
  u.hash = ''
  for (const k of [...u.searchParams.keys()]) if (/^(utm_|fbclid$|gclid$|mc_)/i.test(k)) u.searchParams.delete(k)
  return u.toString()
}

function tally(map) {
  return [...map].map(([name, pages]) => ({ name, pages })).sort((a, b) => b.pages - a.pages)
}

/**
 * A GET that follows up to 3 redirects on the same site: robots.txt and sitemaps often redirect
 * (http→https, apex→www).
 * @param {typeof defaultGet} get @param {URL} root @param {boolean} allowPrivate
 */
export function followingGet(get, root, allowPrivate) {
  return async function getFollowing(url, extra) {
    let current = url
    for (let hop = 0; hop <= 3; hop++) {
      const r = await get(current, { allowPrivate, ...extra })
      if (r.status < 300 || r.status >= 400 || !r.headers.location) return r
      let next
      try { next = new URL(r.headers.location, current) } catch { return r }
      if (!sameSite(next.hostname, root.hostname)) return r
      current = next.toString()
    }
    return { status: 0, headers: {}, body: Buffer.alloc(0), truncated: false }
  }
}

/**
 * robots.txt decides what may be read. A refused (private) host throws. A missing one (4xx)
 * allows everything; a server error (5xx) allows nothing and says so in `note`. `text` is what
 * the site sent (empty unless it answered 200).
 * @returns {Promise<{ robots: ReturnType<typeof parseRobots>, text: string, unavailable: boolean, note?: string }>}
 */
export async function readRobots(getFollowing, root) {
  let text = ''
  let unavailable = false
  let note
  try {
    const r = await getFollowing(new URL('/robots.txt', root).toString(), { maxBytes: 512 * 1024 })
    if (r.status === 200) text = r.body.toString('utf8')
    if (r.status >= 500) {
      unavailable = true
      note = `robots.txt answered ${r.status}, so nothing was read. Try again when the site answers normally.`
    }
  } catch (e) {
    if (e.code === 'EPRIVATE') throw e
  }
  return { robots: parseRobots(unavailable ? 'User-agent: *\nDisallow: /\n' : text), text, unavailable, note }
}

/**
 * Reads the sitemaps: robots.txt's Sitemap lines, then the usual names, and the indexes they
 * lead to. Only sitemaps on the same site are read, each file once and at most MAX_SITEMAPS,
 * and each parsed document is let go before the next one is read. `onUrls` gets each sitemap's
 * page addresses and how many image entries it lists. Returns how many sitemaps were read.
 * @param {{ onUrls: (locs: string[], images: number, from: string) => void, stop?: () => boolean }} opts
 */
export async function readSitemaps(getFollowing, root, robots, { onUrls, stop = () => false }) {
  const seen = new Set()
  let count = 0
  async function read(url) {
    let u
    try { u = new URL(url) } catch { return }
    if (!sameSite(u.hostname, root.hostname)) return
    if (seen.has(url) || seen.size >= MAX_SITEMAPS || stop()) return
    seen.add(url)
    let r
    try { r = await getFollowing(url, { maxBytes: 10 * 1024 * 1024 }) } catch { return }
    if (r.status !== 200) return
    let subs
    let locs
    let images
    try {
      // A gzipped sitemap (sitemap.xml.gz) is known by its first bytes and unzipped under a cap.
      const gzipped = r.body.length >= 2 && r.body[0] === 0x1f && r.body[1] === 0x8b
      const text = (gzipped ? zlib.gunzipSync(r.body, { maxOutputLength: 50 * 1024 * 1024 }) : r.body).toString('utf8')
      const $ = load(text, { xml: true })
      subs = $('sitemap > loc').toArray().map((e) => $(e).text().trim())
      locs = $('url > loc').toArray().map((e) => $(e).text().trim())
      images = $('image\\:loc').length
    } catch { return }
    count++
    onUrls(locs, images, url)
    for (const s of subs) await read(s)
  }
  for (const s of [...robots.sitemaps, ...SITEMAP_PATHS.map((p) => new URL(p, root).toString())]) await read(s)
  return count
}

/**
 * @param {string} start
 * @param {{ out: string, maxPages?: number, budgetMs?: number, concurrency?: number, delayMs?: number, allowPrivate?: boolean, get?: typeof defaultGet, log?: (s: string) => void }} opts
 */
export async function crawl(start, opts) {
  const { out, maxPages = 500, budgetMs = 15 * 60_000, concurrency = 2, delayMs = 250, allowPrivate = false, log = () => {} } = opts
  if (!(Number.isInteger(maxPages) && maxPages > 0)) throw new Error('maxPages must be a positive whole number')
  if (!(Number.isFinite(budgetMs) && budgetMs > 0)) throw new Error('budgetMs must be a positive number')
  const get = opts.get ?? defaultGet
  // After the budget no new request starts; those in flight finish and what was read is written.
  const deadline = Date.now() + budgetMs
  let budgetReached = false
  const overBudget = () => (Date.now() >= deadline ? (budgetReached = true) : false)
  const notes = []
  const first = normalize(start, start)
  if (!first) throw new Error(`${start}: not an http(s) address`)
  const root = new URL(first)
  const rawDir = path.join(out, 'raw')
  fs.mkdirSync(rawDir, { recursive: true })

  // robots.txt decides what we may read; a refused (private) host stops everything here.
  const getFollowing = followingGet(get, root, allowPrivate)
  const { robots, unavailable, note: robotsNote } = await readRobots(getFollowing, root)
  if (robotsNote) notes.push(robotsNote)

  const pages = []
  const queue = []
  const seen = new Set()
  const blocked = new Set()
  const media = new Map()
  const documents = new Map()
  const trackers = new Map()
  const embeds = new Map()
  const cms = new Map()
  const languages = new Set()
  // Media and documents are listed up to a cap; a full list is noted at the end.
  const caps = new Map([[media, MAX_MEDIA], [documents, MAX_DOCUMENTS]])
  const full = new Set()
  const note = (map, key, from) => {
    if (!map.has(key) && map.size >= caps.get(map)) return full.add(map)
    map.set(key, (map.get(key) || new Set()).add(from))
  }
  const count = (map, names) => names.forEach((n) => map.set(n, (map.get(n) || 0) + 1))
  // Only so many addresses are worth remembering when only maxPages are read.
  const maxSeen = maxPages * 3
  let notQueued = 0

  function enqueue(href, from) {
    const n = normalize(href, from)
    if (!n) return
    const u = new URL(n)
    if (!sameSite(u.hostname, root.hostname)) return
    if (SKIP.test(u.pathname)) return
    if (IMAGE.test(u.pathname)) return note(media, n, from)
    if (DOCUMENT.test(u.pathname)) return note(documents, n, from)
    if (seen.has(n)) return
    if (seen.size >= maxSeen) { notQueued++; return }
    seen.add(n)
    if (!robots.allowed(u.pathname + u.search)) return blocked.add(n)
    queue.push(n)
  }

  // Sitemaps first (see readSitemaps), then links.
  enqueue(root.toString(), root.toString())
  if (!unavailable) await readSitemaps(getFollowing, root, robots, { stop: overBudget, onUrls: (locs, _images, from) => { for (const l of locs) enqueue(l, from) } })

  // A slot is reserved before the request, so two workers can never pass the cap together.
  let reserved = 0
  async function visit(url) {
    if (reserved >= maxPages) return
    reserved++
    let r
    try { r = await get(url, { allowPrivate, accept: 'text/html,application/xhtml+xml' }) } catch (e) {
      pages.push({ url, status: 0, error: e.message })
      return
    }
    const record = { url, status: r.status, contentType: String(r.headers['content-type'] || '').split(';')[0] }
    if (r.truncated) record.truncated = true
    pages.push(record)
    log(`${r.status} ${url}`)
    if (r.status >= 300 && r.status < 400 && r.headers.location) {
      try {
        record.location = new URL(r.headers.location, url).toString()
      } catch {
        record.error = `bad Location header: ${String(r.headers.location).slice(0, 200)}`
        return
      }
      enqueue(record.location, url)
      return
    }
    if (r.status !== 200 || !/html/i.test(record.contentType)) return
    const html = decode(r.body, r.headers['content-type'])
    record.file = path.join('raw', `${sha1(url)}.html`)
    fs.writeFileSync(path.join(out, record.file), html)
    // A page that cannot be read fails alone: the error is recorded and the crawl goes on.
    try { readPage(html, url, record) } catch (e) { record.error = e.message }
  }

  function readPage(html, url, record) {
    const $ = load(html)
    record.title = title($)
    record.lang = language($('html').attr('lang'))
    if (record.lang) languages.add(record.lang.split('-')[0])
    const hreflang = (e) => { const v = String($(e).attr('hreflang')).trim().toLowerCase(); return v === 'x-default' ? v : language(v) }
    record.alternates = $('link[rel="alternate"][hreflang]').toArray().map((e) => ({ lang: hreflang(e), href: normalize(String($(e).attr('href')), url) })).filter((a) => a.lang && a.href)
    for (const a of record.alternates) { if (a.lang !== 'x-default') languages.add(a.lang.split('-')[0]); enqueue(a.href, url) }
    count(trackers, detect.trackers(html))
    count(embeds, detect.embeds(html))
    count(cms, detect.cms(html))
    $('a[href]').each((_, e) => enqueue(String($(e).attr('href')), url))
    $('img[src]').each((_, e) => { const n = normalize(String($(e).attr('src')), url); if (n) note(media, n, url) })
  }

  let active = 0
  async function worker() {
    while (reserved < maxPages && !overBudget()) {
      const url = queue.shift()
      if (!url) {
        if (active === 0) return
        await sleep(20)
        continue
      }
      active++
      try { await visit(url) } finally { active-- }
      if (delayMs) await sleep(delayMs)
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
  if (full.has(media)) notes.push(`Only the first ${MAX_MEDIA} images are listed.`)
  if (full.has(documents)) notes.push(`Only the first ${MAX_DOCUMENTS} documents are listed.`)
  if (budgetReached) notes.push(`Stopped at the ${Math.round(budgetMs / 6000) / 10}-minute time budget; ${queue.length} queued addresses were not read.`)

  const inventory = {
    version: 1,
    source: root.toString(),
    crawledAt: new Date().toISOString(),
    robots: { sitemaps: robots.sitemaps, blocked: [...blocked] },
    pages,
    notQueued,
    media: [...media].map(([url, on]) => ({ url, foundOn: [...on].slice(0, 5) })),
    documents: [...documents].map(([url, on]) => ({ url, foundOn: [...on].slice(0, 5) })),
    trackers: tally(trackers),
    embeds: tally(embeds),
    cms: tally(cms),
    languages: [...languages],
    notes,
  }
  fs.writeFileSync(path.join(out, 'inventory.json'), JSON.stringify(inventory, null, 2))
  // The shape scripts/qa/url-parity.ts reads (site "main", per language).
  const urls = { main: {} }
  for (const p of pages) {
    const key = p.lang ? p.lang.split('-')[0] : 'default'
    ;(urls.main[key] ??= []).push({ url: p.url, path: new URL(p.url).pathname, status: p.status })
  }
  fs.writeFileSync(path.join(out, 'urls.json'), JSON.stringify(urls, null, 2))
  return inventory
}
