import assert from 'node:assert/strict'
import { test } from 'node:test'

import { seedDbDecision } from '../../src/lib/seed-guard'

test('an empty install is seeded', () => {
  assert.equal(seedDbDecision({ source: 'plan', pages: 0, users: 0, replace: false, production: false }), 'run')
})
test('existing pages are never truncated by accident', () => {
  assert.equal(seedDbDecision({ source: 'plan', pages: 4, users: 1, replace: false, production: false }), 'refuse_existing')
  assert.equal(seedDbDecision({ source: 'plan', pages: 4, users: 1, replace: true, production: false }), 'run')
})
// A run stopped part-way (a killed container) leaves pages behind. While nobody has signed up,
// nobody can have made any of them, so the next run may clear them and try again.
test('pages left by an interrupted run do not block the next one while nobody has signed up', () => {
  assert.equal(seedDbDecision({ source: 'plan', pages: 4, users: 0, replace: false, production: false }), 'run')
})
// The SQL seed starts with TRUNCATE … CASCADE, which also empties forms, analytics and consent
// records that visitors made. It runs in one transaction, so pages mean it finished: never again
// without an explicit replace, users or not.
test('the SQL seed never runs again over existing pages without replace', () => {
  assert.equal(seedDbDecision({ source: 'sql', pages: 4, users: 0, replace: false, production: false }), 'refuse_existing')
  assert.equal(seedDbDecision({ source: 'sql', pages: 4, users: 0, replace: true, production: false }), 'run')
  assert.equal(seedDbDecision({ source: 'sql', pages: 0, users: 0, replace: false, production: false }), 'run')
})
test('production is always refused', () => {
  assert.equal(seedDbDecision({ source: 'plan', pages: 0, users: 0, replace: true, production: true }), 'refuse_production')
})

// Reset deletes all content. On a first deploy nobody can have made any; once someone has signed
// up, only the admin's confirmed replace may delete what they made.
test('a plan import resets only on replace, or while the site has no users', async () => {
  const { planReset } = await import('../../src/lib/seed-guard')
  assert.equal(planReset({ replace: false, users: 0 }), true)
  assert.equal(planReset({ replace: false, users: 1 }), false)
  assert.equal(planReset({ replace: true, users: 3 }), true)
})
