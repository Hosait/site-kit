import { revalidatePath, revalidateTag } from 'next/cache'

import { SITE_KEYS } from '@/lib/sites'

const COLLECTIONS = ['pages', 'articles', 'people', 'documents', 'media', 'site-settings', 'redirects']

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
  for (const c of COLLECTIONS) {
    revalidateTag(c, 'max')
    for (const s of SITE_KEYS) revalidateTag(`${c}:${s}`, 'max')
  }
  for (const s of SITE_KEYS) revalidateTag(`site:${s}`, 'max')
  revalidatePath('/', 'layout')
  return Response.json({ ok: true })
}
