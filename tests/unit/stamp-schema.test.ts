import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import blocks from '../../schema/blocks.schema.json'
import { LOCALES } from '../../src/lib/sites'
import { stampSchema } from '../../src/lib/site-plan/stamp-schema'

test('stampSchema replaces every locale enum and fills blockType enums, leaving the rest alone', () => {
  const input = { a: { propertyNames: { enum: ['no', 'en'] }, x: 1 }, b: [{ $comment: 'blockType', type: 'string' }] }
  assert.deepEqual(stampSchema(input, ['sv', 'en'], ['hero', 'cta']), {
    a: { propertyNames: { enum: ['sv', 'en'] }, x: 1 },
    b: [{ $comment: 'blockType', type: 'string', enum: ['hero', 'cta'] }],
  })
  assert.deepEqual(stampSchema(input, ['sv']), { a: { propertyNames: { enum: ['sv'] }, x: 1 }, b: [{ $comment: 'blockType', type: 'string' }] })
})

function walk(n: unknown, visit: (o: Record<string, unknown>) => void) {
  if (Array.isArray(n)) return n.forEach((x) => walk(x, visit))
  if (!n || typeof n !== 'object') return
  visit(n as Record<string, unknown>)
  Object.values(n).forEach((x) => walk(x, visit))
}

test('the shipped schema/site-plan.schema.json lists this site\'s locales and the kit\'s block types', () => {
  const schema = JSON.parse(readFileSync('schema/site-plan.schema.json', 'utf8'))
  let localeMaps = 0
  let blockTypeNodes = 0
  walk(schema, (o) => {
    const pn = o.propertyNames as { enum?: string[] } | undefined
    if (pn?.enum) { localeMaps++; assert.deepEqual(pn.enum, LOCALES) }
    if (o.$comment === 'blockType') { blockTypeNodes++; assert.deepEqual(o.enum, blocks.blockTypes) }
  })
  assert.ok(localeMaps > 0 && blockTypeNodes > 0)
})

test('stampSchema fills a value marked with a choice name from the site\'s own options', () => {
  const input = { kind: { $comment: 'articleKind', type: 'string' }, other: { $comment: 'note', type: 'string' } }
  assert.deepEqual(stampSchema(input, ['no'], undefined, { articleKind: ['news', 'blog'] }), {
    kind: { $comment: 'articleKind', type: 'string', enum: ['news', 'blog'] },
    other: { $comment: 'note', type: 'string' },
  })
})
