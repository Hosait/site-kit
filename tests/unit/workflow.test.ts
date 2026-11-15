import assert from 'node:assert/strict'
import { test } from 'node:test'

import { rolesThatEdit, rolesThatPublish, rolesThatReview } from '../../src/lib/editorial/roles'
import { availableActions, stateAfterEdit, stateOf, transition, WORKFLOW_ACTIONS, WORKFLOW_STATES } from '../../src/lib/editorial/workflow'

const editor = { edit: true, review: false }
const reviewer = { edit: false, review: true }
const nobody = { edit: false, review: false }

test('the roles: who edits, who publishes, who reviews', () => {
  const table = (fn: (r: string) => boolean) => Object.fromEntries(['admin', 'publisher', 'editor', 'reviewer'].map((r) => [r, fn(r)]))
  assert.deepEqual(table(rolesThatEdit), { admin: true, publisher: true, editor: true, reviewer: false })
  assert.deepEqual(table(rolesThatPublish), { admin: true, publisher: true, editor: false, reviewer: false })
  assert.deepEqual(table(rolesThatReview), { admin: true, publisher: true, editor: false, reviewer: true })
  assert.equal(rolesThatEdit(undefined), false)
  assert.equal(rolesThatPublish('unknown'), false)
})

test('the happy path: draft → in review → approved', () => {
  assert.deepEqual(transition('draft', 'submit', editor), { ok: true, to: 'in-review' })
  assert.deepEqual(transition('in-review', 'approve', reviewer), { ok: true, to: 'approved' })
})

test('changes requested: back to the author, who sends it again', () => {
  assert.deepEqual(transition('in-review', 'request-changes', reviewer), { ok: true, to: 'changes-requested' })
  assert.deepEqual(transition('changes-requested', 'submit', editor), { ok: true, to: 'in-review' })
})

test('every other combination of state and action is refused with the state in the message', () => {
  const allowed = new Set(['draft/submit', 'changes-requested/submit', 'in-review/approve', 'in-review/request-changes'])
  for (const state of WORKFLOW_STATES) {
    for (const action of WORKFLOW_ACTIONS) {
      const result = transition(state, action, { edit: true, review: true })
      assert.equal(result.ok, allowed.has(`${state}/${action}`), `${state}/${action}`)
      if (!result.ok) {
        assert.equal(result.reason, 'wrong-state')
        assert.match(result.message, /passer ikke/)
      }
    }
  }
})

test('who may act: editors submit, reviewers decide, nobody else does anything', () => {
  assert.equal(transition('in-review', 'approve', editor).ok, false)
  assert.equal(transition('draft', 'submit', reviewer).ok, false)
  for (const state of WORKFLOW_STATES) for (const action of WORKFLOW_ACTIONS) assert.equal(transition(state, action, nobody).ok, false)
  const refused = transition('in-review', 'approve', editor)
  assert.ok(!refused.ok && refused.reason === 'not-allowed')
  // Not allowed comes before wrong state, so a refusal never reveals the state to someone who may not act.
  const both = transition('draft', 'approve', editor)
  assert.ok(!both.ok && both.reason === 'not-allowed')
})

test('the buttons shown to each kind of user', () => {
  assert.deepEqual(availableActions('draft', editor), ['submit'])
  assert.deepEqual(availableActions('in-review', editor), [])
  assert.deepEqual(availableActions('in-review', reviewer), ['approve', 'request-changes'])
  assert.deepEqual(availableActions('approved', { edit: true, review: true }), [])
  assert.deepEqual(availableActions('changes-requested', { edit: true, review: true }), ['submit'])
})

test('editing withdraws a pending or granted approval; publishing keeps it', () => {
  assert.equal(stateAfterEdit('approved', false), 'draft')
  assert.equal(stateAfterEdit('in-review', false), 'draft')
  assert.equal(stateAfterEdit('changes-requested', false), 'changes-requested')
  assert.equal(stateAfterEdit('draft', false), 'draft')
  assert.equal(stateAfterEdit('approved', true), 'approved')
})

test('a document from before the workflow, or with a damaged value, counts as draft', () => {
  assert.equal(stateOf(undefined), 'draft')
  assert.equal(stateOf(null), 'draft')
  assert.equal(stateOf('published'), 'draft')
  assert.equal(stateOf('approved'), 'approved')
})
