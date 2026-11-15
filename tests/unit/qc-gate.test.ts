import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { qcGate } from '../../src/lib/qc-gate'

function repo(crawls: Record<string, { extract?: boolean; qc?: unknown }>) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'qc-gate-'))
  for (const [name, c] of Object.entries(crawls)) {
    const dir = path.join(root, '.site-builder', name)
    mkdirSync(dir, { recursive: true })
    if (c.extract !== false) writeFileSync(path.join(dir, 'extract.json'), '{}')
    if (c.qc !== undefined) writeFileSync(path.join(dir, 'qc.json'), typeof c.qc === 'string' ? c.qc : JSON.stringify(c.qc))
  }
  return root
}

test('a site that is not a rebuild is not held back', () => {
  assert.deepEqual(qcGate(mkdtempSync(path.join(os.tmpdir(), 'qc-gate-')), 'https://x.hosait.com'), [])
  assert.deepEqual(qcGate(repo({ 'www.old.no': { extract: false } }), 'https://x.hosait.com'), [])
})

test('a rebuild needs a qc run against the address being launched', () => {
  const [e] = qcGate(repo({ 'www.old.no': {} }), 'https://x.hosait.com/')
  assert.match(e, /has not been run against https:\/\/x\.hosait\.com: pnpm site-builder qc --out \.site-builder\/www\.old\.no --new https:\/\/x\.hosait\.com/)
  assert.equal(qcGate(repo({ 'www.old.no': { qc: { newBase: 'http://localhost:3100', pass: true } } }), 'https://x.hosait.com').length, 1)
})

test('only a passing qc for the same address lets the launch go on', () => {
  assert.deepEqual(qcGate(repo({ 'www.old.no': { qc: { newBase: 'https://x.hosait.com', pass: true } } }), 'https://x.hosait.com'), [])
  const [e] = qcGate(repo({ 'www.old.no': { qc: { newBase: 'https://x.hosait.com', pass: false, complete: false, summary: { pages: 10, passing: 7 } } } }), 'https://x.hosait.com')
  assert.match(e, /did not pass \(\.site-builder\/www\.old\.no\/qc\.md, incomplete, 7 of 10 pages pass\)/)
  assert.equal(qcGate(repo({ 'www.old.no': { qc: '{not json' } }), 'https://x.hosait.com').length, 1)
})
