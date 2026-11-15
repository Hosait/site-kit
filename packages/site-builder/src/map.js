// map: a first site plan from the crawl, by rules. Every page of the old site becomes a page with
// blocks (map-rules.js), its images, people and documents become refs, the menu and footer become
// settings, and every old address that moves gets a redirect. What the rules cannot place with
// confidence is written as a todo list for the user's own Claude; the plan then goes through
// kit:check-plan, kit:import and qc.
import fs from 'node:fs'
import path from 'node:path'

import { classify, richHtml, sectionsOf, txt } from './map-rules.js'
import { load } from './html.js'
import { imageKey } from './qc-score.js'

export const TODO_BELOW = 0.7
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim()
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const trimPath = (p) => p.replace(/\/+$/, '') || '/'

/** A URL slug from an old path segment: lower case letters, digits and -. */
const slugOf = (seg) => { try { seg = decodeURIComponent(seg) } catch {} return seg.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a').replace(/\.[a-z0-9]{2,5}$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'side' }

/** A ref from text: lower case a-z0-9 and -, unique within `used`. */
export function makeRef(text, used, fallback = 'item') {
  const base = String(text ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || fallback
  let ref = /^[a-z0-9]/.test(base) ? base : `${fallback}-${base}`
  for (let i = 2; used.has(ref); i++) ref = `${base.slice(0, 46)}-${i}`
  used.add(ref)
  return ref
}

/** The kit's blocks and their top-level fields, from schema/blocks.schema.json. */
export function kitBlocks(schema) {
  const out = new Map()
  for (const def of Object.values(schema?.definitions ?? {})) {
    const slug = def?.properties?.blockType?.const
    if (slug) out.set(slug, new Set(Object.keys(def.properties)))
  }
  return out
}

/** The site's languages from the stamped plan schema; the first is the default unless given. */
function localesOf(planSchema, defaultLocale) {
  const list = planSchema?.definitions?.text?.propertyNames?.enum ?? ['no']
  const def = defaultLocale && list.includes(defaultLocale) ? defaultLocale : list[0]
  return { list, def }
}

/** Splits a path into its language (when the first segment is one of the site's) and the rest. */
function splitLang(p, list) {
  const segs = trimPath(p).split('/').filter(Boolean)
  return segs.length && list.includes(segs[0]) ? { lang: segs[0], rest: '/' + segs.slice(1).join('/') } : { lang: null, rest: trimPath(p) }
}

/**
 * @param {string} out a crawl folder after extract (and optionally style)
 * @param {{ planFile: string, blocksSchema: object, planSchema: object, defaultLocale?: string, log?: (s: string) => void }} opts
 */
export function map(out, { planFile, blocksSchema, planSchema, defaultLocale, log = () => {} }) {
  const extracted = readJson(path.join(out, 'extract.json'))
  const inventory = readJson(path.join(out, 'inventory.json'))
  const style = fs.existsSync(path.join(out, 'style.json')) ? readJson(path.join(out, 'style.json')) : null
  const blocks = kitBlocks(blocksSchema)
  const { list: locales, def } = localesOf(planSchema, defaultLocale)
  const oldOrigin = new URL(inventory.source).origin
  const todo = []
  const gaps = []
  const used = { page: new Set(), media: new Set(), person: new Set(), document: new Set() }
  const media = new Map()
  const people = new Map()
  const documents = new Map()

  // Pages: one plan page per path without its language segment, with one layout per language.
  // Translations are paired by hreflang alternates when the old site has them, else by the path
  // without its language segment.
  const localeOf = (p) => splitLang(p.path, locales).lang ?? (locales.includes(p.lang) ? p.lang : def)
  const byPath = new Map(extracted.pages.map((p) => [trimPath(p.path), p]))
  const groupKey = new Map()
  for (const p of extracted.pages) {
    if (groupKey.has(p.path)) continue
    const mates = (p.alternates ?? []).flatMap((a) => { try { const u = new URL(a.href); return u.origin === oldOrigin && byPath.has(trimPath(u.pathname)) ? [byPath.get(trimPath(u.pathname))] : [] } catch { return [] } })
    // The key is the default-language page's path without its language, or this page's.
    const lead = [p, ...mates].find((x) => localeOf(x) === def) ?? p
    const key = splitLang(lead.path, locales).rest
    for (const x of [p, ...mates]) if (!groupKey.has(x.path)) groupKey.set(x.path, key)
  }
  const groups = new Map()
  for (const p of extracted.pages) {
    const locale = localeOf(p)
    if (p.lang && !locales.includes(p.lang) && !splitLang(p.path, locales).lang) todo.push({ page: p.path, kind: 'language', detail: `the page is in «${p.lang}», which site/config.ts does not have; it was put under «${locale}»` })
    const key = groupKey.get(p.path)
    const g = groups.get(key) ?? { rest: key, byLocale: {} }
    if (!g.byLocale[locale]) g.byLocale[locale] = p
    groups.set(key, g)
  }
  // Page titles from <title>, without the site name most titles end with («About | Acme» → «About»).
  const SEP = /\s+[|–—·•:-]\s+/
  const tails = new Map()
  for (const p of extracted.pages) { const parts = clean(p.title).split(SEP); if (parts.length > 1) tails.set(parts.at(-1), (tails.get(parts.at(-1)) ?? 0) + 1) }
  const [siteTail, tailCount] = [...tails].sort((a, b) => b[1] - a[1])[0] ?? []
  const titleOf = (p) => {
    const parts = clean(p.title).split(SEP)
    const t = siteTail && tailCount > extracted.pages.length / 2 && parts.length > 1 && parts.at(-1) === siteTail ? parts.slice(0, -1).join(' – ') : clean(p.title)
    return t || clean(p.h1)
  }

  // Articles (JSON-LD Article with a date) go to `articles`, the rest are pages.
  const isArticleGroup = (g) => Object.values(g.byLocale).some((p) => p.article && p.published)
  const articlePaths = new Set([...groups.values()].filter(isArticleGroup).flatMap((g) => Object.values(g.byLocale).map((p) => trimPath(p.path))))
  const pageRefByPath = new Map()
  const plans = []
  for (const g of [...groups.values()].filter((g) => !isArticleGroup(g)).sort((a, b) => a.rest.split('/').length - b.rest.split('/').length || a.rest.localeCompare(b.rest))) {
    const any = g.byLocale[def] ?? Object.values(g.byLocale)[0]
    const isHome = g.rest === '/'
    const last = g.rest.split('/').filter(Boolean).at(-1)
    const ref = makeRef(isHome ? 'home' : last ?? any.title, used.page, 'page')
    const parentPath = g.rest.split('/').slice(0, -1).join('/') || '/'
    const parent = !isHome && parentPath !== '/' ? plans.find((x) => x.rest === parentPath)?.page.ref : undefined
    for (const p of Object.values(g.byLocale)) pageRefByPath.set(trimPath(p.path), ref)
    plans.push({ rest: g.rest, g, page: { ref, ...(parent ? { parent } : {}), ...(isHome ? { isHome: true } : {}), title: {}, layout: {} } })
  }

  const ctxFor = (p, template) => ({
    oldOrigin,
    isArticle: (href) => { try { const u = new URL(String(href), p.url); return u.origin === oldOrigin && articlePaths.has(trimPath(u.pathname)) } catch { return false } },
    has: (slug, fields = []) => blocks.has(slug) && fields.every((f) => blocks.get(slug).has(f)),
    media(src, alt) {
      let abs
      try { abs = new URL(src, p.url).href } catch { return undefined }
      if (!media.has(abs)) {
        const name = imageKey(abs)
        const ref = makeRef(name, used.media, 'image')
        media.set(abs, { ref, source: abs, ...(clean(alt) ? { alt: { [def]: clean(alt) } } : {}) })
        if (/\.svg(\?|$)/i.test(abs)) todo.push({ page: p.path, kind: 'svg', detail: `${abs} is an SVG, which the import does not take: save a PNG or WebP, or leave it out` })
        if (abs.startsWith('http:')) todo.push({ page: p.path, kind: 'http', detail: `${abs} is not https: the import needs https or a file in seed/media/` })
      }
      return media.get(abs).ref
    },
    link(href, label) {
      let u
      try { u = new URL(String(href ?? ''), p.url) } catch { return { type: 'custom', url: String(href ?? '#'), label: clean(label) || 'Les mer' } }
      const ref = u.origin === oldOrigin ? pageRefByPath.get(trimPath(u.pathname)) : undefined
      return ref ? { type: 'reference', reference: { $pageLink: ref }, label: clean(label) || 'Les mer' } : { type: 'custom', url: u.href, label: clean(label) || 'Les mer' }
    },
    person({ name, role, email, phone, image }) {
      const key = (email || name).toLowerCase()
      if (!people.has(key)) {
        const ref = makeRef(name, used.person, 'person')
        const imageRef = image?.src ? this.media(image.src, image.alt || name) : undefined
        people.set(key, { ref, name, ...(role ? { role: { [def]: role } } : {}), ...(email ? { email } : {}), ...(phone ? { phone } : {}), ...(imageRef ? { image: imageRef } : {}) })
      }
      return people.get(key).ref
    },
    document({ href, title }) {
      const abs = new URL(String(href), p.url).href
      if (!documents.has(abs)) documents.set(abs, { ref: makeRef(title || abs.split('/').pop(), used.document, 'document'), source: abs, title: { [def]: clean(title) || abs.split('/').pop() }, docType: 'other' })
      if (!/\.pdf(\?|$)/i.test(abs)) todo.push({ page: p.path, kind: 'document', detail: `${abs}: Office files, zip and DWG cannot be imported from a URL; download it into seed/media/` })
      return documents.get(abs).ref
    },
    template,
  })

  // Blocks, page by page; section settings from style.json where the template was measured.
  const templates = {}
  for (const { g, page } of plans) {
    for (const [locale, p] of Object.entries(g.byLocale)) {
      page.title[locale] = titleOf(p) || page.ref
      const seg = splitLang(p.path, locales).rest.split('/').filter(Boolean).at(-1)
      if (seg) (page.slug ??= {})[locale] = slugOf(seg)
      if (p.description) (page.meta ??= {})[locale] = { description: clean(p.description) }
      const measured = style?.templates?.[p.template]?.sections ?? []
      const { $, sections } = sectionsOf(p.mainHtml ?? '')
      const layout = []
      sections.forEach((section, i) => {
        const box = measured.find((m) => m.heading && txt($, $(section.els).find('h1, h2, h3').first()) === m.heading) ?? (measured.length === sections.length ? measured[i] : null)
        const ctx = { ...ctxFor(p, p.template), first: i === 0, backgroundImage: Boolean(box?.backgroundImage) }
        const r = classify($, section, ctx)
        const t = (templates[p.template] ??= { example: p.url, pages: 0, blocks: [], todo: 0 })
        if (!r.block) {
          gaps.push({ sourceUrl: p.url, section: `section ${i + 1}${section.els[0] ? ` (${section.els[0].tagName})` : ''}`, reason: r.why })
          return
        }
        if (box && style?.tokens?.spacing) Object.assign(r.block, sectionSettings(box, style.tokens.spacing, blocks.get(r.block.blockType)))
        if (r.confidence < TODO_BELOW) {
          todo.push({ page: p.path, kind: 'section', section: i + 1, block: r.block.blockType, confidence: r.confidence, detail: r.why, html: $.html(section.els).slice(0, 1500) })
          t.todo++
        }
        if (p.url === t.example) t.blocks.push({ blockType: r.block.blockType, confidence: r.confidence, why: r.why })
        layout.push(r.block)
      })
      if (!layout.length) layout.push({ blockType: 'content', richText: { $html: `<p>${esc(clean(p.title))}</p>` } })
      page.layout[locale] = layout
      templates[p.template].pages++
      log(`${p.path}: ${layout.map((b) => b.blockType).join(', ')}`)
    }
    if (!page.title[def]) {
      page.title[def] = Object.values(page.title)[0]
      todo.push({ page: g.rest, kind: 'language', detail: `no page in «${def}», the default language: its title was copied from another language, and it needs a ${def} layout` })
      page.layout[def] ??= Object.values(page.layout)[0]
    }
  }

  // Articles: title, date, slug, lead (the description, when the page shows it) and the text.
  const articles = []
  const kinds = planSchema?.properties?.articles?.items?.properties?.kind?.enum ?? ['news']
  const usedArticle = new Set()
  for (const g of [...groups.values()].filter(isArticleGroup)) {
    const any = g.byLocale[def] ?? Object.values(g.byLocale)[0]
    const a = { ref: makeRef(g.rest.split('/').filter(Boolean).at(-1) ?? any.title, usedArticle, 'article'), kind: /\/(blog|blogg)\//.test(any.path) && kinds.includes('blog') ? 'blog' : kinds.includes('news') ? 'news' : kinds[0], publishedAt: any.published, title: {}, slug: {}, contentHtml: {} }
    for (const [locale, p] of Object.entries(g.byLocale)) {
      a.title[locale] = titleOf(p) || clean(p.h1)
      a.slug[locale] = slugOf(splitLang(p.path, locales).rest.split('/').filter(Boolean).at(-1) ?? a.ref)
      const $ = load(p.mainHtml ?? '')
      // The lead is the paragraph that says what the description says (often in the article's header).
      const lead = p.description && $('p').toArray().find((x) => txt($, x) === clean(p.description))
      if (lead) { (a.lead ??= {})[locale] = clean(p.description); $(lead).remove() }
      // Side content (related articles, share links) is the old site's, not the article's.
      $('h1, time, nav, header, aside').remove()
      // The first image is the article's hero image, in every language.
      const firstImg = $('img').first()
      if (firstImg.length) {
        const ref = ctxFor(p, p.template).media(firstImg.attr('src') ?? '', firstImg.attr('alt') ?? '')
        a.heroImage ??= ref
        if (ref === a.heroImage) { firstImg.closest('figure').remove(); firstImg.remove() }
      }
      a.contentHtml[locale] = richHtml($, ($('main').length ? $('main') : $.root()).children().toArray(), { oldOrigin })
      // The kit's article address is /<language>/<news or blog section>/<slug>: an old address elsewhere needs a redirect by hand.
      if (!/\/(news|nyheter|blog|blogg|aktuelt|artikler|articles)\/[^/]+$/.test(trimPath(p.path))) todo.push({ page: p.path, kind: 'redirect', detail: `article «${a.title[locale]}»: check its new address and add a redirect with toUrl` })
    }
    if (!a.title[def]) { a.title[def] = Object.values(a.title)[0]; todo.push({ page: g.rest, kind: 'language', detail: `article without a «${def}» version: its title was copied` }) }
    articles.push(a)
  }

  // Menu and footer: links to mapped pages; other links are noted.
  const navItems = (links) => links.flatMap((l) => {
    let u
    try { u = new URL(l.href) } catch { return [] }
    const ref = u.origin === oldOrigin ? pageRefByPath.get(trimPath(u.pathname)) : undefined
    if (!ref) { todo.push({ page: '/', kind: 'nav', detail: `menu link «${l.label}» → ${l.href} is not a page of the site; the menu takes pages only` }); return [] }
    return [{ label: clean(l.label), page: ref }]
  })
  const settings = { nav: {} }
  for (const locale of locales) {
    const pagesIn = extracted.pages.filter((p) => (splitLang(p.path, locales).lang ?? (locales.includes(p.lang) ? p.lang : def)) === locale && p.nav?.length)
    const source = locale === def && extracted.nav?.length ? extracted.nav : pagesIn.find((p) => splitLang(p.path, locales).rest === '/')?.nav ?? pagesIn[0]?.nav
    if (source?.length) settings.nav[locale] = navItems(source)
  }
  if (!settings.nav[def]) settings.nav[def] = []
  const footerLinksOf = (links) => links.flatMap((l) => {
    let u
    try { u = new URL(l.href) } catch { return [] }
    const ref = u.origin === oldOrigin ? pageRefByPath.get(trimPath(u.pathname)) : undefined
    if (ref) return [{ label: clean(l.label), page: ref }]
    // Phone and e-mail are the kit's contact settings, shown in its footer.
    if (u.protocol === 'tel:') { settings.phone ??= clean(l.label) || u.pathname; return [] }
    if (u.protocol === 'mailto:') { settings.email ??= u.pathname; return [] }
    return ['http:', 'https:'].includes(u.protocol) ? [{ label: clean(l.label), url: u.href }] : []
  })
  // One footer per language, from that language's home page (or its first page with a footer).
  for (const locale of locales) {
    const pagesIn = extracted.pages.filter((p) => localeOf(p) === locale && p.footer?.links?.length)
    const source = pagesIn.find((p) => splitLang(p.path, locales).rest === '/')?.footer ?? pagesIn[0]?.footer ?? (locale === def ? extracted.footer : null)
    const links = source ? footerLinksOf(source.links ?? []) : []
    if (links.length) (settings.footer ??= {})[locale] = [{ heading: clean(clean(source.text).split(/[|·•]/)[0]).slice(0, 60) || 'Kontakt', links }]
  }

  // Redirects: each old address whose page lands elsewhere goes to its page (the new address is
  // the page's place in the tree, so the old path is kept only when it already is that).
  const planByRef = new Map(plans.map((x) => [x.page.ref, x.page]))
  /** A page's path below its language: its parents' slugs and its own («/tjenester/radgivning»). */
  const pathInTree = (ref, locale) => {
    const segs = []
    for (let pg = planByRef.get(ref); pg && !pg.isHome; pg = pg.parent ? planByRef.get(pg.parent) : null) segs.unshift(pg.slug?.[locale] ?? pg.slug?.[def] ?? pg.ref)
    return '/' + segs.join('/')
  }
  const redirects = []
  const seen = new Set()
  for (const p of extracted.pages) {
    const from = trimPath(p.path)
    const ref = pageRefByPath.get(from)
    if (!ref || from === '/' || seen.has(from)) continue
    seen.add(from)
    // The new address is /<language>/<the old path's segments> (each page keeps its old slug), or
    // the same path on a site with one language: a redirect to itself would loop.
    const locale = splitLang(from, locales).lang ?? (locales.includes(p.lang) ? p.lang : def)
    const chain = pathInTree(ref, locale)
    if (from === trimPath(`/${locale}${chain}`) || (locales.length === 1 && from === chain)) continue
    redirects.push({ from, toPage: ref, permanent: true })
  }

  const plan = {
    version: 1,
    source: { url: inventory.source, ...(inventory.cms ? { cms: String(inventory.cms) } : {}) },
    media: [...media.values()],
    ...(people.size ? { people: [...people.values()] } : {}),
    ...(documents.size ? { documents: [...documents.values()] } : {}),
    pages: plans.map((x) => x.page),
    ...(articles.length ? { articles } : {}),
    settings,
    redirects,
    gaps,
  }
  const articleLike = extracted.pages.filter((p) => !articlePaths.has(trimPath(p.path)) && (/\/(19|20)\d\d\/\d\d\//.test(p.path) || /\/(news|nyheter|blog|blogg|aktuelt)\/./.test(p.path)))
  if (articleLike.length) todo.push({ page: '*', kind: 'articles', detail: `${articleLike.length} pages look like articles (${articleLike.slice(0, 3).map((p) => p.path).join(', ')}…): they are pages in this plan; move them to articles (with publishedAt) if they belong in the article feed` })

  fs.mkdirSync(path.dirname(planFile), { recursive: true })
  fs.writeFileSync(planFile, JSON.stringify(plan, null, 2) + '\n')
  const sectionsTotal = plans.reduce((n, x) => n + Object.values(x.page.layout).reduce((m, l) => m + l.length, 0), 0)
  const result = { planFile, mappedAt: new Date().toISOString(), summary: { pages: plan.pages.length, sections: sectionsTotal, todo: todo.length, gaps: gaps.length, media: plan.media.length }, templates, todo }
  fs.writeFileSync(path.join(out, 'map.json'), JSON.stringify(result, null, 2))
  fs.writeFileSync(path.join(out, 'map.html'), mapHtml(result))
  return result
}

/** A block's section settings from a measured section box (style.json), nearest step on the spacing scale. */
export function sectionSettings(box, spacing, fields) {
  const steps = Object.entries(spacing).map(([k, v]) => [k, parseFloat(v) * (v.endsWith('rem') ? 16 : 1)])
  const nearest = (px) => (px < 8 ? 'none' : steps.sort((a, b) => Math.abs(a[1] - px) - Math.abs(b[1] - px))[0]?.[0])
  const out = {}
  const top = nearest(box.paddingTop ?? 0)
  const bottom = nearest(box.paddingBottom ?? 0)
  if (fields?.has('section') && (top || bottom)) out.section = { ...(top ? { spaceTop: top } : {}), ...(bottom ? { spaceBottom: bottom } : {}) }
  const bg = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(box.background ?? '')
  if (bg && fields?.has('background') && (bg[4] === undefined || Number(bg[4]) > 0.5)) {
    const [r, g, b] = bg.slice(1, 4).map(Number)
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
    if (lum < 0.35) out.background = 'dark'
    else if (lum < 0.97) out.background = 'muted'
  }
  return out
}

function mapHtml(r) {
  const row = (b) => `<li class="${b.confidence < TODO_BELOW ? 'low' : ''}"><b>${esc(b.blockType)}</b> ${Math.round(b.confidence * 100)} % · ${esc(b.why)}</li>`
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Map: ${esc(r.planFile)}</title>
<style>body{font:14px/1.45 system-ui,sans-serif;margin:24px;color:#1d2433}section{border:1px solid #d9dce3;border-radius:8px;padding:12px 16px;margin:0 0 16px}li.low{color:#b42318}pre{white-space:pre-wrap;background:#f6f7f9;padding:8px;max-height:200px;overflow:auto}</style></head><body>
<h1>Site plan draft</h1><p>${r.summary.pages} pages, ${r.summary.sections} sections, ${r.summary.media} images; ${r.summary.todo} to do, ${r.summary.gaps} gaps. Plan: ${esc(r.planFile)}</p>
<h2>Templates</h2>${Object.entries(r.templates).map(([id, t]) => `<section><h3>${esc(id.slice(0, 12))} · ${t.pages} pages · <a href="${esc(t.example)}">${esc(t.example)}</a></h3><ol>${t.blocks.map(row).join('')}</ol></section>`).join('')}
<h2>To do</h2><ol>${r.todo.map((x) => `<li><b>${esc(x.kind)}</b> ${esc(x.page)}${x.section ? ` section ${x.section} (${esc(x.block)}, ${Math.round(x.confidence * 100)} %)` : ''}: ${esc(x.detail)}${x.html ? `<pre>${esc(x.html)}</pre>` : ''}</li>`).join('')}</ol>
</body></html>
`
}
