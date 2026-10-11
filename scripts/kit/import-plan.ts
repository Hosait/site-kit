/**
 * pnpm kit:import <plan.json> [--reset]
 * Writes a site plan into the LOCAL Payload. Then: pnpm kit:export-seed → seed/ for Hosait.
 */
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { findMissingRefs, localeData, orderPages, resolveValue } from '../../src/lib/site-plan/refs'
import type { SitePlan } from '../../src/lib/site-plan/types'
import { validateSitePlan } from '../../src/lib/site-plan/validate'
import { DEFAULT_LOCALE, DEFAULT_SITE, isSiteKey, LOCALES } from '../../src/lib/sites'

const [file, ...flags] = process.argv.slice(2)
if (!file) throw new Error('Usage: pnpm kit:import <plan.json> [--reset]')
if (!/127\.0\.0\.1|localhost/.test(process.env.DATABASE_URL || '')) throw new Error('kit:import writes only to a local database')

const raw = JSON.parse(readFileSync(file, 'utf8'))
const valid = validateSitePlan(raw)
if (!valid.ok) {
  console.error(valid.errors.join('\n'))
  process.exit(1)
}
const plan: SitePlan = valid.plan
const missing = findMissingRefs(plan)
if (missing.length) {
  console.error(`Missing refs: ${missing.join(', ')}`)
  process.exit(1)
}
const site = plan.site && isSiteKey(plan.site) ? plan.site : DEFAULT_SITE
const baseDir = path.dirname(path.resolve(file))

const payload = await getPayload({ config })
if ((await payload.count({ collection: 'pages' })).totalDocs > 0) {
  if (!flags.includes('--reset')) throw new Error('The database already has pages. Run with --reset to replace them.')
  for (const c of ['redirects', 'articles', 'pages', 'people', 'documents', 'media', 'site-settings'] as const)
    await payload.delete({ collection: c, where: { id: { exists: true } }, context: { disableRevalidate: true } })
}

let editorConfig: Awaited<ReturnType<typeof editorConfigFactory.default>>
const html = async (h: string) => {
  editorConfig ??= await editorConfigFactory.default({ config: payload.config })
  return convertHTMLToLexical({ editorConfig, html: h, JSDOM })
}
const ids = { media: new Map<string, number>(), pages: new Map<string, number>() }
const ctx = { disableRevalidate: true }
const others = LOCALES.filter((l) => l !== DEFAULT_LOCALE)

