import type { Endpoint, PayloadRequest } from 'payload'
import { addDataAndFileToRequest } from 'payload'

import { belongsToSite, canEditContent, canReview } from '@/access/siteAccess'
import { emailRequester, emailReviewers } from '@/lib/editorial/notify'
import { isWorkflowAction, stateOf, transition } from '@/lib/editorial/workflow'
import { SINGLE_SITE } from '@/lib/sites'
import type { User } from '@/payload-types'

type Slug = 'pages' | 'articles'

const reply = (status: number, body: Record<string, unknown>) => Response.json(body, { status })

/**
 * POST /api/{pages|articles}/:id/workflow with { action: 'submit' | 'approve' | 'request-changes',
 * message? }. The one way the `workflow` field changes. The rules are in src/lib/editorial/workflow.ts;
 * the save runs with the user's name (audit log, versions) but skips access control, because a
 * reviewer may approve without being allowed to edit the text.
 */
export const workflowEndpoint = (slug: Slug): Endpoint => ({
  path: '/:id/workflow',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    const user = req.user as User | null
    if (!user) return reply(401, { error: 'Logg inn for å fortsette.' })
    await addDataAndFileToRequest(req)
    const { action, message } = (req.data ?? {}) as { action?: unknown; message?: unknown }
    if (!isWorkflowAction(action)) return reply(400, { error: 'Ukjent handling.' })
    const id = Number(req.routeParams?.id)
    if (!Number.isInteger(id)) return reply(400, { error: 'Mangler dokument.' })

    const doc = await req.payload.findByID({ collection: slug, id, draft: true, depth: 0, overrideAccess: true, req }).catch(() => null)
    if (!doc || !belongsToSite(user, doc.site, SINGLE_SITE)) return reply(404, { error: 'Fant ikke dokumentet.' })

    const step = transition(stateOf(doc.workflow), action, { edit: canEditContent(user), review: canReview(user) })
    if (!step.ok) return reply(step.reason === 'not-allowed' ? 403 : 409, { error: step.message })

    const note = typeof message === 'string' ? message.trim().slice(0, 2000) : ''
    const submitter = typeof doc.submittedBy === 'object' ? doc.submittedBy?.id : doc.submittedBy
    await req.payload.update({
      collection: slug,
      id,
      data: { workflow: step.to, ...(action === 'submit' ? { submittedBy: user.id } : {}) },
      draft: true,
      depth: 0,
      overrideAccess: true,
      context: { workflowTransition: true },
      req,
    })
    if (note) {
      await req.payload.create({ collection: 'comments', data: { doc: { relationTo: slug, value: id }, text: note }, overrideAccess: true, req })
    }

    const target = { collection: slug, id, title: doc.title ?? String(id), site: doc.site }
    let notified = 0
    if (action === 'submit') notified = (await emailReviewers(req.payload, target, user)).sent
    else if (await emailRequester(req.payload, target, submitter, action === 'approve', user, note)) notified = 1
    return reply(200, { ok: true, workflow: step.to, notified })
  },
})
