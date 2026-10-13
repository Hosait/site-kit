// Turns cached pages into a neutral model the mapping step (an AI) can read: per page its
// title, meta, headings, main content, images and links, plus a template fingerprint, and the
// site's navigation and footer.
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import { load } from './html.js'

// Page chrome: never the main content. Inside the main content only code, forms, navigation and
// icons are dropped; an article's own header (lead, date) and embedded videos are content.
const CHROME = 'script, style, noscript, template, svg, iframe, form, nav, header, footer, aside, [role=navigation], [role=banner], [role=contentinfo], [aria-hidden=true]'
const DROP_IN_MAIN = 'script, style, noscript, template, svg, form, nav, [role=navigation], [aria-hidden=true]'
const MAX_MAIN = 50_000

const abs = (href, base) => { try { return new URL(href, base).toString() } catch { return null } }
// htmlparser2 adds no <body> a page leaves out; the document itself stands in for it.
const bodyOf = ($) => ($('body').first().length ? $('body').first() : $.root())

/** The largest candidate in srcset, else src (or data-src). */
function imageSrc($img, base) {
  const set = String($img.attr('srcset') || '')
  let best = null
  let bestW = -1
  for (const part of set.split(',')) {
    const [u, d] = part.trim().split(/\s+/)
    if (!u) continue
    const w = /^(\d+)w$/.exec(d || '') ? Number(d.slice(0, -1)) : /^(\d+(\.\d+)?)x$/.exec(d || '') ? Number(d.slice(0, -1)) * 1000 : 0
    if (w > bestW) { best = u; bestW = w }
  }
  return abs(best || $img.attr('src') || $img.attr('data-src') || '', base)
}

function mainElement($) {
  for (const sel of ['main', '[role=main]', 'article']) {
    const m = $(sel).first()
    if (m.length) return m
  }
  // No landmark: the element with the most direct paragraph text that is not page chrome, found
  // in one walk in document order that skips chrome and everything inside it.
  const body = bodyOf($)
  let best = null
  let bestLen = 0
  const stack = body.children().get().reverse()
  while (stack.length) {
    const $el = $(stack.pop())
    if ($el.is(CHROME)) continue
    const len = $el.children('p').text().trim().length
    if (len > bestLen) { best = $el; bestLen = len }
    stack.push(...$el.children().get().reverse())
  }
  return best ?? body
}

function signature($, el) {
  const cls = String($(el).attr('class') || '').split(/\s+/).filter((c) => c && !/\d/.test(c))[0]
  return el.tagName + (cls ? '.' + cls : '')
}

/**
 * Structural fingerprint: the tags (and first class) two levels under body, and the children of
 * the main content's first level with more than one child (site builders wrap content in single
 * divs). Runs of the same element count once, so a longer article is the same template.
 */
function template($, $main) {
  const parts = []
  bodyOf($).children().each((_, a) => { parts.push(signature($, a)); $(a).children().each((__, b) => parts.push(' ' + signature($, b))) })
  let level = $main
  for (let i = 0; i < 6 && level.children().length === 1; i++) level = level.children().first()
  let last = null
  level.children().each((_, c) => {
    const sig = signature($, c)
    if (sig !== last) parts.push('m ' + sig)
    last = sig
  })
  return crypto.createHash('sha1').update(parts.join('|')).digest('hex').slice(0, 10)
}

function links($, $scope, base) {
  return $scope.find('a[href]').map((_, a) => ({ label: $(a).text().replace(/\s+/g, ' ').trim(), href: abs(String($(a).attr('href')), base) })).get().filter((l) => l.href && l.label)
}

/** @param {string} html @param {string} url */
export function extractPage(html, url) {
  const $ = load(html)
  const navEl = $('header nav').first().length ? $('header nav').first() : $('nav, [role=navigation]').first()
  const footerEl = $('footer, [role=contentinfo]').first()
  const $main = mainElement($)
  const tpl = template($, $main)
  const main = $main.clone()
  main.find(DROP_IN_MAIN).remove()
  main.find('*').each((_, el) => { for (const name of Object.keys(el.attribs || {})) if (/^on/i.test(name)) $(el).removeAttr(name) })
  const mainHtml = ($.html(main) || '').slice(0, MAX_MAIN)
  return {
    url,
    path: new URL(url).pathname,
    lang: String($('html').attr('lang') || '').toLowerCase() || undefined,
    title: $('title').first().text().trim(),
    description: $('meta[name="description"]').attr('content')?.trim() || undefined,
    ogImage: abs($('meta[property="og:image"]').attr('content') || '', url) || undefined,
    canonical: abs($('link[rel="canonical"]').attr('href') || '', url) || undefined,
    h1: $main.find('h1').first().text().trim() || $('h1').first().text().trim() || undefined,
    headings: $main.find('h1, h2, h3').map((_, h) => ({ level: Number(h.tagName[1]), text: $(h).text().trim() })).get(),
    mainHtml,
    textLength: main.text().replace(/\s+/g, ' ').trim().length,
    images: $main.find('img').map((_, img) => ({ src: imageSrc($(img), url), alt: String($(img).attr('alt') ?? '').trim() })).get().filter((i) => i.src),
    links: [...new Set(links($, $main, url).map((l) => l.href))],
    template: tpl,
    nav: navEl.length ? links($, navEl, url) : [],
    footer: { text: footerEl.text().replace(/\s+/g, ' ').trim().slice(0, 1000), links: footerEl.length ? links($, footerEl, url) : [] },
  }
}

function mostCommon(items, key) {
  const counts = new Map()
  for (const it of items) { const k = key(it); counts.set(k, (counts.get(k) || { n: 0, it })); counts.get(k).n++ }
  return [...counts.values()].sort((a, b) => b.n - a.n)[0]?.it
}

/** @param {string} dir a crawl folder (inventory.json + raw/) */
export function extract(dir) {
  const inventory = JSON.parse(fs.readFileSync(path.join(dir, 'inventory.json'), 'utf8'))
  // A page that cannot be read fails alone: it is listed in errors and the others go on.
  const pages = []
  const errors = []
  for (const p of inventory.pages.filter((p) => p.status === 200 && p.file)) {
    try { pages.push(extractPage(fs.readFileSync(path.join(dir, p.file), 'utf8'), p.url)) } catch (e) { errors.push({ url: p.url, error: e.message }) }
  }
  const byTemplate = new Map()
  for (const p of pages) { const t = byTemplate.get(p.template) || { id: p.template, count: 0, examples: [] }; t.count++; if (t.examples.length < 3) t.examples.push(p.url); byTemplate.set(p.template, t) }
  const model = {
    version: 1,
    source: inventory.source,
    pages,
    templates: [...byTemplate.values()].sort((a, b) => b.count - a.count),
    nav: mostCommon(pages.filter((p) => p.nav.length), (p) => JSON.stringify(p.nav))?.nav ?? [],
    footer: mostCommon(pages, (p) => p.footer.text)?.footer ?? { text: '', links: [] },
    errors,
  }
  fs.writeFileSync(path.join(dir, 'extract.json'), JSON.stringify(model, null, 2))
  return model
}
