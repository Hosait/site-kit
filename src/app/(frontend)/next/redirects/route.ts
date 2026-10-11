import { getRedirects } from '@/lib/data'
import { resolveLink } from '@/lib/links'
import { DEFAULT_LOCALE, DEFAULT_SITE, isLocale, isSiteKey, LOCALES, type SiteKey } from '@/lib/sites'

export const dynamic = 'force-dynamic'

/**
 * Alle omdirigeringer som ferdig løste mål, til proxyen (src/proxy.ts), som utfører dem før
 * siden rendres. Målet løses på språket i den gamle adressen.
 */
export async function GET() {
  const out: { from: string; to: string; site: SiteKey | null; permanent: boolean }[] = []
  for (const locale of LOCALES) {
    for (const r of await getRedirects(locale)) {
      const from = r.from.replace(/\/$/, '').normalize('NFC')
      const first = from.split('/')[1]
      if ((isLocale(first) ? first : DEFAULT_LOCALE) !== locale) continue
      const site = isSiteKey(r.site) ? r.site : null
      const to = resolveLink(r.to as never, site ?? DEFAULT_SITE, locale)
      if (to) out.push({ from, to, site, permanent: (r as { permanent?: boolean | null }).permanent !== false })
    }
  }
  return Response.json(out, { headers: { 'Cache-Control': 'no-store' } })
}
