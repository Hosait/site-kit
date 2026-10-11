import { DEFAULT_LOCALE, LOCALE_CONFIG, LOCALES, SITE_CONFIG, type Locale } from './sites'

/** The other locale on a two-locale site; null when the site has one. */
export function otherLocale(locale: Locale): Locale | null {
  return LOCALES.find((l) => l !== locale) ?? null
}

/** First Accept-Language tag → a configured locale; unknown languages get English if offered. */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  const first = (acceptLanguage ?? '').split(',')[0]?.trim().toLowerCase().split(/[-;]/)[0]
  if (!first) return DEFAULT_LOCALE
  const hit = LOCALES.find((l) => l === first || (LOCALE_CONFIG[l].aliases as readonly string[]).includes(first))
  if (hit) return hit
  return (LOCALES as string[]).includes('en') ? ('en' as Locale) : DEFAULT_LOCALE
}

/** `/no/sok` → { locale: 'no' } when that is the locale's own search segment. */
export function searchRewrite(pathname: string): { locale: Locale } | null {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length !== 2) return null
  const [locale, segment] = parts
  const loc = LOCALES.find((l) => l === locale)
  return loc && LOCALE_CONFIG[loc].searchSegment === segment ? { locale: loc } : null
}

/** Long date in the visitor's language, in the site's time zone. Empty for a missing or bad date. */
export function formatDate(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(LOCALE_CONFIG[locale].intl, {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: SITE_CONFIG.timezone,
  }).format(d)
}
