import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import os from 'node:os'
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
    delete: async ({ collection, where }: { collection: string; where?: unknown }) => { calls.push({ op: 'delete', collection, data: where }); return { docs: [], errors: [] } },
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

test('a refused download names the whole media URL, even when the error itself names only the host', async () => {
  const p = plan()
  p.media[0].source = 'https://evil.example/path/x.jpg'
  const fetchMedia = async () => { throw Object.assign(new Error('evil.example resolves to a private address'), { code: 'EPRIVATE' }) }
  await assert.rejects(importPlan(fakePayload(), p, { baseDir: 'tests/fixtures', toLexical, fetchMedia }), /https:\/\/evil\.example\/path\/x\.jpg/)
})

test('an import that fails part-way removes only what it wrote, so the next run starts where it began', async () => {
  const p = plan()
  p.media.push({ ref: 'gone', source: 'https://cdn.example/gone.jpg' })
  const payload = fakePayload()
  const fetchMedia = async (u: string) => { throw new Error(`${u}: HTTP 404`) }
  await assert.rejects(importPlan(payload, p, { baseDir: 'tests/fixtures', toLexical, fetchMedia }), /gone\.jpg: HTTP 404.*removed/)
  const created = payload.calls.filter((c) => c.op === 'create')
  const deletes = payload.calls.filter((c) => c.op === 'delete')
  assert.equal(created.length, 1, 'the local media was written before the download failed')
  assert.deepEqual(deletes.map((d) => [d.collection, d.data]), [['media', { id: { in: [1] } }]], 'only what this run created, by id')
})

test('a removal the database refuses is reported, not called removed', async () => {
  const p = plan()
  p.media.push({ ref: 'gone', source: 'https://cdn.example/gone.jpg' })
  const payload = fakePayload()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- replace one method of the fake
  ;(payload as any).delete = async () => ({ docs: [], errors: [{ id: 1, message: 'locked' }] })
  const fetchMedia = async (u: string) => { throw new Error(`${u}: HTTP 404`) }
  await assert.rejects(importPlan(payload, p, { baseDir: 'tests/fixtures', toLexical, fetchMedia }), /removing what this import wrote also failed/)
})

test('a run refused because the site has content deletes nothing', async () => {
  const payload = fakePayload(3)
  await assert.rejects(importPlan(payload, plan(), { baseDir: 'tests/fixtures', toLexical }), /already has content/)
  assert.equal(payload.calls.filter((c) => c.op === 'delete').length, 0)
})

test('a local SVG is refused as media before anything is written', async () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'import-svg-'))
  mkdirSync(path.join(dir, 'media'))
  writeFileSync(path.join(dir, 'media', 'logo.svg'), '<svg xmlns="http://www.w3.org/2000/svg"></svg>')
  writeFileSync(path.join(dir, 'media', 'hero.jpg'), readFileSync('tests/fixtures/media/hero.jpg'))
  const p = plan()
  p.media.unshift({ ref: 'logo', source: 'media/logo.svg' })
  const payload = fakePayload()
  await assert.rejects(importPlan(payload, p, { baseDir: dir, toLexical }), /media\/logo\.svg: SVG is not imported/)
  assert.equal(payload.calls.filter((c) => c.op === 'create').length, 0)
})
