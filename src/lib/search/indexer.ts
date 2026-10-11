import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Payload, PayloadRequest } from 'payload'

import type { Article, Document, Page, Person } from '@/payload-types'
import { DEFAULT_SITE, isSiteKey, type Locale, localePath, LOCALES, SITE_KEYS, type SiteKey, SITES } from '@/lib/sites'
import { pdfText } from './pdf'
import { layoutText, lexicalText } from './text'

/**
 * Holder søkeindeksen (samlingen search-index) i takt med innholdet.
 * Bare publisert innhold kommer med; sider med noindex og personer som har sluttet holdes utenfor.
 */
export type IndexedCollection = 'pages' | 'articles' | 'documents' | 'people'
export type SearchKind = 'page' | 'article' | 'document' | 'person'

export const KIND: Record<IndexedCollection, SearchKind> = {
  pages: 'page',
  articles: 'article',
  documents: 'document',
  people: 'person',
}
const COLLECTIONS = Object.keys(KIND) as IndexedCollection[]

type Entry = {
  key: string
  kind: SearchKind
  docId: number
  locale: Locale
  site: SiteKey
  sites: string
  title: string
  summary: string | null
  body: string | null
  path: string | null
  image: number | null
  date: string | null
  extra: Record<string, unknown> | null
  source: string | null
}

const idOf = (v: unknown): number | null =>
  typeof v === 'number' ? v : v && typeof v === 'object' && 'id' in v ? Number((v as { id: unknown }).id) : null
const siteOf = (v: unknown): SiteKey => (isSiteKey(v) ? v : DEFAULT_SITE)
const sitesText = (sites: readonly string[]) => ` ${sites.join(' ')} `

type Ctx = { payload: Payload; req?: PayloadRequest }

async function load<T>({ payload, req }: Ctx, collection: IndexedCollection, id: number, locale: Locale): Promise<T | null> {
  try {
    return (await payload.findByID({ collection, id, locale, depth: 0, draft: false, overrideAccess: true, req })) as T
  } catch {
    return null
  }
}

/** Indeksradene (ett per språk) for ett dokument. Tom liste = skal ikke være søkbart. */
export async function entriesFor(ctx: Ctx, collection: IndexedCollection, id: number): Promise<Entry[]> {
  const out: Entry[] = []
  const base = (locale: Locale) => ({ key: `${collection}:${id}:${locale}`, kind: KIND[collection], docId: id, locale })

  if (collection === 'documents') {
    // PDF-teksten er lik på begge språk; hentes én gang, og gjenbrukes hvis fila ikke er endret.
    let body: string | null = null
    for (const locale of LOCALES) {
      const doc = await load<Document>(ctx, collection, id, locale)
      if (!doc?.title) continue
      const source = doc.filename ? `${doc.filename}:${doc.filesize ?? ''}` : null
      if (body === null) body = await documentBody(ctx, id, doc, source)
      const sites = doc.sites?.length ? doc.sites : [...SITE_KEYS]
      out.push({
        ...base(locale),
        site: siteOf(sites[0]),
        sites: sitesText(sites),
        title: doc.title,
        summary: doc.description ?? null,
        body,
        path: doc.url ?? null,
        image: null,
        date: doc.updatedAt,
        extra: { docType: doc.docType, language: doc.language, filesize: doc.filesize, mimeType: doc.mimeType },
        source,
      })
    }
    return out
  }

  for (const locale of LOCALES) {
    if (collection === 'pages') {
      const doc = await load<Page>(ctx, collection, id, locale)
      if (!doc?.title || doc._status !== 'published' || doc.path == null || doc.meta?.noindex) continue
      const site = siteOf(doc.site)
      out.push({
        ...base(locale),
        site,
        sites: sitesText([site]),
        title: doc.title,
        summary: doc.summary || doc.meta?.description || null,
        body: layoutText(doc.layout),
        path: localePath(locale, doc.path),
        image: idOf(doc.cardImage) ?? idOf(doc.meta?.image),
        date: null,
        extra: null,
        source: null,
      })
    } else if (collection === 'articles') {
      const doc = await load<Article>(ctx, collection, id, locale)
      if (!doc?.title || doc._status !== 'published' || !doc.slug || doc.meta?.noindex) continue
      const site = siteOf(doc.site)
      out.push({
        ...base(locale),
        site,
        sites: sitesText([site]),
        title: doc.title,
        summary: doc.lead || doc.meta?.description || null,
        body: lexicalText(doc.content),
        path: localePath(locale, `${SITES[site].articleBase[locale]}/${doc.slug}`),
        image: idOf(doc.heroImage) ?? idOf(doc.meta?.image),
        date: doc.publishedAt ?? null,
        extra: { articleKind: doc.kind },
        source: null,
      })
    } else {
      const doc = await load<Person>(ctx, collection, id, locale)
      if (!doc?.name || doc.hasLeft) continue
      const site = siteOf(doc.site)
      out.push({
        ...base(locale),
        site,
        sites: sitesText([site]),
        title: doc.name,
        summary: doc.role ?? null,
        body: [doc.bio, doc.email].filter(Boolean).join('\n') || null,
        path: null,
        image: idOf(doc.image),
        date: null,
        extra: { email: doc.email ?? null, phone: doc.phone ?? null },
        source: null,
      })
    }
  }
  return out
}

