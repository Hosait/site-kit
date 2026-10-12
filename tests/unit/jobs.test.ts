import assert from 'node:assert/strict'
import { test } from 'node:test'

import { jobs, PRUNE_TASK, shouldRunJobs } from '../../src/jobs'

test('jobs run only in the running web server, never in scripts, tests or next build (review focus 5)', () => {
  assert.equal(shouldRunJobs({}), false)
  assert.equal(shouldRunJobs({ NEXT_RUNTIME: 'edge' }), false)
  assert.equal(shouldRunJobs({ NEXT_RUNTIME: 'nodejs', NEXT_PHASE: 'phase-production-build' }), false)
  assert.equal(shouldRunJobs({ NEXT_RUNTIME: 'nodejs' }), true)
  assert.equal(shouldRunJobs(), false, 'this test process is not the web server')
})

test('the prune task runs at 02:15 UTC each night, and the web server checks the queue every 5 minutes', () => {
  const task = jobs.tasks?.find((t) => t.slug === PRUNE_TASK)
  assert.ok(task)
  assert.deepEqual(task.schedule, [{ cron: '0 15 2 * * *', queue: 'nightly' }])
  assert.deepEqual(jobs.autoRun, [{ cron: '0 */5 * * * *', queue: 'nightly' }])
})
