// Rules that turn one section of an old page into one Site Kit block, with a confidence. Pure
// functions over cheerio, tested section by section (test/map-rules.test.js). What no rule places
// with confidence becomes a todo for the user's own Claude.
import { load } from './html.js'
import { DOCUMENT } from './signals.js'

const KEEP_ATTR = { a: ['href'], img: ['src', 'alt'], td: ['colspan', 'rowspan'], th: ['colspan', 'rowspan', 'scope'] }
const DROP = 'script, style, noscript, template, iframe, form, svg, button, input, select, textarea, nav, [aria-hidden=true]'
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim()

/** Text with a space between elements: «2011 Founded», not «2011Founded» as cheerio's .text() gives. */
export function txt($, x) {
  const out = []
  const walk = (n) => {
    if (n.type === 'text') out.push(n.data)
    else if (n.children && !['script', 'style', 'noscript', 'template'].includes(n.name)) for (const c of n.children) walk(c)
  }
  for (const n of $(x).toArray()) walk(n)
  return clean(out.join(' '))
}
const YEAR = /^(1[89]\d\d|20\d\d)\b/
const NUMBER = /^[^\p{L}]{0,2}\d[\d\s.,]*\s*(%|\+|k|m|kr|nok|år|years?)?$/iu

/** The sections of a page: the children of main (below any single wrapper), split at h2 when it is one flat block of text. */
export function sectionsOf(mainHtml) {
  const $ = load(mainHtml)
  let box = $('main').first()
  if (!box.length) box = $.root()
  while (box.children().length === 1 && box.children().first().children().length) box = box.children().first()
  let parts = box.children().toArray().filter((el) => txt($, $(el)) || $(el).is('img, iframe, video, form, table') || $(el).find('img, iframe, video, form, table, input').length)
  // A flat page (headings and paragraphs side by side): one section per h2.
  if (parts.length > 3 && parts.every((el) => /^(h[1-6]|p|ul|ol|blockquote|figure|img|table|div|dl|hr)$/.test(el.tagName))) {
    const groups = []
    for (const el of parts) { if (el.tagName === 'h2' || !groups.length) groups.push([]); groups.at(-1).push(el) }
    if (groups.length > 1) return { $, sections: groups.map((g) => ({ els: g })) }
  }
  parts = parts.slice(0, 80)
  return { $, sections: parts.map((el) => ({ els: [el] })) }
}

/** HTML for a rich text field: content tags only, links made relative to the old site, no handlers. */
export function richHtml($, els, { oldOrigin } = {}) {
  const frag = load('<div id="x"></div>')
  const host = frag('#x')
  for (const el of els) host.append($.html(el))
  host.find(DROP).remove()
  host.find('*').each((_, el) => {
    const keep = KEEP_ATTR[el.tagName] ?? []
    for (const name of Object.keys(el.attribs ?? {})) if (!keep.includes(name)) frag(el).removeAttr(name)
    // Images by their full address, so the import can fetch them.
    if (el.tagName === 'img' && oldOrigin) { try { frag(el).attr('src', new URL(String(frag(el).attr('src') ?? ''), oldOrigin).href) } catch {} }
    if (el.tagName === 'a' && oldOrigin) {
      const href = String(frag(el).attr('href') ?? '')
      try { const u = new URL(href, oldOrigin); if (u.origin === oldOrigin) frag(el).attr('href', u.pathname + u.search + u.hash) } catch {}
    }
  })
  // Wrappers without meaning go; their content stays.
  host.find('div, span, section, article').each((_, el) => { frag(el).replaceWith(frag(el).contents()) })
  // Whitespace between tags is kept: between inline elements it separates words.
  return clean(host.html())
}

/** A hero's small text above the h1 (eyebrow) and its lead below it. */
function heroTexts($, $all) {
  const nodes = $all.find('h1, p').toArray()
  const h1 = nodes.findIndex((n) => n.tagName === 'h1')
  const before = nodes.slice(0, h1).map((n) => txt($, n)).filter((t) => t && t.length <= 60).at(-1)
  const after = nodes.slice(h1 + 1).map((n) => txt($, n)).find((t) => t.length > 0)
  return { ...(before ? { eyebrow: before } : {}), ...(after ? { text: after } : {}) }
}

