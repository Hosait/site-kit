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

test('a question that sets the locales offers only locales the kit has strings for', () => {
  const q = { version: 1, questions: [{ id: 'languages', text: 'x', type: 'multi', options: [{ value: 'no', label: 'Norwegian' }, { value: 'sv', label: 'Swedish' }], sets: ['locales', 'defaultLocale'] }] }
  assert.deepEqual(checkQuestions(q, cfg), ['languages: sv is not a locale the kit supports (no, en)'])
})

test('the editors question offers no sign-in the kit does not have', () => {
  const q = shipped().questions.find((x: { id: string }) => x.id === 'editors')
  assert.ok(q)
  assert.doesNotMatch(q.text, /microsoft|entra|azure|google sign-in|sso/i)
})

// Bjørn's review of #14: asking about a CRM or a job feed invites integrations a move declines.
test('the integrations question asks only for simple embeds, and says connections to other systems are not part of a move', () => {
  const q = shipped().questions.find((x: { id: string }) => x.id === 'integrations')
  assert.ok(q)
  assert.doesNotMatch(q.text, /crm|job feed|newsletter|connect/i)
  for (const thing of [/map/, /video/, /form/]) assert.match(q.text, thing)
  assert.match(q.help ?? '', /not part of a move/)
})

test('* in a path matches any key, and report./cms. paths are always allowed', () => {
  const q = { version: 1, questions: [{ id: 'domain', text: 'x', type: 'text', sets: ['sites.*.origin', 'report.goLive', 'cms.privacyPage'] }] }
  assert.deepEqual(checkQuestions(q, cfg), [])
})

// The answer goes into a chat, a report and possibly the repository: ask what kind of access the
// customer can give, never for the secret itself.
test('the content-access question asks for the kind of access, not for a password or token', () => {
  const q = shipped().questions.find((x: { id: string }) => x.id === 'contentAccess')
  assert.ok(q)
  assert.doesNotMatch(q.text, /username|user name|brukernavn|last resort/i)
  assert.match(q.text, /never go into this chat, the repository or the report/i)
})
