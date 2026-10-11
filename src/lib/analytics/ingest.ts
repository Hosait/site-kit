import { createHash } from 'node:crypto'

import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

import { DEFAULT_LOCALE, isLocale, isSiteKey, SITE_CONFIG, SITE_KEYS, type SiteKey, SITES } from '@/lib/sites'
import { cleanPath, deviceFrom, hostOf, isBot, sourceFrom, type Source } from './classify'
import { CONSENT_COOKIE, isVisitorId, parseConsent, randomId, readCookie, VISITOR_COOKIE } from './consent'
import { pruneDaily, rollup } from './aggregate'
import { countryOf } from './geo'

/**
 * Tar imot hendelser fra sporingsskriptet (src/components/analytics/Tracker.tsx) og lagrer dem.
 * Besøk deles i økter (30 min uten aktivitet). Trafikkilden settes ved første side i økta.
 */
export const EVENT_TYPES = ['pageview', 'leave', 'download', 'email', 'phone', 'outbound', 'cta', 'search', 'form'] as const
export type EventType = (typeof EVENT_TYPES)[number]

export type IncomingEvent = {
  t: string // type
  s: string // nettsted
  l?: string // språk
  p?: string // sti
  r?: string // henvisning (document.referrer, bare ved første side)
  q?: string // spørrestreng på landingssiden (UTM)
  k?: string // sidetype
  i?: number // side-ID
  h?: string // lenke (nedlasting, utgående)
  b?: string // etikett (knappetekst, søkeord, skjema)
  v?: number // verdi (ms på siden, antall treff)
}

type Row = Record<string, unknown>
type SQL = ReturnType<typeof sql>
const db = (payload: Payload) => (payload.db as unknown as { drizzle: { execute: (q: SQL) => Promise<{ rows: Row[] }> } }).drizzle

const SESSION_GAP = "interval '30 minutes'"
const hash = (v: string) => createHash('sha256').update(v).digest('base64url').slice(0, 24)
const osloDay = () => new Date().toLocaleDateString('sv-SE', { timeZone: SITE_CONFIG.timezone })
const str = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null)
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.round(Math.min(v, 2_147_483_647)) : null)

