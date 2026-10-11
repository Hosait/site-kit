import assert from 'node:assert/strict'
import { test } from 'node:test'

import { pageBlocks } from '../../src/blocks/configs'

test('the kit ships only general-purpose blocks', () => {
  const slugs = pageBlocks.map((b) => b.slug)
  for (const gone of ['divisionCards', 'frameWeight', 'imageSequence']) assert.ok(!slugs.includes(gone), gone)
  assert.equal(slugs.length, 19)
})
