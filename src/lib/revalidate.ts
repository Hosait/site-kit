import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidateTag } from 'next/cache'

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
