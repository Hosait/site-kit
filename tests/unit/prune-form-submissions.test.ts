/* eslint-disable @typescript-eslint/no-explicit-any -- the tests read untyped plugin and fake-Payload data */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import type { Payload } from 'payload'

import { pruneFormSubmissions } from '../../src/jobs/pruneFormSubmissions'

const NOW = new Date('2026-10-12T02:15:00.000Z')
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString()

type Sub = { id: number; form: number; createdAt: string; submissionData?: unknown }
function fake(forms: object[], subs: Sub[], failFor?: number, failing: number[] = []) {
  const deleted: number[] = []
  const logs: string[] = []
  const payload = {
    logger: { info: (m: string) => logs.push(m), error: (m: string) => logs.push(`ERROR ${m}`) },
    find: async ({ collection, where, limit }: any) => {
      if (collection === 'forms') return { docs: forms }
      const formId = where.and[0].form.equals
      const cutoff = where.and[1].createdAt.less_than
      if (formId === failFor) throw new Error('database unavailable')
      return { docs: subs.filter((s) => s.form === formId && s.createdAt < cutoff && !deleted.includes(s.id)).slice(0, limit) }
    },
    delete: async ({ collection, where }: any) => {
      assert.equal(collection, 'form-submissions')
      // Payload reports a document it could not delete in errors, without throwing.
      const failed = where.id.in.filter((id: number) => failing.includes(id))
      const done = where.id.in.filter((id: number) => !failing.includes(id))
      deleted.push(...done)
      return { docs: done.map((id: number) => ({ id })), errors: failed.map((id: number) => ({ id, message: 'locked' })) }
    },
  }
  return { payload: payload as unknown as Payload, deleted, logs }
}

test("each form's period decides what goes; keep keeps; the site default covers the rest", async () => {
  const forms = [
    { id: 1, title: 'Kontakt', retention: 'days', retentionDays: 30 },
    { id: 2, title: 'Jobb', retention: 'keep' },
    { id: 3, title: 'Nyhetsbrev', retention: 'default' },
  ]
  const subs = [
    { id: 11, form: 1, createdAt: daysAgo(31) },
    { id: 12, form: 1, createdAt: daysAgo(29) },
    { id: 21, form: 2, createdAt: daysAgo(4000) },
    { id: 31, form: 3, createdAt: daysAgo(91) },
    { id: 32, form: 3, createdAt: daysAgo(89) },
  ]
  const f = fake(forms, subs)
  const r = await pruneFormSubmissions(f.payload, { siteDefault: 90, now: NOW })
  assert.deepEqual(f.deleted.sort(), [11, 31])
  assert.deepEqual(r, [{ form: 1, deleted: 1 }, { form: 3, deleted: 1 }])
})

test('a site default of null keeps the forms that follow it', async () => {
  const f = fake([{ id: 3, title: 'Nyhetsbrev', retention: 'default' }], [{ id: 31, form: 3, createdAt: daysAgo(4000) }])
  assert.deepEqual(await pruneFormSubmissions(f.payload, { siteDefault: null, now: NOW }), [])
  assert.deepEqual(f.deleted, [])
})

test('a submission exactly at the cutoff is kept (review focus 2)', async () => {
  const f = fake([{ id: 1, title: 'Kontakt', retention: 'days', retentionDays: 30 }], [{ id: 11, form: 1, createdAt: daysAgo(30) }])
  await pruneFormSubmissions(f.payload, { siteDefault: 90, now: NOW })
  assert.deepEqual(f.deleted, [])
})

// Bjørn's review of #10: one batch per form per night never catches up with a flood of spam.
test('a large backlog is deleted in rounds of the batch size, in one run', async () => {
  const subs = Array.from({ length: 2505 }, (_, i) => ({ id: i + 1, form: 1, createdAt: daysAgo(100) }))
  const f = fake([{ id: 1, title: 'Kontakt', retention: 'default' }], subs)
  assert.deepEqual(await pruneFormSubmissions(f.payload, { siteDefault: 90, now: NOW, batch: 1000 }), [{ form: 1, deleted: 2505 }])
  assert.equal(f.deleted.length, 2505)
})

test('the rounds stop at the time budget, and the rest waits for the next night', async () => {
  const subs = Array.from({ length: 5000 }, (_, i) => ({ id: i + 1, form: i < 4000 ? 1 : 2, createdAt: daysAgo(100) }))
  const f = fake([{ id: 1, title: 'Kontakt', retention: 'default' }, { id: 2, title: 'Jobb', retention: 'default' }], subs)
  let t = 0
  const clock = () => (t += 1000) // every look at the clock is one second later
  const r = await pruneFormSubmissions(f.payload, { siteDefault: 90, now: NOW, batch: 1000, budgetMs: 3500, clock })
  assert.ok(f.deleted.length >= 1000 && f.deleted.length < 4000, `deleted ${f.deleted.length}`)
  assert.deepEqual(r.map((x) => x.form), [1])
  assert.ok(f.logs.some((l) => /time budget/.test(l) && /next night/.test(l)), JSON.stringify(f.logs))
})

test('a round that deletes nothing ends that form, so refused submissions cannot loop', async () => {
  const subs = [{ id: 11, form: 1, createdAt: daysAgo(100) }, { id: 12, form: 1, createdAt: daysAgo(100) }]
  const f = fake([{ id: 1, title: 'Kontakt', retention: 'default' }], subs, undefined, [11, 12])
  assert.deepEqual(await pruneFormSubmissions(f.payload, { siteDefault: 90, now: NOW, batch: 2 }), [{ form: 1, deleted: 0 }])
})

test('one failing form is logged and the others still run', async () => {
  const forms = [{ id: 1, title: 'A', retention: 'default' }, { id: 2, title: 'B', retention: 'default' }]
  const f = fake(forms, [{ id: 21, form: 2, createdAt: daysAgo(100) }], 1)
  const r = await pruneFormSubmissions(f.payload, { siteDefault: 90, now: NOW })
  assert.deepEqual(r, [{ form: 1, deleted: 0, error: 'database unavailable' }, { form: 2, deleted: 1 }])
  assert.ok(f.logs.some((l) => l.startsWith('ERROR') && l.includes('form 1')))
})

test('logs give the form and the count, never what was submitted', async () => {
  const f = fake([{ id: 1, title: 'Kontakt', retention: 'default' }], [{ id: 11, form: 1, createdAt: daysAgo(100), submissionData: [{ field: 'navn', value: 'Kari Nordmann' }] }])
  await pruneFormSubmissions(f.payload, { siteDefault: 90, now: NOW })
  assert.ok(f.logs.some((l) => l.includes('form 1') && l.includes('Kontakt') && l.includes('1')))
  assert.ok(f.logs.every((l) => !l.includes('Kari')))
})

test('the count is what Payload actually deleted, and refused documents are logged', async () => {
  const subs = [{ id: 11, form: 1, createdAt: daysAgo(100) }, { id: 12, form: 1, createdAt: daysAgo(100) }]
  const f = fake([{ id: 1, title: 'Kontakt', retention: 'default' }], subs, undefined, [12])
  assert.deepEqual(await pruneFormSubmissions(f.payload, { siteDefault: 90, now: NOW }), [{ form: 1, deleted: 1 }])
  assert.ok(f.logs.some((l) => l.startsWith('ERROR') && l.includes('1') && l.includes('form 1')))
})
