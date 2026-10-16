import { getAllRoutes } from '@/lib/data'
import { type Locale, LOCALES, SITE_KEYS, type SiteKey } from '@/lib/sites'

export const dynamic = 'force-dynamic'

/**
 * Per site, the locales that have a published home page. The proxy (src/proxy.ts) uses it to
 * send visitors from `/` only to a locale whose home page exists.
 */
export async function GET() {
  const out = {} as Record<SiteKey, Locale[]>
  for (const site of SITE_KEYS) {
    const routes = await getAllRoutes(site)
    out[site] = LOCALES.filter((l) => routes.some((r) => r.collection === 'pages' && r.locale === l && r.value === ''))
  }
  return Response.json(out, { headers: { 'Cache-Control': 'no-store' } })
}
