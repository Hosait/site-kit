import assert from 'node:assert/strict'
import { test } from 'node:test'

import { flushAllCaches } from '../../src/lib/revalidate'
import { SITE_KEYS } from '../../src/lib/sites'

// With the 'max' profile the next visitor is served the page that was cached before (a 404 for a
// page that did not exist before an import) while the new one is built. An import must make the
// first request already read the new content, so every tag expires at once.
test('flushing the caches expires every content tag and site tag at once, and the layout path', () => {
  const tags: [string, unknown][] = []
  const paths: [string, string][] = []
  flushAllCaches(
    (tag, profile) => tags.push([tag, profile]),
    (path, type) => paths.push([path, type]),
  )
  assert.ok(tags.length > 0)
  assert.ok(tags.every(([, profile]) => (profile as { expire: number }).expire === 0), 'a tag was marked stale instead of expired')
  const names = tags.map(([t]) => t)
  for (const c of ['pages', 'articles', 'people', 'documents', 'media', 'site-settings', 'redirects']) {
    assert.ok(names.includes(c), c)
    for (const s of SITE_KEYS) assert.ok(names.includes(`${c}:${s}`), `${c}:${s}`)
  }
  for (const s of SITE_KEYS) assert.ok(names.includes(`site:${s}`), `site:${s}`)
  assert.deepEqual(paths, [['/', 'layout']])
})
