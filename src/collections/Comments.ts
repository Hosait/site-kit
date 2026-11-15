import type { Access, CollectionBeforeChangeHook, CollectionConfig, Where } from 'payload'
import { APIError } from 'payload'

import { belongsToSite, isAdmin, memberOfSite, siteMemberFilter } from '@/access/siteAccess'
import { SINGLE_SITE, SITE_OPTIONS } from '@/lib/sites'
import type { User } from '@/payload-types'

/**
 * Comments on a page or article, shown in the sidebar of its edit view
 * (src/components/admin/EditorialPanel.tsx). A comment may point at one section (`blockId`) and
 * may answer another (`parent`, one level of replies). Everyone with a role on the site reads
 * and writes comments; only the author changes the text, anyone marks one resolved.
 */
const ownWords = (user: User): Where => ({ author: { equals: user.id } })

const canCreate: Access = ({ req: { user } }) => siteMemberFilter(user as User | null, SINGLE_SITE) !== false

const canDelete: Access = ({ req: { user } }) => {
  const u = user as User | null
  const members = siteMemberFilter(u, SINGLE_SITE)
  if (!u || members === false) return false
  if (isAdmin(u)) return true
  return members === true ? ownWords(u) : { and: [members, ownWords(u)] }
}

/** Sets author and site from the request and the document, so neither can be forged. */
const prepare: CollectionBeforeChangeHook = async ({ data, originalDoc, operation, req }) => {
  const user = req.user as User | null
  if (!user) throw new APIError('Logg inn for å kommentere.', 401)

  if (operation === 'update') {
    // `data` holds the whole comment. Put back what may not change: the author may reword,
    // someone else may only mark it resolved or open again.
    const author = typeof originalDoc?.author === 'object' ? originalDoc.author?.id : originalDoc?.author
    const fixed = author === user.id || isAdmin(user) ? ['doc', 'author', 'parent', 'site'] : ['doc', 'author', 'parent', 'site', 'text', 'blockId']
    for (const key of fixed) data[key] = originalDoc?.[key]
    return data
  }

  const target = data.doc as { relationTo?: 'pages' | 'articles'; value?: number | string | { id: number | string } } | undefined
  const value = typeof target?.value === 'object' ? target.value.id : target?.value
  if (!target?.relationTo || value === undefined) throw new APIError('Kommentaren må høre til en side eller artikkel.', 400)
  const doc = await req.payload.findByID({ collection: target.relationTo, id: value, depth: 0, draft: true, overrideAccess: true, req }).catch(() => null)
  if (!doc || !belongsToSite(user, doc.site, SINGLE_SITE)) throw new APIError('Fant ikke dokumentet.', 404)

  let parent = typeof data.parent === 'object' ? data.parent?.id : data.parent
  if (parent) {
    const answered = await req.payload.findByID({ collection: 'comments', id: parent, depth: 0, overrideAccess: true, req }).catch(() => null)
    const same = answered && answered.doc.relationTo === target.relationTo && String(typeof answered.doc.value === 'object' ? answered.doc.value.id : answered.doc.value) === String(value)
    if (!answered || !same) throw new APIError('Svaret hører til en annen kommentar enn dokumentet.', 400)
    // A reply to a reply goes in the same thread.
    const above = typeof answered.parent === 'object' && answered.parent ? answered.parent.id : answered.parent
    parent = above ?? parent
  }
  return { ...data, parent: parent ?? null, author: user.id, site: doc.site, resolved: false }
}

export const Comments: CollectionConfig = {
  slug: 'comments',
  labels: { singular: 'Kommentar', plural: 'Kommentarer' },
  access: { read: memberOfSite, create: canCreate, update: memberOfSite, delete: canDelete },
  admin: { hidden: true, useAsTitle: 'text', defaultColumns: ['text', 'author', 'resolved', 'createdAt'] },
  defaultSort: 'createdAt',
  fields: [
    { name: 'doc', type: 'relationship', relationTo: ['pages', 'articles'], label: 'Side eller artikkel', required: true, index: true },
    { name: 'blockId', type: 'text', label: 'Seksjon (ID)', index: true },
    { name: 'author', type: 'relationship', relationTo: 'users', label: 'Skrevet av', admin: { readOnly: true } },
    { name: 'text', type: 'textarea', label: 'Kommentar', required: true, maxLength: 2000 },
    { name: 'parent', type: 'relationship', relationTo: 'comments', label: 'Svar på' },
    { name: 'resolved', type: 'checkbox', label: 'Løst', defaultValue: false },
    { name: 'site', type: 'select', label: 'Nettsted', options: SITE_OPTIONS, index: true, admin: { hidden: true } },
  ],
  hooks: { beforeChange: [prepare] },
  timestamps: true,
}
