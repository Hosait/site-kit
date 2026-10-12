/**
 * Deletes form submissions older than their form's retention period (see
 * src/lib/forms/retention.ts). Run each night by the prune-form-submissions task.
 */
import type { Payload } from 'payload'

import { retentionDaysFor, type FormRetention } from '../lib/forms/retention'

export const PRUNE_BATCH = 1000
const DAY = 86_400_000

type FormDoc = { id: number | string; title?: string } & FormRetention

export async function pruneFormSubmissions(
  payload: Payload,
  { siteDefault, now = new Date(), batch = PRUNE_BATCH }: { siteDefault: number | null; now?: Date; batch?: number },
): Promise<{ form: number | string; deleted: number; error?: string }[]> {
  const out: { form: number | string; deleted: number; error?: string }[] = []
  const forms = await payload.find({ collection: 'forms', pagination: false, depth: 0 })
  for (const form of forms.docs as unknown as FormDoc[]) {
    const days = retentionDaysFor(form, siteDefault)
    if (days === null) continue
    const cutoff = new Date(now.getTime() - days * DAY).toISOString()
    try {
      // At most one batch per form per run: a large backlog clears over a few nights.
      const old = await payload.find({
        collection: 'form-submissions',
        where: { and: [{ form: { equals: form.id } }, { createdAt: { less_than: cutoff } }] },
        limit: batch,
        depth: 0,
      })
      const ids = old.docs.map((d) => d.id)
      if (ids.length) {
        await payload.delete({ collection: 'form-submissions', where: { id: { in: ids } } })
        payload.logger.info(`form submissions: deleted ${ids.length} older than ${days} days from form ${form.id} (${form.title ?? ''})`)
      }
      out.push({ form: form.id, deleted: ids.length })
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e)
      payload.logger.error(`form submissions: could not prune form ${form.id} (${form.title ?? ''}): ${error}`)
      out.push({ form: form.id, deleted: 0, error })
    }
  }
  return out
}
