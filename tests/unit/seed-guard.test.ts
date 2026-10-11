import assert from 'node:assert/strict'
import { test } from 'node:test'

import { seedDbDecision } from '../../src/lib/seed-guard'

test('an empty install is seeded', () => {
  assert.equal(seedDbDecision({ pages: 0, replace: false, production: false }), 'run')
})
test('existing pages are never truncated by accident', () => {
  assert.equal(seedDbDecision({ pages: 4, replace: false, production: false }), 'refuse_existing')
  assert.equal(seedDbDecision({ pages: 4, replace: true, production: false }), 'run')
})
test('production is always refused', () => {
  assert.equal(seedDbDecision({ pages: 0, replace: true, production: true }), 'refuse_production')
})
