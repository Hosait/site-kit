import type { Locale } from '@/lib/sites'

export type Localized<T> = Partial<Record<Locale, T>>
/** Inside block data: { $media: ref } → media id, { $page: ref } → page id,
 *  { $pageLink: ref } → { relationTo: 'pages', value: id }, { $person: ref } / { $document: ref } / { $form: ref } → record id,
 *  { $html: '<p>…</p>' } → Lexical JSON. */
export type PlanValue = unknown
export type PlanBlock = { blockType: string } & Record<string, PlanValue>

export type PlanFormField = {
  type: 'text' | 'email' | 'textarea' | 'number' | 'checkbox' | 'select' | 'country' | 'message'
  name?: string
  label?: Localized<string>
  required?: boolean
  width?: 25 | 33 | 50 | 66 | 75 | 100
  default?: boolean
  options?: { value: string; label: Localized<string> }[]
  /** Only on `message`: the info text. */
  text?: Localized<string>
}
export type PlanForm = {
  ref: string
  title: Localized<string>
  fields: PlanFormField[]
  submitLabel?: Localized<string>
  confirmation: Localized<string>
  /** Days, "keep", or left out for the site default (site/config.ts forms.retentionDays). */
  retention?: number | 'keep'
}

export type SitePlan = {
  version: 1
  site?: string
  source: { url: string; cms?: string }
  media: { ref: string; source: string; alt?: Localized<string>; credit?: string }[]
  people?: { ref: string; name: string; role?: Localized<string>; email?: string; phone?: string; image?: string; bio?: Localized<string> }[]
  documents?: { ref: string; source: string; title: Localized<string>; docType: string; language?: Locale; description?: Localized<string> }[]
  forms?: PlanForm[]
  pages: {
    ref: string
    parent?: string
    isHome?: boolean
    order?: number
    hideFromNav?: boolean
    cardImage?: string
    title: Localized<string>
    slug?: Localized<string>
    summary?: Localized<string>
    meta?: Localized<{ title?: string; description?: string; image?: { $media: string } }>
    layout: Localized<PlanBlock[]>
  }[]
  articles?: {
    ref: string
    kind: string
    publishedAt: string
    heroImage?: string
    title: Localized<string>
    slug?: Localized<string>
    lead?: Localized<string>
    contentHtml?: Localized<string>
  }[]
  settings: {
    nav: Localized<{ label: string; page: string }[]>
    contact?: Localized<{ label: string; page: string }>
    footer?: Localized<{ heading: string; links: { label: string; page?: string; url?: string }[] }[]>
    copyright?: Localized<string>
    phone?: string
    email?: string
    address?: { street?: string; postalCode?: string; city?: string; country?: string }
  }
  redirects?: { from: string; toPage?: string; toUrl?: string; permanent?: boolean }[]
  gaps?: { sourceUrl: string; section: string; reason: string }[]
}
