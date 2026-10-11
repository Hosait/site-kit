import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

import { isLocale, isSiteKey, type Locale, type SiteKey } from '@/lib/sites'
import { monthlyHistory } from './aggregate'

/**
 * Rapportene i Besøksanalyse (/admin/analytics) og CSV-eksporten.
 * Dager regnes i norsk tid. «Besøkende» = unike besøkende per dag, summert over perioden
 * (uten samtykke kan samme person ikke kjennes igjen fra dag til dag).
 */
export type Filters = {
  days: number
  site: SiteKey | null
  locale: Locale | null
  /** Hel kalendermåned (YYYY-MM) i stedet for de siste `days` dagene (månedsrapporten). */
  month?: string | null
}
export const PERIODS = [1, 7, 30, 90, 365] as const
const MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/

export function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
  const days = Number(one(sp.days))
  const site = one(sp.site)
  const locale = one(sp.locale)
  const month = one(sp.month)
  return {
    days: (PERIODS as readonly number[]).includes(days) ? days : 30,
    site: isSiteKey(site) ? site : null,
    locale: isLocale(locale) ? locale : null,
    month: month && MONTH.test(month) ? month : null,
  }
}

/** Første dag i måneden `ym` forskjøvet med `shift` måneder, som YYYY-MM-DD. */
export function monthStart(ym: string, shift = 0): string {
  const [, y, m] = MONTH.exec(ym)!
  const d = new Date(Date.UTC(Number(y), Number(m) - 1 + shift, 1))
  return d.toISOString().slice(0, 10)
}
/** Måneden `ym` forskjøvet med `shift` måneder, som YYYY-MM. */
export const shiftMonth = (ym: string, shift: number) => monthStart(ym, shift).slice(0, 7)

type Row = Record<string, unknown>
type SQL = ReturnType<typeof sql>
const run = async (payload: Payload, q: SQL): Promise<Row[]> =>
  (await (payload.db as unknown as { drizzle: { execute: (q: SQL) => Promise<{ rows: Row[] }> } }).drizzle.execute(q)).rows

const TZ = `'Europe/Oslo'`
const dayStart = (daysBack: number) =>
  sql.raw(`((date_trunc('day', now() at time zone ${TZ}) - interval '${Math.trunc(daysBack)} days') at time zone ${TZ})`)
const localMidnight = (date: string) => sql.raw(`('${date}'::timestamp at time zone ${TZ})`)
const DAY = sql.raw(`to_char(created_at at time zone ${TZ}, 'YYYY-MM-DD')`)

/** Nedre og øvre grense for perioden (offset 1 = perioden før, til sammenligning). */
function bounds(f: Filters, offset = 0): [SQL, SQL] {
  if (f.month) return [localMidnight(monthStart(f.month, -offset)), localMidnight(monthStart(f.month, 1 - offset))]
  return [dayStart(f.days * (offset + 1) - 1), offset ? dayStart(f.days * offset - 1) : sql.raw('now()')]
}

/** WHERE for perioden og filtrene. */
function where(f: Filters, offset = 0): SQL {
  const [lower, upper] = bounds(f, offset)
  const parts: SQL[] = [sql`created_at >= ${lower}`, offset || f.month ? sql`created_at < ${upper}` : sql`created_at <= ${upper}`]
  if (f.site) parts.push(sql`site = ${f.site}`)
  if (f.locale) parts.push(sql`locale = ${f.locale}`)
  return sql.join(parts, sql` and `)
}

const n = (v: unknown) => Number(v ?? 0)
const CONVERSIONS = sql.raw(`('download', 'email', 'phone', 'form')`)

export type Kpis = {
  visitors: number
  sessions: number
  pageviews: number
  avgSessionSeconds: number
  bounceRate: number
  conversions: number
  consentedVisitors: number
  newVisitors: number
}

