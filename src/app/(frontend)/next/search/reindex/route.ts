import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { reindexAll, reindexProgress } from '@/lib/search/indexer'

export const dynamic = 'force-dynamic'
export const maxDuration = 900

/**
 * Bygger søkeindeksen på nytt (i bakgrunnen). Fra panelet «Søkeindeks» i admin, eller med CRON_SECRET:
 *   wget -qO- --post-data= --header "Authorization: Bearer $CRON_SECRET" http://127.0.0.1:3000/next/search/reindex
 * GET gir fremdriften.
 */
const HEADER = 'x-site-search' // Samme navn i src/components/admin/SearchPanelClient.tsx.

async function authorized(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') === `Bearer ${secret}`) return true
  // Egen header krever CORS-preflight, så andre nettsteder kan ikke utløse dette med brukerens cookie.
  if (req.headers.get(HEADER) !== '1') return false
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: req.headers })
  return (user as { role?: string } | null)?.role === 'admin'
}

export async function GET(req: Request) {
  if (!(await authorized(req))) return new Response('Forbidden', { status: 403 })
  const payload = await getPayload({ config: configPromise })
  const count = await payload.count({ collection: 'search-index', overrideAccess: true })
  return Response.json({ entries: count.totalDocs, progress: reindexProgress() })
}

export async function POST(req: Request) {
  if (!(await authorized(req))) return new Response('Forbidden', { status: 403 })
  const payload = await getPayload({ config: configPromise })
  return Response.json({ ok: true, progress: await reindexAll(payload) })
}
