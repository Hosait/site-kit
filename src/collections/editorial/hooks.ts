import {
  APIError,
  type CollectionAfterChangeHook,
  type CollectionAfterDeleteHook,
  type CollectionBeforeChangeHook,
  type CollectionSlug,
  type PayloadRequest,
} from 'payload'

import { canPublish, publishesStatus } from '@/access/siteAccess'
import { stateAfterEdit, stateOf } from '@/lib/editorial/workflow'
import type { User } from '@/payload-types'

/**
 * Publishing needs the publish right, whichever way the request is written. Access control
 * (siteAccess.ts) already refuses `_status: 'published'` in the data. This catches the rest: a
 * save that is not a draft save writes to the live document, and it does not have to say so.
 * Payload marks every draft save (`draft: true`, the admin's «Lagre utkast» and autosave) with
 * `_status: 'draft'` before the hooks run, so an update from someone who may not publish must
 * carry exactly that. Kit scripts and jobs run through the local API without a user and are not asked.
 */
export const guardPublish: CollectionBeforeChangeHook = async ({ collection, data, operation, originalDoc, req }) => {
  // Whether the live document was published before this save; the audit log and `guardUnpublish` read it.
  if (operation === 'update') req.context.wasLive = await isLive(req, collection.slug, originalDoc?.id)
  const user = req.user as User | null
  if (!user || canPublish(user)) return data
  const publishes = operation === 'update' ? data._status !== 'draft' : publishesStatus(data)
  if (publishes) throw new APIError('Du kan ikke publisere. Lagre som utkast og send til godkjenning, så publiserer en utgiver.', 403)
  return data
}

/** Whether the live (published) document of this id is published, read in the request's own transaction. */
export async function isLive(req: PayloadRequest, collection: CollectionSlug, id: number | string | undefined): Promise<boolean> {
  if (id === undefined) return false
  const row = (await req.payload.db.findOne({ collection, where: { id: { equals: id } }, req })) as { _status?: string } | null
  return row?._status === 'published'
}

/**
 * The other way off the site without the publish right: a save that is not a draft save, with a
 * draft pending, writes `_status: 'draft'` over the live document and takes the page off the
 * site, and so does «Avpubliser». Draft saves leave the live document alone, so a live document
 * that is no longer live afterwards is refused, and the save is rolled back. First in
 * `afterChange`, before anything is revalidated or indexed.
 */
export const guardUnpublish: CollectionAfterChangeHook = async ({ collection, doc, req }) => {
  const user = req.user as User | null
  if (!user || canPublish(user) || !req.context.wasLive || (await isLive(req, collection.slug, doc.id))) return doc
  throw new APIError('Du kan ikke avpublisere. Be en utgiver ta siden av nettstedet.', 403)
}

/** A change to the text sends a document in review or approved back to draft; «workflowTransition» marks the endpoint's own save. */
export const workflowOnChange: CollectionBeforeChangeHook = ({ data, originalDoc, operation, req }) => {
  if (req.context.workflowTransition || operation === 'create') return data
  const before = stateOf(originalDoc?.workflow)
  const after = stateAfterEdit(before, publishesStatus(data))
  if (after !== before) data.workflow = after
  return data
}

/** Comments go with the page or article they were written on. */
export const deleteComments: CollectionAfterDeleteHook = async ({ collection, id, req }) => {
  await req.payload.delete({
    collection: 'comments',
    where: { doc: { equals: { relationTo: collection.slug, value: id } } },
    req,
  })
}
