import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'

import { pageBlocks } from '@/blocks/configs'
import type { Locale } from '@/lib/sites'
import { previewUrl } from '@/lib/preview'
import { buildEditorConfig } from '@/lib/visual-editor/schema'
import themeJson from '@site/theme.json'

import { VisualEditor, type Swatch } from './VisualEditor'

/** Section backgrounds as the visitor sees them (globals.css `.bg-section-*`, colours from site/theme.json). */
function swatches(): Swatch[] {
  const c = (themeJson as { colors?: Record<string, string> }).colors ?? {}
  return [
    { value: 'none', label: 'Ingen', color: c.background ?? '#ffffff' },
    { value: 'muted', label: 'Lys grå', color: c.muted ?? '#f4f5f7' },
    { value: 'tint', label: 'Lys merkefarge', color: c.tint ?? '#dbe7fb' },
    { value: 'dark', label: 'Mørk', color: c.ink ?? '#14213d' },
    { value: 'brand', label: 'Merkefarge', color: c.brandDark ?? '#163e7a' },
  ]
}

/**
 * «Visuell redigering» (/admin/visual/pages/:id): the page's real frontend in a frame, with
 * sections, text and images edited on top of it. It saves to the same `layout` as the form.
 */
export async function VisualEditorView({ initPageResult, params }: AdminViewServerProps) {
  const { req, locale } = initPageResult
  const segments = (params?.segments as string[] | undefined) ?? []
  const id = segments[2]
  const adminRoute = req.payload.config.routes.admin
  if (!req.user) redirect(`${adminRoute}/login?redirect=${encodeURIComponent(`${adminRoute}/visual/pages/${id ?? ''}`)}`)
  if (!id || !/^\d+$/.test(id)) redirect(`${adminRoute}/collections/pages`)

  const page = await req.payload
    .findByID({ collection: 'pages', id, draft: true, depth: 0, locale: locale?.code as Locale | undefined, user: req.user, overrideAccess: false, select: { title: true, path: true, site: true } })
    .catch(() => null)
  if (!page) redirect(`${adminRoute}/collections/pages`)

  // Titles for relationship pickers (people, documents, pages …), from each collection's admin config.
  const titles = Object.fromEntries(req.payload.config.collections.map((c) => [c.slug, c.admin?.useAsTitle ?? 'id']))

  return (
    <VisualEditor
      id={Number(id)}
      locale={locale?.code ?? ''}
      config={buildEditorConfig(pageBlocks)}
      previewSrc={previewUrl('pages', page, locale?.code)}
      formHref={`${adminRoute}/collections/pages/${id}?form=1`}
      listHref={`${adminRoute}/collections/pages`}
      swatches={swatches()}
      titles={titles}
    />
  )
}
