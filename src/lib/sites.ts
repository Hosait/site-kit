/**
 * Sites and locales served by this install, derived from site/config.ts.
 * Host → site is decided in src/proxy.ts. All CMS content has the field `site`.
 */
import { siteConfig } from '@site/config'

import { checkSiteConfig, type SiteConfigInput } from './site-config'
import { STRING_LOCALES } from './string-locales'

const problems = checkSiteConfig(siteConfig, STRING_LOCALES)
if (problems.length) throw new Error(`site/config.ts: ${problems.join('; ')}`)

export const SITE_CONFIG = siteConfig
/** Feature switches, widened so code can compare them whatever site/config.ts sets. */
export const FEATURES: SiteConfigInput['features'] = siteConfig.features
/** Form defaults, widened so code can compare whatever site/config.ts sets. */
export const FORMS: SiteConfigInput['forms'] = siteConfig.forms
export type SiteKey = keyof typeof siteConfig.sites & string
export type Locale = keyof typeof siteConfig.locales & string

export const SITE_KEYS = Object.keys(siteConfig.sites) as SiteKey[]
export const DEFAULT_SITE: SiteKey = SITE_KEYS[0]
export const SINGLE_SITE = SITE_KEYS.length === 1
export const LOCALES = Object.keys(siteConfig.locales) as Locale[]
export const DEFAULT_LOCALE = siteConfig.defaultLocale as Locale
export const LOCALE_CONFIG = siteConfig.locales
export const HREFLANG = Object.fromEntries(LOCALES.map((l) => [l, siteConfig.locales[l].hreflang])) as Record<Locale, string>

export type SiteConfig = {
  key: SiteKey
  name: string
  origin: string
  hosts: readonly string[]
  articleBase: Record<Locale, string>
}

export const SITES = Object.fromEntries(
  SITE_KEYS.map((key) => [key, { key, ...siteConfig.sites[key] }]),
) as unknown as Record<SiteKey, SiteConfig>

export const SITE_OPTIONS = SITE_KEYS.map((key) => ({ label: SITES[key].name, value: key }))

export const isSiteKey = (value: unknown): value is SiteKey =>
  typeof value === 'string' && (SITE_KEYS as readonly string[]).includes(value)

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value)

/** Site from the Host header. An unknown host gives null (staging uses a cookie or ?site=). */
export function siteFromHost(host: string | null | undefined): SiteKey | null {
  if (!host) return null
  const hostname = host.split(':')[0].toLowerCase()
  for (const key of SITE_KEYS) if (SITES[key].hosts.includes(hostname)) return key
  const base = stagingHost()
  if (base && hostname.endsWith(`.${base}`)) {
    const first = hostname.slice(0, -base.length - 1)
    if (isSiteKey(first) && first !== DEFAULT_SITE) return first
  }
  return null
}

function stagingHost(): string | null {
  const v = process.env.STAGING_HOST || process.env.NEXT_PUBLIC_STAGING_HOST
  return v ? v.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase() : null
}

/** Staging address: the default site on the staging host, the others on subdomains of it. */
function stagingOrigin(site: SiteKey): string | null {
  const base = stagingHost()
  if (!base) return null
  const proto = process.env.NEXT_PUBLIC_SERVER_URL?.match(/^(https?):/)?.[1] ?? 'https'
  return `${proto}://${site === DEFAULT_SITE ? base : `${site}.${base}`}`
}

/**
 * Production: indexing on, canonical URLs on the own domains, the seed route locked.
 * SITE_ORIGINS=production or =staging decides when set. Unset, the site is in production once
 * HOSAIT_URL (the project's verified own domain, set by Hosait) is one of the configured hosts.
 */
export function isProduction(): boolean {
  const set = process.env.SITE_ORIGINS
  if (set) return set === 'production'
  let host: string
  try {
    host = new URL(process.env.HOSAIT_URL || '').hostname.toLowerCase()
  } catch {
    return false
  }
  return SITE_KEYS.some((key) => SITES[key].hosts.includes(host))
}

/** Public address of a site: own domain in production, staging (sub)domain, else the server URL. */
export function siteOrigin(site: SiteKey): string {
  if (isProduction()) return SITES[site].origin
  return stagingOrigin(site) ?? (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3100')
}

/** `/no/om-oss` from a locale and an internal path ('' = home). */
export function localePath(locale: Locale, path: string): string {
  const clean = path.replace(/^\/+|\/+$/g, '')
  return clean ? `/${locale}/${clean}` : `/${locale}`
}

/** Link to a path on a (possibly different) site. */
export function siteHref(target: SiteKey, current: SiteKey, path: string): string {
  if ((target as string) === current) return path
  if (isProduction()) return SITES[target].origin + path
  const staging = stagingOrigin(target)
  if (staging) return staging + path
  return `${path}${path.includes('?') ? '&' : '?'}site=${target}`
}
