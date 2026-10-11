import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload, type Where } from 'payload'

import type { Article, Page, SiteSetting } from '@/payload-types'
import { type Locale, LOCALES, SITE_CONFIG, type SiteKey } from './sites'

/**
 * Alle oppslag frontenden gjør. Publisert innhold caches med tagger som tømmes av
 * src/lib/revalidate.ts; i forhåndsvisning (draft) hentes alt ferskt.
 */
export type ArticleKind = keyof typeof SITE_CONFIG.articleKinds

export const payload = () => getPayload({ config: configPromise })

const cached = <A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string, tags: (...args: A) => string[]) =>
  (...args: A) => unstable_cache(() => fn(...args), [key, JSON.stringify(args)], { tags: tags(...args) })()

async function findPage(site: SiteKey, locale: Locale, path: string, draft: boolean): Promise<Page | null> {
  const p = await payload()
  const res = await p.find({
    collection: 'pages',
    locale,
    draft,
    depth: 2,
    limit: 1,
    overrideAccess: draft,
    where: { and: [{ site: { equals: site } }, { path: { equals: path } }] },
  })
  return res.docs[0] ?? null
}
const findPageCached = cached(findPage, 'page', (site) => ['pages', `pages:${site}`, 'media', 'people', 'documents'])
export const getPage = (site: SiteKey, locale: Locale, path: string, draft = false) =>
  draft ? findPage(site, locale, path, true) : findPageCached(site, locale, path, false)

async function findArticle(site: SiteKey, locale: Locale, slug: string, draft: boolean): Promise<Article | null> {
  const p = await payload()
  const res = await p.find({
    collection: 'articles',
    locale,
    draft,
    depth: 2,
    limit: 1,
    overrideAccess: draft,
    where: { and: [{ site: { equals: site } }, { slug: { equals: slug } }] },
  })
  return res.docs[0] ?? null
}
const findArticleCached = cached(findArticle, 'article', (site) => ['articles', `articles:${site}`, 'media'])
export const getArticle = (site: SiteKey, locale: Locale, slug: string, draft = false) =>
  draft ? findArticle(site, locale, slug, true) : findArticleCached(site, locale, slug, false)

export type ArticleQuery = {
  locale: Locale
  sites?: SiteKey[] | null
  kind?: 'all' | ArticleKind | null
  limit?: number
  page?: number
  exclude?: number
}
export const getArticles = cached(
  async ({ locale, sites, kind, limit = 3, page = 1, exclude }: ArticleQuery) => {
    const p = await payload()
    const and: Where[] = [{ _status: { equals: 'published' } }, { slug: { exists: true } }]
    if (sites?.length) and.push({ site: { in: sites } })
    if (kind && kind !== 'all') and.push({ kind: { equals: kind } })
    if (exclude) and.push({ id: { not_equals: exclude } })
    return p.find({
      collection: 'articles',
      locale,
      depth: 1,
      limit,
      page,
      sort: '-publishedAt',
      where: { and },
      select: { title: true, slug: true, site: true, kind: true, publishedAt: true, lead: true, heroImage: true },
    })
  },
  'articles',
  () => ['articles', 'media'],
)

export const getSettings = cached(
  async (site: SiteKey, locale: Locale): Promise<SiteSetting | null> => {
    const p = await payload()
    const res = await p.find({
      collection: 'site-settings',
      locale,
      depth: 1,
      limit: 1,
      where: { site: { equals: site } },
    })
    return res.docs[0] ?? null
  },
  'settings',
  (site) => ['site-settings', `site-settings:${site}`, 'pages', 'articles'],
)

/** Stien til samme dokument på de andre språkene (til hreflang og språkbytte). */
export const getAlternatePaths = cached(
  async (collection: 'pages' | 'articles', id: number): Promise<Partial<Record<Locale, string>>> => {
    const p = await payload()
    const out: Partial<Record<Locale, string>> = {}
    for (const locale of LOCALES) {
      const doc = await p.findByID({
        collection,
        id,
        locale,
        depth: 0,
        select: collection === 'pages' ? { path: true, title: true } : { slug: true, title: true },
      })
      const value = collection === 'pages' ? (doc as Page).path : (doc as Article).slug
      // En side «finnes» på et språk når den har tittel der (fallback er av).
      if (doc.title && value !== undefined && value !== null) out[locale] = value
    }
    return out
  },
  'alternates',
  (collection) => [collection],
)

