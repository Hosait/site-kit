import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

import { checkPlan } from '../../src/lib/site-plan/check'

const plan = () => JSON.parse(readFileSync('tests/fixtures/plan-minimal.json', 'utf8'))

test('a valid plan with its files in place passes, with a summary', () => {
  const r = checkPlan(plan(), 'tests/fixtures')
  assert.deepEqual(r.errors, [])
  assert.equal(r.ok, true)
  assert.equal(r.summary.pages, plan().pages.length)
})

test('schema errors come back with their path', () => {
  const p = plan()
  p.pages[0].layout.no[0].blockType = 'carousel3d'
  const r = checkPlan(p, 'tests/fixtures')
  assert.equal(r.ok, false)
  assert.ok(r.errors.some((e) => e.includes('/pages/0/layout/no/0')))
})

test('a missing ref, a missing file, a path outside the folder and an http URL are all reported together', () => {
  const p = plan()
  p.pages[0].parent = 'no-such-page'
  p.media[0].source = 'media/not-there.jpg'
  p.media.push({ ref: 'up', source: '../../package.json' }, { ref: 'plain', source: 'http://old.example/x.jpg' })
  const errors = checkPlan(p, 'tests/fixtures').errors.join('\n')
  assert.match(errors, /missing page "no-such-page"/)
  assert.match(errors, /media\/not-there\.jpg does not exist/)
  assert.match(errors, /outside the plan's folder/)
  assert.match(errors, /only https URLs or files next to the plan/)
})

test('public https media are accepted without being fetched', () => {
  const p = plan()
  p.media[0].source = 'https://old.example/hero.jpg'
  assert.equal(checkPlan(p, 'tests/fixtures').ok, true)
})

test('an absolute path is refused even when it points into the plan folder', () => {
  const p = plan()
  const inside = p.media.find((m: { source: string }) => !/^https:/.test(m.source))
  inside.source = path.resolve('tests/fixtures', inside.source)
  const r = checkPlan(p, 'tests/fixtures')
  assert.equal(r.ok, false)
  assert.match(r.errors.join('\n'), /use a path relative to the plan/)
})