async function upload(collection: 'media' | 'documents', source: string, data: Record<string, unknown>) {
  if (/^https:\/\//.test(source)) {
    const res = await fetch(source)
    if (!res.ok) throw new Error(`${source}: HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    const name = decodeURIComponent(new URL(source).pathname.split('/').pop() || 'file')
    return payload.create({ collection, data: data as never, file: { data: buf, mimetype: res.headers.get('content-type') || 'application/octet-stream', name, size: buf.length }, locale: DEFAULT_LOCALE, context: ctx })
  }
  const abs = path.resolve(baseDir, source)
  if (!abs.startsWith(baseDir + path.sep)) throw new Error(`${source}: outside the plan's folder`)
  return payload.create({ collection, data: data as never, filePath: abs, locale: DEFAULT_LOCALE, context: ctx })
}

async function localized(collection: string, id: number, item: Record<string, unknown>, fields: string[], resolve = false) {
  for (const l of others) {
    const data = localeData(item, l, fields)
    if (!Object.values(data).some((v) => v !== undefined)) continue
    await payload.update({ collection: collection as never, id, locale: l, data: (resolve ? await resolveValue(data, ids, html) : data) as never, context: ctx })
  }
}

for (const m of plan.media) {
  const doc = await upload('media', m.source, { ...localeData(m, DEFAULT_LOCALE, ['alt']), credit: m.credit })
  ids.media.set(m.ref, doc.id as number)
  await localized('media', doc.id as number, m, ['alt'])
}
for (const p of plan.people ?? []) {
  const data = { ...localeData(p, DEFAULT_LOCALE, ['name', 'role', 'email', 'phone', 'bio']), image: p.image ? ids.media.get(p.image) : undefined, site }
  const doc = await payload.create({ collection: 'people', data: data as never, locale: DEFAULT_LOCALE, context: ctx })
  await localized('people', doc.id as number, p, ['role', 'bio'])
}
for (const d of plan.documents ?? []) {
  const doc = await upload('documents', d.source, { ...localeData(d, DEFAULT_LOCALE, ['title', 'description']), docType: d.docType, language: d.language, sites: [site] })
  await localized('documents', doc.id as number, d, ['title', 'description'])
}
for (const p of orderPages(plan.pages)) {
  const base = {
    site,
    isHome: p.isHome ?? false,
    order: p.order,
    hideFromNav: p.hideFromNav,
    parent: p.parent ? ids.pages.get(p.parent) : undefined,
    cardImage: p.cardImage ? ids.media.get(p.cardImage) : undefined,
    _status: 'published',
  }
  const fields = ['title', 'slug', 'summary', 'meta', 'layout']
  const data = await resolveValue({ ...base, ...localeData(p, DEFAULT_LOCALE, fields as never) }, ids, html)
  const doc = await payload.create({ collection: 'pages', data: data as never, locale: DEFAULT_LOCALE, context: ctx })
  ids.pages.set(p.ref, doc.id as number)
  await localized('pages', doc.id as number, p, fields, true)
}
for (const a of plan.articles ?? []) {
  const contentHtml = a.contentHtml?.[DEFAULT_LOCALE]
  const data = {
    site,
    kind: a.kind,
    publishedAt: a.publishedAt,
    heroImage: a.heroImage ? ids.media.get(a.heroImage) : undefined,
    _status: 'published',
    ...localeData(a, DEFAULT_LOCALE, ['title', 'slug', 'lead']),
    content: contentHtml ? await html(contentHtml) : undefined,
  }
  const doc = await payload.create({ collection: 'articles', data: data as never, locale: DEFAULT_LOCALE, context: ctx })
  for (const l of others) {
    const c = a.contentHtml?.[l]
    const ld = { ...localeData(a, l, ['title', 'slug', 'lead']), content: c ? await html(c) : undefined }
    if (Object.values(ld).some((v) => v !== undefined)) await payload.update({ collection: 'articles', id: doc.id, locale: l, data: ld as never, context: ctx })
  }
}
const link = (page?: string, url?: string, label?: string) =>
  page ? { type: 'reference', reference: { relationTo: 'pages', value: ids.pages.get(page) }, label } : { type: 'custom', url, label }
const settingsFor = (l: (typeof LOCALES)[number]) => ({
  nav: (plan.settings.nav[l] ?? []).map((i) => ({ link: link(i.page, undefined, i.label) })),
  contactLink: plan.settings.contact?.[l] ? link(plan.settings.contact[l]!.page, undefined, plan.settings.contact[l]!.label) : undefined,
  footerColumns: (plan.settings.footer?.[l] ?? []).map((c) => ({ heading: c.heading, links: c.links.map((x) => ({ link: link(x.page, x.url, x.label) })) })),
  copyright: plan.settings.copyright?.[l],
})
const settings = await payload.create({
  collection: 'site-settings',
  data: { site, ...settingsFor(DEFAULT_LOCALE), phone: plan.settings.phone, email: plan.settings.email, address: plan.settings.address } as never,
  locale: DEFAULT_LOCALE,
  context: ctx,
})
for (const l of others) await payload.update({ collection: 'site-settings', id: settings.id, locale: l, data: settingsFor(l) as never, context: ctx })
for (const r of plan.redirects ?? []) {
  await payload.create({ collection: 'redirects', data: { from: r.from, to: link(r.toPage, r.toUrl), permanent: r.permanent ?? true } as never, context: ctx })
}
console.log(`Imported ${plan.media.length} media, ${plan.pages.length} pages, ${plan.articles?.length ?? 0} articles.`)
await payload.destroy()
process.exit(0)