export async function kpis(payload: Payload, f: Filters, offset = 0): Promise<Kpis> {
  const w = where(f, offset)
  const [row] = await run(
    payload,
    sql`
    with e as (select * from analytics_events where ${w}),
    s as (
      select session,
        count(*) filter (where type = 'pageview') as views,
        coalesce(sum(value) filter (where type = 'leave'), 0) as ms
      from e group by session
    )
    select
      (select count(*) from (select distinct ${DAY}, visitor from e) d) as visitors,
      (select count(*) from s) as sessions,
      (select count(*) from e where type = 'pageview') as pageviews,
      (select coalesce(avg(ms), 0) from s where views > 0) as avg_ms,
      (select coalesce(avg(case when views = 1 then 1.0 else 0 end), 0) from s where views > 0) as bounce,
      (select count(*) from e where type in ${CONVERSIONS}) as conversions,
      (select count(distinct visitor) from e where consent) as consented,
      (select count(distinct visitor) from e where is_new) as new_visitors`,
  )
  return {
    visitors: n(row.visitors),
    sessions: n(row.sessions),
    pageviews: n(row.pageviews),
    avgSessionSeconds: Math.round(n(row.avg_ms) / 1000),
    bounceRate: n(row.bounce),
    conversions: n(row.conversions),
    consentedVisitors: n(row.consented),
    newVisitors: n(row.new_visitors),
  }
}

export async function overview(payload: Payload, f: Filters) {
  const w = where(f)
  const siteOnly = f.site ? sql`and site = ${f.site}` : sql``
  const [current, previous, live, today, trend, devices, countries, pages] = await Promise.all([
    kpis(payload, f),
    kpis(payload, f, 1),
    run(payload, sql`select count(distinct visitor) as n from analytics_events where created_at > now() - interval '5 minutes' ${siteOnly}`),
    run(payload, sql`select count(distinct visitor) as n from analytics_events where created_at >= ${dayStart(0)} ${siteOnly}`),
    run(
      payload,
      sql`select ${DAY} as day, count(distinct visitor) as visitors, count(*) filter (where type = 'pageview') as pageviews
          from analytics_events where ${w} group by 1 order by 1`,
    ),
    run(payload, sql`select coalesce(device, 'ukjent') as key, count(distinct session) as sessions from analytics_events where ${w} group by 1 order by 2 desc`),
    run(payload, sql`select coalesce(country, '–') as key, count(distinct session) as sessions from analytics_events where ${w} group by 1 order by 2 desc limit 15`),
    topPages(payload, f, 10),
  ])
  return {
    current,
    previous,
    liveVisitors: n(live[0]?.n),
    todayVisitors: n(today[0]?.n),
    trend: fillDays(trend, f).map((r) => ({ day: String(r.day), visitors: n(r.visitors), pageviews: n(r.pageviews) })),
    devices: devices.map((r) => ({ key: String(r.key), value: n(r.sessions) })),
    countries: countries.map((r) => ({ key: String(r.key), value: n(r.sessions) })),
    pages,
  }
}

/** Dager uten besøk får 0, så grafen viser hele perioden. */
function fillDays(rows: Row[], f: Filters): Row[] {
  const byDay = new Map(rows.map((r) => [String(r.day), r]))
  const out: Row[] = []
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Oslo' })
  if (f.month) {
    const end = monthStart(f.month, 1)
    for (let d = new Date(`${monthStart(f.month)}T12:00:00Z`); d.toISOString().slice(0, 10) < end; d = new Date(d.getTime() + 86_400_000)) {
      const key = d.toISOString().slice(0, 10)
      if (key > today) break
      out.push(byDay.get(key) ?? { day: key })
    }
    return out
  }
  const noon = new Date(`${today}T12:00:00Z`)
  for (let i = f.days - 1; i >= 0; i--) {
    const d = new Date(noon.getTime() - i * 86_400_000).toISOString().slice(0, 10)
    out.push(byDay.get(d) ?? { day: d })
  }
  return out
}

