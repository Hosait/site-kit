import assert from 'node:assert/strict'
import { test } from 'node:test'

import type { Page } from '../../src/payload-types'
import { buildMetadata } from '../../src/lib/seo'

// Next merges a page's metadata over the layout's key by key, and a key that is present but
// undefined still counts: `robots: undefined` wiped the layout's staging noindex on every page.
const page = (meta: Page['meta'] = {}) => ({ id: 1, title: 'Om oss', site: 'main', layout: [], meta, updatedAt: '', createdAt: '' }) as unknown as Page
const metadata = (doc: Page) => buildMetadata({ site: 'main', locale: 'no', doc, path: '/no/om-oss', alternates: {} })

test('a page not marked noindex leaves robots to the layout, which says noindex on staging', () => {
  assert.equal('robots' in metadata(page()), false)
})

test('a page marked noindex says so itself', () => {
  assert.deepEqual(metadata(page({ noindex: true })).robots, { index: false, follow: true })
})
