import { payload } from '@/lib/data'
import { ingest, type IncomingEvent } from '@/lib/analytics/ingest'

export const dynamic = 'force-dynamic'

/**
 * Mottak for besøkshendelser fra sporingsskriptet (sendBeacon, text/plain: ingen CORS-preflight).
 * Svarer alltid 204, også når hendelsen forkastes (roboter, redaktører, uten samtykke).
 */
const MAX_BYTES = 4096
// Enkel grense per IP: 120 hendelser per minutt.
const hits = new Map<string, { at: number; n: number }>()
function limited(ip: string) {
  const now = Date.now()
  const h = hits.get(ip)
  if (!h || now - h.at > 60_000) {
    if (hits.size > 10_000) hits.clear()
    hits.set(ip, { at: now, n: 1 })
    return false
  }
  return ++h.n > 120
}

export async function POST(req: Request) {
  const noContent = new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } })
  // Bare fra egne sider (samme opprinnelse).
  const origin = req.headers.get('origin')
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
  if (origin && host && new URL(origin).host !== host) return noContent
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (limited(ip)) return noContent

  const text = await req.text()
  if (text.length > MAX_BYTES) return noContent
  let event: IncomingEvent
  try {
    event = JSON.parse(text)
  } catch {
    return noContent
  }
  try {
    await ingest(await payload(), req.headers, event)
  } catch (err) {
    console.error('Besøksanalyse: kunne ikke lagre hendelse', err)
  }
  return noContent
}
