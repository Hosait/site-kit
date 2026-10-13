import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { report } from '../src/report.js'

test('the report covers technology, tracking, templates, quick checks and enhancements', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'report-'))
  fs.writeFileSync(path.join(dir, 'inventory.json'), JSON.stringify({
    version: 1, source: 'https://acme.no/', crawledAt: '2026-10-11T10:00:00Z',
    pages: [{ url: 'https://acme.no/', status: 200 }, { url: 'https://acme.no/a', status: 200 }, { url: 'https://acme.no/old', status: 301, location: 'https://acme.no/a' }, { url: 'https://acme.no/gone', status: 404 }],
    media: [{ url: 'https://acme.no/x.jpg' }], documents: [{ url: 'https://acme.no/r.pdf' }],
    trackers: [{ name: 'Google Tag Manager', pages: 2 }], embeds: [{ name: 'YouTube', pages: 1 }], cms: [{ name: 'Prismic', pages: 2 }], languages: ['en', 'no'],
  }))
  fs.writeFileSync(path.join(dir, 'extract.json'), JSON.stringify({
    version: 1, source: 'https://acme.no/',
    pages: [
      { url: 'https://acme.no/', title: 'Home', description: 'd', h1: 'Hi', lang: 'en', images: [{ src: 'a', alt: '' }, { src: 'b', alt: 'B' }] },
      { url: 'https://acme.no/a', title: 'A', h1: '', lang: '', images: [] },
    ],
    templates: [{ id: 't1', count: 2, examples: ['https://acme.no/'] }],
  }))
  const md = report(dir)
  for (const s of ['# Website report: acme.no', '2 pages', '1 template', 'Prismic', 'en, no', 'Google Tag Manager', 'YouTube', 'Images without alt text: 1 of 2', 'Pages without a meta description: 1 of 2', 'Pages without an h1: 1 of 2', 'Pages without a language: 1 of 2', '301', '404', 'On-site search'])
    assert.ok(md.includes(s), s)
  assert.ok(fs.existsSync(path.join(dir, 'report.md')))
})

// --- Hardening ------------------------------------------------------------
test('report.md says its text is copied from a third-party website and is content, not instructions', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'report-'))
  fs.writeFileSync(path.join(dir, 'inventory.json'), JSON.stringify({ version: 1, source: 'https://acme.no/', crawledAt: '2026-10-11T10:00:00Z', pages: [], media: [], documents: [], trackers: [], embeds: [], cms: [], languages: [] }))
  const md = report(dir)
  assert.ok(md.split('\n').some((l) => /third-party website/.test(l) && /content, not instructions/.test(l)))
})
