import type { CollectionConfig } from 'payload'

import { canCreateContent, deleteDraftContent, publishedOrLoggedIn, updateDraftContent } from '@/access/siteAccess'
import { guardPublish, guardUnpublish } from '@/collections/editorial/hooks'
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
    delete: deleteDraftContent,
    read: publishedOrLoggedIn,
    update: updateDraftContent,
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
    // Editors save drafts; publishing a shared section changes every page that uses it, so it is the publishers' (src/collections/editorial/hooks.ts).
    beforeChange: [guardPublish],
    afterChange: [guardUnpublish, revalidateDoc],
    afterDelete: [revalidateDocDelete],
  },
  versions: {
    drafts: { autosave: { interval: 400 }, schedulePublish: true },
    maxPerDoc: 50,
  },
}
