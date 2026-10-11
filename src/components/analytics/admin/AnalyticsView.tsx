import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'
import type { ReactNode } from 'react'

import { hasAnalyticsAccess } from '@/collections/Analytics'
import { productGroupLabel } from '@/lib/analytics/productGroups'
import {
  behaviour,
  consentStats,
  conversions,
  kpis,
  overview,
  parseFilters,
  PERIODS,
  products,
  shiftMonth,
  sources,
  type Filters,
} from '@/lib/analytics/reports'
import { monthlyHistory } from '@/lib/analytics/aggregate'
import { analyticsSettings } from '@/lib/analytics/ingest'
import { SITE_KEYS, SITES } from '@/lib/sites'
import { Donut, GroupTrend, MonthlyChart, PrintButton, TrendChart } from './Charts'
import styles from './analytics.module.css'

/**
 * Besøksanalyse i admin (/admin/analytics). Faner via ?tab=, filtre via ?days=&site=&locale=.
 * Bare for administratorer og brukere med «Tilgang til besøksanalyse».
 */
export const TABS = [
  { key: 'overview', label: 'Oversikt' },
  { key: 'sources', label: 'Besøkende og trafikkilder' },
  { key: 'behaviour', label: 'Sider og brukeratferd' },
  { key: 'products', label: 'Produkter og markeder' },
  { key: 'conversions', label: 'Konverteringer' },
  { key: 'reports', label: 'Rapporter' },
  { key: 'settings', label: 'Innstillinger og cookies' },
] as const
type TabKey = (typeof TABS)[number]['key']

const CHANNEL: Record<string, string> = {
  direct: 'Direkte',
  search: 'Søkemotorer',
  social: 'Sosiale medier',
  referral: 'Henvisninger',
  campaign: 'Kampanjer (UTM)',
  email: 'E-post',
}
const DEVICE: Record<string, string> = { mobile: 'Mobil', tablet: 'Nettbrett', desktop: 'PC' }
const CONVERSION: Record<string, string> = {
  download: 'Nedlastinger',
  email: 'Klikk på e-post',
  phone: 'Klikk på telefon',
  form: 'Skjema sendt',
}
const CONSENT_ACTION: Record<string, string> = {
  accept_all: 'Godtok alle',
  reject_optional: 'Avviste valgfrie',
  custom: 'Tilpasset',
  withdraw: 'Trakk tilbake',
}
const PERIOD_LABEL: Record<number, string> = { 1: 'I dag', 7: 'Siste 7 dager', 30: 'Siste 30 dager', 90: 'Siste 90 dager', 365: 'Siste 365 dager' }