/** Alle publiserte sider og artikler for et nettsted – til sitemap og statisk generering. */
export const getAllRoutes = cached(
  async (site: SiteKey) => {
    const p = await payload()
    const routes: { collection: 'pages' | 'articles'; id: number; locale: Locale; value: string; updatedAt: string; noindex?: boolean | null }[] = []
    for (const locale of LOCALES) {
      const pages = await p.find({
        collection: 'pages',
        locale,
        depth: 0,
        limit: 0,
        pagination: false,
        where: { and: [{ site: { equals: site } }, { _status: { equals: 'published' } }, { path: { exists: true } }] },
        select: { path: true, title: true, updatedAt: true, meta: { noindex: true } },
      })
      for (const d of pages.docs) {
        if (d.title && d.path !== null && d.path !== undefined)
          routes.push({ collection: 'pages', id: d.id, locale, value: d.path, updatedAt: d.updatedAt, noindex: d.meta?.noindex })
      }
      const articles = await p.find({
        collection: 'articles',
        locale,
        depth: 0,
        limit: 0,
        pagination: false,
        where: { and: [{ site: { equals: site } }, { _status: { equals: 'published' } }, { slug: { exists: true } }] },
        select: { slug: true, title: true, updatedAt: true, meta: { noindex: true } },
      })
      for (const d of articles.docs) {
        if (d.title && d.slug)
          routes.push({ collection: 'articles', id: d.id, locale, value: d.slug, updatedAt: d.updatedAt, noindex: d.meta?.noindex })
      }
    }
    return routes
  },
  'routes',
  (site) => ['pages', 'articles', `site:${site}`],
)

/** Omdirigeringer med mål løst på riktig språk (målsidens adresse varierer per språk). */
export const getRedirects = cached(
  async (locale: Locale) => {
    const p = await payload()
    const res = await p.find({ collection: 'redirects', locale, depth: 1, limit: 0, pagination: false })
    return res.docs
  },
  'redirects',
  () => ['redirects'],
)

export type ChildPage = { id: number; title: string; path: string; summary: string | null; image: unknown; children: ChildPage[] }

/** Første bilde i en sides seksjoner – brukes som kortbilde når `cardImage` mangler. */
function firstImage(layout: unknown): unknown {
  if (!Array.isArray(layout)) return null
  for (const b of layout as Record<string, unknown>[]) {
    for (const key of ['media', 'image']) {
      const v = b[key]
      if (v && typeof v === 'object') return v
    }
    const items = (b.items ?? b.images) as Record<string, unknown>[] | undefined
    if (Array.isArray(items)) for (const it of items) if (it.image && typeof it.image === 'object') return it.image
  }
  return null
}

/** Undersider (ett eller to nivåer) til oversikter som katalogen. */
export const getChildPages = cached(
  async (site: SiteKey, locale: Locale, parentId: number, depth: number): Promise<ChildPage[]> => {
    const p = await payload()
    const load = async (id: number, level: number): Promise<ChildPage[]> => {
      const res = await p.find({
        collection: 'pages',
        locale,
        depth: 1,
        limit: 0,
        pagination: false,
        sort: ['order', 'title'],
        where: {
          and: [{ site: { equals: site } }, { parent: { equals: id } }, { _status: { equals: 'published' } }],
        },
        select: { title: true, path: true, summary: true, cardImage: true, layout: true },
      })
      const out: ChildPage[] = []
      for (const d of res.docs) {
        if (!d.title || d.path == null) continue
        out.push({
          id: d.id,
          title: d.title,
          path: d.path,
          summary: d.summary ?? null,
          image: d.cardImage && typeof d.cardImage === 'object' ? d.cardImage : firstImage(d.layout),
          children: level < depth ? await load(d.id, level + 1) : [],
        })
      }
      return out
    }
    return load(parentId, 1)
  },
  'children',
  (site) => ['pages', `pages:${site}`, 'media'],
)
