import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { checkQuestions } from '../../src/lib/questions'
import { siteConfig } from '../../site/config'

const shipped = () => JSON.parse(readFileSync('site/questions.json', 'utf8'))
const cfg = siteConfig as unknown as Record<string, unknown>

test('the shipped questions are valid against this site\'s config', () => {
  assert.deepEqual(checkQuestions(shipped(), cfg), [])
})

test('the checker catches duplicate ids, unknown types, choices without options and paths that do not exist', () => {
  const q = shipped()
  q.questions.push({ ...q.questions[0] })
  q.questions.push({ id: 'colour', text: 'x', type: 'colourpicker', sets: ['report.colour'] })
  q.questions.push({ id: 'pick', text: 'x', type: 'choice', options: [{ value: 'a', label: 'A' }], sets: ['report.pick'] })
  q.questions.push({ id: 'wrong', text: 'x', type: 'text', sets: ['features.nope'] })
  const problems = checkQuestions(q, cfg).join('\n')
  assert.match(problems, /duplicate id/)
  assert.match(problems, /colour: unknown type/)
  assert.match(problems, /pick: needs at least two options/)
  assert.match(problems, /wrong: features\.nope is not in site\/config\.ts/)
})

test('* in a path matches any key, and report./cms. paths are always allowed', () => {
  const q = { version: 1, questions: [{ id: 'domain', text: 'x', type: 'text', sets: ['sites.*.origin', 'report.goLive', 'cms.privacyPage'] }] }
  assert.deepEqual(checkQuestions(q, cfg), [])
})
