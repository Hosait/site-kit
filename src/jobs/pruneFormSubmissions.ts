/**
 * Deletes form submissions older than their form's retention period (see
 * src/lib/forms/retention.ts). Run each night by the prune-form-submissions task.
 */
import type { Payload } from 'payload'

import { retentionDaysFor, type FormRetention } from '../lib/forms/retention'

export const PRUNE_BATCH = 1000
/** One night's run stops after this long; what is left goes the next night. */
export const PRUNE_BUDGET_MS = 10 * 60_000
const DAY = 86_400_000

type FormDoc = { id: number | string; title?: string } & FormRetention

export async function pruneFormSubmissions(
  payload: Payload,
  {
    siteDefault,
    now = new Date(),
    batch = PRUNE_BATCH,
    budgetMs = PRUNE_BUDGET_MS,
    clock = Date.now,
  }: { siteDefault: number | null; now?: Date; batch?: number; budgetMs?: number; clock?: () => number },
): Promise<{ form: number | string; deleted: number; error?: string }[]> {
  const out: { form: number | string; deleted: number; error?: string }[] = []
  const stopAt = clock() + budgetMs
  const forms = await payload.find({ collection: 'forms', pagination: false, depth: 0 })
  for (const form of forms.docs as unknown as FormDoc[]) {
    const days = retentionDaysFor(form, siteDefault)
    if (days === null) continue
    if (clock() >= stopAt) {
      payload.logger.info('form submissions: the time budget is used up; the rest is deleted the next night')
      break
    }
    const cutoff = new Date(now.getTime() - days * DAY).toISOString()
    let deleted = 0
    try {
      // Rounds of one batch until nothing old is left, a round deletes nothing, or time is up.
      for (;;) {
        const old = await payload.find({
          collection: 'form-submissions',
          where: { and: [{ form: { equals: form.id } }, { createdAt: { less_than: cutoff } }] },
          limit: batch,
          depth: 0,
        })
        const ids = old.docs.map((d) => d.id)
        if (!ids.length) break
        // Payload reports a document it could not delete in errors, without throwing.
        const res = await payload.delete({ collection: 'form-submissions', where: { id: { in: ids } } })
        deleted += res.docs.length
        if (res.errors.length) payload.logger.error(`form submissions: ${res.errors.length} could not be deleted from form ${form.id} (${form.title ?? ''})`)
        if (!res.docs.length || ids.length < batch) break
        if (clock() >= stopAt) {
          payload.logger.info(`form submissions: the time budget is used up at form ${form.id}; the rest is deleted the next night`)
          break
        }
      }
      if (deleted) payload.logger.info(`form submissions: deleted ${deleted} older than ${days} days from form ${form.id} (${form.title ?? ''})`)
      out.push({ form: form.id, deleted })
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e)
      payload.logger.error(`form submissions: could not prune form ${form.id} (${form.title ?? ''}): ${error}`)
      out.push({ form: form.id, deleted, error })
    }
  }
  return out
}
