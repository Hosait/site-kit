/**
 * De tre nettstedene som deler én kodebase og ett CMS.
 * Vertsnavn → nettsted avgjøres i src/proxy.ts. Alt innhold i CMS-et har feltet `site`.
 */

export const SITE_KEYS = ['industri', 'sbs', 'dws'] as const
export type SiteKey = (typeof SITE_KEYS)[number]

export const LOCALES = ['no', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'no'

/** BCP 47-kode til hreflang og <html lang>. URL-en bruker `no`, språket er bokmål. */
export const HREFLANG: Record<Locale, string> = { no: 'nb', en: 'en' }

export type SiteConfig = {
  key: SiteKey
  /** Fullt navn, brukes i <title>-suffiks og strukturerte data. */
  name: string
  /** Undertittel under logoen (divisjonsnavn). */
  division: string | null
  /** Produksjonsdomene, uten avsluttende skråstrek. */
  origin: string
  /** Vertsnavn som peker hit (prod + lokale utviklingsnavn). */
  hosts: string[]
  /** URL-prefiks for artikler per språk. */
  articleBase: Record<Locale, string>
}

export const SITES: Record<SiteKey, SiteConfig> = {
  industri: {
    key: 'industri',
    name: 'Spilka Industri',
    division: null,
    origin: 'https://www.spilka.com',
    hosts: ['www.spilka.com', 'spilka.com', 'industri.localhost'],
    articleBase: { no: 'kunngjoringer', en: 'announcements' },
  },
  sbs: {
    key: 'sbs',
    name: 'Spilka Building Solutions',
    division: 'Building Solutions',
    origin: 'https://www.spilka-sbs.com',
    hosts: ['www.spilka-sbs.com', 'spilka-sbs.com', 'sbs.localhost'],
    articleBase: { no: 'fagbloggen', en: 'blog' },
  },
  dws: {
    key: 'dws',
    name: 'Spilka Door & Window Solutions',
    division: 'Door & Window Solutions',
    origin: 'https://www.spilka-dws.com',
    hosts: ['www.spilka-dws.com', 'spilka-dws.com', 'dws.localhost'],
    articleBase: { no: 'fagbloggen', en: 'blog' },
  },
}

export const SITE_OPTIONS = SITE_KEYS.map((key) => ({ label: SITES[key].name, value: key }))

export const isSiteKey = (value: unknown): value is SiteKey =>
  typeof value === 'string' && (SITE_KEYS as readonly string[]).includes(value)

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value)

/** Slår opp nettsted fra Host-headeren. Ukjent vert gir null (staging bruker cookie/`?site=`). */
export function siteFromHost(host: string | null | undefined): SiteKey | null {
  if (!host) return null
  const hostname = host.split(':')[0].toLowerCase()
  for (const key of SITE_KEYS) {
    if (SITES[key].hosts.includes(hostname)) return key
  }
  // Test på Hosait: sbs.spilka.hosait.com / dws.spilka.hosait.com (underdomener av test-adressen).
  const base = stagingHost()
  if (base && hostname.endsWith(`.${base}`)) {
    const first = hostname.slice(0, -base.length - 1)
    if (isSiteKey(first)) return first
  }
  return null
}

/** Test-adressen uten protokoll (f.eks. spilka.hosait.com) når nettstedene testes på underdomener. */
function stagingHost(): string | null {
  const v = process.env.STAGING_HOST || process.env.NEXT_PUBLIC_STAGING_HOST
  return v ? v.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase() : null
}

/**
 * Staging-adressen til et nettsted: industri på test-adressen, sbs/dws på underdomener av den.
 * Protokollen hentes fra NEXT_PUBLIC_SERVER_URL (https når den mangler). Null uten STAGING_HOST.
 */
function stagingOrigin(site: SiteKey): string | null {
  const base = stagingHost()
  if (!base) return null
  const proto = process.env.NEXT_PUBLIC_SERVER_URL?.match(/^(https?):/)?.[1] ?? 'https'
  return `${proto}://${site === 'industri' ? base : `${site}.${base}`}`
}

/**
 * Offentlig adresse for et nettsted: eget domene i produksjon, eget (under)domene på staging,
 * ellers NEXT_PUBLIC_SERVER_URL (lokal utvikling).
 */
export function siteOrigin(site: SiteKey): string {
  if (process.env.SITE_ORIGINS === 'production') return SITES[site].origin
  return stagingOrigin(site) ?? (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3100')
}

/** Bygger en sti som `/no/om-spilka` fra språk og intern sti (`''` = forsiden). */
export function localePath(locale: Locale, path: string): string {
  const clean = path.replace(/^\/+|\/+$/g, '')
  return clean ? `/${locale}/${clean}` : `/${locale}`
}

/**
 * Lenke til en sti på et (muligens annet) nettsted.
 * Samme nettsted → relativ sti. Annet nettsted → eget domene i produksjon,
 * ellers samme vert med `?site=` slik at staging og lokal utvikling fungerer på én adresse.
 */
export function siteHref(target: SiteKey, current: SiteKey, path: string): string {
  if (target === current) return path
  if (process.env.SITE_ORIGINS === 'production') return SITES[target].origin + path
  const staging = stagingOrigin(target)
  if (staging) return staging + path
  return `${path}${path.includes('?') ? '&' : '?'}site=${target}`
}
