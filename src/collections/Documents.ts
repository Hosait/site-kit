import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { SITE_OPTIONS } from '@/lib/sites'
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
      defaultValue: 'other',
      options: [
        { label: 'Produktblad', value: 'datasheet' },
        { label: 'Miljødeklarasjon (EPD)', value: 'epd' },
        { label: 'FDV', value: 'fdv' },
        { label: 'Monteringsanvisning', value: 'installation' },
        { label: 'Tegning/CAD/BIM', value: 'drawing' },
        { label: 'Sertifikat/testrapport', value: 'certificate' },
        { label: 'Brosjyre', value: 'brochure' },
        { label: 'Rapport', value: 'report' },
        { label: 'Annet', value: 'other' },
      ],
    },
    {
      name: 'language',
      type: 'select',
      label: 'Dokumentets språk',
      defaultValue: 'no',
      options: [
        { label: 'Norsk', value: 'no' },
        { label: 'Engelsk', value: 'en' },
        { label: 'Flerspråklig', value: 'multi' },
      ],
    },
    { name: 'sites', type: 'select', label: 'Nettsteder', hasMany: true, options: SITE_OPTIONS },
    { name: 'description', type: 'textarea', label: 'Beskrivelse', localized: true },
  ],
  hooks: { afterChange: [revalidateDoc, indexDoc], afterDelete: [revalidateDocDelete, unindexDoc] },
}
