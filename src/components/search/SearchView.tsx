import Link from 'next/link'

import { Img } from '@/components/Img'
import { Highlight } from '@/components/search/Highlight'
import { payload } from '@/lib/data'
import { DOC_TYPES, formatDate, SEARCH_SEGMENT, t } from '@/lib/i18n'
import { hitHref } from '@/lib/search/href'
import type { SearchKind } from '@/lib/search/indexer'
import { emptyResult, search, SEARCH_KINDS, type SearchHit } from '@/lib/search/query'
import { isExternal } from '@/lib/links'
import { isSiteKey, SITE_KEYS, SITES, type Locale, type SiteKey } from '@/lib/sites'
import type { Media } from '@/payload-types'
import { cn } from '@/utilities/ui'

export type SearchQuery = { q?: string; site?: string; kind?: string; page?: string }

/** Leser søkeparametrene fra adressen (ukjente verdier ignoreres). */
export function parseQuery(sp: Record<string, string | string[] | undefined>): SearchQuery {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
  return { q: one(sp.q), site: one(sp.site), kind: one(sp.kind), page: one(sp.page) }
}

const formatSize = (bytes: unknown, locale: Locale) => {
  const n = Number(bytes)
  if (!n) return ''
  const mb = n / 1024 / 1024
  const v = mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} kB`
  return locale === 'no' ? v.replace('.', ',') : v
}

/** Søkesiden: søker i alt innhold på alle tre nettsteder, med filtre for nettsted og type. */
export async function SearchView({ site, locale, query }: { site: SiteKey; locale: Locale; query: SearchQuery }) {
  const s = t(locale)
  const q = (query.q ?? '').trim()
  const filterSite = isSiteKey(query.site) ? query.site : null
  const filterKind = SEARCH_KINDS.includes(query.kind as SearchKind) ? (query.kind as SearchKind) : null
  const p = await payload()
  const result = q
    ? await search(p, { q, locale, current: site, site: filterSite, kind: filterKind, page: Number(query.page) || 1 })
    : emptyResult(q)

  // Bildene til treffene på denne siden, i én spørring.
  const imageIds = [...new Set(result.hits.map((h) => h.image).filter((id): id is number => id !== null))]
  const media = imageIds.length
    ? (await p.find({ collection: 'media', where: { id: { in: imageIds } }, depth: 0, limit: imageIds.length, pagination: false })).docs
    : []
  const mediaById = new Map(media.map((m) => [m.id, m as Media]))

  const base = `/${locale}/${SEARCH_SEGMENT[locale]}`
  const href = (over: Partial<Record<'site' | 'kind' | 'page', string | null>>) => {
    const params = new URLSearchParams()
    params.set('q', q)
    const next = { site: filterSite, kind: filterKind, page: null as string | null, ...over }
    if (next.site) params.set('site', next.site)
    if (next.kind) params.set('kind', next.kind)
    if (next.page && next.page !== '1') params.set('page', next.page)
    return `${base}?${params}`
  }
  const allCount = Object.values(result.facets.kinds).reduce((a, b) => a + b, 0)

  return (
    <div className="wrap-wide pb-20 pt-10 md:pt-16">
      <h1 className="t-display">{s.searchTitle}</h1>

      <form role="search" action={base} method="get" className="mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <label htmlFor="search-q" className="sr-only">
          {s.searchLabel}
        </label>
        <input
          id="search-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder={s.searchPlaceholder}
          autoComplete="off"
          enterKeyHint="search"
          maxLength={100}
          className="min-h-12 flex-1 rounded-full border border-night/20 bg-white px-5 text-base outline-offset-2 focus:border-blue"
        />
        {filterSite && <input type="hidden" name="site" value={filterSite} />}
        {filterKind && <input type="hidden" name="kind" value={filterKind} />}
        <button type="submit" className="btn btn-primary">
          {s.search}
        </button>
      </form>
      {!q && <p className="t-small mt-4 max-w-2xl text-night/70">{s.searchHint}</p>}

      {q && (
        <>
          <span hidden data-a-search={q} data-a-hits={result.total} />
          <p role="status" className="mt-8 text-lg">
            {result.total > 0 ? (
              <>
                <strong>{result.total}</strong> {result.total === 1 ? s.oneResultFor : s.resultsFor} «{q}»
              </>
            ) : (
              <>
                {s.noResults} «{q}». {s.noResultsHelp}
              </>
            )}
          </p>
          {result.fuzzy && <p className="t-small mt-1 text-night/70">{s.fuzzyNote}</p>}

          {allCount > 0 && (
            <div className="mt-6 flex flex-col gap-3">
              <FilterRow
                label={s.filterKind}
                items={[
                  { label: s.allKinds, count: allCount, href: href({ kind: null }), active: !filterKind },
                  ...SEARCH_KINDS.filter((k) => result.facets.kinds[k] > 0).map((k) => ({
                    label: s[`kind_${k}`],
                    count: result.facets.kinds[k],
                    href: href({ kind: k }),
                    active: filterKind === k,
                  })),
                ]}
              />
              <FilterRow
                label={s.filterSite}
                items={[
                  { label: s.allSites, count: null, href: href({ site: null }), active: !filterSite },
                  ...SITE_KEYS.filter((k) => result.facets.sites[k] > 0).map((k) => ({
                    label: SITES[k].name,
                    count: result.facets.sites[k],
                    href: href({ site: k }),
                    active: filterSite === k,
                  })),
                ]}
              />
            </div>
          )}

          {result.hits.length > 0 && (
            <ol className="mt-8 divide-y divide-night/10 border-y border-night/10">
              {result.hits.map((hit) => (
                <li key={hit.id}>
                  <Result hit={hit} site={site} locale={locale} image={hit.image ? mediaById.get(hit.image) : undefined} />
                </li>
              ))}
            </ol>
          )}

          {result.pages > 1 && (
            <nav aria-label={s.resultPages} className="mt-8 flex flex-wrap items-center gap-4">
              {result.page > 1 && (
                <Link className="btn" href={href({ page: String(result.page - 1) })} rel="prev">
                  ← {s.previousPage}
                </Link>
              )}
              <span className="t-small">
                {s.pageLabel} {result.page} {s.of} {result.pages}
              </span>
              {result.page < result.pages && (
                <Link className="btn" href={href({ page: String(result.page + 1) })} rel="next">
                  {s.nextPage} →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  )
}

type FilterItem = { label: string; count: number | null; href: string; active: boolean }

function FilterRow({ label, items }: { label: string; items: FilterItem[] }) {
  return (
    <nav aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="t-small mr-1 font-medium text-night/70">{label}:</span>
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          aria-current={it.active ? 'true' : undefined}
          className={cn(
            'inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm no-underline',
            it.active ? 'border-night bg-night text-white' : 'border-night/20 text-night hover:border-blue hover:text-blue-text',
          )}
        >
          {it.label}
          {it.count !== null && <span className={it.active ? 'text-white/80' : 'text-night/70'}>({it.count})</span>}
        </Link>
      ))}
    </nav>
  )
}

function Result({ hit, site, locale, image }: { hit: SearchHit; site: SiteKey; locale: Locale; image?: Media }) {
  const s = t(locale)
  const link = hitHref(hit, site)
  const extra = hit.extra ?? {}
  const meta: string[] = [SITES[hit.site].name]
  if (hit.kind === 'article' && hit.date) meta.push(formatDate(hit.date, locale))
  if (hit.kind === 'document') {
    meta.push(DOC_TYPES[locale][String(extra.docType)] ?? DOC_TYPES[locale].other)
    const size = formatSize(extra.filesize, locale)
    if (size) meta.push(`PDF, ${size}`)
  }
  if (hit.kind === 'person') meta.push(s.one_person)

  const title =
    link && (isExternal(link) || hit.kind === 'document') ? (
      <a href={link} className="text-night no-underline hover:text-blue-text hover:underline">
        {hit.title}
      </a>
    ) : link ? (
      <Link href={link} className="text-night no-underline hover:text-blue-text hover:underline">
        {hit.title}
      </Link>
    ) : (
      hit.title
    )

  return (
    <article className="flex gap-4 py-6 md:gap-6">
      <div className="min-w-0 flex-1">
        <p className="t-small text-night/70">{meta.filter(Boolean).join(' · ')}</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight md:text-2xl">{title}</h2>
        {hit.kind === 'person' ? (
          <div className="mt-2 flex flex-col gap-1">
            {hit.snippet && <p className="text-night/80">{hit.snippet.replace(/[⟦⟧]/g, '')}</p>}
            {typeof extra.email === 'string' && extra.email && (
              <a href={`mailto:${extra.email}`} className="inline-flex min-h-11 items-center self-start">
                {extra.email}
              </a>
            )}
            {typeof extra.phone === 'string' && extra.phone && (
              <a href={`tel:${extra.phone.replace(/\s/g, '')}`} className="inline-flex min-h-11 items-center self-start">
                {extra.phone}
              </a>
            )}
          </div>
        ) : (
          hit.snippet && (
            <p className="mt-2 line-clamp-3 text-night/80">
              <Highlight text={hit.snippet} />
            </p>
          )
        )}
      </div>
      {image && (
        <div className="hidden w-28 shrink-0 overflow-hidden rounded-xl sm:block md:w-36">
          <Img media={image} sizes="144px" cover className="aspect-[4/3] h-full w-full" alt="" />
        </div>
      )}
    </article>
  )
}
