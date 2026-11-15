/**
 * Deletes content audit log rows older than AUDIT_RETENTION_DAYS. The log has no delete access,
 * so this job (local API, access control skipped) is the only way a row goes. Run each night by
 * the prune-audit-log task (src/jobs/index.ts), like src/jobs/pruneFormSubmissions.ts.
 */
import type { Payload } from 'payload'

import { AUDIT_RETENTION_DAYS, cutoffFor } from '../lib/editorial/audit'

export const AUDIT_PRUNE_BATCH = 1000
/** One night's run stops after this long; what is left goes the next night. */
export const AUDIT_PRUNE_BUDGET_MS = 10 * 60_000

export async function pruneAuditLog(
  payload: Payload,
  {
    days = AUDIT_RETENTION_DAYS,
    now = new Date(),
    batch = AUDIT_PRUNE_BATCH,
    budgetMs = AUDIT_PRUNE_BUDGET_MS,
    clock = Date.now,
  }: { days?: number; now?: Date; batch?: number; budgetMs?: number; clock?: () => number } = {},
): Promise<{ deleted: number }> {
  const cutoff = cutoffFor(now, days)
  const stopAt = clock() + budgetMs
  let deleted = 0
  for (;;) {
    const old = await payload.find({
      collection: 'content-audit-log',
      where: { createdAt: { less_than: cutoff } },
      limit: batch,
      depth: 0,
      pagination: false,
      select: {},
    })
    const ids = old.docs.map((d) => d.id)
    if (!ids.length) break
    // Payload reports a row it could not delete in errors, without throwing.
    const res = await payload.delete({ collection: 'content-audit-log', where: { id: { in: ids } } })
    deleted += res.docs.length
    if (res.errors.length) payload.logger.error(`audit log: ${res.errors.length} rows could not be deleted`)
    if (!res.docs.length || ids.length < batch) break
    if (clock() >= stopAt) {
      payload.logger.info('audit log: the time budget is used up; the rest is deleted the next night')
      break
    }
  }
  if (deleted) payload.logger.info(`audit log: deleted ${deleted} rows older than ${days} days`)
  return { deleted }
}
