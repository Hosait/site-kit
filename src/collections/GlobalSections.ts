import type { CollectionConfig } from 'payload'

import { canCreateContent, editorOfSite, publishedOrLoggedIn } from '@/access/siteAccess'
import { reusableBlocks } from '@/blocks/layouts'
import { siteField } from '@/fields/site'
import { revalidateDoc, revalidateDocDelete } from '@/lib/revalidate'

/**
 * Seksjoner som brukes på flere sider. En side peker på dem med blokken «Felles seksjon» og viser
 * den publiserte versjonen; når en felles seksjon publiseres, bygges sidene som bruker den på nytt
 * (cache-taggen `globalSections`, se src/lib/data.ts). Den kan ikke inneholde en annen felles seksjon.
 */
export const GlobalSections: CollectionConfig<'globalSections'> = {
  slug: 'globalSections',
  // Postgres names are limited to 63 characters; the version tables of every block (e.g. `enum__<table>_v_blocks_article_feed_section_space_bottom`) need the shorter name.
  dbName: 'gsections',
  labels: { singular: 'Felles seksjon', plural: 'Felles seksjoner' },
  access: {
    create: canCreateContent,
    delete: editorOfSite,
    read: publishedOrLoggedIn,
    update: editorOfSite,
  },
  admin: {
    defaultColumns: ['title', 'site', '_status', 'updatedAt'],
    description: 'Seksjoner som vises på flere sider, for eksempel en kontaktseksjon. Endre dem her, så endres alle sidene som bruker dem.',
    group: 'Innhold',
    listSearchableFields: ['title'],
    useAsTitle: 'title',
  },
  fields: [
    { name: 'title', type: 'text', label: 'Navn', required: true, admin: { description: 'Bare synlig i administrasjonen.' } },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Seksjoner',
      blocks: reusableBlocks,
      localized: true,
      admin: { initCollapsed: true },
    },
    siteField(),
  ],
  hooks: {
    afterChange: [revalidateDoc],
    afterDelete: [revalidateDocDelete],
  },
  versions: {
    drafts: { autosave: { interval: 400 }, schedulePublish: true },
    maxPerDoc: 50,
  },
}
