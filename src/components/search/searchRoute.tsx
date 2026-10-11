import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { Shell } from '@/components/Shell'
import { SEARCH_SEGMENT, t } from '@/lib/i18n'
import { isLocale, isSiteKey, LOCALES, type Locale } from '@/lib/sites'
import { parseQuery, SearchView } from './SearchView'

type Props = {
  params: Promise<{ site: string; locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * Felles for /no/sok og /en/search (to mapper, ett segment per språk).
 * Feil kombinasjon (f.eks. /en/sok) sendes til riktig adresse med søket intakt.
 */
export function searchRoute(segmentLocale: Locale) {
  async function Page({ params, searchParams }: Props) {
    const { site, locale } = await params
    if (!isSiteKey(site) || !isLocale(locale)) notFound()
    const query = parseQuery(await searchParams)
    if (locale !== segmentLocale) {
      const qs = new URLSearchParams(Object.entries(query).filter((e): e is [string, string] => Boolean(e[1])))
      redirect(`/${locale}/${SEARCH_SEGMENT[locale]}${qs.size ? `?${qs}` : ''}`)
    }
    const other = LOCALES.find((l) => l !== locale)!
    const alternateHref = `/${other}/${SEARCH_SEGMENT[other]}${query.q ? `?q=${encodeURIComponent(query.q)}` : ''}`
    return (
      <Shell site={site} locale={locale} alternateHref={alternateHref} analytics={{ kind: 'search' }}>
        <SearchView site={site} locale={locale} query={query} />
      </Shell>
    )
  }

  async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { locale } = await params
    const loc = isLocale(locale) ? locale : segmentLocale
    const q = parseQuery(await searchParams).q?.trim()
    // Søkeresultater skal ikke indekseres av søkemotorer.
    return { title: q ? `${t(loc).searchTitle}: ${q}` : t(loc).searchTitle, robots: { index: false, follow: true } }
  }

  return { Page, generateMetadata }
}
