import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Shell } from '@/components/Shell'
import { t } from '@/lib/i18n'
import { otherLocale } from '@/lib/locales'
import { DEFAULT_LOCALE, isLocale, isSiteKey, LOCALE_CONFIG } from '@/lib/sites'
import { parseQuery, SearchView } from './SearchView'

type Props = {
  params: Promise<{ site: string; locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** The search page. The proxy rewrites each locale's own segment (site/config.ts) to this route. */
export function searchRoute() {
  async function Page({ params, searchParams }: Props) {
    const { site, locale } = await params
    if (!isSiteKey(site) || !isLocale(locale)) notFound()
    const query = parseQuery(await searchParams)
    const other = otherLocale(locale)
    const alternateHref = other
      ? `/${other}/${LOCALE_CONFIG[other].searchSegment}${query.q ? `?q=${encodeURIComponent(query.q)}` : ''}`
      : null
    return (
      <Shell site={site} locale={locale} alternateHref={alternateHref} analytics={{ kind: 'search' }}>
        <SearchView site={site} locale={locale} query={query} />
      </Shell>
    )
  }

  async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { locale } = await params
    const loc = isLocale(locale) ? locale : DEFAULT_LOCALE
    const q = parseQuery(await searchParams).q?.trim()
    // Search results are never indexed.
    return { title: q ? `${t(loc).searchTitle}: ${q}` : t(loc).searchTitle, robots: { index: false, follow: true } }
  }

  return { Page, generateMetadata }
}
