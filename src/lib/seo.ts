import type { Metadata } from 'next'

import type { Article, Media, Page } from '@/payload-types'
import themeJson from '@site/theme.json'

import { docPath } from './links'
import { validateTheme } from './theme'
import { DEFAULT_LOCALE, HREFLANG, type Locale, LOCALE_CONFIG, SITE_CONFIG, type SiteKey, siteOrigin, SITES } from './sites'

type Doc = Page | Article

const imageUrl = (m: unknown, origin: string): string | undefined => {
  if (!m || typeof m !== 'object') return undefined
  const media = m as Media
  // Bare bilder kan deles: et toppfelt kan ha en video.
  if (!media.mimeType?.startsWith('image/')) return undefined
  const url = media.sizes?.og?.url || media.url
  if (!url) return undefined
  return url.startsWith('http') ? url : origin + url
}

/** Brødteksten i et Lexical-tre, gått gjennom uten rekursjon, til minst `max` tegn er samlet. */
function lexicalText(rich: unknown, max: number): string {
  const root = (rich as { root?: unknown } | null)?.root
  const stack: unknown[] = root ? [root] : []
  const parts: string[] = []
  let length = 0
  while (stack.length && length < max) {
    const node = stack.pop() as { type?: unknown; text?: unknown; children?: unknown } | null
    // Overskrifter gjentar tittelen; beskrivelsen er brødteksten.
    if (!node || typeof node !== 'object' || node.type === 'heading') continue
    if (typeof node.text === 'string') {
      parts.push(node.text)
      length += node.text.length
    }
    if (Array.isArray(node.children)) {
      // A space after each block (paragraph, heading, list item), none between text runs in it.
      stack.push({ text: ' ' })
      for (let i = node.children.length - 1; i >= 0; i--) stack.push(node.children[i])
    }
  }
  return parts.join('').replace(/\s+/g, ' ').trim()
}

/** Kort beskrivelse: hele ord, høyst rundt 155 tegn. */
function clip(text: string, max = 155): string | undefined {
  const t = text.trim()
  if (!t) return undefined
  if (t.length <= max) return t
  const cut = t.slice(0, max)
  const space = cut.lastIndexOf(' ')
  return `${(space > 0 ? cut.slice(0, space) : cut).replace(/[\s,.;:–-]+$/, '')}…`
}

type Block = { blockType?: string; variant?: string | null; text?: string | null; richText?: unknown; media?: unknown; image?: unknown }

/** Det første en besøkende leser på en side: heltens tekst, ellers den første tekstblokken. */
function pageLead(layout: Block[]): string | undefined {
  const hero = layout.find((b) => b.blockType === 'hero' && b.text?.trim())
  if (hero) return clip(String(hero.text))
  const rich = layout.find((b) => (b.blockType === 'content' || b.blockType === 'textImage') && b.richText)
  return rich ? clip(lexicalText(rich.richText, 400)) : undefined
}

/** Det første bildet en besøkende ser: heltens, ellers den første bildeblokken. */
function pageImage(layout: Block[], origin: string): string | undefined {
  for (const b of layout) {
    // Et toppfelt med bare tekst beholder et gammelt bilde i dataene; det vises ikke.
    const m = b.blockType === 'hero' ? (b.variant === 'text' ? undefined : b.media) : b.blockType === 'fullImage' || b.blockType === 'textImage' ? b.image : undefined
    const url = imageUrl(m, origin)
    if (url) return url
  }
  return undefined
}

const LOGO_SRC = validateTheme(themeJson).logo.src

/**
 * Tittel, beskrivelse, canonical, hreflang og Open Graph for en side eller artikkel. En side uten
 * egen SEO-beskrivelse eller delingsbilde får sin første tekst og sitt første bilde.
 */
export function buildMetadata({
  site,
  locale,
  doc,
  path,
  alternates,
}: {
  site: SiteKey
  locale: Locale
  doc: Doc
  path: string
  alternates: Record<string, string>
}): Metadata {
  const origin = siteOrigin(site)
  const meta = doc.meta ?? {}
  const isHome = 'isHome' in doc && doc.isHome
  // SEO-pluginen legger på « | Nettsted»; layouten gjør det også, så vi bruker absolute.
  const rawTitle = meta.title || doc.title
  const title = isHome ? rawTitle : rawTitle.includes(' | ') ? rawTitle : `${rawTitle} | ${SITES[site].name}`
  const layout = 'layout' in doc && Array.isArray(doc.layout) ? (doc.layout as Block[]) : []
  const description = meta.description || ('lead' in doc ? (doc.lead ?? undefined) : pageLead(layout))
  const ogImage = imageUrl(meta.image, origin) || ('heroImage' in doc ? imageUrl(doc.heroImage, origin) : pageImage(layout, origin))

  const languages: Record<string, string> = {}
  for (const [l, p] of Object.entries(alternates)) languages[HREFLANG[l as Locale]] = origin + p
  if (alternates[DEFAULT_LOCALE]) languages['x-default'] = origin + alternates[DEFAULT_LOCALE]

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: origin + path, languages },
    openGraph: {
      type: 'kind' in doc ? 'article' : 'website',
      siteName: SITES[site].name,
      locale: LOCALE_CONFIG[locale].ogLocale,
      title,
      description,
      url: origin + path,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
      ...('publishedAt' in doc && doc.publishedAt ? { publishedTime: doc.publishedAt } : {}),
    },
    twitter: { card: 'summary_large_image' },
    robots: meta.noindex ? { index: false, follow: true } : undefined,
  }
}

/** Strukturerte data (schema.org): organisasjon på forsiden, artikkel på artikler, brødsmuler overalt. */
export function jsonLdFor({
  site,
  locale,
  kind,
  doc,
}: {
  site: SiteKey
  locale: Locale
  kind: 'page' | 'article'
  doc: Doc
}): object[] {
  const origin = siteOrigin(site)
  const out: object[] = []

  if (kind === 'page' && (doc as Page).isHome) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITES[site].name,
      url: origin,
      logo: `${origin}${LOGO_SRC}`,
      parentOrganization: SITE_CONFIG.brand.legalName !== SITES[site].name ? { '@type': 'Organization', name: SITE_CONFIG.brand.legalName } : undefined,
    })
  }

  if (kind === 'article') {
    const a = doc as Article
    out.push({
      '@context': 'https://schema.org',
      '@type': a.kind === 'blog' ? 'BlogPosting' : 'NewsArticle',
      headline: a.title,
      description: a.lead ?? undefined,
      datePublished: a.publishedAt ?? undefined,
      dateModified: a.updatedAt,
      image: imageUrl(a.heroImage, origin),
      inLanguage: HREFLANG[locale],
      publisher: { '@type': 'Organization', name: SITES[site].name, logo: `${origin}${LOGO_SRC}` },
      mainEntityOfPage: origin + (docPath('articles', a, locale) ?? ''),
    })
  }

  const path = kind === 'page' ? (doc as Page).path : null
  if (kind === 'page' && path) {
    const parts = path.split('/')
    out.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: parts.map((_, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: i === parts.length - 1 ? doc.title : parts[i].replace(/-/g, ' '),
        item: `${origin}/${locale}/${parts.slice(0, i + 1).join('/')}`,
      })),
    })
  }
  return out
}
