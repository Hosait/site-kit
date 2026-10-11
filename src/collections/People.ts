import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { canCreateContent, editorOfSite } from '@/access/siteAccess'
import { SITE_OPTIONS } from '@/lib/sites'
import { revalidateDoc, revalidateDocDelete } from '@/lib/revalidate'
import { indexDoc, unindexDoc } from '@/lib/search/indexer'

/** Ledelse, kontaktpersoner og ansatthistorier. Vises via blokken «Personer». */
export const People: CollectionConfig = {
  slug: 'people',
  labels: { singular: 'Person', plural: 'Personer' },
  access: { read: anyone, create: canCreateContent, update: editorOfSite, delete: editorOfSite },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'email', 'site'],
    group: 'Innhold',
  },
  fields: [
    { name: 'name', type: 'text', label: 'Navn', required: true },
    { name: 'role', type: 'text', label: 'Tittel/rolle', localized: true },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', label: 'E-post' },
        { name: 'phone', type: 'text', label: 'Telefon' },
      ],
    },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Portrett' },
    { name: 'bio', type: 'textarea', label: 'Kort om personen', localized: true },
    {
      name: 'site',
      type: 'select',
      label: 'Hovednettsted',
      options: SITE_OPTIONS,
      required: true,
      defaultValue: 'industri',
      admin: { position: 'sidebar' },
    },
    {
      name: 'hasLeft',
      type: 'checkbox',
      label: 'Har sluttet',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Vises ikke i søket på nettstedene.' },
    },
  ],
  hooks: { afterChange: [revalidateDoc, indexDoc], afterDelete: [revalidateDocDelete, unindexDoc] },
}
