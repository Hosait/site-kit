import type { Access, Where } from 'payload'

import { rolesThatEdit, rolesThatPublish, rolesThatReview } from '@/lib/editorial/roles'
import { SINGLE_SITE } from '@/lib/sites'
import type { User } from '@/payload-types'

/** The rules per role are in src/lib/editorial/roles.ts; these take the signed-in user. */
type Who = User | null | undefined

export const isAdmin = (user: Who): boolean => user?.role === 'admin'
/** May create and change content (drafts at least). */
export const canEditContent = (user: Who): boolean => rolesThatEdit(user?.role)
/** May set `_status: 'published'`: publish, schedule a publication, restore a published version. */
export const canPublish = (user: Who): boolean => rolesThatPublish(user?.role)
/** May approve or ask for changes. */
export const canReview = (user: Who): boolean => rolesThatReview(user?.role)

/** Whether a save or restore carries `_status: 'published'` (a per-locale object also counts). */
export function publishesStatus(data: { _status?: unknown } | null | undefined): boolean {
  const status = data?._status
  if (status === 'published') return true
  return typeof status === 'object' && status !== null && Object.values(status).includes('published')
}

/** Which sites a user belongs to. One site: everyone with a role belongs to it. */
export function siteMemberFilter(user: User | null, singleSite: boolean): boolean | Where {
  if (!user?.role) return false
  if (isAdmin(user) || singleSite) return true
  const sites = user.sites ?? []
  if (sites.length === 0) return false
  return { site: { in: sites } } as Where
}

/** Whether the user belongs to the given site (a document's `site`). */
export function belongsToSite(user: User | null, site: string | null | undefined, singleSite: boolean): boolean {
  const filter = siteMemberFilter(user, singleSite)
  if (typeof filter === 'boolean') return filter
  return Boolean(site && (user?.sites ?? []).includes(site as never))
}

/** Admins: everything. One site: every editor. Several sites: only the sites an editor has. Reviewers never edit. */
export function editorFilter(user: User | null, singleSite: boolean): boolean | Where {
  if (!canEditContent(user)) return false
  return siteMemberFilter(user, singleSite)
}

export const editorOfSite: Access = ({ req: { user } }) => editorFilter(user as User | null, SINGLE_SITE)

/** Everyone with a role on the site, reviewers included. */
export const memberOfSite: Access = ({ req: { user } }) => siteMemberFilter(user as User | null, SINGLE_SITE)

/** Publisert innhold er offentlig; utkast krever innlogging. */
export const publishedOrLoggedIn: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

export const adminOnly: Access = ({ req: { user } }) => isAdmin(user as User | null)

/**
 * Opprette krever bare at brukeren er redaktør for minst ett nettsted (feltet `site` sjekkes ved lagring).
 * Publishing at creation needs the publish right.
 */
export const canCreateContent: Access = ({ req: { user }, data }) => {
  const u = user as User | null
  if (!u || editorFilter(u, SINGLE_SITE) === false) return false
  return !publishesStatus(data) || canPublish(u)
}

/**
 * Update access for collections with drafts. Setting `_status: 'published'` (publish, schedule,
 * restore a published version) needs the publish right; every role that edits may save drafts.
 * A publication that comes without `_status` in the data is caught by `guardPublish`.
 */
export const updateDraftContent: Access = ({ req: { user }, data }) => {
  const u = user as User | null
  const filter = editorFilter(u, SINGLE_SITE)
  if (filter === false) return false
  if (publishesStatus(data) && !canPublish(u)) return false
  return filter
}

/** Deleting a published document takes it off the site, so editors may delete only what was never published. */
export const deleteDraftContent: Access = ({ req: { user } }) => {
  const u = user as User | null
  const filter = editorFilter(u, SINGLE_SITE)
  if (filter === false || canPublish(u)) return filter
  const unpublished: Where = { _status: { not_equals: 'published' } }
  return filter === true ? unpublished : { and: [filter, unpublished] }
}
