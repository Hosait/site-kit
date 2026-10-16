/**
 * Writes a validated site plan into Payload. Used by `pnpm kit:import` (local database) and by
 * the seed route on a fresh deploy (seed/site-plan.json).
 */
import path from 'node:path'

import type { Payload } from 'payload'

import { DEFAULT_LOCALE, DEFAULT_SITE, isSiteKey, LOCALES } from '../sites'
import { retentionFromPlan } from '../forms/retention'
import { fetchMedia as defaultFetchMedia } from './fetch-media'
import { formData, hasLocale, type FormRow } from './forms'
import { localFileProblem, resolveLocalFile } from './local-file'
import { findMissingRefs, localeData, orderPages, resolveValue } from './refs'
import type { SitePlan } from './types'

export const CONTENT_COLLECTIONS = ['redirects', 'articles', 'pages', 'form-submissions', 'forms', 'people', 'documents', 'media', 'site-settings'] as const

export type ImportOptions = {
  /** Folder that relative media and document paths are resolved against. */
  baseDir: string
  /** Delete existing content first. Without it, a database that has content is refused. */
  reset?: boolean
  fetchMedia?: (url: string) => Promise<{ data: Buffer; mimetype: string; name: string }>
  toLexical?: (html: string) => Promise<unknown>
  onProgress?: (done: number, total: number) => void
}
export type ImportResult = { media: number; pages: number; articles: number }

async function lexicalConverter(payload: Payload) {
  const { convertHTMLToLexical, editorConfigFactory } = await import('@payloadcms/richtext-lexical')
  const { JSDOM } = await import('jsdom')
  const editorConfig = await editorConfigFactory.default({ config: payload.config })
  return async (h: string): Promise<unknown> => convertHTMLToLexical({ editorConfig, html: h, JSDOM })
}

