import assert from 'node:assert/strict'
import { test } from 'node:test'

import { jobs, PRUNE_TASK } from '../../src/jobs'

test('the job runs in the standalone server, where only node server.js sets the environment (no NEXT_RUNTIME)', async () => {
  const saved = process.env.NEXT_RUNTIME
  delete process.env.NEXT_RUNTIME
  try {
    assert.equal(await (jobs.shouldAutoRun?.({} as never) ?? true), true)
  } finally {
    if (saved !== undefined) process.env.NEXT_RUNTIME = saved
  }
})

test('the prune task runs at 02:15 UTC each night, and the web server checks the queue every 5 minutes', () => {
  const task = jobs.tasks?.find((t) => t.slug === PRUNE_TASK)
  assert.ok(task)
  assert.deepEqual(task.schedule, [{ cron: '0 15 2 * * *', queue: 'nightly' }])
  assert.deepEqual(jobs.autoRun, [{ cron: '0 */5 * * * *', queue: 'nightly' }])
})
