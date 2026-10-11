import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

/** Helsesjekk for Hosait og overvåking: svarer 200 når appen og databasen virker. */
export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
    await payload.count({ collection: 'site-settings' })
    return Response.json({ ok: true, commit: process.env.HOSAIT_COMMIT_SHORT ?? null })
  } catch (err) {
    return Response.json({ ok: false, error: err instanceof Error ? err.message : 'unknown' }, { status: 503 })
  }
}
