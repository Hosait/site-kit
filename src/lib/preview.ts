import { localePath, SITES, type Locale, type SiteKey } from './sites'
import { DEFAULT_SITE } from '@/lib/sites'

type PreviewDoc = { site?: SiteKey | null; path?: string | null; slug?: string | null; kind?: string | null }

/**
 * Adresse til forhåndsvisning i admin. Går via /next/preview som slår på draft mode
 * og sender videre til siden. `?site=` gjør at forhåndsvisningen virker på én vert.
 */
export function previewUrl(collection: 'pages' | 'articles', data: Partial<PreviewDoc> | undefined, locale?: string) {
  const loc: Locale = locale === 'en' ? 'en' : 'no'
  const site = (data?.site ?? DEFAULT_SITE) as SiteKey
  const path =
    collection === 'pages'
      ? localePath(loc, data?.path ?? '')
      : localePath(loc, `${SITES[site].articleBase[loc]}/${data?.slug ?? ''}`)
  const params = new URLSearchParams({
    path,
    site,
    previewSecret: process.env.PREVIEW_SECRET || '',
  })
  return `/next/preview?${params.toString()}`
}
