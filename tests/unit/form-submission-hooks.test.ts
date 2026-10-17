/* eslint-disable @typescript-eslint/no-explicit-any -- the hook is called with a minimal fake of Payload's arguments */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { ignoreClientCreatedAt } from '../../src/collections/formSubmissionHooks'

// A visitor's POST to /api/form-submissions could set createdAt (Payload only fills it when
// missing), and a submission dated in the future would never be old enough to delete.
test('a new submission is dated by the server, whatever the visitor sent', async () => {
  const before = Date.now()
  const out: any = await (ignoreClientCreatedAt as any)({ operation: 'create', data: { form: 1, createdAt: '2999-01-01T00:00:00.000Z' } })
  const at = Date.parse(out.createdAt)
  assert.ok(at >= before && at <= Date.now(), out.createdAt)
  assert.equal(out.form, 1)
})

test('an update leaves the date alone', async () => {
  const data = { createdAt: '2026-01-01T00:00:00.000Z' }
  assert.deepEqual(await (ignoreClientCreatedAt as any)({ operation: 'update', data }), data)
})