export async function topPages(payload: Payload, f: Filters, limit = 50) {
  const rows = await run(
    payload,
    sql`
    select site, path,
      count(*) filter (where type = 'pageview') as views,
      count(distinct visitor) filter (where type = 'pageview') as visitors,
      coalesce(avg(value) filter (where type = 'leave'), 0) as avg_ms
    from analytics_events where ${where(f)} and path is not null
    group by site, path having count(*) filter (where type = 'pageview') > 0
    order by views desc limit ${limit}`,
  )
  return rows.map((r) => ({
    site: String(r.site),
    path: String(r.path),
    views: n(r.views),
    visitors: n(r.visitors),
    avgSeconds: Math.round(n(r.avg_ms) / 1000),
  }))
}

export async function sources(payload: Payload, f: Filters) {
  const w = where(f)
  const [channels, referrers, campaigns] = await Promise.all([
    run(
      payload,
      sql`select channel as key, count(distinct session) as sessions,
            count(distinct session) filter (where type in ${CONVERSIONS}) as converting
          from analytics_events where ${w} group by 1 order by 2 desc`,
    ),
    run(
      payload,
      sql`select channel, source as key, count(distinct session) as sessions
          from analytics_events where ${w} and source is not null and channel in ('search', 'social', 'referral', 'email')
          group by 1, 2 order by 3 desc limit 40`,
    ),
    run(
      payload,
      sql`select coalesce(campaign, '(uten navn)') as campaign, coalesce(source, '') as source, coalesce(medium, '') as medium,
            count(distinct session) as sessions,
            count(*) filter (where type in ${CONVERSIONS}) as conversions
          from analytics_events where ${w} and channel in ('campaign', 'email') and (campaign is not null or medium is not null)
          group by 1, 2, 3 order by 4 desc limit 50`,
    ),
  ])
  return {
    channels: channels.map((r) => ({ key: String(r.key ?? 'direct'), sessions: n(r.sessions), converting: n(r.converting) })),
    referrers: referrers.map((r) => ({ channel: String(r.channel), key: String(r.key), sessions: n(r.sessions) })),
    campaigns: campaigns.map((r) => ({
      campaign: String(r.campaign),
      source: String(r.source),
      medium: String(r.medium),
      sessions: n(r.sessions),
      conversions: n(r.conversions),
    })),
  }
}

export async function behaviour(payload: Payload, f: Filters) {
  const w = where(f)
  const pv = sql`select session, path, created_at, row_number() over (partition by session order by created_at) as rn,
                   row_number() over (partition by session order by created_at desc) as rn_desc,
                   lead(path) over (partition by session order by created_at) as next_path
                 from analytics_events where ${w} and type = 'pageview'`
  const [pages, entries, exits, flows, ctas, outbound, searches, emptySearches] = await Promise.all([
    topPages(payload, f, 30),
    run(payload, sql`select path as key, count(*) as n from (${pv}) p where rn = 1 group by 1 order by 2 desc limit 15`),
    run(payload, sql`select path as key, count(*) as n from (${pv}) p where rn_desc = 1 group by 1 order by 2 desc limit 15`),
    run(
      payload,
      sql`select path as from_path, next_path as to_path, count(*) as n from (${pv}) p
          where next_path is not null and next_path <> path group by 1, 2 order by 3 desc limit 20`,
    ),
    run(payload, sql`select label as key, count(*) as n from analytics_events where ${w} and type = 'cta' and label is not null group by 1 order by 2 desc limit 20`),
    run(payload, sql`select label as key, count(*) as n from analytics_events where ${w} and type = 'outbound' and label is not null group by 1 order by 2 desc limit 20`),
    run(
      payload,
      sql`select lower(label) as key, count(*) as n, round(avg(value)) as hits from analytics_events
          where ${w} and type = 'search' and label is not null group by 1 order by 2 desc limit 25`,
    ),
    run(
      payload,
      sql`select lower(label) as key, count(*) as n from analytics_events
          where ${w} and type = 'search' and coalesce(value, 0) = 0 and label is not null group by 1 order by 2 desc limit 25`,
    ),
  ])
  const kv = (rows: Row[]) => rows.map((r) => ({ key: String(r.key), value: n(r.n) }))
  return {
    pages,
    entries: kv(entries),
    exits: kv(exits),
    flows: flows.map((r) => ({ from: String(r.from_path), to: String(r.to_path), value: n(r.n) })),
    ctas: kv(ctas),
    outbound: kv(outbound),
    searches: searches.map((r) => ({ key: String(r.key), value: n(r.n), hits: n(r.hits) })),
    emptySearches: kv(emptySearches),
  }
}

