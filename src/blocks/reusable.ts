import type { Block } from 'payload'

/** Keeps the pick to the document's own site (a page on one site never shows another site's content). */
const sameSite = ({ data }: { data?: { site?: string | null } }) => (data?.site ? { site: { equals: data.site } } : true)

/**
 * A reference to a «Felles seksjon» (collection globalSections). The section is drawn from its
 * published layout, so editing it once changes every page that uses it. Global sections cannot
 * contain this block (see `reusableBlocks`), so references never nest.
 */
export const GlobalSection: Block = {
  slug: 'globalSection',
  labels: { singular: 'Felles seksjon', plural: 'Felles seksjoner' },
  interfaceName: 'GlobalSectionBlock',
  fields: [
    {
      name: 'globalSection',
      type: 'relationship',
      relationTo: 'globalSections',
      label: 'Felles seksjon',
      required: true,
      filterOptions: sameSite,
      admin: { description: 'Endres den felles seksjonen, endres alle sidene som bruker den.' },
    },
  ],
}

/**
 * A pointer to a «Lagret seksjon» (collection sectionPresets). It exists only until the page is
 * saved: the beforeChange hook `expandPresets` replaces it with an independent copy of the saved
 * block. It is not a page block for site plans, so it is not in `pageBlocks`.
 */
export const Preset: Block = {
  slug: 'preset',
  labels: { singular: 'Sett inn lagret seksjon', plural: 'Sett inn lagrede seksjoner' },
  interfaceName: 'PresetBlock',
  fields: [
    {
      name: 'preset',
      type: 'relationship',
      relationTo: 'sectionPresets',
      label: 'Lagret seksjon',
      required: true,
      filterOptions: sameSite,
      admin: {
        description: 'Når siden lagres, byttes denne ut med en kopi av seksjonen. Kopien kan du redigere fritt.',
        components: { Field: '/components/admin/ApplyingRelationshipField#ApplyingRelationshipField' },
      },
    },
  ],
}
