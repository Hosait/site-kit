/**
 * Payload jobs. Payload's autoRun starts a timer wherever Payload loads, so it is limited to
 * the running web server: kit scripts (kit:import) and tests would otherwise never exit, and
 * next build would start it too.
 */
import type { Config } from 'payload'

import { FORMS } from '../lib/sites'
import { pruneFormSubmissions } from './pruneFormSubmissions'

export const PRUNE_TASK = 'prune-form-submissions'

export function shouldRunJobs(env: Record<string, string | undefined> = process.env): boolean {
  return env.NEXT_RUNTIME === 'nodejs' && env.NEXT_PHASE !== 'phase-production-build'
}

export const jobs: NonNullable<Config['jobs']> = {
  tasks: [
    {
      slug: PRUNE_TASK,
      // Server time: UTC on Hosait, so 03:15 or 04:15 in Norway.
      schedule: [{ cron: '0 15 2 * * *', queue: 'nightly' }],
      outputSchema: [{ name: 'deleted', type: 'number' }],
      handler: async ({ req }) => {
        const result = await pruneFormSubmissions(req.payload, { siteDefault: FORMS.retentionDays })
        return { output: { deleted: result.reduce((n, r) => n + r.deleted, 0) } }
      },
    },
  ],
  autoRun: [{ cron: '0 */5 * * * *', queue: 'nightly' }],
  shouldAutoRun: () => shouldRunJobs(),
}