/** Children that repeat: same tag and first class, at least two. */
function repeated($, el) {
  const kids = $(el).children().toArray()
  const sig = (k) => `${k.tagName}.${String($(k).attr('class') ?? '').split(/\s+/)[0]}`
  const counts = new Map()
  for (const k of kids) counts.set(sig(k), (counts.get(sig(k)) ?? 0) + 1)
  const [best, n] = [...counts].sort((a, b) => b[1] - a[1])[0] ?? []
  if (n >= 2) return kids.filter((k) => sig(k) === best)
  // One level down (a list inside a wrapper).
  for (const k of kids) { const r = repeated($, k); if (r.length >= 2) return r }
  return []
}

const firstText = ($, el, sel) => txt($, $(el).find(sel).first())
const img = ($, el) => { const i = $(el).find('img').first(); return i.length ? { src: i.attr('src') || i.attr('data-src') || '', alt: clean(i.attr('alt')) } : null }

/**
 * One section → { block, confidence, why } (block null for a gap). ctx.media(src, alt) gives a
 * media ref, ctx.link(href, label) a link field, ctx.person(p) and ctx.document(d) refs,
 * ctx.has(blockType) whether the kit has a block, and ctx.first whether this is the page's top.
 */
export function classify($, section, ctx) {
  const els = section.els
  const el = els.length === 1 ? els[0] : null
  const $all = $(els)
  const text = txt($, $all)
  const heading = txt($, $all.find('h2, h3').first()) || (els[0]?.tagName?.match(/^h[23]$/) ? txt($, $(els[0])) : '')
  // An image inside a paragraph or list item is part of the text.
  const imgs = $all.find('img').toArray().filter((i) => !$(i).closest('p, li').length)
  const mediaRef = (i) => (i ? ctx.media(i.attribs?.src || i.src || '', i.attribs?.alt ?? i.alt ?? '') : undefined)

  if ($all.find('form').length || els.some((e) => e.tagName === 'form')) return { block: null, confidence: 1, why: 'a form (add it under forms, or list it as a gap when it must send e-mail or take payment)' }
  const frame = $all.find('iframe').first()
  if (frame.length) {
    const src = String(frame.attr('src') ?? '')
    if (/youtube\.com|youtu\.be|vimeo\.com/.test(src)) return { block: { blockType: 'video', ...(heading ? { heading } : {}), url: src }, confidence: 0.9, why: 'video' }
    if (/google\.[a-z.]+\/maps/.test(src)) return { block: { blockType: 'embed', ...(heading ? { heading } : {}), provider: 'google-maps', url: src, title: heading || 'Kart', height: Number(frame.attr('height')) || 400 }, confidence: 0.9, why: 'map' }
    return { block: null, confidence: 1, why: `an embedded page from ${src.slice(0, 80)} (no block: a gap, or an embed the kit supports)` }
  }
  if (ctx.first && $all.find('h1').length) {
    const media = imgs[0] ? mediaRef(imgs[0]) : undefined
    const links = $all.find('a').toArray().filter((a) => /\b(btn|button|cta)\b/i.test(String($(a).attr('class') ?? ''))).slice(0, 2)
    return {
      block: {
        blockType: 'hero', variant: media ? (ctx.backgroundImage ? 'image' : 'split') : 'text', heading: firstText($, $all, 'h1'),
        ...heroTexts($, $all), ...(media ? { media: { $media: media } } : {}),
        ...(links.length ? { links: links.map((a) => ({ link: ctx.link($(a).attr('href'), txt($, $(a))) })) } : {}),
      },
      confidence: 0.85, why: 'the top of the page with its h1',
    }
  }
  const details = $all.find('details').toArray()
  if (details.length >= 2) {
    return { block: { blockType: 'accordion', ...(heading ? { heading } : {}), items: details.map((d) => ({ title: txt($, $(d).find('summary').first()), content: { $html: richHtml($, $(d).children().not('summary').toArray(), ctx) } })) }, confidence: 0.9, why: 'questions and answers (details)' }
  }
  if ($all.find('table').length && ctx.has('table')) {
    const t = $all.find('table').first()
    const rows = t.find('tr').toArray().map((tr) => $(tr).find('th, td').toArray().map((c) => txt($, $(c))))
    return { block: { blockType: 'table', ...(heading ? { heading } : {}), ...(t.find('caption').length ? { caption: txt($, t.find('caption')) } : {}), rows: rows.map((cells) => ({ cells: cells.map((c) => ({ text: c })) })) }, confidence: 0.6, why: 'a table (check the field names of the table block)' }
  }
  const quote = $all.find('blockquote').first()
  if (quote.length && txt($, quote).length > 10 && text.length < txt($, quote).length * 1.6 + 60) {
    const cap = $all.find('figcaption, cite, footer').first()
    const parts = cap.children().toArray().map((c) => txt($, c)).filter(Boolean)
    const author = (parts[0] ?? txt($, cap)).replace(/^[–—-]\s*/, '')
    quote.find('cite, footer').remove()
    return { block: { blockType: 'quote', quote: txt($, quote), ...(author ? { author } : {}), ...(parts[1] ? { role: parts[1] } : {}) }, confidence: 0.85, why: 'a quote' }
  }
  const items = el ? repeated($, el) : []
  if (items.length >= 2) {
    const texts = items.map((it) => txt($, $(it)))
    const short = (it) => (txt($, $(it).find('strong, b, h3, h4, .number, [class*=number], [class*=value]').first()) || txt($, $(it).children().first()))
    if (items.every((it) => NUMBER.test(short(it))) && texts.every((t) => t.length < 120)) {
      return { block: { blockType: 'stats', ...(heading ? { heading } : {}), items: items.map((it) => { const v = short(it); return { value: v, label: clean(txt($, it).replace(v, '')) } }) }, confidence: 0.75, why: 'figures with labels' }
    }
    if (items.every((it) => YEAR.test(txt($, $(it))))) {
      return { block: { blockType: 'timeline', ...(heading ? { heading } : {}), items: items.map((it) => { const t = txt($, $(it)); const year = YEAR.exec(t)[1]; const title = firstText($, it, 'h3, h4, strong') || t.replace(year, '').slice(0, 80); return { year, title, text: clean(t.replace(year, '').replace(title, '')) } }) }, confidence: 0.75, why: 'dated steps' }
    }
    const articleLinks = items.filter((it) => $(it).find('a[href]').toArray().some((a) => ctx.isArticle?.($(a).attr('href'))))
    if (articleLinks.length === items.length) return { block: { blockType: 'articleFeed', ...(heading ? { heading } : {}), kind: 'all', limit: items.length }, confidence: 0.85, why: 'a list of articles' }
    const docLinks = items.map((it) => $(it).find('a').toArray().find((a) => DOCUMENT.test(new URL(String($(a).attr('href') ?? ''), 'http://x').pathname))).filter(Boolean)
    if (docLinks.length === items.length) {
      return { block: { blockType: 'documents', ...(heading ? { heading } : {}), documents: docLinks.map((a) => ({ $document: ctx.document({ href: $(a).attr('href'), title: txt($, $(a)) }) })) }, confidence: 0.8, why: 'a list of documents' }
    }
    const person = (it) => $(it).find('a[href^="mailto:"], a[href^="tel:"]').length && $(it).find('img').length
    if (items.every(person)) {
      return {
        block: { blockType: 'people', ...(heading ? { heading } : {}), people: items.map((it) => ({ $person: ctx.person({ name: firstText($, it, 'h3, h4, strong, b') || txt($, $(it)).split(' ').slice(0, 2).join(' '), role: firstText($, it, 'p, em, small'), email: String($(it).find('a[href^="mailto:"]').attr('href') ?? '').replace(/^mailto:/, ''), phone: /\d/.test(txt($, $(it).find('a[href^="tel:"]').first())) ? txt($, $(it).find('a[href^="tel:"]').first()) : String($(it).find('a[href^="tel:"]').attr('href') ?? '').replace(/^tel:/, ''), image: img($, it) }) })), layout: 'grid' },
        confidence: 0.75, why: 'people with photo and e-mail or phone',
      }
    }
    if (items.every((it) => !txt($, $(it)) && $(it).find('img').length)) {
      const blockType = items.length >= 4 && ctx.has('logoWall') && items.every((it) => Number($(it).find('img').attr('height') || 0) <= 120) ? 'logoWall' : 'imageGrid'
      if (blockType === 'logoWall') return { block: { blockType, ...(heading ? { heading } : {}), logos: items.map((it) => ({ image: { $media: mediaRef(img($, it)) } })) }, confidence: 0.6, why: 'a row of logos (check the logoWall fields)' }
      return { block: { blockType: 'imageGrid', ...(heading ? { heading } : {}), columns: String(Math.min(4, Math.max(2, items.length))), images: items.map((it) => { const c = txt($, $(it).find('figcaption')); return { image: { $media: mediaRef(img($, it)) }, ...(c ? { caption: c } : {}) } }) }, confidence: 0.8, why: 'images only' }
    }
    if (items.every((it) => $(it).find('h2, h3, h4').length && txt($, $(it)).length < 600)) {
      return {
        block: {
          blockType: 'cards', ...(heading ? { heading } : {}), columns: String(Math.min(4, Math.max(2, items.length === 4 ? 4 : items.length % 3 === 0 ? 3 : 2))),
          items: items.map((it) => { const i = img($, it); const a = $(it).find('a[href]').last(); return { title: firstText($, it, 'h2, h3, h4'), text: txt($, $(it).find('p').first()), ...(i ? { image: { $media: mediaRef(i) } } : {}), ...(a.length ? { link: ctx.link(a.attr('href'), clean(a.text()) || firstText($, it, 'h2, h3, h4')) } : {}) } }),
        },
        confidence: 0.75, why: 'repeated items with a heading each',
      }
    }
  }
  const textLen = text.length
  const captionLen = txt($, $all.find('figcaption')).length
  if (imgs.length >= 2 && textLen - captionLen < imgs.length * 60) {
    return { block: { blockType: 'imageGrid', ...(heading ? { heading } : {}), columns: String(Math.min(4, imgs.length)), images: imgs.map((i) => { const c = txt($, $(i).closest('figure').find('figcaption')); return { image: { $media: mediaRef(i) }, ...(c ? { caption: c } : {}) } }) }, confidence: 0.7, why: 'a group of images' }
  }
  if (imgs.length === 1 && textLen - captionLen < 15) return { block: { blockType: 'fullImage', image: { $media: mediaRef(imgs[0]) }, size: 'wide' }, confidence: 0.75, why: 'one image' }
  if (imgs.length === 1) {
    const imgFirst = $all.find('*').toArray().findIndex((e) => e.tagName === 'img') < $all.find('*').toArray().findIndex((e) => /^(h[1-6]|p)$/.test(e.tagName))
    const textEls = $all.clone().find('img, picture, figure').remove().end().toArray()
    return { block: { blockType: 'textImage', ...(heading ? { heading } : {}), image: { $media: mediaRef(imgs[0]) }, imagePosition: imgFirst ? 'left' : 'right', richText: { $html: richHtml($, textEls, ctx).replace(heading ? new RegExp(`<h[23]>${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</h[23]>`) : /^$/, '') } }, confidence: 0.7, why: 'text with one image' }
  }
  if (!textLen) return { block: null, confidence: 0.3, why: 'nothing readable (decoration or something drawn by script)' }
  const plain = $all.find('*').toArray().filter((e) => !['script', 'style', 'noscript', 'template'].includes(e.tagName)).every((e) => /^(h[1-6]|p|ul|ol|li|a|strong|em|b|i|br|span|div|blockquote|small|sup|sub|hr|table|thead|tbody|tr|td|th|caption|figure|figcaption|img|picture|source|section|article|dl|dt|dd)$/.test(e.tagName))
  return { block: { blockType: 'content', richText: { $html: richHtml($, els, ctx) } }, confidence: plain ? 0.8 : 0.5, why: plain ? 'text' : 'text with elements the text block may not keep' }
}
