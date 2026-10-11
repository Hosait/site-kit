import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

import type { Payload } from 'payload'

import { CONTENT_COLLECTIONS, importPlan } from '../../src/lib/site-plan/import'

type Call = { op: string; collection: string; data?: unknown; filePath?: string; file?: unknown; locale?: string }
function fakePayload(existing = 0) {
  const calls: Call[] = []
  let id = 0
  const payload = {
    calls,
    count: async () => ({ totalDocs: existing }),
    delete: async ({ collection }: { collection: string }) => { calls.push({ op: 'delete', collection }); return {} },
    create: async (a: { collection: string; data: unknown; filePath?: string; file?: unknown; locale?: string }) => { calls.push({ op: 'create', ...a }); return { id: ++id } },
    update: async (a: { collection: string; data: unknown; locale?: string }) => { calls.push({ op: 'update', ...a }); return { id: 1 } },
    config: {},
  }
  return payload as unknown as Payload & { calls: Call[] }
}
const plan = () => JSON.parse(readFileSync('tests/fixtures/plan-minimal.json', 'utf8'))
const toLexical = async (h: string) => ({ html: h })

test('imports media from the plan folder, pages in two passes, then site settings, and reports progress', async () => {
  const payload = fakePayload()
  const progress: number[] = []
  const r = await importPlan(payload, plan(), { baseDir: 'tests/fixtures', toLexical, onProgress: (d, t) => progress.push(d / t) })
  const media = payload.calls.filter((c) => c.op === 'create' && c.collection === 'media')
  assert.ok(media.length > 0 && media.every((c) => c.filePath?.startsWith(path.resolve('tests/fixtures') + path.sep)))
  assert.ok(payload.calls.some((c) => c.op === 'create' && c.collection === 'pages'))
  assert.ok(payload.calls.some((c) => c.op === 'update' && c.collection === 'pages'))
  assert.ok(payload.calls.some((c) => c.op === 'create' && c.collection === 'site-settings'))
  assert.equal(progress.at(-1), 1)
  assert.equal(r.pages, plan().pages.length)
})

test('a database with content is refused, unless reset deletes every content collection first', async () => {
  await assert.rejects(importPlan(fakePayload(3), plan(), { baseDir: 'tests/fixtures', toLexical }), /already has content/)
  const payload = fakePayload(3)
  await importPlan(payload, plan(), { baseDir: 'tests/fixtures', toLexical, reset: true })
  assert.deepEqual(payload.calls.filter((c) => c.op === 'delete').map((c) => c.collection), [...CONTENT_COLLECTIONS])
})

test('a media path outside the plan folder is refused', async () => {
  const p = plan()
  p.media[0].source = '../../package.json'
  await assert.rejects(importPlan(fakePayload(), p, { baseDir: 'tests/fixtures', toLexical }), /outside the plan's folder/)
})

test('https media go through fetchMedia, and a refused download stops the import naming the URL', async () => {
  const p = plan()
  p.media[0].source = 'https://evil.example/x.jpg'
  const fetchMedia = async (u: string) => { throw new Error(`${u} resolves to a private address`) }
  await assert.rejects(importPlan(fakePayload(), p, { baseDir: 'tests/fixtures', toLexical, fetchMedia }), /evil\.example/)
})

test('missing refs are refused before anything is written', async () => {
  const p = plan()
  p.pages[0].parent = 'no-such-page'
  const payload = fakePayload()
  await assert.rejects(importPlan(payload, p, { baseDir: 'tests/fixtures', toLexical }), /Missing refs/)
  assert.equal(payload.calls.length, 0)
})
