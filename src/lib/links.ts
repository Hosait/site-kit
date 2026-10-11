import type { Article, Page } from '@/payload-types'
import { isSiteKey, localePath, SITES, siteHref, type Locale, type SiteKey } from './sites'
import { DEFAULT_SITE } from '@/lib/sites'

export type LinkValue = {
  type?: 'reference' | 'custom' | null
  newTab?: boolean | null
  reference?:
    | { relationTo: 'pages'; value: number | Page }
    | { relationTo: 'articles'; value: number | Article }
    | null
  url?: string | null
  label?: string | null
  appearance?: 'primary' | 'secondary' | 'text' | null
}

/** Offentlig sti for en side eller artikkel, uten domene. */
export function docPath(collection: 'pages' | 'articles', doc: Partial<Page & Article>, locale: Locale): string | null {
  const site: SiteKey = isSiteKey(doc.site) ? doc.site : DEFAULT_SITE
  if (collection === 'pages') {
    if (doc.path === undefined || doc.path === null) return null
    return localePath(locale, doc.path)
  }
  if (!doc.slug) return null
  return localePath(locale, `${SITES[site].articleBase[locale]}/${doc.slug}`)
}

/**
 * Gjør en CMS-lenke om til href. Interne lenker til et annet av våre nettsteder blir
 * absolutte i produksjon (se siteHref). Returnerer null når målet ikke finnes på språket.
 */
export function resolveLink(link: LinkValue | null | undefined, current: SiteKey, locale: Locale): string | null {
  if (!link) return null
  if (link.type === 'custom' || !link.type) return link.url?.trim() || null
  const ref = link.reference
  if (!ref || typeof ref.value !== 'object') return null
  const doc = ref.value as Partial<Page & Article>
  const path = docPath(ref.relationTo, doc, locale)
  if (!path) return null
  const target: SiteKey = isSiteKey(doc.site) ? doc.site : current
  return siteHref(target, current, path)
}

export function linkLabel(link: LinkValue | null | undefined): string {
  if (!link) return ''
  if (link.label) return link.label
  const v = link.reference?.value
  return v && typeof v === 'object' && 'title' in v ? (v.title ?? '') : ''
}

export const isExternal = (href: string) => /^https?:\/\//i.test(href)
