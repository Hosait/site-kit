import assert from 'node:assert/strict'
import { test } from 'node:test'

import { pageBlocks } from '../../src/blocks/configs'
import { alignClass, assertUniqueSlugs } from '../../src/blocks/variants'

const fieldNames = (slug: string) =>
  (pageBlocks.find((b) => b.slug === slug)?.fields ?? []).flatMap((f) => ('name' in f ? [f.name] : []))

test('section blocks offer a background, text blocks an alignment', () => {
  for (const slug of ['timeline', 'accordion', 'facts', 'people', 'documents', 'articleFeed', 'imageGrid', 'childPages', 'video'])
    assert.ok(fieldNames(slug).includes('background'), `${slug} background`)
  for (const slug of ['hero', 'cta', 'quote', 'cards', 'stats'])
    assert.ok(fieldNames(slug).includes('align'), `${slug} align`)
})

test('alignClass maps only known values', () => {
  assert.equal(alignClass('center'), 'text-center mx-auto')
  assert.equal(alignClass('left'), '')
  assert.equal(alignClass('<script>'), '')
})

test('duplicate slugs between kit and custom blocks are refused', () => {
  assert.throws(() => assertUniqueSlugs([{ slug: 'hero', fields: [] }, { slug: 'hero', fields: [] }]), /hero/)
})
