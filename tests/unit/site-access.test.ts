import assert from 'node:assert/strict'
import { test } from 'node:test'

import type { Access } from 'payload'

import {
  belongsToSite,
  canCreateContent,
  canPublish,
  canReview,
  deleteDraftContent,
  editorFilter,
  publishesStatus,
  siteMemberFilter,
  updateDraftContent,
} from '../../src/access/siteAccess'

const editor = (sites: string[]) => ({ id: 1, role: 'editor', sites }) as never
const as = (role: string, sites: string[] = []) => ({ id: 7, role, sites }) as never
const run = (access: Access, user: unknown, data?: object) => access({ req: { user } as never, data } as never) as unknown

test('one site: an editor with no sites list may edit everything', () => {
  assert.equal(editorFilter(editor([]), true), true)
})

test('several sites: editors are limited to their sites, none means no access', () => {
  assert.deepEqual(editorFilter(editor(['a']), false), { site: { in: ['a'] } })
  assert.equal(editorFilter(editor([]), false), false)
})

test('admins always, anonymous never', () => {
  assert.equal(editorFilter({ id: 2, role: 'admin', sites: [] } as never, false), true)
  assert.equal(editorFilter(null, true), false)
})

test('a reviewer never edits, but belongs to the site like the others', () => {
  assert.equal(editorFilter(as('reviewer'), true), false)
  assert.equal(siteMemberFilter(as('reviewer'), true), true)
  assert.deepEqual(siteMemberFilter(as('reviewer', ['a']), false), { site: { in: ['a'] } })
  assert.equal(siteMemberFilter(as('reviewer'), false), false)
  assert.equal(siteMemberFilter({ id: 1, sites: ['a'] } as never, false), false, 'no role, no membership')
  assert.equal(belongsToSite(as('reviewer', ['a']), 'a', false), true)
  assert.equal(belongsToSite(as('reviewer', ['a']), 'b', false), false)
  assert.equal(belongsToSite(as('editor'), 'b', true), true)
  assert.equal(belongsToSite(null, 'a', true), false)
})

test('only admins and publishers publish; reviewers and publishers review', () => {
  assert.deepEqual(['admin', 'publisher', 'editor', 'reviewer'].map((r) => canPublish(as(r))), [true, true, false, false])
  assert.deepEqual(['admin', 'publisher', 'editor', 'reviewer'].map((r) => canReview(as(r))), [true, true, false, true])
  assert.equal(canPublish(null), false)
})

test('publishesStatus reads a plain status and a per-locale one', () => {
  assert.equal(publishesStatus({ _status: 'published' }), true)
  assert.equal(publishesStatus({ _status: { no: 'draft', en: 'published' } }), true)
  assert.equal(publishesStatus({ _status: 'draft' }), false)
  assert.equal(publishesStatus({}), false)
  assert.equal(publishesStatus(undefined), false)
})

test('creating: editors create drafts, only publishers create published; reviewers create nothing', () => {
  assert.equal(run(canCreateContent, as('editor'), { _status: 'draft' }), true)
  assert.equal(run(canCreateContent, as('editor'), { _status: 'published' }), false)
  assert.equal(run(canCreateContent, as('publisher'), { _status: 'published' }), true)
  assert.equal(run(canCreateContent, as('reviewer'), { _status: 'draft' }), false)
  assert.equal(run(canCreateContent, null, {}), false)
})

test('updating: every editing role saves drafts, only publishers set published; none for reviewers', () => {
  assert.equal(run(updateDraftContent, as('editor'), { title: 'x' }), true)
  assert.equal(run(updateDraftContent, as('editor'), { _status: 'draft' }), true)
  assert.equal(run(updateDraftContent, as('editor'), { _status: 'published' }), false)
  assert.equal(run(updateDraftContent, as('publisher'), { _status: 'published' }), true)
  assert.equal(run(updateDraftContent, as('admin'), { _status: 'published' }), true)
  assert.equal(run(updateDraftContent, as('reviewer'), { title: 'x' }), false)
})

test('deleting: editors only what was never published', () => {
  assert.equal(run(deleteDraftContent, as('publisher')), true)
  assert.deepEqual(run(deleteDraftContent, as('editor')), { _status: { not_equals: 'published' } })
  assert.equal(run(deleteDraftContent, as('reviewer')), false)
})
