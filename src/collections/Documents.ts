import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { DEFAULT_LOCALE, LOCALE_CONFIG, LOCALES, SITE_CONFIG, SITE_OPTIONS } from '@/lib/sites'
import { revalidateDoc, revalidateDocDelete } from '@/lib/revalidate'
import { indexDoc, unindexDoc } from '@/lib/search/indexer'

/** Felles dokumentbank: produktblad, EPD, FDV, monteringsanvisninger, tegninger, sertifikater. */
export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: { singular: 'Dokument', plural: 'Dokumenter' },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'docType', 'language', 'sites', 'updatedAt'],
    group: 'Innhold',
  },
  folders: true,
  upload: {
    staticDir: 'uploads/documents',
    mimeTypes: [
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.*',
      'application/vnd.ms-excel',
      'image/vnd.dwg',
      'application/acad',
      'application/octet-stream',
    ],
  },
  fields: [
    { name: 'title', type: 'text', label: 'Tittel', required: true, localized: true },
    {
      name: 'docType',
      type: 'select',
      label: 'Type',
      required: true,
      defaultValue: Object.keys(SITE_CONFIG.documentTypes).at(-1),
      options: Object.entries(SITE_CONFIG.documentTypes).map(([value, l]) => {
        const labels = l as Record<string, string>
        return { value, label: { nb: labels[DEFAULT_LOCALE], en: labels.en ?? labels[DEFAULT_LOCALE] } }
      }),
    },
    {
      name: 'language',
      type: 'select',
      label: 'Dokumentets språk',
      defaultValue: DEFAULT_LOCALE,
      options: [...LOCALES.map((l) => ({ label: LOCALE_CONFIG[l].label, value: l })), { label: 'Flerspråklig', value: 'multi' }],
    },
    { name: 'sites', type: 'select', label: 'Nettsteder', hasMany: true, options: SITE_OPTIONS },
    { name: 'description', type: 'textarea', label: 'Beskrivelse', localized: true },
  ],
  hooks: { afterChange: [revalidateDoc, indexDoc], afterDelete: [revalidateDocDelete, unindexDoc] },
}
