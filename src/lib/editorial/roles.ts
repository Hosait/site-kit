/**
 * What each user role (Users.role) may do with content. Plain strings and no imports, so the
 * server's access control (src/access/siteAccess.ts) and the admin panel use the same rules.
 *
 * admin: everything. publisher: edits and publishes. editor: edits and saves drafts, cannot
 * publish. reviewer: reads, comments, approves or asks for changes.
 */
export const ROLES = ['admin', 'publisher', 'editor', 'reviewer'] as const
export type RoleName = (typeof ROLES)[number]

type MaybeRole = string | null | undefined

/** May create and change content (drafts at least). */
export const rolesThatEdit = (role: MaybeRole): boolean => role === 'admin' || role === 'publisher' || role === 'editor'
/** May set `_status: 'published'`. */
export const rolesThatPublish = (role: MaybeRole): boolean => role === 'admin' || role === 'publisher'
/** May approve or ask for changes (a publisher's own publishing right needs no approval). */
export const rolesThatReview = (role: MaybeRole): boolean => rolesThatPublish(role) || role === 'reviewer'