async function documentBody({ payload, req }: Ctx, id: number, doc: Document, source: string | null): Promise<string> {
  if (!doc.mimeType?.includes('pdf')) return ''
  if (source) {
    const prev = await payload.find({
      collection: 'search-index',
      where: { and: [{ kind: { equals: 'document' } }, { docId: { equals: id } }, { source: { equals: source } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })
    const body = prev.docs[0]?.body
    if (body) return body
  }
  return pdfText(doc)
}

/** Erstatter indeksradene for ett dokument. */
export async function reindexOne(ctx: Ctx, collection: IndexedCollection, id: number): Promise<number> {
  const entries = await entriesFor(ctx, collection, id)
  await removeFromIndex(ctx, collection, id)
  for (const data of entries) {
    await ctx.payload.create({ collection: 'search-index', data, depth: 0, overrideAccess: true, req: ctx.req })
  }
  return entries.length
}

export async function removeFromIndex({ payload, req }: Ctx, collection: IndexedCollection, id: number) {
  await payload.delete({
    collection: 'search-index',
    where: { and: [{ kind: { equals: KIND[collection] } }, { docId: { equals: id } }] },
    depth: 0,
    overrideAccess: true,
    req,
  })
}

const isIndexed = (slug: string): slug is IndexedCollection => slug in KIND

/** afterChange: oppdaterer indeksen når noe publiseres, avpubliseres eller endres. */
export const indexDoc: CollectionAfterChangeHook = async ({ doc, collection, req }) => {
  if (req.context.skipSearchIndex || !isIndexed(collection.slug)) return doc
  // Autolagrede utkast endrer ikke det publiserte innholdet.
  if (doc._status === 'draft' && (req.query as { autosave?: unknown } | undefined)?.autosave === 'true') return doc
  try {
    await reindexOne({ payload: req.payload, req }, collection.slug, doc.id)
  } catch (err) {
    req.payload.logger.error({ err, msg: `Søkeindeks: kunne ikke oppdatere ${collection.slug}/${doc.id}` })
  }
  return doc
}

export const unindexDoc: CollectionAfterDeleteHook = async ({ doc, collection, req }) => {
  if (!isIndexed(collection.slug) || !doc?.id) return doc
  try {
    await removeFromIndex({ payload: req.payload, req }, collection.slug, doc.id)
  } catch (err) {
    req.payload.logger.error({ err, msg: `Søkeindeks: kunne ikke fjerne ${collection.slug}/${doc.id}` })
  }
  return doc
}

export type ReindexProgress = {
  running: boolean
  total: number
  done: number
  entries: number
  failed: string[]
  startedAt: string
  finishedAt?: string
}
const g = globalThis as unknown as { __searchReindex?: ReindexProgress }
export const reindexProgress = () => g.__searchReindex ?? null

/**
 * Bygger hele indeksen på nytt i bakgrunnen (etter import av innhold, eller fra admin).
 * Rader som ikke ble skrevet på nytt (slettet innhold) fjernes til slutt.
 */
export async function reindexAll(payload: Payload): Promise<ReindexProgress> {
  if (g.__searchReindex?.running) return g.__searchReindex
  const startedAt = new Date().toISOString()
  const jobs: { collection: IndexedCollection; id: number }[] = []
  for (const collection of COLLECTIONS) {
    const res = await payload.find({ collection, depth: 0, limit: 0, pagination: false, select: { updatedAt: true }, overrideAccess: true })
    for (const d of res.docs) jobs.push({ collection, id: d.id })
  }
  const progress: ReindexProgress = { running: true, total: jobs.length, done: 0, entries: 0, failed: [], startedAt }
  g.__searchReindex = progress

  void (async () => {
    for (const job of jobs) {
      try {
        progress.entries += await reindexOne({ payload }, job.collection, job.id)
      } catch (err) {
        progress.failed.push(`${job.collection}/${job.id}: ${err instanceof Error ? err.message : String(err)}`)
      }
      progress.done++
    }
    try {
      await payload.delete({
        collection: 'search-index',
        where: { updatedAt: { less_than: startedAt } },
        depth: 0,
        overrideAccess: true,
      })
    } catch (err) {
      progress.failed.push(`opprydding: ${err instanceof Error ? err.message : String(err)}`)
    }
    progress.running = false
    progress.finishedAt = new Date().toISOString()
  })()

  return progress
}