/** Produktkategori: de to første delene av stien etter språket, f.eks. «katalog/opus». */
/** Most downloaded documents (label = the document's title when the tracker knew it). */
export async function downloads(payload: Payload, f: Filters) {
  const rows = await run(
    payload,
    sql`select coalesce(label, '(ukjent)') as key, count(*) as n
        from analytics_events where ${where(f)} and type = 'download' group by 1 order by 2 desc limit 25`,
  )
  return rows.map((r) => ({ key: String(r.key), value: n(r.n) }))
}

export async function conversions(payload: Payload, f: Filters) {
  const w = where(f)
  const [byType, byChannel, byCountry, rate, forms] = await Promise.all([
    run(payload, sql`select type as key, count(*) as n from analytics_events where ${w} and type in ${CONVERSIONS} group by 1 order by 2 desc`),
    run(payload, sql`select coalesce(channel, 'direct') as key, count(*) as n from analytics_events where ${w} and type in ${CONVERSIONS} group by 1 order by 2 desc`),
    run(payload, sql`select coalesce(country, '–') as key, count(*) as n from analytics_events where ${w} and type in ${CONVERSIONS} group by 1 order by 2 desc limit 15`),
    run(
      payload,
      sql`select count(distinct session) as sessions, count(distinct session) filter (where type in ${CONVERSIONS}) as converting
          from analytics_events where ${w}`,
    ),
    run(
      payload,
      sql`select count(*) as n from form_submissions where created_at >= ${bounds(f)[0]} and created_at < ${f.month ? bounds(f)[1] : sql.raw('now()')} ${f.site ? sql`and site = ${f.site}` : sql``}`,
    ),
  ])
  const kv = (rows: Row[]) => rows.map((r) => ({ key: String(r.key), value: n(r.n) }))
  return {
    byType: kv(byType),
    byChannel: kv(byChannel),
    byCountry: kv(byCountry),
    sessions: n(rate[0]?.sessions),
    converting: n(rate[0]?.converting),
    formSubmissions: n(forms[0]?.n),
  }
}

export async function consentStats(payload: Payload, f: Filters) {
  const rows = await run(
    payload,
    sql`select action as key, count(*) as n from consent_log where created_at >= ${bounds(f)[0]}
        ${f.site ? sql`and site = ${f.site}` : sql``} group by 1 order by 2 desc`,
  )
  return rows.map((r) => ({ key: String(r.key), value: n(r.n) }))
}

/** Tabeller til CSV-eksport. */
export const EXPORTS = {
  sider: async (p: Payload, f: Filters) => topPages(p, f, 1000),
  kilder: async (p: Payload, f: Filters) => (await sources(p, f)).channels,
  henvisninger: async (p: Payload, f: Filters) => (await sources(p, f)).referrers,
  kampanjer: async (p: Payload, f: Filters) => (await sources(p, f)).campaigns,
  dokumenter: async (p: Payload, f: Filters) => downloads(p, f),
  konverteringer: async (p: Payload, f: Filters) => (await conversions(p, f)).byType,
  'konverteringer-land': async (p: Payload, f: Filters) => (await conversions(p, f)).byCountry,
  sok: async (p: Payload, f: Filters) => (await behaviour(p, f)).searches,
  maaneder: async (p: Payload, f: Filters) => (await monthlyHistory(p, f)).map(({ key: _key, ...r }) => r),
} as const
export type ExportName = keyof typeof EXPORTS
