import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import blocks from '../../schema/blocks.schema.json'
import { LOCALES } from '../../src/lib/sites'
import { PLAN_CHOICES } from '../../src/lib/site-plan/choices'
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

test('the shipped schema/site-plan.schema.json lists this site\'s locales, the kit\'s block types and the site\'s choices', () => {
  const schema = JSON.parse(readFileSync('schema/site-plan.schema.json', 'utf8'))
  let localeMaps = 0
  let blockTypeNodes = 0
  const choices = new Set<string>()
  walk(schema, (o) => {
    const pn = o.propertyNames as { enum?: string[] } | undefined
    if (pn?.enum) { localeMaps++; assert.deepEqual(pn.enum, LOCALES) }
    if (o.$comment === 'blockType') { blockTypeNodes++; assert.deepEqual(o.enum, blocks.blockTypes) }
    if (typeof o.$comment === 'string' && o.$comment in PLAN_CHOICES) {
      choices.add(o.$comment)
      assert.deepEqual(o.enum, PLAN_CHOICES[o.$comment as keyof typeof PLAN_CHOICES], o.$comment)
    }
  })
  assert.ok(localeMaps > 0 && blockTypeNodes > 0)
  assert.deepEqual([...choices].sort(), Object.keys(PLAN_CHOICES).sort())
})

// kit:schema regenerates the schema files, so it must not need them to load: validate.ts compiles them.
test('kit:schema takes the choices from a module that does not load the schemas', () => {
  const script = readFileSync('scripts/kit/schema.ts', 'utf8')
  assert.doesNotMatch(script, /site-plan\/validate/)
  assert.doesNotMatch(readFileSync('src/lib/site-plan/choices.ts', 'utf8'), /schema\.json|validate/)
})

test('stampSchema fills a value marked with a choice name from the site\'s own options', () => {
  const input = { kind: { $comment: 'articleKind', type: 'string' }, other: { $comment: 'note', type: 'string' } }
  assert.deepEqual(stampSchema(input, ['no'], undefined, { articleKind: ['news', 'blog'] }), {
    kind: { $comment: 'articleKind', type: 'string', enum: ['news', 'blog'] },
    other: { $comment: 'note', type: 'string' },
  })
})
