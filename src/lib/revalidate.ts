import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

import { SITE_KEYS } from './sites'

/**
 * Sidene er statisk generert og merket med cache-tagger. Når et dokument publiseres
 * eller endres, tømmer vi taggen for samlingen og nettstedet. Det er grovkornet, men
 * trygt: alle lister, menyer og artikkelstrømmer som kan vise dokumentet, bygges på nytt.
 */
function tagsFor(collection: string, site?: string | null): string[] {
  const tags = [collection]
  if (site) tags.push(`${collection}:${site}`, `site:${site}`)
  return tags
}

function revalidate(tags: string[]) {
  for (const tag of tags) {
    try {
      revalidateTag(tag, 'max')
    } catch {
      // Utenfor Next-runtime (skript, migrering) finnes ingen cache å tømme.
    }
  }
}

export const revalidateDoc: CollectionAfterChangeHook = ({ doc, previousDoc, collection, req }) => {
  if (req.context.disableRevalidate) return doc
  const changedVisibility = doc._status === 'published' || previousDoc?._status === 'published'
  if (doc._status === undefined || changedVisibility) {
    revalidate(tagsFor(collection.slug, doc.site))
    if (previousDoc?.site && previousDoc.site !== doc.site) revalidate(tagsFor(collection.slug, previousDoc.site))
  }
  return doc
}

export const revalidateDocDelete: CollectionAfterDeleteHook = ({ doc, collection, req }) => {
  if (!req.context.disableRevalidate) revalidate(tagsFor(collection.slug, doc?.site))
  return doc
}

const CONTENT_TAGS = ['pages', 'articles', 'people', 'documents', 'media', 'site-settings', 'redirects']

/**
 * Tømmer all cache etter en import eller et skript som skriver direkte til databasen.
 * Taggene utløper med en gang (expire: 0): med profilen 'max' får første besøkende den gamle siden
 * (et 404 for en side som ikke fantes før importen) mens den nye bygges.
 */
export function flushAllCaches(
  revalidate: (tag: string, profile: { expire: number }) => void = revalidateTag,
  revalidateLayout: (path: string, type: 'layout') => void = revalidatePath,
): void {
  const now = { expire: 0 }
  for (const c of CONTENT_TAGS) {
    revalidate(c, now)
    for (const s of SITE_KEYS) revalidate(`${c}:${s}`, now)
  }
  for (const s of SITE_KEYS) revalidate(`site:${s}`, now)
  revalidateLayout('/', 'layout')
}
