/* eslint-disable @typescript-eslint/no-explicit-any -- the tests read untyped plugin and fake-Payload data */
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import type { Payload } from 'payload'

import { CONTENT_COLLECTIONS, importPlan } from '../../src/lib/site-plan/import'

type Call = { op: string; collection: string; data?: unknown; filePath?: string; file?: unknown; locale?: string; id?: number }
function fakePayload(existing = 0) {
  const calls: Call[] = []
  let id = 0
  const withRowIds = (data: any) => ({
    fields: (data?.fields ?? []).map((f: any, i: number) => ({ ...f, id: `row${i}`, options: f.options?.map((o: any, j: number) => ({ ...o, id: `opt${i}-${j}` })) })),
  })
  const payload = {
    calls,
    count: async () => ({ totalDocs: existing }),
    delete: async ({ collection, where }: { collection: string; where?: unknown }) => { calls.push({ op: 'delete', collection, data: where }); return { docs: [], errors: [] } },
    create: async (a: { collection: string; data: unknown; filePath?: string; file?: unknown; locale?: string }) => {
      const doc = { id: ++id, ...(a.collection === 'forms' ? withRowIds(a.data) : {}) }
      calls.push({ op: 'create', ...a, id: doc.id })
      return doc
    },
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

// With replace, the import deletes the site's content first; a bad local file found after that
// would leave the site empty. Local files are checked before anything is deleted.
test('a bad local file stops a replacing import before anything is deleted', async () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'import-replace-'))
  mkdirSync(path.join(dir, 'media'))
  writeFileSync(path.join(dir, 'media', 'hero.jpg'), readFileSync('tests/fixtures/media/hero.jpg'))
  writeFileSync(path.join(dir, 'media', 'logo.svg'), '<svg xmlns="http://www.w3.org/2000/svg"></svg>')
  const p = plan()
  p.media.push({ ref: 'logo', source: 'media/logo.svg' })
  const payload = fakePayload(3)
  await assert.rejects(importPlan(payload, p, { baseDir: dir, toLexical, reset: true }), /media\/logo\.svg: SVG is not imported/)
  assert.deepEqual(payload.calls.filter((c) => c.op === 'delete' || c.op === 'create'), [])
})

const contactForm = () => ({
  ref: 'contact',
  title: { no: 'Kontakt', en: 'Contact' },
  fields: [
    { type: 'text', name: 'navn', label: { no: 'Navn', en: 'Name' }, required: true, width: 50 },
    { type: 'select', name: 'emne', label: { no: 'Emne', en: 'Topic' }, options: [{ value: 'pris', label: { no: 'Pris', en: 'Price' } }] },
    { type: 'checkbox', name: 'samtykke', label: { no: 'Ja', en: 'Yes' }, default: false },
    { type: 'message', text: { no: 'Hei <du> & "deg"', en: 'Hi' } },
  ],
  submitLabel: { no: 'Send', en: 'Send' },
  confirmation: { no: 'Takk!', en: 'Thanks!' },
  retention: 30,
})

test('forms are created before pages as the plugin stores them, and the form block gets its id', async () => {
  const p = plan()
  p.forms = [contactForm()]
  p.pages[0].layout.no.push({ blockType: 'formBlock', form: { $form: 'contact' } })
  const payload = fakePayload()
  await importPlan(payload, p, { baseDir: 'tests/fixtures', toLexical })
  const creates = payload.calls.filter((c) => c.op === 'create').map((c) => c.collection)
  assert.ok(creates.indexOf('forms') < creates.indexOf('pages'))
  const form = payload.calls.find((c) => c.op === 'create' && c.collection === 'forms')!
  const data = form.data as any
  assert.equal(form.locale, 'no')
  assert.equal(data.title, 'Kontakt')
  assert.deepEqual(data.fields[0], { id: undefined, blockType: 'text', name: 'navn', label: 'Navn', required: true, width: 50 })
  assert.deepEqual(data.fields[1].options, [{ id: undefined, value: 'pris', label: 'Pris' }])
  assert.equal(data.fields[2].defaultValue, false)
  assert.deepEqual(data.fields[3], { id: undefined, blockType: 'message', message: { html: '<p>Hei &lt;du&gt; &amp; &quot;deg&quot;</p>' } })
  assert.equal(data.submitButtonLabel, 'Send')
  assert.equal(data.confirmationType, 'message')
  assert.deepEqual(data.confirmationMessage, { html: '<p>Takk!</p>' })
  assert.deepEqual([data.retention, data.retentionDays], ['days', 30])
  assert.deepEqual(data.emails, [])
  const layout = payload.calls.find((c) => c.op === 'update' && c.collection === 'pages' && c.locale === 'no')!.data as any
  assert.equal(layout.layout.at(-1).form, form.id)
})

