import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { APIError } from 'payload'

import { canCreateContent, editorOfSite, publishedOrLoggedIn } from '@/access/siteAccess'
import { richTextEditor } from '@/fields/richText'
import { seoTab } from '@/fields/seo'
import { siteField } from '@/fields/site'
import { previewUrl } from '@/lib/preview'
import { revalidateDoc, revalidateDocDelete } from '@/lib/revalidate'
import { indexDoc, unindexDoc } from '@/lib/search/indexer'
import { slugify } from '@/lib/slugify'
import type { Article } from '@/payload-types'
import { DEFAULT_LOCALE, SITE_CONFIG } from '@/lib/sites'

/** Artikler (nyheter, fagblogg …; typene står i site/config.ts). Adresse: /{språk}/{articleBase}/{slug}. */
const normalizeSlug: CollectionBeforeChangeHook<Article> = async ({ data, req, originalDoc }) => {
  const locale = req.locale && req.locale !== 'all' ? req.locale : DEFAULT_LOCALE
  data.slug = data.slug ? slugify(data.slug) : slugify(data.title || '', { transliterate: true })
  if (!data.slug) throw new APIError('Artikkelen må ha en slug eller tittel.', 400)
  if (!data.publishedAt && data._status === 'published') data.publishedAt = new Date().toISOString()

  const site = data.site ?? originalDoc?.site
  const clash = await req.payload.find({
    collection: 'articles',
    locale,
    depth: 0,
    limit: 1,
    draft: true,
    req,
    where: {
      and: [
        { site: { equals: site } },
        { slug: { equals: data.slug } },
        ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
      ],
    },
  })
  if (clash.totalDocs > 0) throw new APIError(`Slug «${data.slug}» er allerede i bruk.`, 400)
  return data
}

export const Articles: CollectionConfig<'articles'> = {
  slug: 'articles',
  labels: { singular: 'Artikkel', plural: 'Artikler' },
  access: {
    create: canCreateContent,
    delete: editorOfSite,
    read: publishedOrLoggedIn,
    update: editorOfSite,
  },
  defaultPopulate: { title: true, slug: true, site: true, kind: true, publishedAt: true, lead: true, heroImage: true },
  admin: {
    defaultColumns: ['title', 'site', 'kind', 'publishedAt', '_status'],
    listSearchableFields: ['title', 'slug'],
    useAsTitle: 'title',
    group: 'Innhold',
    livePreview: { url: ({ data, locale }) => previewUrl('articles', data, locale?.code) },
    preview: (data, { locale }) => previewUrl('articles', data, locale),
  },
  fields: [
    { name: 'title', type: 'text', label: 'Tittel', required: true, localized: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Innhold',
          fields: [
            { name: 'lead', type: 'textarea', label: 'Ingress', localized: true },
            { name: 'heroImage', type: 'upload', relationTo: 'media', label: 'Hovedbilde' },
            { name: 'content', type: 'richText', editor: richTextEditor, label: 'Brødtekst', localized: true },
          ],
        },
        seoTab,
      ],
    },
    siteField(),
    {
      name: 'kind',
      type: 'select',
      label: 'Type',
      required: true,
      defaultValue: Object.keys(SITE_CONFIG.articleKinds)[0],
      options: Object.entries(SITE_CONFIG.articleKinds).map(([value, l]) => {
        const labels = l as Record<string, string>
        return { value, label: { nb: labels[DEFAULT_LOCALE], en: labels.en ?? labels[DEFAULT_LOCALE] } }
      }),
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Publiseringsdato',
      index: true,
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly', displayFormat: 'd. MMM yyyy' } },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      localized: true,
      index: true,
      admin: { position: 'sidebar', description: 'Lages fra tittelen hvis tom.' },
    },
  ],
  hooks: {
    beforeChange: [normalizeSlug],
    afterChange: [revalidateDoc, indexDoc],
    afterDelete: [revalidateDocDelete, unindexDoc],
  },
  versions: {
    drafts: { autosave: { interval: 400 }, schedulePublish: true },
    maxPerDoc: 30,
  },
}
