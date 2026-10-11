// Crawl one website politely and cache its HTML: robots.txt, same site (www/apex count as
// one), sitemap first, then links; a page cap, two workers and a pause between requests.
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'

import { detect } from './detect.js'
import { get as defaultGet } from './net.js'
import { parseRobots } from './robots.js'

const IMAGE = /\.(jpe?g|png|gif|webp|svg|avif|ico|bmp|tiff?)$/i
const DOCUMENT = /\.(pdf|docx?|xlsx?|pptx?|zip|csv|txt|mp4|mov|webm)$/i
const SKIP = /\.(css|js|mjs|json|xml|rss|atom|woff2?|ttf|otf|eot|map)$/i
const MAX_SITEMAPS = 50
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
 * @param {string} start
 * @param {{ out: string, maxPages?: number, concurrency?: number, delayMs?: number, allowPrivate?: boolean, get?: typeof defaultGet, log?: (s: string) => void }} opts
 */
export async function crawl(start, opts) {
  const { out, maxPages = 500, concurrency = 2, delayMs = 250, allowPrivate = false, log = () => {} } = opts
  const get = opts.get ?? defaultGet
  const first = normalize(start, start)
  if (!first) throw new Error(`${start}: not an http(s) address`)
  const root = new URL(first)
  const rawDir = path.join(out, 'raw')
  fs.mkdirSync(rawDir, { recursive: true })

  // robots.txt and sitemaps often redirect (http→https, apex→www): follow up to 3 hops on the same site.
  async function getFollowing(url, extra) {
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

  // robots.txt decides what we may read. A refused (private) host stops everything here.
  let robotsText = ''
  try {
    const r = await getFollowing(new URL('/robots.txt', root).toString(), { maxBytes: 512 * 1024 })
    if (r.status === 200) robotsText = r.body.toString('utf8')
  } catch (e) {
    if (e.code === 'EPRIVATE') throw e
  }
  const robots = parseRobots(robotsText)

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
  const note = (map, key, from) => map.set(key, (map.get(key) || new Set()).add(from))
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
    if (!robots.allowed(u.pathname)) return blocked.add(n)
    queue.push(n)
  }

  // Sitemaps first: robots.txt's Sitemap lines, then the usual names. Each file is read once,
  // and its parsed document is let go before the next one is read.
  const sitemapSeen = new Set()
  async function readSitemap(url) {
    if (sitemapSeen.has(url) || sitemapSeen.size >= MAX_SITEMAPS) return
    sitemapSeen.add(url)
    let r
    try { r = await getFollowing(url, { maxBytes: 10 * 1024 * 1024 }) } catch { return }
    if (r.status !== 200) return
    let subs
    let locs
    {
      const $ = cheerio.load(r.body.toString('utf8'), { xmlMode: true })
      subs = $('sitemap > loc').map((_, e) => $(e).text().trim()).get()
      locs = $('url > loc').map((_, e) => $(e).text().trim()).get()
    }
    for (const l of locs) enqueue(l, url)
    for (const s of subs) await readSitemap(s)
  }
  enqueue(root.toString(), root.toString())
  for (const s of [...robots.sitemaps, ...['/sitemap.xml', '/sitemap_index.xml', '/sitemap-index.xml'].map((p) => new URL(p, root).toString())]) await readSitemap(s)

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
    const html = r.body.toString('utf8')
    record.file = path.join('raw', `${sha1(url)}.html`)
    fs.writeFileSync(path.join(out, record.file), html)
    const $ = cheerio.load(html)
    record.title = $('title').first().text().trim()
    record.lang = ($('html').attr('lang') || '').trim().toLowerCase() || undefined
    if (record.lang) languages.add(record.lang.split('-')[0])
    record.alternates = $('link[rel="alternate"][hreflang]').map((_, e) => ({ lang: String($(e).attr('hreflang')).toLowerCase(), href: normalize(String($(e).attr('href')), url) })).get().filter((a) => a.href)
    for (const a of record.alternates) { if (a.lang !== 'x-default') languages.add(a.lang.split('-')[0]); enqueue(a.href, url) }
    count(trackers, detect.trackers(html))
    count(embeds, detect.embeds(html))
    count(cms, detect.cms(html))
    $('a[href]').each((_, e) => enqueue(String($(e).attr('href')), url))
    $('img[src]').each((_, e) => { const n = normalize(String($(e).attr('src')), url); if (n) note(media, n, url) })
  }

  let active = 0
  async function worker() {
    while (reserved < maxPages) {
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
