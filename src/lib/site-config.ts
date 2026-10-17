/**
 * The shape of site/config.ts and the checks it must pass. Kept apart from sites.ts so the
 * checks can be tested with any config.
 */
export type LocaleSettings = {
  label: string
  short: string
  hreflang: string
  intl: string
  ogLocale: string
  /** Postgres text search configuration, e.g. 'norwegian', 'english', 'simple'. */
  textSearch: string
  searchSegment: string
  cookiePolicyPath: string
  /** Accept-Language primary tags that mean this locale besides its own code, e.g. ['nb', 'nn']. */
  aliases: readonly string[]
}

export type SiteSettingsInput = {
  name: string
  origin: string
  hosts: readonly string[]
  articleBase: Record<string, string>
}

export type SiteConfigInput = {
  brand: { name: string; legalName: string; orgNumber: string; country: string }
  sites: Record<string, SiteSettingsInput>
  locales: Record<string, LocaleSettings>
  defaultLocale: string
  admin: { language: 'nb' | 'en'; titleSuffix: string }
  email: { fromName: string; fromAddress: string }
  timezone: string
  cookiePrefix: string
  documentTypes: Record<string, Record<string, string>>
  articleKinds: Record<string, Record<string, string>>
  features: { analytics: 'builtin' | 'none'; search: boolean }
  /** Form submissions are deleted after this many days unless a form sets its own; null keeps them. */
  forms: { retentionDays: number | null }
}

const KEY = /^[a-z][a-z0-9]*$/
const HOST = /^[a-z0-9.-]+$/

/** Every problem with the config, in plain English. Empty means the config is usable. */
export function checkSiteConfig(c: SiteConfigInput, stringLocales: readonly string[]): string[] {
  const problems: string[] = []
  const locales = Object.keys(c.locales)
  const sites = Object.keys(c.sites)
  if (locales.length < 1 || locales.length > 2) problems.push(`locales: use one or two, found ${locales.length}`)
  if (!locales.includes(c.defaultLocale)) problems.push(`defaultLocale "${c.defaultLocale}" is not in locales`)
  for (const l of locales) {
    if (!stringLocales.includes(l)) problems.push(`locale "${l}" has no visitor strings in src/lib/i18n.ts`)
    if (!KEY.test(l)) problems.push(`locale "${l}" must be lowercase letters and digits`)
    // textSearch is written into SQL as a regconfig name.
    if (!/^[a-z_]+$/.test(c.locales[l].textSearch)) problems.push(`locale "${l}": textSearch must be a Postgres config name like 'norwegian'`)
  }
  if (sites.length < 1) problems.push('sites: at least one site is needed')
  for (const key of sites) {
    const s = c.sites[key]
    if (!KEY.test(key)) problems.push(`site key "${key}" must be lowercase letters and digits`)
    if (!/^https:\/\/[a-z0-9.-]+$/.test(s.origin)) problems.push(`site "${key}": origin must be https://host with no path`)
    for (const h of s.hosts) if (!HOST.test(h)) problems.push(`site "${key}": host "${h}" must be lowercase`)
    for (const l of locales) if (!s.articleBase[l]) problems.push(`site "${key}": articleBase has no "${l}"`)
  }
  if (!/^[a-z][a-z0-9-]*$/.test(c.cookiePrefix)) problems.push('cookiePrefix must be lowercase letters, digits and dashes')
  // The time zone is written into SQL (analytics), so only plain IANA names are accepted.
  if (!/^[A-Za-z]+(?:\/[A-Za-z_+-]+)*$/.test(c.timezone)) problems.push('timezone must be an IANA name such as Europe/Oslo')
  for (const [group, values] of [['documentTypes', c.documentTypes], ['articleKinds', c.articleKinds]] as const) {
    for (const [value, labels] of Object.entries(values)) {
      if (!KEY.test(value)) problems.push(`${group}: "${value}" must be lowercase letters and digits`)
      for (const l of locales) if (!labels[l]) problems.push(`${group}.${value}: no label for "${l}"`)
    }
  }
  const days = c.forms?.retentionDays
  if (days !== null && !(Number.isInteger(days) && (days as number) >= 1 && (days as number) <= 3650))
    problems.push('forms.retentionDays must be a whole number of days from 1 to 3650, or null to keep submissions')
  return problems
}
