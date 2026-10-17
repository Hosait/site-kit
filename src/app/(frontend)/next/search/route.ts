import { clientAddress } from '@/lib/client-address'
import { payload } from '@/lib/data'
import { hitHref } from '@/lib/search/href'
import { search, SEARCH_KINDS } from '@/lib/search/query'
import type { SearchKind } from '@/lib/search/indexer'
import { isLocale, isSiteKey } from '@/lib/sites'

export const dynamic = 'force-dynamic'

/**
 * Forslag mens man skriver i søkefeltet i headeren:
 *   /next/search?q=dør&locale=no&current=sbs[&site=dws&kind=document&limit=6]
 * Ligger utenfor proxyen, så nettstedet man står på sendes med (`current`).
 */

// Enkel grense per IP: 30 søk per 10 sekunder (beskytter databasen mot hamring).
const WINDOW_MS = 10_000
const MAX_PER_WINDOW = 30
const hits = new Map<string, { at: number; n: number }>()
function limited(ip: string): boolean {
  const now = Date.now()
  const h = hits.get(ip)
  if (!h || now - h.at > WINDOW_MS) {
    if (hits.size > 5000) hits.clear()
    hits.set(ip, { at: now, n: 1 })
    return false
  }
  h.n++
  return h.n > MAX_PER_WINDOW
}

export async function GET(req: Request) {
  const ip = clientAddress(req.headers.get('x-forwarded-for'))
  if (limited(ip)) return Response.json({ error: 'For mange søk. Vent litt.' }, { status: 429 })

  const url = new URL(req.url)
  const q = url.searchParams.get('q') ?? ''
  const locale = url.searchParams.get('locale')
  const current = url.searchParams.get('current')
  const site = url.searchParams.get('site')
  const kind = url.searchParams.get('kind')
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 6, 1), 20)
  if (!isLocale(locale) || !isSiteKey(current)) return Response.json({ error: 'Mangler locale/current' }, { status: 400 })

  const result = await search(await payload(), {
    q,
    locale,
    current,
    site: isSiteKey(site) ? site : null,
    kind: SEARCH_KINDS.includes(kind as SearchKind) ? (kind as SearchKind) : null,
    limit,
  })
  return Response.json(
    {
      total: result.total,
      fuzzy: result.fuzzy,
      hits: result.hits.map((h) => ({
        kind: h.kind,
        site: h.site,
        title: h.title,
        snippet: h.snippet,
        href: hitHref(h, current),
      })),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
