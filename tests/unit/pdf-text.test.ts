import assert from 'node:assert/strict'
import { test } from 'node:test'

import { clipPdfText } from '../../src/lib/search/pdf'

// The search index's body field refuses more than 40,000 characters, and a refusal makes the
// document fail to save, so a long PDF must be clipped below that.
test('PDF text is clipped below the 40,000 characters the search index accepts, with spaces collapsed', () => {
  const long = Array.from({ length: 20_000 }, (_, i) => `ord${i}`).join('\n  ')
  const clipped = clipPdfText(long)
  assert.equal(clipped.length, 39_000)
  assert.ok(!/\s{2}|\n/.test(clipped))
})

test('a short PDF text is kept as it is, trimmed', () => {
  assert.equal(clipPdfText('  Årsrapport\n2025  '), 'Årsrapport 2025')
})
