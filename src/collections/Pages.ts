import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, CollectionConfig, Where } from 'payload'
import { APIError } from 'payload'

import { canCreateContent, editorOfSite, publishedOrLoggedIn } from '@/access/siteAccess'
import { pageBlocks } from '@/blocks/configs'
import { seoTab } from '@/fields/seo'
import { siteField } from '@/fields/site'
import { slugify } from '@/lib/slugify'
import { revalidateDoc, revalidateDocDelete } from '@/lib/revalidate'
import { indexDoc, unindexDoc } from '@/lib/search/indexer'
import { previewUrl } from '@/lib/preview'
import type { Page } from '@/payload-types'
import { DEFAULT_LOCALE } from '@/lib/sites'

/**
 * Sider er hierarkiske: `path` (f.eks. `om-spilka/kontakt`) bygges av forelderens sti + egen slug,
 * per språk. Forsiden har `isHome` og tom sti. Stien er unik per nettsted og språk.
 */
const computePath: CollectionBeforeChangeHook<Page> = async ({ data, req, originalDoc }) => {
  const locale = req.locale && req.locale !== 'all' ? req.locale : DEFAULT_LOCALE
  const site = data.site ?? originalDoc?.site
  if (data.isHome) {
    data.slug = ''
    data.path = ''
  } else {
    const slug = data.slug ? slugify(data.slug) : slugify(data.title || '', { transliterate: true })
    if (!slug) throw new APIError('Siden må ha en slug eller tittel.', 400)
    data.slug = slug

    let parentPath = ''
    const parentId = typeof data.parent === 'object' ? data.parent?.id : data.parent
    if (parentId) {
      const parent = await req.payload.findByID({
        collection: 'pages',
        id: parentId,
        locale,
        depth: 0,
        draft: true,
        req,
        select: { path: true, site: true },
      })
      if (parent.site !== site) throw new APIError('Forelder må høre til samme nettsted.', 400)
      parentPath = parent.path ?? ''
    }
    // «Fast adresse» vinner, slik at gamle Craft-adresser kan beholdes uendret.
    const override = data.pathOverride?.trim().replace(/^\/+|\/+$/g, '')
    data.path = override || (parentPath ? `${parentPath}/${slug}` : slug)
  }

  const clash = await req.payload.find({
    collection: 'pages',
    locale,
    depth: 0,
    limit: 1,
    draft: true,
    req,
    where: {
      and: [
        { site: { equals: site } },
        { path: { equals: data.path } },
        ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
      ],
    },
  })
  if (clash.totalDocs > 0) {
    throw new APIError(`Stien «/${data.path}» er allerede i bruk på dette nettstedet.`, 400)
  }
  return data
}

/** Når en side flytter eller får ny slug, må undersidenes stier bygges på nytt. */
const resaveChildren: CollectionAfterChangeHook<Page> = async ({ doc, previousDoc, req }) => {
  if (doc.path === previousDoc?.path || req.context.skipResaveChildren) return doc
  const locale = req.locale && req.locale !== 'all' ? req.locale : DEFAULT_LOCALE
  const children = await req.payload.find({
    collection: 'pages',
    where: { parent: { equals: doc.id } },
    locale,
    depth: 0,
    limit: 0,
    draft: true,
    req,
  })
  for (const child of children.docs) {
    await req.payload.update({
      collection: 'pages',
      id: child.id,
      locale,
      data: { slug: child.slug },
      draft: child._status !== 'published',
      req,
    })
  }
  return doc
}

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  labels: { singular: 'Side', plural: 'Sider' },
  access: {
    create: canCreateContent,
    delete: editorOfSite,
    read: publishedOrLoggedIn,
    update: editorOfSite,
  },
  defaultPopulate: { title: true, path: true, site: true },
  admin: {
    defaultColumns: ['title', 'path', 'site', '_status', 'updatedAt'],
    listSearchableFields: ['title', 'path'],
    useAsTitle: 'title',
    group: 'Innhold',
    livePreview: { url: ({ data, locale }) => previewUrl('pages', data, locale?.code) },
    preview: (data, { locale }) => previewUrl('pages', data, locale),
  },
  fields: [
    { name: 'title', type: 'text', label: 'Tittel', required: true, localized: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Innhold',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              label: 'Seksjoner',
              blocks: pageBlocks,
              localized: true,
              admin: { initCollapsed: true },
            },
          ],
        },
        seoTab,
      ],
    },
    siteField(),
    {
      name: 'isHome',
      type: 'checkbox',
      label: 'Forside',
      admin: { position: 'sidebar' },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages',
      label: 'Overordnet side',
      admin: { position: 'sidebar', condition: (data) => !data?.isHome },
      filterOptions: ({ data, id }): Where => ({
        and: [{ site: { equals: data?.site } }, ...(id ? [{ id: { not_equals: id } } as Where] : [])],
      }),
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      localized: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Siste del av adressen. Lages fra tittelen hvis tom.',
        condition: (data) => !data?.isHome,
      },
    },
    {
      name: 'path',
      type: 'text',
      label: 'Adresse',
      localized: true,
      index: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'pathOverride',
      type: 'text',
      label: 'Fast adresse (avansert)',
      localized: true,
      admin: {
        position: 'sidebar',
        description: 'Overstyrer adressen, f.eks. for å beholde en gammel Craft-adresse. Uten / foran.',
        condition: (data) => !data?.isHome,
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Rekkefølge blant søsken',
      admin: { position: 'sidebar', description: 'Lavest først. Tomt = alfabetisk.' },
    },
    {
      name: 'cardImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Bilde i oversikter',
      admin: { position: 'sidebar', description: 'Brukes når siden vises som kort. Tomt = første bilde på siden.' },
    },
    {
      name: 'summary',
      type: 'textarea',
      label: 'Kort beskrivelse i oversikter',
      localized: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'hideFromNav',
      type: 'checkbox',
      label: 'Skjul i undermeny',
      admin: { position: 'sidebar' },
    },
  ],
  hooks: {
    beforeChange: [computePath],
    afterChange: [resaveChildren, revalidateDoc, indexDoc],
    afterDelete: [revalidateDocDelete, unindexDoc],
  },
  versions: {
    drafts: { autosave: { interval: 400 }, schedulePublish: true },
    maxPerDoc: 50,
  },
}
