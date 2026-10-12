import assert from 'node:assert/strict'
import { test } from 'node:test'

import { retentionDaysFor, retentionFromPlan } from '../../src/lib/forms/retention'

test('a form keeps its own number of days, keeps everything, or follows the site', () => {
  assert.equal(retentionDaysFor({ retention: 'days', retentionDays: 30 }, 90), 30)
  assert.equal(retentionDaysFor({ retention: 'keep' }, 90), null)
  assert.equal(retentionDaysFor({ retention: 'default' }, 90), 90)
  assert.equal(retentionDaysFor({}, 90), 90)
  assert.equal(retentionDaysFor({ retention: 'default' }, null), null)
})

test('"Number of days" without a valid number follows the site default (review focus 1)', () => {
  for (const retentionDays of [null, undefined, 0, -5, 2.5]) assert.equal(retentionDaysFor({ retention: 'days', retentionDays }, 90), 90, String(retentionDays))
  assert.equal(retentionDaysFor({ retention: 'days', retentionDays: null }, null), null)
})

test("the plan's retention becomes the form's admin fields", () => {
  assert.deepEqual(retentionFromPlan(30), { retention: 'days', retentionDays: 30 })
  assert.deepEqual(retentionFromPlan('keep'), { retention: 'keep', retentionDays: null })
  assert.deepEqual(retentionFromPlan(undefined), { retention: 'default', retentionDays: null })
})

test('a number of days beyond 3650 (written outside the admin) follows the site default', () => {
  assert.equal(retentionDaysFor({ retention: 'days', retentionDays: 3651 }, 90), 90)
  assert.equal(retentionDaysFor({ retention: 'days', retentionDays: 1e9 }, 90), 90)
  assert.equal(retentionDaysFor({ retention: 'days', retentionDays: 3650 }, 90), 3650)
})
