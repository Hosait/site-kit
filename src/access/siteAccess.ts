import type { Access, Where } from 'payload'

import { SINGLE_SITE } from '@/lib/sites'
import type { User } from '@/payload-types'

export const isAdmin = (user: User | null | undefined): boolean => user?.role === 'admin'

/** Admins: everything. One site: every editor. Several sites: only the sites an editor has. */
export function editorFilter(user: User | null, singleSite: boolean): boolean | Where {
  if (!user) return false
  if (isAdmin(user)) return true
  if (singleSite) return true
  const sites = user.sites ?? []
  if (sites.length === 0) return false
  return { site: { in: sites } } as Where
}

export const editorOfSite: Access = ({ req: { user } }) => editorFilter(user as User | null, SINGLE_SITE)

/** Publisert innhold er offentlig; utkast krever innlogging. */
export const publishedOrLoggedIn: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

export const adminOnly: Access = ({ req: { user } }) => isAdmin(user as User | null)

/** Opprette krever bare at brukeren er redaktør for minst ett nettsted (feltet `site` sjekkes ved lagring). */
export const canCreateContent: Access = ({ req: { user } }) => {
  const u = user as User | null
  return Boolean(u && (isAdmin(u) || SINGLE_SITE || (u.sites ?? []).length > 0))
}
