import type { Field } from 'payload'

import { WORKFLOW_LABELS, WORKFLOW_STATES } from '@/lib/editorial/workflow'

const nobody = () => false

/**
 * Fields of a collection with drafts. `workflow` and `submittedBy` change only through the
 * workflow endpoint (endpoint.ts), never by a save, so nobody can approve their own text by
 * sending the field; `editorial` is the sidebar panel with the approval buttons and comments.
 */
export const editorialFields = (): Field[] => [
  {
    name: 'workflow',
    type: 'select',
    label: 'Godkjenning',
    defaultValue: 'draft',
    index: true,
    options: WORKFLOW_STATES.map((value) => ({ value, label: WORKFLOW_LABELS[value] })),
    access: { create: nobody, update: nobody },
    admin: { hidden: true },
  },
  {
    name: 'submittedBy',
    type: 'relationship',
    relationTo: 'users',
    label: 'Sendt til godkjenning av',
    access: { create: nobody, update: nobody },
    admin: { hidden: true },
  },
  {
    name: 'editorial',
    type: 'ui',
    admin: { position: 'sidebar', components: { Field: '/components/admin/EditorialPanel#EditorialPanel' } },
  },
]
