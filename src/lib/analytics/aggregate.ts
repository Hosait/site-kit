import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

/**
 * Daglige summer (analytics_daily) for langtidsutvikling: beholdes i 25 måneder, lenge etter at
 * rådataene (analytics_events, 13 måneder) er slettet. Én rad per dag, nettsted, språk og
 * dimensjon: total, produktgruppe, kanal og land. Inneholder bare tall, ingen besøks-ID-er.
 */
type Row = Record<string, unknown>
type SQL = ReturnType<typeof sql>
const run = async (payload: Payload, q: SQL): Promise<Row[]> =>
  (await (payload.db as unknown as { drizzle: { execute: (q: SQL) => Promise<{ rows: Row[] }> } }).drizzle.execute(q)).rows

const TZ = `'Europe/Oslo'`
const midnight = (date: string) => sql.raw(`('${date}'::timestamp at time zone ${TZ})`)
const CONVERSIONS = sql.raw(`('download', 'email', 'phone', 'form')`)
const osloDate = (d: Date) => d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Oslo' })
const nextDate = (date: string) => new Date(new Date(`${date}T12:00:00Z`).getTime() + 86_400_000).toISOString().slice(0, 10)

/** Summerer én dag (erstatter eventuelle rader for dagen). */
async function rollupDay(payload: Payload, day: string) {
  const from = midnight(day)
  const to = midnight(nextDate(day))
  const range = sql`created_at >= ${from} and created_at < ${to}`
  const metrics = sql`count(distinct visitor) filter (where type = 'pageview'), count(distinct session),
    count(*) filter (where type = 'pageview'), count(*) filter (where type in ${CONVERSIONS})`
  await run(payload, sql`delete from analytics_daily where day = ${day}`)
  await run(
    payload,
    sql`insert into analytics_daily (day, site, locale, dimension, key, visitors, sessions, pageviews, conversions)
      select ${day}, site, coalesce(locale, ''), 'total', '', ${metrics}
        from analytics_events where ${range} group by site, coalesce(locale, '')
      union all
      select ${day}, site, coalesce(locale, ''), 'channel', coalesce(channel, 'direct'), ${metrics}
        from analytics_events where ${range} group by site, coalesce(locale, ''), coalesce(channel, 'direct')
      union all
      select ${day}, site, coalesce(locale, ''), 'country', coalesce(country, '–'), ${metrics}
        from analytics_events where ${range} group by site, coalesce(locale, ''), coalesce(country, '–')`,
  )
}

/**
 * Summerer alle hele dager som mangler, til og med i går (høyst `max` dager per kjøring).
 * Kjøres fra oppryddingen i mottaket (høyst én gang i timen) og før langtidsrapportene.
 */
let running: Promise<number> | null = null
export function rollup(payload: Payload, max = 400): Promise<number> {
  // Én kjøring om gangen (mottaket og dashboardet kan starte den samtidig).
  running ??= rollupMissing(payload, max).finally(() => (running = null))
  return running
}

async function rollupMissing(payload: Payload, max: number): Promise<number> {
  const yesterday = osloDate(new Date(Date.now() - 86_400_000))
  const [row] = await run(
    payload,
    sql`select (select max(day) from analytics_daily) as last,
          (select to_char(min(created_at) at time zone ${sql.raw(TZ)}, 'YYYY-MM-DD') from analytics_events) as first`,
  )
  let day = row?.last ? nextDate(String(row.last)) : (row?.first as string | null)
  let count = 0
  while (day && day <= yesterday && count < max) {
    await rollupDay(payload, day)
    day = nextDate(day)
    count++
  }
  return count
}

/** Sletter daglige summer eldre enn `days` dager. */
export async function pruneDaily(payload: Payload, days: number) {
  const cutoff = osloDate(new Date(Date.now() - days * 86_400_000))
  await run(payload, sql`delete from analytics_daily where day < ${cutoff}`)
}

export type MonthRow = { month: string; visitors: number; sessions: number; pageviews: number; conversions: number }

/** Utvikling per måned fra de daglige summene (inntil 25 måneder). */
export async function monthlyHistory(
  payload: Payload,
  f: { site: string | null; locale: string | null },
  dimension: 'total' = 'total',
): Promise<(MonthRow & { key: string })[]> {
  await rollup(payload)
  const filters: SQL[] = [sql`dimension = ${dimension}`]
  if (f.site) filters.push(sql`site = ${f.site}`)
  if (f.locale) filters.push(sql`locale = ${f.locale}`)
  const rows = await run(
    payload,
    sql`select substr(day, 1, 7) as month, key, sum(visitors) as visitors, sum(sessions) as sessions,
          sum(pageviews) as pageviews, sum(conversions) as conversions
        from analytics_daily where ${sql.join(filters, sql` and `)} group by 1, 2 order by 1, 2`,
  )
  return rows.map((r) => ({
    month: String(r.month),
    key: String(r.key ?? ''),
    visitors: Number(r.visitors ?? 0),
    sessions: Number(r.sessions ?? 0),
    pageviews: Number(r.pageviews ?? 0),
    conversions: Number(r.conversions ?? 0),
  }))
}
