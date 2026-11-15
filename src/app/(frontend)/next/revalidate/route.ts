import { flushAllCaches } from '@/lib/revalidate'

/**
 * Tømmer all cache. Brukes etter import/skript som skriver direkte til databasen
 * (de kjører utenfor Next og kan ikke tømme cachen selv).
 *   curl -X POST -H "Authorization: Bearer $CRON_SECRET" $URL/next/revalidate
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Forbidden', { status: 403 })
  }
  flushAllCaches()
  return Response.json({ ok: true })
}
