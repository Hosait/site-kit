import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { canCreateContent, editorOfSite } from '@/access/siteAccess'
import { pageBlocks } from '@/blocks/configs'
import { siteField } from '@/fields/site'

/**
 * Sidemaler: en ferdig oppsatt rekke seksjoner. Velges en mal på en ny side («Start fra sidemal»),
 * kopieres seksjonene inn i siden (hook `startFromTemplate` på Pages). Etterpå er siden uavhengig av malen.
 */
export const PageTemplates: CollectionConfig<'pageTemplates'> = {
  slug: 'pageTemplates',
  labels: { singular: 'Sidemal', plural: 'Sidemaler' },
  access: {
    create: canCreateContent,
    delete: editorOfSite,
    read: authenticated,
    update: editorOfSite,
  },
  admin: {
    defaultColumns: ['name', 'site', 'updatedAt'],
    description: 'Ferdige sideoppsett. Velg en mal når du lager en ny side, så får siden en kopi av seksjonene.',
    group: 'Innhold',
    listSearchableFields: ['name'],
    useAsTitle: 'name',
  },
  fields: [
    { name: 'name', type: 'text', label: 'Navn', required: true },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Seksjoner',
      blocks: pageBlocks,
      localized: true,
      admin: { initCollapsed: true },
    },
    siteField(),
  ],
}
