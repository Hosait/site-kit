import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { dbResultMessage, planStatusMessage } from '../../src/components/admin/seed-panel-text'

test('the db answer is described for the plan path, a running import, the SQL path and errors', () => {
  assert.match(dbResultMessage({ ok: true, started: true, mode: 'plan' }), /site-plan\.json/)
  assert.match(dbResultMessage({ ok: true, alreadyRunning: true }), /allerede/)
  assert.match(dbResultMessage({ ok: true, counts: { pages: 2, articles: 1, media: 3 } }), /2 sider, 1 artikler, 3 bilder/)
  assert.equal(dbResultMessage({ ok: false, error: 'boom' }), 'Feil: boom')
})

test('plan progress, its error and its result are shown', () => {
  assert.equal(planStatusMessage(null), null)
  assert.match(planStatusMessage({ running: true, done: 3, total: 10 }) ?? '', /3 av 10/)
  assert.equal(planStatusMessage({ running: false, done: 1, total: 10, error: 'https://x/y.jpg: HTTP 404' }), 'Feil: https://x/y.jpg: HTTP 404')
  assert.match(planStatusMessage({ running: false, done: 10, total: 10, result: { media: 8, pages: 9, articles: 3 } }) ?? '', /9 sider, 3 artikler, 8 bilder/)
})

test('the panel uses these helpers and only offers step 2 when the SQL seed has media sources', () => {
  const src = readFileSync('src/components/admin/SeedPanelClient.tsx', 'utf8')
  assert.doesNotMatch(src, /body\.counts\.pages/)
  assert.match(src, /dbResultMessage\(/)
  assert.match(src, /planStatusMessage\(/)
  assert.match(src, /sources &&/)
  const route = readFileSync('src/app/(frontend)/next/seed/[step]/route.ts', 'utf8')
  assert.match(route, /sources: fs\.existsSync\(path\.join\(SEED_DIR, 'sources\.json'\)\)/)
})

// Replacing the content deletes every content collection, form submissions included: the
// admin must be told before they confirm, since submissions are personal data and cannot be restored.
test('the seed panel says that replacing deletes forms and their submissions', () => {
  const panel = readFileSync('src/components/admin/SeedPanelClient.tsx', 'utf8')
  const confirm = panel.match(/window\.confirm\('([^']+)'\)/)?.[1] ?? ''
  assert.match(confirm, /skjemaer/)
  assert.match(confirm, /innsendinger/)
  assert.match(panel, /erstatter alt innhold, også skjemaer og innsendinger/)
})
