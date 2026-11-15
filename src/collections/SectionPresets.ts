import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { canCreateContent, editorOfSite } from '@/access/siteAccess'
import { pageBlocks } from '@/blocks/configs'
import { siteField } from '@/fields/site'

/**
 * Lagrede seksjoner: én blokk lagret under et navn. På en side legger redaktøren til «Sett inn
 * lagret seksjon» og velger den; ved lagring (hook `expandPresets` på Pages) byttes den ut med en
 * kopi som kan redigeres fritt. Formen er enkel: `block` er en liste med nøyaktig én blokk, slik at
 * den visuelle editoren kan lese den samme dataen.
 */
export const SectionPresets: CollectionConfig<'sectionPresets'> = {
  slug: 'sectionPresets',
  labels: { singular: 'Lagret seksjon', plural: 'Lagrede seksjoner' },
  access: {
    create: canCreateContent,
    delete: editorOfSite,
    read: authenticated,
    update: editorOfSite,
  },
  admin: {
    defaultColumns: ['name', 'site', 'updatedAt'],
    description: 'En seksjon du bruker ofte. Sett den inn på en side med «Sett inn lagret seksjon».',
    group: 'Innhold',
    listSearchableFields: ['name'],
    useAsTitle: 'name',
  },
  fields: [
    { name: 'name', type: 'text', label: 'Navn', required: true },
    { name: 'description', type: 'textarea', label: 'Beskrivelse', admin: { description: 'Hva seksjonen er til for. Bare synlig i administrasjonen.' } },
    {
      name: 'block',
      type: 'blocks',
      label: 'Seksjon',
      blocks: pageBlocks,
      minRows: 1,
      maxRows: 1,
      localized: true,
    },
    siteField(),
  ],
}
