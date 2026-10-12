import assert from 'node:assert/strict'
import { test } from 'node:test'

import { formRetentionFields } from '../../src/collections/formRetentionFields'

test('the admin offers the site default (named), a number of days, or keep', () => {
  const [choice] = formRetentionFields(90) as any[]
  assert.equal(choice.name, 'retention')
  assert.equal(choice.defaultValue, 'default')
  assert.deepEqual(choice.options.map((o: any) => o.value), ['default', 'days', 'keep'])
  assert.match(choice.options[0].label, /90/)
  assert.match((formRetentionFields(null) as any[])[0].options[0].label, /behold/i)
})

test('days are required and checked only when "Number of days" is chosen', () => {
  const days = (formRetentionFields(90) as any[])[1]
  const v = (value: unknown, retention: string) => days.validate(value, { siblingData: { retention } })
  assert.equal(v(undefined, 'default'), true)
  assert.equal(v(undefined, 'keep'), true)
  assert.equal(v(30, 'days'), true)
  for (const bad of [undefined, 0, 3651, 2.5]) assert.equal(typeof v(bad, 'days'), 'string', String(bad))
})
