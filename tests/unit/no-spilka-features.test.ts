import assert from 'node:assert/strict'
import { test } from 'node:test'

import { pageBlocks } from '../../src/blocks/configs'
import { customBlocks } from '../../site/blocks/custom/configs'

test('the kit ships only general-purpose blocks', () => {
  // A site's own blocks (site/blocks/custom) are not part of the kit.
  const custom = new Set(customBlocks.map((b) => b.slug))
  const slugs = pageBlocks.map((b) => b.slug).filter((slug) => !custom.has(slug))
  for (const gone of ['divisionCards', 'frameWeight', 'imageSequence']) assert.ok(!slugs.includes(gone), gone)
  assert.equal(slugs.length, 19)
})
