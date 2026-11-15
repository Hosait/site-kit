import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig } from 'payload'

import { isLive } from '@/collections/editorial/hooks'
import { auditOperation, changedFieldNames, docLabel } from '@/lib/editorial/audit'

type Row = {
  collection: string
  docId: string
  docTitle: string
  site: string | null
  operation: 'create' | 'update' | 'publish' | 'unpublish' | 'delete'
  changedFields: string[]
}

async function write(req: Parameters<CollectionAfterChangeHook>[0]['req'], row: Row) {
  // Same request and transaction as the change: a change is saved together with its row or not at all.
  await req.payload.create({
    collection: 'content-audit-log',
    data: { ...row, user: req.user?.id ?? null, actor: req.user?.email ?? 'system' },
    overrideAccess: true,
    req,
  })
}

const auditChange: CollectionAfterChangeHook = async ({ collection, doc, previousDoc, operation, req }) => {
  // Autosave stores a draft every few hundred milliseconds while someone types; only saves are logged.
  if (req.context.skipAudit || String(req.query?.autosave) === 'true') return doc
  const before = operation === 'create' ? null : previousDoc
  const changedFields = changedFieldNames(before, doc)
  // «Live» is the published document itself: a draft saved over it leaves it live, which `doc._status` alone cannot tell.
  const wasLive = operation === 'update' && Boolean(req.context.wasLive)
  const nowLive = doc._status !== undefined && (await isLive(req, collection.slug, doc.id))
  const kind = auditOperation(operation, wasLive, nowLive)
  if (operation === 'update' && kind === 'update' && changedFields.length === 0) return doc
  await write(req, {
    collection: collection.slug,
    docId: String(doc.id),
    docTitle: docLabel(doc),
    site: typeof doc.site === 'string' ? doc.site : null,
    operation: kind,
    changedFields,
  })
  return doc
}

const auditDelete: CollectionAfterDeleteHook = async ({ collection, doc, id, req }) => {
  if (req.context.skipAudit) return doc
  await write(req, {
    collection: collection.slug,
    docId: String(id),
    docTitle: docLabel(doc),
    site: typeof doc?.site === 'string' ? doc.site : null,
    operation: 'delete',
    changedFields: [],
  })
  return doc
}

/** Adds the audit hooks (after the collection's own) so every create, change, publish and delete is logged. */
export function withAudit<C extends CollectionConfig>(collection: C): C {
  return {
    ...collection,
    hooks: {
      ...collection.hooks,
      afterChange: [...(collection.hooks?.afterChange ?? []), auditChange],
      afterDelete: [...(collection.hooks?.afterDelete ?? []), auditDelete],
    },
  }
}
