import type { Access, Where } from 'payload'

import type { User } from '@/payload-types'

export const isAdmin = (user: User | null | undefined): boolean => user?.role === 'admin'

/**
 * Redaktører får bare endre innhold på nettstedene de er tildelt.
 * Administratorer får alt. Gjelder samlinger med feltet `site`.
 */
export const editorOfSite: Access = ({ req: { user } }) => {
  const u = user as User | null
  if (!u) return false
  if (isAdmin(u)) return true
  const sites = u.sites ?? []
  if (sites.length === 0) return false
  return { site: { in: sites } } as Where
}

/** Publisert innhold er offentlig; utkast krever innlogging. */
export const publishedOrLoggedIn: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

export const adminOnly: Access = ({ req: { user } }) => isAdmin(user as User | null)

/** Opprette krever bare at brukeren er redaktør for minst ett nettsted (feltet `site` sjekkes ved lagring). */
export const canCreateContent: Access = ({ req: { user } }) => {
  const u = user as User | null
  return Boolean(u && (isAdmin(u) || (u.sites ?? []).length > 0))
}
