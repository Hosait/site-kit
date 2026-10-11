import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { validateSitePlan } from '../../src/lib/site-plan/validate'

const minimal = () => JSON.parse(readFileSync('tests/fixtures/plan-minimal.json', 'utf8'))

test('the minimal plan is valid', () => {
  const r = validateSitePlan(minimal())
  assert.equal(r.ok, true, JSON.stringify(r))
})

test('an unknown block type is refused with its path', () => {
  const p = minimal()
  p.pages[0].layout.no[0].blockType = 'carousel3d'
  const r = validateSitePlan(p)
  assert.equal(r.ok, false)
  assert.ok(!r.ok && r.errors.some((e) => e.includes('/pages/0/layout/no/0')))
})

test('a locale the site does not have is refused', () => {
  const p = minimal()
  p.pages[0].title.de = 'Startseite'
  assert.equal(validateSitePlan(p).ok, false)
})

test('a missing version is refused', () => {
  const p = minimal()
  delete p.version
  assert.equal(validateSitePlan(p).ok, false)
})
