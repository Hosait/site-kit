import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import type { Payload } from 'payload'

import { loadSeedPlan, runPlanSeed, seedSource, type PlanSeedProgress } from '../../src/lib/site-plan/seed-plan'

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'seed-'))
const fresh = (): PlanSeedProgress => ({ running: true, done: 0, total: 0, startedAt: 'now' })
const fixture = fs.readFileSync('tests/fixtures/plan-minimal.json', 'utf8')

test('seedSource prefers the plan, then the SQL dump, else none', () => {
  const d = tmp()
  assert.equal(seedSource(d), 'none')
  fs.writeFileSync(path.join(d, 'content.sql.gz'), '')
  assert.equal(seedSource(d), 'sql')
  fs.writeFileSync(path.join(d, 'site-plan.json'), fixture)
  assert.equal(seedSource(d), 'plan')
})

test('loadSeedPlan names the file on bad JSON, lists schema errors, and accepts a valid plan', () => {
  const d = tmp()
  fs.writeFileSync(path.join(d, 'site-plan.json'), '{ nope')
  const bad = loadSeedPlan(d)
  assert.ok(!bad.ok && /seed\/site-plan\.json/.test(bad.error))
  fs.writeFileSync(path.join(d, 'site-plan.json'), JSON.stringify({ version: 1 }))
  assert.equal(loadSeedPlan(d).ok, false)
  fs.writeFileSync(path.join(d, 'site-plan.json'), fixture)
  assert.equal(loadSeedPlan(d).ok, true)
})

test('runPlanSeed imports with the seed folder as base, keeps progress, and runs the follow-up', async () => {
  const progress = fresh()
  let seen: { baseDir?: string; reset?: boolean } = {}
  let after = false
  await runPlanSeed({} as Payload, JSON.parse(fixture), '/app/seed', progress, {
    reset: true,
    importer: async (_p, _plan, o) => { seen = o; o.onProgress?.(3, 3); return { media: 1, pages: 2, articles: 0 } },
    after: async () => { after = true },
  })
  assert.deepEqual([seen.baseDir, seen.reset], ['/app/seed', true])
  assert.deepEqual([progress.running, progress.done, progress.total, progress.result?.pages], [false, 3, 3, 2])
  assert.equal(after, true)
  assert.ok(progress.finishedAt)
})

test('runPlanSeed never throws: a refused media download lands in progress.error and the follow-up is skipped', async () => {
  const progress = fresh()
  let after = false
  await runPlanSeed({} as Payload, JSON.parse(fixture), '/app/seed', progress, {
    reset: false,
    importer: async () => { throw new Error('https://10.0.0.5/x.jpg resolves to a private address') },
    after: async () => { after = true },
  })
  assert.equal(progress.running, false)
  assert.match(progress.error ?? '', /10\.0\.0\.5/)
  assert.equal(after, false)
})

test('the shipped seed is a valid plan whose local media all exist under seed/', () => {
  const r = loadSeedPlan('seed')
  assert.ok(r.ok, r.ok ? '' : r.error)
  for (const m of r.plan.media) if (!/^https:\/\//.test(m.source)) assert.ok(fs.existsSync(path.join('seed', m.source)), m.source)
})

test('the db step checks for a running import before the content check, and uses the plan when present', () => {
  const src = fs.readFileSync('src/app/(frontend)/next/seed/[step]/route.ts', 'utf8')
  assert.ok(src.indexOf('g.__seedPlan?.running') > -1 && src.indexOf('g.__seedPlan?.running') < src.indexOf('seedDbDecision('))
  assert.match(src, /seedSource\(SEED_DIR\) === 'plan'/)
  assert.match(src, /plan: g\.__seedPlan \?\? null/)
})

test('the db step claims the running slot before its first await, so two requests at once cannot both import', () => {
  const src = fs.readFileSync('src/app/(frontend)/next/seed/[step]/route.ts', 'utf8')
  const db = src.slice(src.indexOf("if (step === 'db')"))
  assert.ok(db.indexOf('g.__seedPlan = claim') > -1, 'claims the slot')
  assert.ok(db.indexOf('g.__seedPlan = claim') < db.indexOf('await '), 'before any await')
  assert.match(src, /release\(\)/)
})
