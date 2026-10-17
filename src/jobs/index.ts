/**
 * Payload jobs. autoRun's timer starts only where Payload is loaded with `cron: true`: the
 * health route (src/app/(payload)/api/health) and Payload's own REST and admin requests. Kit
 * scripts and tests load it without, and Payload skips it during next build, so they exit.
 */
import type { Config } from 'payload'

import { FORMS } from '../lib/sites'
import { pruneFormSubmissions } from './pruneFormSubmissions'

export const PRUNE_TASK = 'prune-form-submissions'

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
}
