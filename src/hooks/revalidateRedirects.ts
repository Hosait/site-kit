import type { CollectionAfterChangeHook } from 'payload'
import { revalidateTag } from 'next/cache'

/** Tømmer cachen for omdirigeringer. Utenfor Next (skript) finnes ingen cache – da gjør vi ingenting. */
export const revalidateRedirects: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (context.disableRevalidate) return doc
  try {
    revalidateTag('redirects', 'max')
  } catch {
    // Kjører i et skript; skriptet tømmer cachen via /next/revalidate til slutt.
  }
  return doc
}
