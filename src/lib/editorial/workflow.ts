/**
 * Approval workflow of a page or article: draft → in review → approved or changes requested.
 * Pure rules, no Payload; the endpoint (src/collections/editorial/endpoint.ts) applies them.
 *
 * Publishing is separate (src/access/siteAccess.ts): a publisher may publish at any time, and
 * approval is how an editor's work reaches a publisher. Editing a document that is in review or
 * approved sends it back to draft, so an approval always matches the text that was approved.
 */
export const WORKFLOW_STATES = ['draft', 'in-review', 'approved', 'changes-requested'] as const
export type WorkflowState = (typeof WORKFLOW_STATES)[number]

export const WORKFLOW_ACTIONS = ['submit', 'approve', 'request-changes'] as const
export type WorkflowAction = (typeof WORKFLOW_ACTIONS)[number]

export const WORKFLOW_LABELS: Record<WorkflowState, string> = {
  draft: 'Utkast',
  'in-review': 'Til godkjenning',
  approved: 'Godkjent',
  'changes-requested': 'Endringer ønskes',
}

export const ACTION_LABELS: Record<WorkflowAction, string> = {
  submit: 'Send til godkjenning',
  approve: 'Godkjenn',
  'request-changes': 'Be om endringer',
}

/** Who may take an action: `edit` the roles that edit content, `review` the roles that approve. */
const ACTIONS: Record<WorkflowAction, { from: WorkflowState[]; to: WorkflowState; by: 'edit' | 'review' }> = {
  submit: { from: ['draft', 'changes-requested'], to: 'in-review', by: 'edit' },
  approve: { from: ['in-review'], to: 'approved', by: 'review' },
  'request-changes': { from: ['in-review'], to: 'changes-requested', by: 'review' },
}

export const isWorkflowState = (value: unknown): value is WorkflowState => WORKFLOW_STATES.includes(value as WorkflowState)
export const isWorkflowAction = (value: unknown): value is WorkflowAction => WORKFLOW_ACTIONS.includes(value as WorkflowAction)

export type Permissions = { edit: boolean; review: boolean }

export type Transition = { ok: true; to: WorkflowState } | { ok: false; reason: 'wrong-state' | 'not-allowed'; message: string }

/** The state a document is in; documents from before the workflow existed have none and count as draft. */
export const stateOf = (value: unknown): WorkflowState => (isWorkflowState(value) ? value : 'draft')

export function transition(state: WorkflowState, action: WorkflowAction, can: Permissions): Transition {
  const rule = ACTIONS[action]
  if (!can[rule.by]) return { ok: false, reason: 'not-allowed', message: `Du har ikke tilgang til «${ACTION_LABELS[action]}».` }
  if (!rule.from.includes(state)) {
    return { ok: false, reason: 'wrong-state', message: `«${ACTION_LABELS[action]}» passer ikke når status er «${WORKFLOW_LABELS[state]}».` }
  }
  return { ok: true, to: rule.to }
}

/** The actions open to someone in a state; the admin panel shows one button for each. */
export function availableActions(state: WorkflowState, can: Permissions): WorkflowAction[] {
  return WORKFLOW_ACTIONS.filter((action) => transition(state, action, can).ok)
}

/**
 * The state after a save that changes the document. Edits withdraw a pending or granted approval;
 * publishing keeps it (it is what the publisher acted on).
 */
export function stateAfterEdit(state: WorkflowState, publishing: boolean): WorkflowState {
  if (publishing) return state
  return state === 'in-review' || state === 'approved' ? 'draft' : state
}
