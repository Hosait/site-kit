import type { Metadata } from 'next'

import type { Article, Media, Page } from '@/payload-types'
import themeJson from '@site/theme.json'

import { docPath } from './links'
import { validateTheme } from './theme'
import { DEFAULT_LOCALE, HREFLANG, type Locale, LOCALE_CONFIG, SITE_CONFIG, type SiteKey, siteOrigin, SITES } from './sites'

type Doc = Page | Article

const imageUrl = (m: unknown, origin: string): string | undefined => {
  if (!m || typeof m !== 'object') return undefined
  const media = m as Media
  const url = media.sizes?.og?.url || media.url
  if (!url) return undefined
  return url.startsWith('http') ? url : origin + url
}

/** Tittel, beskrivelse, canonical, hreflang og Open Graph for en side eller artikkel. */
const LOGO_SRC = validateTheme(themeJson).logo.src

export function buildMetadata({
  site,
  locale,
  doc,
  path,
  alternates,
}: {
  site: SiteKey
  locale: Locale
  doc: Doc
  path: string
  alternates: Record<string, string>
}): Metadata {
  const origin = siteOrigin(site)
  const meta = doc.meta ?? {}
  const isHome = 'isHome' in doc && doc.isHome
  // SEO-pluginen legger på « | Nettsted»; layouten gjør det også, så vi bruker absolute.
  const rawTitle = meta.title || doc.title
  const title = isHome ? rawTitle : rawTitle.includes(' | ') ? rawTitle : `${rawTitle} | ${SITES[site].name}`
  const description = meta.description || ('lead' in doc ? (doc.lead ?? undefined) : undefined)
  const ogImage = imageUrl(meta.image, origin) || ('heroImage' in doc ? imageUrl(doc.heroImage, origin) : undefined)

  const languages: Record<string, string> = {}
  for (const [l, p] of Object.entries(alternates)) languages[HREFLANG[l as Locale]] = origin + p
  if (alternates[DEFAULT_LOCALE]) languages['x-default'] = origin + alternates[DEFAULT_LOCALE]

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: origin + path, languages },
    openGraph: {
      type: 'kind' in doc ? 'article' : 'website',
      siteName: SITES[site].name,
      locale: LOCALE_CONFIG[locale].ogLocale,
      title,
      description,
      url: origin + path,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
      ...('publishedAt' in doc && doc.publishedAt ? { publishedTime: doc.publishedAt } : {}),
    },
    twitter: { card: 'summary_large_image' },
    robots: meta.noindex ? { index: false, follow: true } : undefined,
  }
}

/** Strukturerte data (schema.org): organisasjon på forsiden, artikkel på artikler, brødsmuler overalt. */
export function jsonLdFor({
  site,
  locale,
  kind,
  doc,
}: {
  site: SiteKey
  locale: Locale
  kind: 'page' | 'article'
  doc: Doc
}): object[] {
  const origin = siteOrigin(site)
  const out: object[] = []

  if (kind === 'page' && (doc as Page).isHome) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITES[site].name,
      url: origin,
      logo: `${origin}${LOGO_SRC}`,
      parentOrganization: SITE_CONFIG.brand.legalName !== SITES[site].name ? { '@type': 'Organization', name: SITE_CONFIG.brand.legalName } : undefined,
    })
  }

  if (kind === 'article') {
    const a = doc as Article
    out.push({
      '@context': 'https://schema.org',
      '@type': a.kind === 'blog' ? 'BlogPosting' : 'NewsArticle',
      headline: a.title,
      description: a.lead ?? undefined,
      datePublished: a.publishedAt ?? undefined,
      dateModified: a.updatedAt,
      image: imageUrl(a.heroImage, origin),
      inLanguage: HREFLANG[locale],
      publisher: { '@type': 'Organization', name: SITES[site].name, logo: `${origin}${LOGO_SRC}` },
      mainEntityOfPage: origin + (docPath('articles', a, locale) ?? ''),
    })
  }

  const path = kind === 'page' ? (doc as Page).path : null
  if (kind === 'page' && path) {
    const parts = path.split('/')
    out.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: parts.map((_, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: i === parts.length - 1 ? doc.title : parts[i].replace(/-/g, ' '),
        item: `${origin}/${locale}/${parts.slice(0, i + 1).join('/')}`,
      })),
    })
  }
  return out
}
