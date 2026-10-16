import assert from 'node:assert/strict'
import { test } from 'node:test'

import { planOutcome, settlesWithin } from '../../src/lib/site-plan/seed-response'

// Hosait runs the seed command once (seed.run) and treats exit code 0 as done. With ?wait=1 the
// route answers only when the import has finished, and never 200 for a failure.
test('a finished import answers 200 with its result', () => {
  const r = planOutcome({ running: false, done: 5, total: 5, startedAt: 'x', result: { media: 1, pages: 2, articles: 0 } }, true)
  assert.equal(r.status, 200)
  assert.deepEqual(r.body, { ok: true, mode: 'plan', result: { media: 1, pages: 2, articles: 0 } })
})

test('a failed import answers 500 with the error, so wget exits non-zero', () => {
  const r = planOutcome({ running: false, done: 2, total: 5, startedAt: 'x', error: 'https://x/a.jpg: HTTP 404' }, true)
  assert.equal(r.status, 500)
  assert.deepEqual(r.body, { ok: false, error: 'https://x/a.jpg: HTTP 404' })
})

test('an import still running at the deadline answers 504 and says it continues', () => {
  const r = planOutcome({ running: true, done: 2, total: 5, startedAt: 'x' }, false)
  assert.equal(r.status, 504)
  assert.equal((r.body as { ok: boolean }).ok, false)
  assert.match((r.body as { error: string }).error, /still running/)
})

test('settlesWithin tells whether a promise settled before the deadline, rejected ones included', async () => {
  assert.equal(await settlesWithin(Promise.resolve(), 50), true)
  assert.equal(await settlesWithin(Promise.reject(new Error('x')), 50), true)
  assert.equal(await settlesWithin(new Promise(() => {}), 30), false)
})

test('an answer that is not 200 is logged with its reason, since wget drops the body', async () => {
  const { seedAnswer } = await import('../../src/lib/site-plan/seed-response')
  const lines: string[] = []
  const log = (...a: unknown[]) => lines.push(a.join(' '))
  const failed = seedAnswer(500, { ok: false, error: 'https://x/a.jpg: HTTP 404' }, log)
  assert.equal(failed.status, 500)
  assert.deepEqual(await failed.json(), { ok: false, error: 'https://x/a.jpg: HTTP 404' })
  assert.deepEqual(lines, ['[seed] 500 https://x/a.jpg: HTTP 404'])
  seedAnswer(200, { ok: true }, log)
  assert.equal(lines.length, 1, 'a success is not logged as an error')
})
