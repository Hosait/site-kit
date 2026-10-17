import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { crawlGate } from '../src/gate.js'

test('crawlGate lets crawl start only after a finished check of the same site that is not red', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gate-'))
  const write = (o) => fs.writeFileSync(path.join(dir, 'assess.json'), JSON.stringify({ source: 'https://www.acme.no/', reasons: [], assessedAt: new Date().toISOString(), ...o }))
  assert.match(String(crawlGate(dir, 'https://www.acme.no/', false)), /site-builder assess/)
  write({ class: 'red', reasons: [{ class: 'red', code: 'shop', text: 'A shop', evidence: [] }] })
  assert.match(String(crawlGate(dir, 'https://www.acme.no/', true)), /red \(shop\)/)
  write({ class: 'green' })
  assert.match(String(crawlGate(dir, 'https://other.no/', false)), /other\.no/)
  assert.equal(crawlGate(dir, 'https://acme.no/', false), null, 'www and the bare domain are one site')
  write({ class: 'yellow', reasons: [{ class: 'yellow', code: 'documents', text: 'Many documents', evidence: [] }] })
  assert.match(String(crawlGate(dir, 'https://www.acme.no/', false)), /--accepted-scope/)
  assert.equal(crawlGate(dir, 'https://www.acme.no/', true), null)
  write({ class: 'yellow', reasons: [{ class: 'yellow', code: 'not-enough-read', text: 'Too little', evidence: [] }] })
  assert.match(String(crawlGate(dir, 'https://www.acme.no/', true)), /again/, 'an unfinished check is not accepted, it runs again')
  fs.writeFileSync(path.join(dir, 'assess.json'), '{ not json')
  assert.match(String(crawlGate(dir, 'https://www.acme.no/', true)), /site-builder assess/)
})

test('a fit check older than seven days, or without a date, runs again before crawl', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gate-'))
  const write = (o) => fs.writeFileSync(path.join(dir, 'assess.json'), JSON.stringify({ source: 'https://www.acme.no/', reasons: [], class: 'green', ...o }))
  const day = 24 * 60 * 60 * 1000
  write({ assessedAt: new Date(Date.now() - 6 * day).toISOString() })
  assert.equal(crawlGate(dir, 'https://www.acme.no/', false), null)
  write({ assessedAt: new Date(Date.now() - 8 * day).toISOString() })
  assert.match(String(crawlGate(dir, 'https://www.acme.no/', false)), /more than 7 days old.*site-builder assess/)
  write({})
  assert.match(String(crawlGate(dir, 'https://www.acme.no/', false)), /no date.*site-builder assess/)
})

// Bjørn's review of #13: a check dated in the future was accepted, and would never grow old.
test('a fit check dated in the future runs again before crawl', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gate-'))
  const write = (o) => fs.writeFileSync(path.join(dir, 'assess.json'), JSON.stringify({ source: 'https://www.acme.no/', reasons: [], class: 'green', ...o }))
  write({ assessedAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() })
  assert.match(String(crawlGate(dir, 'https://www.acme.no/', false)), /in the future.*site-builder assess/)
  write({ assessedAt: new Date(Date.now() + 60 * 1000).toISOString() })
  assert.equal(crawlGate(dir, 'https://www.acme.no/', false), null, 'a minute of clock difference is fine')
})