const nf = new Intl.NumberFormat('nb-NO')
const fmt = (v: number) => nf.format(v)
const pct = (v: number) => `${nf.format(Math.round(v * 1000) / 10)} %`
const dur = (s: number) => (s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`)
let regionNames: Intl.DisplayNames | null = null
const countryName = (code: string) => {
  if (!/^[A-Z]{2}$/.test(code)) return code === '–' ? 'Ukjent' : code
  try {
    regionNames ??= new Intl.DisplayNames(['nb'], { type: 'region' })
    return regionNames.of(code) ?? code
  } catch {
    return code
  }
}
const siteName = (k: string) => (k in SITES ? SITES[k as keyof typeof SITES].name.replace('Spilka ', '') : k)

export async function AnalyticsView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, permissions, visibleEntities, locale } = initPageResult
  if (!req.user) redirect('/admin/login?redirect=%2Fadmin%2Fanalytics')
  const sp = (searchParams ?? {}) as Record<string, string | string[] | undefined>
  const tabParam = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab
  const tab: TabKey = TABS.some((t) => t.key === tabParam) ? (tabParam as TabKey) : 'overview'
  const filters = parseFilters(sp)

  const template = (children: ReactNode) => (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={visibleEntities}
    >
      <Gutter className={styles.page}>{children}</Gutter>
    </DefaultTemplate>
  )

  if (!hasAnalyticsAccess(req.user)) {
    return template(
      <>
        <h1>Besøksanalyse</h1>
        <p>Du har ikke tilgang. En administrator kan gi tilgang under Brukere.</p>
      </>,
    )
  }

  const qs = (over: Record<string, string | number | null>) => {
    const p = new URLSearchParams()
    const all = { tab, days: filters.days, site: filters.site, locale: filters.locale, ...over }
    for (const [k, v] of Object.entries(all)) if (v !== null && v !== undefined && !(k === 'tab' && v === 'overview')) p.set(k, String(v))
    return `/admin/analytics?${p}`
  }

  return template(
    <>
      <div className={styles.header}>
        <div>
          <h1>Besøksanalyse</h1>
          <p className={styles.muted}>
            {tab === 'reports' ? 'Rapporter' : PERIOD_LABEL[filters.days]} · {filters.site ? SITES[filters.site].name : 'Alle nettsteder'}
            {filters.locale ? ` · ${filters.locale === 'no' ? 'Norsk' : 'Engelsk'}` : ''}
          </p>
        </div>
      </div>

      <nav aria-label="Besøksanalyse" className={styles.tabs}>
        {TABS.map((t) => (
          <a key={t.key} href={qs({ tab: t.key })} className={styles.tab} aria-current={t.key === tab ? 'page' : undefined}>
            {t.label}
          </a>
        ))}
      </nav>

      {tab !== 'settings' && tab !== 'reports' && <FilterForm tab={tab} filters={filters} />}

      {tab === 'overview' && <Overview filters={filters} req={req} />}
      {tab === 'sources' && <Sources filters={filters} req={req} />}
      {tab === 'behaviour' && <Behaviour filters={filters} req={req} />}
      {tab === 'products' && <Products filters={filters} req={req} />}
      {tab === 'conversions' && <Conversions filters={filters} req={req} />}
      {tab === 'reports' && <Reports filters={filters} req={req} />}
      {tab === 'settings' && <Settings filters={filters} req={req} />}
    </>,
  )
}

type TabProps = { filters: Filters; req: AdminViewServerProps['initPageResult']['req'] }

function FilterForm({ tab, filters }: { tab: TabKey; filters: Filters }) {
  return (
    <form method="get" action="/admin/analytics" className={styles.filters}>
      <input type="hidden" name="tab" value={tab} />
      <label>
        Periode
        <select name="days" defaultValue={String(filters.days)}>
          {PERIODS.map((d) => (
            <option key={d} value={d}>
              {PERIOD_LABEL[d]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Nettsted
        <select name="site" defaultValue={filters.site ?? ''}>
          <option value="">Alle nettsteder</option>
          {SITE_KEYS.map((k) => (
            <option key={k} value={k}>
              {SITES[k].name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Språk
        <select name="locale" defaultValue={filters.locale ?? ''}>
          <option value="">Alle språk</option>
          <option value="no">Norsk</option>
          <option value="en">Engelsk</option>
        </select>
      </label>
      <button type="submit" className="btn btn--style-secondary btn--size-medium" style={{ margin: 0 }}>
        Vis
      </button>
    </form>
  )
}

function Kpi({ label, value, current, previous, invert }: { label: string; value: string; current?: number; previous?: number; invert?: boolean }) {
  let delta: ReactNode = null
  if (current !== undefined && previous !== undefined && previous > 0) {
    const change = (current - previous) / previous
    const good = invert ? change < 0 : change > 0
    delta = (
      <div className={`${styles.delta} ${change === 0 ? styles.muted : good ? styles.up : styles.down}`}>
        {change > 0 ? '▲' : change < 0 ? '▼' : '–'} {pct(Math.abs(change))} mot forrige periode
      </div>
    )
  }
  return (
    <div className={styles.card}>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiValue}>{value}</div>
      {delta}
    </div>
  )
}

/** Tabell med valgfri stolpe bak første tallkolonne. */
function Table({
  head,
  rows,
  barCol,
  empty = 'Ingen data i perioden.',
}: {
  head: { label: string; num?: boolean }[]
  rows: ReactNode[][]
  barCol?: number
  empty?: string
}) {
  if (!rows.length) return <p className={styles.muted}>{empty}</p>
  const max = barCol !== undefined ? Math.max(...rows.map((r) => Number(String(r[barCol]).replace(/\D/g, '')) || 0), 1) : 1
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {head.map((h, i) => (
            <th key={i} className={h.num ? styles.num : undefined} scope="col">
              {h.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const w = barCol !== undefined ? `${Math.round(((Number(String(r[barCol]).replace(/\D/g, '')) || 0) / max) * 100)}%` : undefined
          return (
            <tr key={i}>
              {r.map((c, j) => (
                <td
                  key={j}
                  className={[head[j]?.num ? styles.num : '', j === 0 && w ? styles.bar : '', j === 0 ? styles.path : ''].join(' ')}
                  style={j === 0 && w ? ({ '--w': w } as React.CSSProperties) : undefined}
                >
                  <span>{c}</span>
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function Card({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return (
    <section className={`${styles.card} ${styles.section}`}>
      <h2>{title}</h2>
      {children}
      {note && <p className={styles.note}>{note}</p>}
    </section>
  )
}

async function Overview({ filters, req }: TabProps) {
  const [o, history] = await Promise.all([overview(req.payload, filters), monthlyHistory(req.payload, filters)])
  const c = o.current
  const p = o.previous
  const returning = Math.max(0, c.consentedVisitors - c.newVisitors)
  return (
    <>
      <div className={styles.kpis}>
        <Kpi label="Akkurat nå (5 min)" value={fmt(o.liveVisitors)} />
        <Kpi label="Besøkende i dag" value={fmt(o.todayVisitors)} />
        <Kpi label="Besøkende" value={fmt(c.visitors)} current={c.visitors} previous={p.visitors} />
        <Kpi label="Besøk (økter)" value={fmt(c.sessions)} current={c.sessions} previous={p.sessions} />
        <Kpi label="Sidevisninger" value={fmt(c.pageviews)} current={c.pageviews} previous={p.pageviews} />
        <Kpi label="Gj.snittlig besøkstid" value={dur(c.avgSessionSeconds)} current={c.avgSessionSeconds} previous={p.avgSessionSeconds} />
        <Kpi label="Fluktfrekvens" value={pct(c.bounceRate)} current={c.bounceRate} previous={p.bounceRate} invert />
        <Kpi label="Konverteringer" value={fmt(c.conversions)} current={c.conversions} previous={p.conversions} />
      </div>
      <Card title="Trafikkutvikling">
        <TrendChart data={o.trend} />
      </Card>
      {history.length > 1 && (
        <Card title="Utvikling per måned" note="Fra daglige summer, som beholdes i 25 måneder. Inneværende dag er ikke med.">
          <MonthlyChart data={history} />
        </Card>
      )}
      <div className={styles.grid2}>
        <Card title="Enheter (besøk)">
          <Donut label="Besøk per enhetstype" data={o.devices.map((d) => ({ key: d.key, label: DEVICE[d.key] ?? d.key, value: d.value }))} />
        </Card>
        <Card
          title="Nye og tilbakevendende"
          note="Kan bare måles for besøkende som har godtatt statistikk-informasjonskapselen. Uten samtykke kjennes ingen igjen fra dag til dag."
        >
          <Table
            head={[{ label: 'Blant dem som har samtykket' }, { label: 'Besøkende', num: true }]}
            rows={c.consentedVisitors ? [['Nye', fmt(c.newVisitors)], ['Tilbakevendende', fmt(returning)]] : []}
            empty="Ingen besøkende med samtykke i perioden."
          />
        </Card>
      </div>
      <div className={styles.grid2}>
        <Card title="Mest besøkte sider">
          <Table
            head={[{ label: 'Side' }, { label: 'Nettsted' }, { label: 'Visninger', num: true }]}
            rows={o.pages.map((r) => [r.path, siteName(r.site), fmt(r.views)])}
            barCol={2}
          />
        </Card>
        <Card title="Land (besøk)" note="Bare land registreres; IP-adresser lagres aldri.">
          <Table head={[{ label: 'Land' }, { label: 'Besøk', num: true }]} rows={o.countries.map((r) => [countryName(r.key), fmt(r.value)])} barCol={1} />
        </Card>
      </div>
    </>
  )
}

async function Sources({ filters, req }: TabProps) {
  const s = await sources(req.payload, filters)
  const total = s.channels.reduce((a, b) => a + b.sessions, 0) || 1
  const byChannel = (ch: string) => s.referrers.filter((r) => r.channel === ch)
  return (
    <>
      <div className={styles.grid2}>
        <Card title="Kanaler">
          <Donut label="Besøk per kanal" data={s.channels.map((c) => ({ key: c.key, label: CHANNEL[c.key] ?? c.key, value: c.sessions }))} />
        </Card>
        <Card title="Besøk og konvertering per kanal">
          <Table
            head={[{ label: 'Kanal' }, { label: 'Besøk', num: true }, { label: 'Andel', num: true }, { label: 'Med konvertering', num: true }]}
            rows={s.channels.map((c) => [CHANNEL[c.key] ?? c.key, fmt(c.sessions), pct(c.sessions / total), fmt(c.converting)])}
            barCol={1}
          />
        </Card>
      </div>
      <div className={styles.grid2}>
        <Card title="Søkemotorer">
          <Table head={[{ label: 'Søkemotor' }, { label: 'Besøk', num: true }]} rows={byChannel('search').map((r) => [r.key, fmt(r.sessions)])} barCol={1} />
        </Card>
        <Card title="Sosiale medier">
          <Table head={[{ label: 'Nettverk' }, { label: 'Besøk', num: true }]} rows={byChannel('social').map((r) => [r.key, fmt(r.sessions)])} barCol={1} />
        </Card>
      </div>
      <div className={styles.grid2}>
        <Card title="Henvisninger fra andre nettsteder">
          <Table head={[{ label: 'Nettsted' }, { label: 'Besøk', num: true }]} rows={byChannel('referral').map((r) => [r.key, fmt(r.sessions)])} barCol={1} />
        </Card>
        <Card title="Kampanjer (UTM)" note="Lenker med utm_source, utm_medium og utm_campaign. Konverteringer = nedlastinger, e-post, telefon og skjema.">
          <Table
            head={[{ label: 'Kampanje' }, { label: 'Kilde / medium' }, { label: 'Besøk', num: true }, { label: 'Konv.', num: true }]}
            rows={s.campaigns.map((r) => [r.campaign, [r.source, r.medium].filter(Boolean).join(' / '), fmt(r.sessions), fmt(r.conversions)])}
            barCol={2}
          />
        </Card>
      </div>
    </>
  )
}

async function Behaviour({ filters, req }: TabProps) {
  const b = await behaviour(req.payload, filters)
  return (
    <>
      <Card title="Sider">
        <Table
          head={[{ label: 'Side' }, { label: 'Nettsted' }, { label: 'Produktgruppe' }, { label: 'Visninger', num: true }, { label: 'Besøkende', num: true }, { label: 'Tid på siden', num: true }]}
          rows={b.pages.map((r) => [r.path, siteName(r.site), productGroupLabel(r.productGroup), fmt(r.views), fmt(r.visitors), dur(r.avgSeconds)])}
          barCol={3}
        />
      </Card>
      <div className={styles.grid2}>
        <Card title="Inngangssider">
          <Table head={[{ label: 'Første side i besøket' }, { label: 'Besøk', num: true }]} rows={b.entries.map((r) => [r.key, fmt(r.value)])} barCol={1} />
        </Card>
        <Card title="Utgangssider">
          <Table head={[{ label: 'Siste side i besøket' }, { label: 'Besøk', num: true }]} rows={b.exits.map((r) => [r.key, fmt(r.value)])} barCol={1} />
        </Card>
      </div>
      <Card title="Navigasjon mellom sider" note="Vanligste overganger fra én side til den neste i samme besøk.">
        <Table head={[{ label: 'Fra' }, { label: 'Til' }, { label: 'Antall', num: true }]} rows={b.flows.map((r) => [r.from, r.to, fmt(r.value)])} barCol={2} />
      </Card>
      <div className={styles.grid2}>
        <Card title="Klikk på knapper">
          <Table head={[{ label: 'Knapp' }, { label: 'Klikk', num: true }]} rows={b.ctas.map((r) => [r.key, fmt(r.value)])} barCol={1} />
        </Card>
        <Card title="Utgående lenker">
          <Table head={[{ label: 'Nettsted' }, { label: 'Klikk', num: true }]} rows={b.outbound.map((r) => [r.key, fmt(r.value)])} barCol={1} />
        </Card>
      </div>
      <div className={styles.grid2}>
        <Card title="Søk på nettstedet">
          <Table
            head={[{ label: 'Søkeord' }, { label: 'Søk', num: true }, { label: 'Treff (snitt)', num: true }]}
            rows={b.searches.map((r) => [r.key, fmt(r.value), fmt(r.hits)])}
            barCol={1}
          />
        </Card>
        <Card title="Søk uten treff" note="Det besøkende leter etter, men ikke finner: kandidater for nytt innhold.">
          <Table head={[{ label: 'Søkeord' }, { label: 'Søk', num: true }]} rows={b.emptySearches.map((r) => [r.key, fmt(r.value)])} barCol={1} />
        </Card>
      </div>
    </>
  )
}

async function Products({ filters, req }: TabProps) {
  const p = await products(req.payload, filters)
  const groups = p.groups.map((g) => ({ key: g.key, label: productGroupLabel(g.key) }))
  const weeks = [...new Set(p.trend.map((t) => t.week))]
  const trendData = weeks.map((week) => ({
    week,
    ...Object.fromEntries(groups.map((g) => [g.key, p.trend.find((t) => t.week === week && t.key === g.key)?.views ?? 0])),
  }))
  return (
    <>
      <Card
        title="Produktgrupper"
        note="Produktgruppen settes på sider og dokumenter i CMS-et (koder fra Spilka360) og arves av undersider. Henvendelser = skjema, e-post- og telefonklikk."
      >
        <Table
          head={[{ label: 'Produktgruppe' }, { label: 'Visninger', num: true }, { label: 'Besøkende', num: true }, { label: 'Nedlastinger', num: true }, { label: 'Henvendelser', num: true }]}
          rows={p.groups.map((g) => [productGroupLabel(g.key), fmt(g.views), fmt(g.visitors), fmt(g.downloads), fmt(g.inquiries)])}
          barCol={1}
          empty="Ingen visninger av sider med produktgruppe i perioden."
        />
      </Card>
      {filters.days >= 30 && groups.length > 0 && (
        <Card title="Utvikling i produktinteresse (visninger per uke)">
          <GroupTrend data={trendData} groups={groups} />
        </Card>
      )}
      <Card title="Interesse per land">
        <Table
          head={[{ label: 'Land' }, ...groups.map((g) => ({ label: g.label, num: true })), { label: 'Totalt', num: true }]}
          rows={p.matrix.map((r) => [countryName(r.country), ...groups.map((g) => fmt(r.groups[g.key] ?? 0)), fmt(r.total)])}
        />
      </Card>
      <div className={styles.grid2}>
        <Card title="Mest besøkte produkter">
          <Table
            head={[{ label: 'Side' }, { label: 'Gruppe' }, { label: 'Visninger', num: true }]}
            rows={p.topProducts.map((r) => [r.path, productGroupLabel(r.group), fmt(r.views)])}
            barCol={2}
          />
        </Card>
        <Card title="Mest besøkte produktkategorier">
          <Table
            head={[{ label: 'Kategori' }, { label: 'Nettsted' }, { label: 'Visninger', num: true }]}
            rows={p.categories.map((r) => [r.key, siteName(r.site), fmt(r.views)])}
            barCol={2}
          />
        </Card>
      </div>
      <div className={styles.grid2}>
        <Card title="Mest nedlastede dokumenter">
          <Table
            head={[{ label: 'Dokument' }, { label: 'Gruppe' }, { label: 'Nedlastinger', num: true }]}
            rows={p.documents.map((r) => [r.key, productGroupLabel(r.group), fmt(r.value)])}
            barCol={2}
          />
        </Card>
        <Card title="Interesse per språkversjon">
          <Table
            head={[{ label: 'Produktgruppe' }, { label: 'Norsk', num: true }, { label: 'Engelsk', num: true }]}
            rows={groups.map((g) => [
              g.label,
              fmt(p.byLocale.find((r) => r.key === g.key && r.locale === 'no')?.views ?? 0),
              fmt(p.byLocale.find((r) => r.key === g.key && r.locale === 'en')?.views ?? 0),
            ])}
          />
        </Card>
      </div>
    </>
  )
}

async function Conversions({ filters, req }: TabProps) {
  const c = await conversions(req.payload, filters)
  return (
    <>
      <div className={styles.kpis}>
        <Kpi label="Besøk med konvertering" value={fmt(c.converting)} />
        <Kpi label="Konverteringsrate" value={pct(c.sessions ? c.converting / c.sessions : 0)} />
        <Kpi label="Skjema sendt (innsendinger)" value={fmt(c.formSubmissions)} />
      </div>
      <div className={styles.grid2}>
        <Card title="Konverteringer per type">
          <Table head={[{ label: 'Type' }, { label: 'Antall', num: true }]} rows={c.byType.map((r) => [CONVERSION[r.key] ?? r.key, fmt(r.value)])} barCol={1} />
        </Card>
        <Card title="Per kanal">
          <Table head={[{ label: 'Kanal' }, { label: 'Antall', num: true }]} rows={c.byChannel.map((r) => [CHANNEL[r.key] ?? r.key, fmt(r.value)])} barCol={1} />
        </Card>
      </div>
      <div className={styles.grid2}>
        <Card title="Per produktgruppe">
          <Table
            head={[{ label: 'Produktgruppe' }, { label: 'Henvendelser', num: true }, { label: 'Nedlastinger', num: true }]}
            rows={c.byGroup.map((r) => [r.key === '(ingen)' ? '(ingen)' : productGroupLabel(r.key), fmt(r.inquiries), fmt(r.downloads)])}
            barCol={1}
          />
        </Card>
        <Card title="Per land">
          <Table head={[{ label: 'Land' }, { label: 'Antall', num: true }]} rows={c.byCountry.map((r) => [countryName(r.key), fmt(r.value)])} barCol={1} />
        </Card>
      </div>
      <p className={styles.note}>
        Innsendte skjema finnes under <Link href="/admin/collections/form-submissions">Skjema → Innsendinger</Link>, med siden og produktgruppen de ble
        sendt fra.
      </p>
    </>
  )
}

const REPORTS: { key: string; label: string }[] = [
  { key: 'sider', label: 'Sider' },
  { key: 'kilder', label: 'Kanaler' },
  { key: 'henvisninger', label: 'Søkemotorer, sosiale medier og henvisninger' },
  { key: 'kampanjer', label: 'Kampanjer (UTM)' },
  { key: 'produktgrupper', label: 'Produktgrupper' },
  { key: 'produkter', label: 'Produkter' },
  { key: 'land', label: 'Land × produktgruppe' },
  { key: 'dokumenter', label: 'Nedlastede dokumenter' },
  { key: 'konverteringer', label: 'Konverteringer per produktgruppe' },
  { key: 'sok', label: 'Søkeord' },
  { key: 'maaneder', label: 'Utvikling per måned (25 mnd)' },
]

const osloToday = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Oslo' })
const monthName = (ym: string) =>
  new Date(`${ym}-15T12:00:00Z`).toLocaleDateString('nb-NO', { month: 'long', year: 'numeric', timeZone: 'UTC' })

async function Reports({ filters, req }: TabProps) {
  const current = osloToday().slice(0, 7)
  const months = Array.from({ length: 13 }, (_, i) => shiftMonth(current, -i))
  // Standard: forrige hele måned.
  const month = filters.month ?? shiftMonth(current, -1)
  const q = (report: string) => {
    const p = new URLSearchParams({ report, month })
    if (filters.site) p.set('site', filters.site)
    if (filters.locale) p.set('locale', filters.locale)
    return `/next/analytics/export?${p}`
  }
  return (
    <>
      <form method="get" action="/admin/analytics" className={styles.filters}>
        <input type="hidden" name="tab" value="reports" />
        <label>
          Måned
          <select name="month" defaultValue={month}>
            {months.map((m) => (
              <option key={m} value={m}>
                {monthName(m)}
                {m === current ? ' (så langt)' : ''}
              </option>
            ))}
          </select>
        </label>
        <label>
          Nettsted
          <select name="site" defaultValue={filters.site ?? ''}>
            <option value="">Alle nettsteder</option>
            {SITE_KEYS.map((k) => (
              <option key={k} value={k}>
                {SITES[k].name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Språk
          <select name="locale" defaultValue={filters.locale ?? ''}>
            <option value="">Alle språk</option>
            <option value="no">Norsk</option>
            <option value="en">Engelsk</option>
          </select>
        </label>
        <button type="submit" className="btn btn--style-secondary btn--size-medium" style={{ margin: 0 }}>
          Vis månedsrapport
        </button>
      </form>

      <MonthlyReport filters={{ ...filters, month }} req={req} />

      <div className={styles.noPrint}>
        <Card
          title="Last ned som CSV"
          note={`Gjelder ${monthName(month)} og filtrene over. Åpnes i Excel (semikolonseparert). Hver eksport logges i revisjonsloggen.`}
        >
          <div className={styles.links}>
            {REPORTS.map((r) => (
              <a key={r.key} href={q(r.key)} download>
                {r.label}
              </a>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}

const change = (a: number, b: number) => (b > 0 ? `${a >= b ? '+' : '−'}${pct(Math.abs(a - b) / b)}` : '–')

/** Månedsrapport: nøkkeltall mot forrige måned og samme måned i fjor, og de viktigste listene. */
async function MonthlyReport({ filters, req }: TabProps) {
  const p = req.payload
  const month = filters.month!
  const [cur, prev, lastYear, src, beh, prod, conv] = await Promise.all([
    kpis(p, filters),
    kpis(p, filters, 1),
    kpis(p, filters, 12),
    sources(p, filters),
    behaviour(p, filters),
    products(p, filters),
    conversions(p, filters),
  ])
  const rows: [string, number, number, number][] = [
    ['Besøkende', cur.visitors, prev.visitors, lastYear.visitors],
    ['Besøk (økter)', cur.sessions, prev.sessions, lastYear.sessions],
    ['Sidevisninger', cur.pageviews, prev.pageviews, lastYear.pageviews],
    ['Gj.snittlig besøkstid (sekunder)', cur.avgSessionSeconds, prev.avgSessionSeconds, lastYear.avgSessionSeconds],
    ['Konverteringer', cur.conversions, prev.conversions, lastYear.conversions],
  ]
  const totalSessions = src.channels.reduce((a, b) => a + b.sessions, 0) || 1
  return (
    <section>
      <div className={styles.reportHead}>
        <h2>
          Månedsrapport {monthName(month)} – {filters.site ? SITES[filters.site].name : 'alle nettsteder'}
          {filters.locale ? ` (${filters.locale === 'no' ? 'norsk' : 'engelsk'})` : ''}
        </h2>
        <div className={styles.noPrint}>
          <PrintButton />
        </div>
      </div>
      <Card title="Nøkkeltall" note="Sammenligning med samme måned i fjor krever data så langt tilbake (rådata lagres i 13 måneder).">
        <Table
          head={[
            { label: 'Nøkkeltall' },
            { label: monthName(month), num: true },
            { label: 'Forrige måned', num: true },
            { label: 'Endring', num: true },
            { label: 'Samme måned i fjor', num: true },
            { label: 'Endring', num: true },
          ]}
          rows={rows.map(([label, a, b, c]) => [label, fmt(a), fmt(b), change(a, b), fmt(c), change(a, c)])}
        />
      </Card>
      <div className={styles.grid2}>
        <Card title="Kanaler">
          <Table
            head={[{ label: 'Kanal' }, { label: 'Besøk', num: true }, { label: 'Andel', num: true }]}
            rows={src.channels.map((c) => [CHANNEL[c.key] ?? c.key, fmt(c.sessions), pct(c.sessions / totalSessions)])}
            barCol={1}
          />
        </Card>
        <Card title="Produktgrupper">
          <Table
            head={[{ label: 'Produktgruppe' }, { label: 'Visninger', num: true }, { label: 'Henvendelser', num: true }]}
            rows={prod.groups.map((g) => [productGroupLabel(g.key), fmt(g.views), fmt(g.inquiries)])}
            barCol={1}
          />
        </Card>
      </div>
      <div className={styles.grid2}>
        <Card title="Mest besøkte sider">
          <Table
            head={[{ label: 'Side' }, { label: 'Nettsted' }, { label: 'Visninger', num: true }]}
            rows={beh.pages.slice(0, 10).map((r) => [r.path, siteName(r.site), fmt(r.views)])}
            barCol={2}
          />
        </Card>
        <Card title="Interesse per land (produktsider)">
          <Table
            head={[{ label: 'Land' }, { label: 'Visninger', num: true }]}
            rows={prod.matrix.slice(0, 10).map((r) => [countryName(r.country), fmt(r.total)])}
            barCol={1}
            empty="Ingen visninger av produktsider i perioden."
          />
        </Card>
      </div>
      <div className={styles.grid2}>
        <Card title="Konverteringer">
          <Table head={[{ label: 'Type' }, { label: 'Antall', num: true }]} rows={conv.byType.map((r) => [CONVERSION[r.key] ?? r.key, fmt(r.value)])} barCol={1} />
        </Card>
        <Card title="Mest nedlastede dokumenter">
          <Table head={[{ label: 'Dokument' }, { label: 'Antall', num: true }]} rows={prod.documents.slice(0, 10).map((r) => [r.key, fmt(r.value)])} barCol={1} />
        </Card>
      </div>
      <Card title="Søk uten treff">
        <Table head={[{ label: 'Søkeord' }, { label: 'Søk', num: true }]} rows={beh.emptySearches.slice(0, 10).map((r) => [r.key, fmt(r.value)])} barCol={1} />
      </Card>
    </section>
  )
}

async function Settings({ filters, req }: TabProps) {
  const [settings, consent] = await Promise.all([analyticsSettings(req.payload), consentStats(req.payload, { ...filters, days: 30 })])
  const total = consent.reduce((a, b) => a + b.value, 0)
  return (
    <>
      <div className={styles.grid2}>
        <Card title="Innstillinger">
          <Table
            head={[{ label: 'Innstilling' }, { label: 'Verdi' }]}
            rows={[
              ['Enkel statistikk uten samtykke', settings.basicWithoutConsent ? 'På' : 'Av'],
              ['Lagringstid for besøksdata', `${settings.retentionDays} dager`],
              ['Lagringstid for samtykkelogg', `${settings.consentLogDays} dager`],
            ]}
          />
          <div className={styles.links} style={{ marginTop: 12 }}>
            <Link href="/admin/globals/analytics-settings">Endre innstillinger</Link>
          </div>
        </Card>
        <Card title="Samtykker siste 30 dager" note="Fra cookie-banneret. Uten IP-adresser.">
          <Table
            head={[{ label: 'Valg' }, { label: 'Antall', num: true }, { label: 'Andel', num: true }]}
            rows={consent.map((r) => [CONSENT_ACTION[r.key] ?? r.key, fmt(r.value), pct(total ? r.value / total : 0)])}
            barCol={1}
          />
        </Card>
      </div>
      <Card title="Logger">
        <div className={styles.links}>
          <Link href="/admin/collections/consent-log">Samtykkelogg</Link>
          <Link href="/admin/collections/audit-log">Revisjonslogg</Link>
          <Link href="/admin/collections/users">Tilganger (Brukere)</Link>
        </div>
      </Card>
      <Card title="Slik fungerer det">
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
          <li>Uten samtykke: besøk telles anonymt per døgn (ingen informasjonskapsler, ingen IP-adresser lagres).</li>
          <li>Med samtykke til statistikk: en anonym ID (spilka-vid) gjør det mulig å se tilbakevendende besøkende.</li>
          <li>Innloggede redaktører og kjente roboter telles ikke.</li>
          <li>Hendelser eldre enn lagringstiden slettes automatisk.</li>
        </ul>
      </Card>
    </>
  )
}
