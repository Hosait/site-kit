import assert from 'node:assert/strict'
import { test } from 'node:test'

import { editorFilter } from '../../src/access/siteAccess'

const editor = (sites: string[]) => ({ id: 1, role: 'editor', sites }) as never

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
