/* eslint-disable @typescript-eslint/no-explicit-any -- the tests read untyped hook arguments */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import type { CollectionConfig } from 'payload'

import { withAudit } from '../../src/collections/editorial/audit'
import { ContentAuditLog } from '../../src/collections/ContentAuditLog'
import { jobs, PRUNE_AUDIT_TASK } from '../../src/jobs'
import { AUDIT_RETENTION_DAYS, auditOperation, changedFieldNames, cutoffFor, docLabel } from '../../src/lib/editorial/audit'

test('changed fields are names only: noise and credentials are left out, blank equals missing', () => {
  assert.deepEqual(changedFieldNames({ title: 'a', summary: '', layout: [] }, { title: 'b', summary: null, layout: undefined, updatedAt: 'x' }), ['title'])
  assert.deepEqual(changedFieldNames({ layout: [{ a: 1 }] }, { layout: [{ a: 2 }] }), ['layout'])
  assert.deepEqual(changedFieldNames({ role: 'editor', hash: 'old', salt: 's' }, { role: 'publisher', hash: 'new', salt: 't', loginAttempts: 1 }), ['role'])
  assert.deepEqual(changedFieldNames(null, { id: 1, title: 'x', slug: 'x', path: 'x' }), ['slug', 'title'])
})

test('publish and unpublish are read from whether the live document is published', () => {
  assert.equal(auditOperation('update', false, true), 'publish')
  assert.equal(auditOperation('create', false, true), 'publish')
  assert.equal(auditOperation('update', true, false), 'unpublish')
  assert.equal(auditOperation('update', true, true), 'update')
  assert.equal(auditOperation('update', false, false), 'update', 'a draft over nothing live')
  assert.equal(auditOperation('create', false, false), 'create')
})

test('a row is named by title, name, file or e-mail, else the id', () => {
  assert.equal(docLabel({ id: 1, title: ' Om oss ' }), 'Om oss')
  assert.equal(docLabel({ id: 2, name: 'Kari' }), 'Kari')
  assert.equal(docLabel({ id: 3, filename: 'a.pdf' }), 'a.pdf')
  assert.equal(docLabel({ id: 4, email: 'a@b.no' }), 'a@b.no')
  assert.equal(docLabel({ id: 5 }), '5')
  assert.equal(docLabel(null), '')
})

test('the audit hooks are added after the collection\'s own, and write one row with names only', async () => {
  const own = () => undefined
  const wrapped = withAudit<CollectionConfig>({ slug: 'pages', fields: [], hooks: { afterChange: [own as never] } })
  assert.equal(wrapped.hooks?.afterChange?.[0], own)
  assert.equal(wrapped.hooks?.afterChange?.length, 2)
  assert.equal(wrapped.hooks?.afterDelete?.length, 1)

  const rows: any[] = []
  let live = true
  const req = (extra: object = {}) => ({ user: { id: 3, email: 'e@x.no' }, context: {}, query: {}, payload: { create: async (a: any) => void rows.push(a), db: { findOne: async () => ({ _status: live ? 'published' : 'draft' }) } }, ...extra })
  const change = wrapped.hooks!.afterChange![1] as any
  await change({ collection: { slug: 'pages' }, operation: 'update', doc: { id: 9, title: 'T', summary: 'NEW SECRET', site: 'main' }, previousDoc: { id: 9, title: 'T', summary: 'OLD SECRET' }, req: req() })
  assert.equal(rows.length, 1)
  assert.deepEqual(rows[0].data, { collection: 'pages', docId: '9', docTitle: 'T', site: 'main', operation: 'update', changedFields: ['site', 'summary'], user: 3, actor: 'e@x.no' })
  assert.equal(rows[0].overrideAccess, true)
  assert.ok(!JSON.stringify(rows).includes('SECRET'))

  // Autosave (REST sends `autosave=true`, parsed to a boolean), an unchanged save and an opted-out one write nothing.
  await change({ collection: { slug: 'pages' }, operation: 'update', doc: { id: 9, title: 'T2' }, previousDoc: { id: 9, title: 'T' }, req: req({ query: { autosave: true } }) })
  await change({ collection: { slug: 'pages' }, operation: 'update', doc: { id: 9, title: 'T', updatedAt: '2' }, previousDoc: { id: 9, title: 'T', updatedAt: '1' }, req: req() })
  await change({ collection: { slug: 'pages' }, operation: 'update', doc: { id: 9, title: 'T3' }, previousDoc: { id: 9, title: 'T' }, req: req({ context: { skipAudit: true } }) })
  assert.equal(rows.length, 1)

  // A draft over a live page leaves it live; a page that was live and no longer is was unpublished.
  const wasLive = { context: { wasLive: true } }
  await change({ collection: { slug: 'pages' }, operation: 'update', doc: { id: 9, summary: 'b', _status: 'draft' }, previousDoc: { id: 9, summary: 'a', _status: 'published' }, req: req(wasLive) })
  live = false
  await change({ collection: { slug: 'pages' }, operation: 'update', doc: { id: 9, summary: 'c', _status: 'draft' }, previousDoc: { id: 9, summary: 'b', _status: 'draft' }, req: req(wasLive) })
  assert.deepEqual(rows.slice(1).map((r) => r.data.operation), ['update', 'unpublish'])
  rows.splice(1)

  // Scripts and jobs have no user: the row says «system».
  await change({ collection: { slug: 'pages' }, operation: 'create', doc: { id: 10, title: 'N', _status: 'draft' }, previousDoc: undefined, req: req({ user: null }) })
  assert.equal(rows[1].data.actor, 'system')
  assert.equal(rows[1].data.user, null)

  const del = wrapped.hooks!.afterDelete![0] as any
  await del({ collection: { slug: 'pages' }, id: 9, doc: { id: 9, title: 'T' }, req: req() })
  assert.deepEqual([rows[2].data.operation, rows[2].data.changedFields], ['delete', []])
})

test('nobody can add to, edit or delete the log; only admins read it', async () => {
  const access = ContentAuditLog.access!
  for (const user of [null, { id: 1, role: 'admin' }, { id: 2, role: 'publisher' }]) {
    for (const op of ['create', 'update', 'delete'] as const) assert.equal(await (access as any)[op]({ req: { user } }), false, `${op} ${user?.role}`)
  }
  assert.equal(await (access.read as any)({ req: { user: { id: 1, role: 'admin' } } }), true)
  assert.equal(await (access.read as any)({ req: { user: { id: 2, role: 'editor' } } }), false)
})

test('the retention job runs nightly after the form pruning, with a two-year default', () => {
  const task = jobs.tasks?.find((t) => t.slug === PRUNE_AUDIT_TASK)
  assert.ok(task)
  assert.deepEqual(task.schedule, [{ cron: '0 30 2 * * *', queue: 'nightly' }])
  assert.equal(AUDIT_RETENTION_DAYS, 730)
  assert.equal(cutoffFor(new Date('2026-11-15T00:00:00.000Z'), 730), '2024-11-15T00:00:00.000Z')
})
