import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

import { isSiteKey, SITE_KEYS, type Locale, type SiteKey } from '@/lib/sites'
import type { SearchKind } from './indexer'
import { toTsQuery } from './text'

/**
 * Søk i search-index med Postgres-fulltekst: norsk/engelsk ordstamme, prefiks på hvert ord
 * og vekting (tittel > ingress > brødtekst). Ingen treff → likhetssøk i titler (pg_trgm), som
 * tåler skrivefeil. Uttrykket i `vector` er det samme som GIN-indeksene i migrasjonen bruker.
 */
export const SEARCH_KINDS: SearchKind[] = ['page', 'article', 'document', 'person']
export const HL_START = '⟦'
export const HL_END = '⟧'

const CONFIG: Record<Locale, 'norwegian' | 'english'> = { no: 'norwegian', en: 'english' }
const KIND_WEIGHT: Record<SearchKind, number> = { page: 1, article: 0.9, document: 0.85, person: 1 }
const PAGE_SIZE = 20
const MAX_QUERY = 100

export const vector = (locale: Locale) => {
  const c = CONFIG[locale]
  return `(setweight(to_tsvector('${c}'::regconfig, coalesce(title, '')), 'A') || setweight(to_tsvector('${c}'::regconfig, coalesce(summary, '')), 'B') || setweight(to_tsvector('${c}'::regconfig, coalesce(body, '')), 'C'))`
}

export type SearchHit = {
  id: number
  kind: SearchKind
  site: SiteKey
  sites: SiteKey[]
  title: string
  /** Utdrag med treffene mellom HL_START og HL_END. */
  snippet: string
  path: string | null
  image: number | null
  date: string | null
  extra: Record<string, unknown> | null
}

export type SearchResult = {
  query: string
  total: number
  page: number
  pages: number
  hits: SearchHit[]
  facets: { sites: Record<SiteKey, number>; kinds: Record<SearchKind, number> }
  /** Ingen eksakte treff; viser titler som ligner (skrivefeil). */
  fuzzy: boolean
}

export type SearchParams = {
  q: string
  locale: Locale
  /** Nettstedet søket gjøres fra: treff herfra rangeres litt høyere. */
  current: SiteKey
  site?: SiteKey | null
  kind?: SearchKind | null
  page?: number
  limit?: number
}

type Row = Record<string, unknown>
type SQL = ReturnType<typeof sql>
const db = (payload: Payload) =>
  (payload.db as unknown as { drizzle: { execute: (q: SQL) => Promise<{ rows: Row[] }> } }).drizzle

let trgm: Promise<boolean> | null = null
/** pg_trgm lages av migrasjonen; lokalt (push uten migrasjoner) forsøkes det her. */
const hasTrgm = (payload: Payload) =>
  (trgm ??= db(payload)
    .execute(sql`create extension if not exists pg_trgm`)
    .then(() => true)
    .catch(() => false))

const parseSites = (v: unknown): SiteKey[] => String(v ?? '').split(' ').filter(isSiteKey)

export const emptyResult = (q: string): SearchResult => ({
  query: q,
  total: 0,
  page: 1,
  pages: 0,
  hits: [],
  facets: {
    sites: Object.fromEntries(SITE_KEYS.map((s) => [s, 0])) as Record<SiteKey, number>,
    kinds: Object.fromEntries(SEARCH_KINDS.map((k) => [k, 0])) as Record<SearchKind, number>,
  },
  fuzzy: false,
})

export async function search(payload: Payload, params: SearchParams): Promise<SearchResult> {
  const q = params.q.trim().slice(0, MAX_QUERY)
  const tsq = toTsQuery(q)
  const result = emptyResult(q)
  if (!tsq) return result

  const loc = params.locale === 'en' ? 'en' : 'no'
  const cfg = sql.raw(`'${CONFIG[loc]}'::regconfig`)
  const vec = sql.raw(vector(loc))
  const locSql = sql.raw(`'${loc}'`)

  // 1. Alle treff (få hundre rader på det meste): id, type, nettsteder og rangering.
  let candidates = (
    await db(payload).execute(sql`
      select id, kind, sites, title, ts_rank(${vec}, query) as rank
      from search_index, to_tsquery(${cfg}, ${tsq}) query
      where locale = ${locSql} and ${vec} @@ query
      order by rank desc
      limit 500`)
  ).rows
  if (!candidates.length && (await hasTrgm(payload))) {
    candidates = (
      await db(payload).execute(sql`
        select id, kind, sites, title, word_similarity(${q}, title) as rank
        from search_index
        where locale = ${locSql} and word_similarity(${q}, title) > 0.35
        order by rank desc
        limit 50`)
    ).rows
    result.fuzzy = candidates.length > 0
  }

  // 2. Rangering: type, nettstedet man står på, og ord fra søket i tittelen.
  const needle = q.toLowerCase()
  const scored = candidates.map((r) => {
    const kind = r.kind as SearchKind
    const sites = parseSites(r.sites)
    let score = Number(r.rank) * (KIND_WEIGHT[kind] ?? 1)
    if (sites.includes(params.current)) score *= 1.3
    if (String(r.title).toLowerCase().includes(needle)) score *= 2
    return { id: Number(r.id), kind, sites, score }
  })
  for (const r of scored) {
    result.facets.kinds[r.kind] = (result.facets.kinds[r.kind] ?? 0) + 1
    for (const s of r.sites) result.facets.sites[s]++
  }
  const filtered = scored
    .filter((r) => (!params.site || r.sites.includes(params.site)) && (!params.kind || r.kind === params.kind))
    .sort((a, b) => b.score - a.score)

  const limit = params.limit ?? PAGE_SIZE
  result.total = filtered.length
  result.pages = Math.ceil(filtered.length / limit)
  result.page = Math.min(Math.max(1, params.page ?? 1), Math.max(1, result.pages))
  const slice = filtered.slice((result.page - 1) * limit, result.page * limit)
  if (!slice.length) return result

  // 3. Visningsdata og utdrag bare for siden som vises.
  const ids = sql.join(
    slice.map((r) => sql`${r.id}`),
    sql`, `,
  )
  const options = `StartSel=${HL_START}, StopSel=${HL_END}, MaxWords=30, MinWords=12, MaxFragments=2, FragmentDelimiter=" … "`
  const rows = (
    await db(payload).execute(sql`
      select id, kind, site, sites, title, summary, path, image_id, date, extra,
        ts_headline(${cfg}, coalesce(summary, '') || ' ' || left(coalesce(body, ''), 30000), to_tsquery(${cfg}, ${tsq}), ${options}) as snippet
      from search_index
      where id in (${ids})`)
  ).rows
  const byId = new Map(rows.map((r) => [Number(r.id), r]))
  result.hits = slice.flatMap((s) => {
    const r = byId.get(s.id)
    if (!r) return []
    const snippet = String(r.snippet ?? '').includes(HL_START) ? String(r.snippet) : String(r.summary ?? r.snippet ?? '')
    return [
      {
        id: s.id,
        kind: s.kind,
        site: isSiteKey(r.site) ? r.site : 'industri',
        sites: s.sites,
        title: String(r.title),
        snippet: snippet.slice(0, 400),
        path: (r.path as string | null) ?? null,
        image: r.image_id == null ? null : Number(r.image_id),
        date: r.date ? new Date(r.date as string).toISOString() : null,
        extra: (r.extra as Record<string, unknown> | null) ?? null,
      },
    ]
  })
  return result
}