export async function importPlan(payload: Payload, plan: SitePlan, opts: ImportOptions): Promise<ImportResult> {
  // Checked before anything is written.
  const missing = findMissingRefs(plan)
  if (missing.length) throw new Error(`Missing refs: ${missing.join(', ')}`)
  const site = plan.site && isSiteKey(plan.site) ? plan.site : DEFAULT_SITE
  const baseDir = path.resolve(opts.baseDir)
  const fetchMedia = opts.fetchMedia ?? defaultFetchMedia
  const ctx = { disableRevalidate: true }
  const others = LOCALES.filter((l) => l !== DEFAULT_LOCALE)

  // Local files are checked before anything is deleted, so a bad one never leaves a replaced site empty.
  const localFiles = new Map<string, string>()
  for (const [collection, list] of [['media', plan.media], ['documents', plan.documents ?? []]] as const) {
    for (const { source } of list) {
      if (/^[a-z][a-z0-9+.-]*:\/\//i.test(source)) continue
      const filePath = await resolveLocalFile(baseDir, source)
      const problem = await localFileProblem(collection, filePath, source)
      if (problem) throw new Error(problem)
      localFiles.set(source, filePath)
    }
  }

  // Any content counts: a run that failed half-way leaves media without pages, and must not be duplicated.
  let existing = 0
  for (const c of CONTENT_COLLECTIONS) existing += (await payload.count({ collection: c })).totalDocs
  if (existing > 0) {
    if (!opts.reset) throw new Error('The database already has content. Import with reset to replace it.')
    for (const c of CONTENT_COLLECTIONS) await payload.delete({ collection: c, where: { id: { exists: true } }, context: ctx })
  }

  // If the import fails part-way, it removes exactly what it created (by id), so the next attempt
  // starts where this one began, and nothing else on the site is touched.
  const written: Partial<Record<(typeof CONTENT_COLLECTIONS)[number], (string | number)[]>> = {}
  const wrote = <T extends { id: string | number }>(collection: (typeof CONTENT_COLLECTIONS)[number], doc: T): T => {
    ;(written[collection] ??= []).push(doc.id)
    return doc
  }
  try {
    let toLexical = opts.toLexical
    const html = async (h: string) => {
      toLexical ??= await lexicalConverter(payload)
      return toLexical(h)
    }
    const total =
      plan.media.length + (plan.people?.length ?? 0) + (plan.documents?.length ?? 0) + (plan.forms?.length ?? 0) + plan.pages.length * 2 + (plan.articles?.length ?? 0) + (plan.redirects?.length ?? 0) + 1
    let done = 0
    const tick = () => opts.onProgress?.(++done, total)
    const ids = { media: new Map<string, number>(), pages: new Map<string, number>(), people: new Map<string, number>(), documents: new Map<string, number>(), forms: new Map<string, number>() }

    async function upload(collection: 'media' | 'documents', source: string, data: Record<string, unknown>) {
      // Anything that looks like a URL goes through fetchMedia, which refuses all but public https.
      if (/^[a-z][a-z0-9+.-]*:\/\//i.test(source)) {
        let file: { data: Buffer; mimetype: string; name: string }
        try {
          file = await fetchMedia(source)
        } catch (e) {
          // Name the whole URL: the plan's author must be able to find the line to fix.
          const message = e instanceof Error ? e.message : String(e)
          throw new Error(message.includes(source) ? message : `${source}: ${message}`)
        }
        return wrote(collection, await payload.create({ collection, data: data as never, file: { ...file, size: file.data.length }, locale: DEFAULT_LOCALE, context: ctx }))
      }
      const filePath = localFiles.get(source) ?? (await resolveLocalFile(baseDir, source))
      return wrote(collection, await payload.create({ collection, data: data as never, filePath, locale: DEFAULT_LOCALE, context: ctx }))
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
      tick()
    }
    for (const p of plan.people ?? []) {
      const data = { ...localeData(p, DEFAULT_LOCALE, ['name', 'role', 'email', 'phone', 'bio']), image: p.image ? ids.media.get(p.image) : undefined, site }
      const doc = wrote('people', await payload.create({ collection: 'people', data: data as never, locale: DEFAULT_LOCALE, context: ctx }))
      ids.people.set(p.ref, doc.id as number)
      await localized('people', doc.id as number, p, ['role', 'bio'])
      tick()
    }
    for (const d of plan.documents ?? []) {
      const doc = await upload('documents', d.source, { ...localeData(d, DEFAULT_LOCALE, ['title', 'description']), docType: d.docType, language: d.language, sites: [site] })
      ids.documents.set(d.ref, doc.id as number)
      await localized('documents', doc.id as number, d, ['title', 'description'])
      tick()
    }
    for (const f of plan.forms ?? []) {
      // The plugin does not localize the title: the default language's, else the first given.
      const title = f.title[DEFAULT_LOCALE] ?? Object.values(f.title)[0]
      const data = { title, ...(await formData(f, DEFAULT_LOCALE, html)), ...retentionFromPlan(f.retention), emails: [] }
      let doc: { id: number; fields?: FormRow[] }
      try {
        doc = wrote('forms', (await payload.create({ collection: 'forms', data: data as never, locale: DEFAULT_LOCALE, context: ctx })) as typeof doc)
      } catch (e) {
        // Name the form: the plan's author must be able to find it.
        throw new Error(`form "${f.ref}": ${e instanceof Error ? e.message : String(e)}`)
      }
      ids.forms.set(f.ref, doc.id)
      for (const l of others) {
        if (!hasLocale(f, l)) continue
        try {
          await payload.update({ collection: 'forms', id: doc.id, locale: l, data: (await formData(f, l, html, doc.fields)) as never, context: ctx })
        } catch (e) {
          throw new Error(`form "${f.ref}" (${l}): ${e instanceof Error ? e.message : String(e)}`)
        }
      }
      tick()
    }
    // Pages link to each other (and may link both ways), so create them all first, then fill in layouts.
    const ordered = orderPages(plan.pages)
    for (const p of ordered) {
      const base = {
        site,
        isHome: p.isHome ?? false,
        order: p.order,
        hideFromNav: p.hideFromNav,
        parent: p.parent ? ids.pages.get(p.parent) : undefined,
        cardImage: p.cardImage ? ids.media.get(p.cardImage) : undefined,
        _status: 'published',
      }
      const doc = wrote('pages', await payload.create({ collection: 'pages', data: { ...base, ...localeData(p, DEFAULT_LOCALE, ['title', 'slug', 'summary']) } as never, locale: DEFAULT_LOCALE, context: ctx }))
      ids.pages.set(p.ref, doc.id as number)
      await localized('pages', doc.id as number, p, ['title', 'slug', 'summary'])
      tick()
    }
    for (const p of ordered) {
      const id = ids.pages.get(p.ref)!
      const data = await resolveValue(localeData(p, DEFAULT_LOCALE, ['meta', 'layout']), ids, html)
      await payload.update({ collection: 'pages', id, locale: DEFAULT_LOCALE, data: { ...(data as object), _status: 'published' } as never, context: ctx })
      await localized('pages', id, p, ['meta', 'layout'], true)
      tick()
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
      const doc = wrote('articles', await payload.create({ collection: 'articles', data: data as never, locale: DEFAULT_LOCALE, context: ctx }))
      for (const l of others) {
        const c = a.contentHtml?.[l]
        const ld = { ...localeData(a, l, ['title', 'slug', 'lead']), content: c ? await html(c) : undefined }
        if (Object.values(ld).some((v) => v !== undefined)) await payload.update({ collection: 'articles', id: doc.id, locale: l, data: ld as never, context: ctx })
      }
      tick()
    }
    const link = (page?: string, url?: string, label?: string) =>
      page ? { type: 'reference', reference: { relationTo: 'pages', value: ids.pages.get(page) }, label } : { type: 'custom', url, label }
    const settingsFor = (l: (typeof LOCALES)[number]) => ({
      nav: (plan.settings.nav[l] ?? []).map((i) => ({ link: link(i.page, undefined, i.label) })),
      contactLink: plan.settings.contact?.[l] ? link(plan.settings.contact[l]!.page, undefined, plan.settings.contact[l]!.label) : undefined,
      footerColumns: (plan.settings.footer?.[l] ?? []).map((c) => ({ heading: c.heading, links: c.links.map((x) => ({ link: link(x.page, x.url, x.label) })) })),
      copyright: plan.settings.copyright?.[l],
    })
    const settings = wrote('site-settings', await payload.create({
      collection: 'site-settings',
      data: { site, ...settingsFor(DEFAULT_LOCALE), phone: plan.settings.phone, email: plan.settings.email, address: plan.settings.address } as never,
      locale: DEFAULT_LOCALE,
      context: ctx,
    }))
    for (const l of others) await payload.update({ collection: 'site-settings', id: settings.id, locale: l, data: settingsFor(l) as never, context: ctx })
    tick()
    for (const r of plan.redirects ?? []) {
      wrote('redirects', await payload.create({ collection: 'redirects', data: { from: r.from, to: link(r.toPage, r.toUrl), permanent: r.permanent ?? true } as never, context: ctx }))
      tick()
    }
    return { media: plan.media.length, pages: plan.pages.length, articles: plan.articles?.length ?? 0 }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    try {
      for (const c of CONTENT_COLLECTIONS) {
        const ids = written[c]
        if (!ids?.length) continue
        const res = await payload.delete({ collection: c, where: { id: { in: ids } }, context: ctx })
        if (res.errors?.length) throw new Error(`${res.errors.length} of ${ids.length} ${c} could not be deleted`)
      }
    } catch (cleanup) {
      throw new Error(`${message} (removing what this import wrote also failed: ${cleanup instanceof Error ? cleanup.message : String(cleanup)})`)
    }
    throw new Error(`${message} (everything this import wrote was removed, so it can run again)`)
  }
}