// Alle vertsnavn som hører til oss: henvisninger herfra er ikke en trafikkilde.
const OWN_HOSTS = [
  ...SITE_KEYS.flatMap((k) => SITES[k].hosts.map((h) => h.replace(/^www\./, ''))),
  ...(process.env.STAGING_HOST ? [process.env.STAGING_HOST.replace(/^https?:\/\//, '').replace(/\/.*$/, '')] : []),
  'localhost',
]

type Settings = { basicWithoutConsent: boolean; retentionDays: number; aggregateDays: number; consentLogDays: number }
let settingsCache: { at: number; value: Settings } | null = null
export async function analyticsSettings(payload: Payload): Promise<Settings> {
  if (settingsCache && Date.now() - settingsCache.at < 60_000) return settingsCache.value
  const g = (await payload.findGlobal({ slug: 'analytics-settings', depth: 0, overrideAccess: true }).catch(() => null)) as Partial<Settings> | null
  const value = {
    basicWithoutConsent: g?.basicWithoutConsent !== false,
    retentionDays: g?.retentionDays || 395,
    aggregateDays: g?.aggregateDays || 760,
    consentLogDays: g?.consentLogDays || 1095,
  }
  settingsCache = { at: Date.now(), value }
  return value
}
export const clearSettingsCache = () => (settingsCache = null)

let salt: { day: string; value: string } | null = null
/** Døgnsalt for anonym telling uten samtykke. Lagres i databasen (tåler omstart) og slettes etter et døgn. */
async function dailySalt(payload: Payload): Promise<string> {
  const day = osloDay()
  if (salt?.day === day) return salt.value
  await db(payload).execute(sql`insert into analytics_salts (day, salt) values (${day}, ${randomId(32)}) on conflict (day) do nothing`)
  const rows = (await db(payload).execute(sql`select salt from analytics_salts where day = ${day}`)).rows
  await db(payload).execute(sql`delete from analytics_salts where day <> ${day}`)
  salt = { day, value: String(rows[0].salt) }
  return salt.value
}

let lastCleanup = 0
/**
 * Høyst én gang i timen: summerer hele dager som mangler (før rådata slettes), og sletter
 * hendelser, dagssummer og samtykker eldre enn lagringstidene.
 */
async function cleanup(payload: Payload, settings: Settings) {
  if (Date.now() - lastCleanup < 3_600_000) return
  lastCleanup = Date.now()
  await rollup(payload)
  await pruneDaily(payload, settings.aggregateDays)
  await db(payload).execute(sql`delete from analytics_events where created_at < now() - make_interval(days => ${settings.retentionDays})`)
  await db(payload).execute(sql`delete from consent_log where created_at < now() - make_interval(days => ${settings.consentLogDays})`)
}

export type IngestResult = { stored: boolean; reason?: string }

export async function ingest(payload: Payload, headers: Headers, e: IncomingEvent): Promise<IngestResult> {
  const ua = headers.get('user-agent') ?? ''
  if (isBot(ua)) return { stored: false, reason: 'bot' }
  if (headers.get('sec-purpose')?.includes('prefetch')) return { stored: false, reason: 'prefetch' }
  const cookies = headers.get('cookie')
  // Innloggede redaktører telles ikke.
  if (readCookie(cookies, 'payload-token')) return { stored: false, reason: 'editor' }

  const type = EVENT_TYPES.find((t) => t === e.t)
  const site: SiteKey | null = isSiteKey(e.s) ? e.s : null
  if (!type || !site) return { stored: false, reason: 'invalid' }

  const settings = await analyticsSettings(payload)
  const consent = parseConsent(readCookie(cookies, CONSENT_COOKIE))
  const vid = readCookie(cookies, VISITOR_COOKIE)
  const consented = Boolean(consent?.statistics && isVisitorId(vid))
  if (!consented && !settings.basicWithoutConsent) return { stored: false, reason: 'no-consent' }

  const ip = headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || null
  const visitor = consented ? `c:${hash(vid!)}` : `a:${hash(`${await dailySalt(payload)}|${site}|${ip ?? ''}|${ua}`)}`
  const path = e.p ? cleanPath(e.p) : null

  // Pågående økt for denne besøkende (siste hendelse innen 30 minutter).
  const last = (
    await db(payload).execute(sql`
      select session, type, path, channel, source, medium, campaign, created_at from analytics_events
      where visitor = ${visitor} and created_at > now() - ${sql.raw(SESSION_GAP)}
      order by created_at desc limit 1`)
  ).rows[0]

  // Samme sidevisning to ganger på rad innen 3 sekunder (dobbel innlasting) telles én gang.
  if (type === 'pageview' && last?.type === 'pageview' && last.path === path && Date.now() - new Date(String(last.created_at)).getTime() < 3000) {
    return { stored: false, reason: 'duplicate' }
  }

  let session: string
  let source: Source
  let isNew = false
  if (last) {
    session = String(last.session)
    source = { channel: last.channel as Source['channel'], source: last.source as string | null, medium: last.medium as string | null, campaign: last.campaign as string | null }
  } else {
    session = randomId(12)
    source = sourceFrom(e.r, new URLSearchParams(str(e.q, 500) ?? ''), OWN_HOSTS)
    if (consented) {
      const seen = (await db(payload).execute(sql`select 1 from analytics_events where visitor = ${visitor} limit 1`)).rows.length
      isNew = !seen
    }
  }

  // Nedlasting: finn dokumentet fra filnavnet i lenken.
  let docId: number | null = null
  let label = str(e.b, 200)
  if (type === 'download' && e.h) {
    const filename = decodeURIComponent(e.h.split('?')[0].split('/').pop() ?? '')
    const doc = (await db(payload).execute(sql`select d.id, l.title from documents d left join documents_locales l on l._parent_id = d.id and l._locale = ${DEFAULT_LOCALE} where d.filename = ${filename} limit 1`)).rows[0]
    if (doc) {
      docId = Number(doc.id)
      // Dokumentets tittel fra CMS-et (lenketeksten har ofte «PDF 3,4 MB Last ned» i seg).
      label = (doc.title as string | null) ?? label
    } else {
      label = label ?? filename.slice(0, 200)
    }
  }
  if (type === 'outbound') label = hostOf(e.h) ?? label

  await db(payload).execute(sql`
    insert into analytics_events
      (site, locale, type, path, page_kind, page_id, doc_id, label, value, visitor, session, consent, is_new,
       channel, source, medium, campaign, country, device)
    values
      (${site}, ${isLocale(e.l) ? e.l : null}, ${type}, ${path}, ${str(e.k, 20)}, ${num(e.i)}, ${docId}, ${label},
       ${num(e.v)}, ${visitor}, ${session}, ${consented}, ${isNew}, ${source.channel}, ${source.source}, ${source.medium},
       ${source.campaign}, ${countryOf(ip)}, ${deviceFrom(ua, headers.get('sec-ch-ua-mobile'))})`)

  void cleanup(payload, settings).catch((err) => payload.logger.error({ err, msg: 'Besøksanalyse: opprydding feilet' }))
  return { stored: true }
}

/** Lagrer et samtykkevalg (dokumentasjon). Ingen IP-adresse. */
export async function logConsent(
  payload: Payload,
  input: { consentId: string; action: string; statistics: boolean; version: number; site?: string; locale?: string },
) {
  await payload.create({
    collection: 'consent-log',
    data: {
      consentId: input.consentId,
      action: input.action,
      statistics: input.statistics,
      version: input.version,
      site: isSiteKey(input.site) ? input.site : null,
      locale: isLocale(input.locale) ? input.locale : null,
    },
    overrideAccess: true,
  })
}