test('the second language fills the same field rows, so the first language is kept', async () => {
  const p = plan()
  p.forms = [contactForm()]
  const payload = fakePayload()
  await importPlan(payload, p, { baseDir: 'tests/fixtures', toLexical })
  const en = payload.calls.find((c) => c.op === 'update' && c.collection === 'forms' && c.locale === 'en')!.data as any
  assert.deepEqual(en.fields.map((f: any) => f.id), ['row0', 'row1', 'row2', 'row3'])
  assert.equal(en.fields[1].options[0].id, 'opt1-0')
  assert.equal(en.fields[0].label, 'Name')
  assert.equal(en.submitButtonLabel, 'Send')
  assert.equal(en.title, undefined, 'the plugin does not localize the title')
})

test('a form written only in the second language still imports (review focus 3)', async () => {
  const p = plan()
  const f = contactForm()
  f.title = { en: 'Contact' } as never
  f.fields[0].label = { en: 'Name' } as never
  p.forms = [f]
  const payload = fakePayload()
  await importPlan(payload, p, { baseDir: 'tests/fixtures', toLexical })
  const data = payload.calls.find((c) => c.op === 'create' && c.collection === 'forms')!.data as any
  assert.equal(data.title, 'Contact')
})

test('a form left without retention follows the site, and "keep" keeps', async () => {
  for (const [retention, expected] of [[undefined, ['default', null]], ['keep', ['keep', null]]] as const) {
    const p = plan()
    p.forms = [{ ...contactForm(), retention }]
    const payload = fakePayload()
    await importPlan(payload, p, { baseDir: 'tests/fixtures', toLexical })
    const data = payload.calls.find((c) => c.op === 'create' && c.collection === 'forms')!.data as any
    assert.deepEqual([data.retention, data.retentionDays], expected)
  }
})

test('a form the database refuses stops the import, naming the form', async () => {
  const p = plan()
  p.forms = [contactForm()]
  const payload = fakePayload()
  const create = payload.create.bind(payload)
  ;(payload as any).create = async (a: any) => {
    if (a.collection === 'forms') throw new Error('The following field is invalid: fields.0.name')
    return create(a)
  }
  await assert.rejects(importPlan(payload, p, { baseDir: 'tests/fixtures', toLexical }), /form "contact": The following field is invalid/)
})

test('an import that fails after the forms removes the forms it created too', async () => {
  const p = plan()
  p.forms = [contactForm()]
  const payload = fakePayload()
  const create = payload.create.bind(payload)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- replace one method of the fake
  ;(payload as any).create = async (a: any) => {
    if (a.collection === 'pages') throw new Error('pages refused')
    return create(a)
  }
  await assert.rejects(importPlan(payload, p, { baseDir: 'tests/fixtures', toLexical }), /pages refused.*removed/)
  const formId = payload.calls.find((c) => c.op === 'create' && c.collection === 'forms')!.id
  const deletes = payload.calls.filter((c) => c.op === 'delete').map((d) => [d.collection, d.data])
  assert.deepEqual(deletes.find(([c]) => c === 'forms'), ['forms', { id: { in: [formId] } }])
})

test('reset clears submissions and forms after the pages that use them', () => {
  const c: string[] = [...CONTENT_COLLECTIONS]
  assert.ok(c.indexOf('pages') < c.indexOf('form-submissions') && c.indexOf('form-submissions') < c.indexOf('forms'))
})
