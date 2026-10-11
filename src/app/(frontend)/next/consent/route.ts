import { payload } from '@/lib/data'
import { CONSENT_VERSION } from '@/lib/analytics/consent'
import { logConsent } from '@/lib/analytics/ingest'

export const dynamic = 'force-dynamic'

const ACTIONS = new Set(['accept_all', 'reject_optional', 'custom', 'withdraw'])

/** Dokumentasjon av samtykkevalg fra cookie-banneret (ID, valg, versjon, tidspunkt; ingen IP). */
export async function POST(req: Request) {
  const origin = req.headers.get('origin')
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
  if (origin && host && new URL(origin).host !== host) return new Response(null, { status: 403 })
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  const consentId = typeof body?.id === 'string' && /^[A-Za-z0-9_-]{8,40}$/.test(body.id) ? body.id : null
  const action = typeof body?.action === 'string' && ACTIONS.has(body.action) ? body.action : null
  if (!consentId || !action) return Response.json({ ok: false }, { status: 400 })
  await logConsent(await payload(), {
    consentId,
    action,
    statistics: body?.statistics === true,
    version: CONSENT_VERSION,
    site: typeof body?.site === 'string' ? body.site : undefined,
    locale: typeof body?.locale === 'string' ? body.locale : undefined,
  })
  return Response.json({ ok: true })
}
