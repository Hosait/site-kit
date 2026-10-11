import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound, permanentRedirect, redirect } from 'next/navigation'

import { ArticleView } from '@/components/ArticleView'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Shell } from '@/components/Shell'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { getAllRoutes, getAlternatePaths, getArticle, getPage, getRedirects } from '@/lib/data'
import { docPath, resolveLink } from '@/lib/links'
import { buildMetadata, jsonLdFor } from '@/lib/seo'
import { isLocale, isSiteKey, localePath, LOCALES, SITE_KEYS, SITES, type Locale, type SiteKey } from '@/lib/sites'
import type { Article, Page as PageDoc } from '@/payload-types'

type Params = Promise<{ site: string; locale: string; path?: string[] }>

/**
 * Ved bygging finnes ingen database (Hosait bygger i en isolert container), så listen kan
 * være tom. Sider genereres da ved første besøk og caches til innholdet endres.
 */
export async function generateStaticParams() {
  try {
    const params: { site: string; locale: string; path: string[] }[] = []
    for (const site of SITE_KEYS) {
      for (const r of await getAllRoutes(site)) {
        const path = r.collection === 'pages' ? r.value : `${SITES[site].articleBase[r.locale]}/${r.value}`
        params.push({ site, locale: r.locale, path: path ? path.split('/') : [] })
      }
    }
    return params
  } catch {
    return []
  }
}

type Resolved =
  | { kind: 'page'; doc: PageDoc }
  | { kind: 'article'; doc: Article }
  | { kind: 'redirect'; to: string; permanent: boolean }
  | null

async function resolve(site: SiteKey, locale: string, segments: string[], draft: boolean): Promise<Resolved> {
  const path = segments.map(decodeURIComponent).join('/').normalize('NFC')
  const fullPath = locale === '_' ? `/${path}` : `/${locale}${path ? `/${path}` : ''}`

  if (isLocale(locale)) {
    const page = await getPage(site, locale, path, draft)
    if (page) return { kind: 'page', doc: page }
    const base = SITES[site].articleBase[locale]
    if (segments.length === 2 && path.startsWith(`${base}/`)) {
      const article = await getArticle(site, locale, path.slice(base.length + 1), draft)
      if (article) return { kind: 'article', doc: article }
    }
  }

  // Omdirigeringer fra gamle Craft-adresser (administreres i CMS-et).
  const redirects = await getRedirects(isLocale(locale) ? locale : 'no')
  const match = redirects.find(
    (r) => (!r.site || r.site === site) && r.from.replace(/\/$/, '').normalize('NFC') === fullPath.replace(/\/$/, ''),
  )
  if (match) {
    const to = resolveLink(
      match.to as never,
      site,
      isLocale(locale) ? locale : 'no',
    )
    if (to) return { kind: 'redirect', to, permanent: (match as { permanent?: boolean }).permanent !== false }
  }
  return null
}

export default async function Page({ params }: { params: Params }) {
  const { site: siteParam, locale, path = [] } = await params
  if (!isSiteKey(siteParam)) notFound()
  const site = siteParam
  const { isEnabled: draft } = await draftMode()

  const found = await resolve(site, locale, path, draft)
  if (!found) notFound()
  if (found.kind === 'redirect') {
    if (found.permanent) permanentRedirect(found.to)
    redirect(found.to)
  }

  const loc = locale as Locale
  const collection = found.kind === 'page' ? 'pages' : 'articles'
  const alternates = await getAlternatePaths(collection, found.doc.id)
  const other = LOCALES.find((l) => l !== loc)!
  const otherValue = alternates[other]
  const alternateHref =
    otherValue === undefined
      ? null
      : collection === 'pages'
        ? localePath(other, otherValue)
        : localePath(other, `${SITES[site].articleBase[other]}/${otherValue}`)

  const jsonLd = jsonLdFor({ site, locale: loc, kind: found.kind, doc: found.doc })

  // Brødsmuler for undersider: tittelen til hver forelder langs stien.
  // Produktgruppe til besøksanalysen: sidens egen, ellers nærmeste overordnede sides.
  const crumbs: { title: string; href: string }[] = []
  let productGroup = found.kind === 'page' ? (found.doc.productGroup ?? null) : null
  if (found.kind === 'page' && found.doc.path) {
    const parts = found.doc.path.split('/')
    for (let i = 1; i < parts.length; i++) {
      const prefix = parts.slice(0, i).join('/')
      const ancestor = await getPage(site, loc, prefix)
      if (ancestor) crumbs.push({ title: ancestor.title, href: localePath(loc, prefix) })
    }
    for (let i = parts.length - 1; i >= 1 && !productGroup; i--) {
      productGroup = (await getPage(site, loc, parts.slice(0, i).join('/')))?.productGroup ?? null
    }
  }
  // Sider uten toppseksjon får tittelen som h1 (dagens nettsted mangler h1 på flere sider).
  const firstBlock = found.kind === 'page' ? found.doc.layout?.[0]?.blockType : null
  const needsTitle = found.kind === 'page' && firstBlock !== 'hero' && firstBlock !== 'divisionCards'

  return (
    <Shell site={site} locale={loc} alternateHref={alternateHref} analytics={{ kind: found.kind, id: found.doc.id, group: productGroup }}>
      {draft && <LivePreviewListener />}
      {crumbs.length > 0 && <Breadcrumbs crumbs={crumbs} locale={loc} home={localePath(loc, '')} />}
      {needsTitle && (
        <div className="wrap-wide pb-2 pt-10 md:pt-16">
          <h1 className="t-display">{found.doc.title}</h1>
        </div>
      )}
      {found.kind === 'page' ? (
        <RenderBlocks blocks={found.doc.layout} site={site} locale={loc} pageId={found.doc.id} />
      ) : (
        <ArticleView article={found.doc} site={site} locale={loc} />
      )}
      {jsonLd.map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
      ))}
    </Shell>
  )
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { site, locale, path = [] } = await params
  if (!isSiteKey(site) || !isLocale(locale)) return {}
  const { isEnabled: draft } = await draftMode()
  const found = await resolve(site, locale, path, draft)
  if (!found || found.kind === 'redirect') return {}
  const collection = found.kind === 'page' ? 'pages' : 'articles'
  const alternates = await getAlternatePaths(collection, found.doc.id)
  return buildMetadata({
    site,
    locale,
    doc: found.doc,
    path: docPath(collection, found.doc, locale) ?? `/${locale}`,
    alternates: Object.fromEntries(
      Object.entries(alternates).map(([l, v]) => [
        l,
        collection === 'pages'
          ? localePath(l as Locale, v!)
          : localePath(l as Locale, `${SITES[site].articleBase[l as Locale]}/${v}`),
      ]),
    ),
  })
}
