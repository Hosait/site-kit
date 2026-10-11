import type { CollectionConfig, Field } from 'payload'

import { anyone } from '@/access/anyone'
import { adminOnly, editorOfSite } from '@/access/siteAccess'
import { link } from '@/fields/link'
import { siteField } from '@/fields/site'
import { revalidateDoc } from '@/lib/revalidate'

/**
 * Meny, bunntekst og organisasjonsdata – ett dokument per nettsted.
 * (Payload-globals er singletons, så vi bruker en samling med unikt `site`.)
 */
const navItem: Field[] = [link({ name: 'link', appearance: false })]

export const SiteSettings: CollectionConfig = {
  slug: 'site-settings',
  labels: { singular: 'Nettstedsinnstillinger', plural: 'Nettstedsinnstillinger' },
  access: { read: anyone, create: adminOnly, delete: adminOnly, update: editorOfSite },
  admin: { useAsTitle: 'site', group: 'Nettsted', defaultColumns: ['site', 'updatedAt'] },
  fields: [
    siteField({ unique: true, admin: {} }),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hovedmeny',
          fields: [
            {
              name: 'nav',
              type: 'array',
              label: 'Menypunkter',
              localized: true,
              maxRows: 7,
              admin: { initCollapsed: true },
              fields: [
                ...navItem,
                {
                  name: 'children',
                  type: 'array',
                  label: 'Undermeny',
                  admin: { initCollapsed: true },
                  fields: navItem,
                },
              ],
            },
            {
              ...link({ name: 'contactLink', label: 'Kontaktknapp (høyre i menyen)', appearance: false, required: false }),
              localized: true,
            } as Field,
          ],
        },
        {
          label: 'Bunntekst',
          fields: [
            {
              name: 'footerColumns',
              type: 'array',
              label: 'Kolonner',
              localized: true,
              maxRows: 5,
              admin: { initCollapsed: true },
              fields: [
                { name: 'heading', type: 'text', label: 'Overskrift', required: true },
                { name: 'links', type: 'array', label: 'Lenker', fields: navItem },
              ],
            },
            { name: 'copyright', type: 'text', label: 'Copyright-linje', localized: true },
            { name: 'legal', type: 'textarea', label: 'Juridisk tekst', localized: true },
            {
              name: 'legalLinks',
              type: 'array',
              label: 'Personvern/cookies-lenker',
              localized: true,
              fields: navItem,
            },
          ],
        },
        {
          label: 'Organisasjon',
          description: 'Brukes i strukturerte data (Google) og kontaktinfo.',
          fields: [
            { name: 'legalName', type: 'text', label: 'Juridisk navn', defaultValue: 'AS Spilka Industri' },
            { name: 'orgNumber', type: 'text', label: 'Organisasjonsnummer' },
            { name: 'phone', type: 'text', label: 'Telefon' },
            { name: 'email', type: 'email', label: 'E-post' },
            {
              name: 'address',
              type: 'group',
              label: 'Besøksadresse',
              fields: [
                { name: 'street', type: 'text', label: 'Gate' },
                { name: 'postalCode', type: 'text', label: 'Postnr.' },
                { name: 'city', type: 'text', label: 'Sted' },
                { name: 'country', type: 'text', label: 'Land', defaultValue: 'NO' },
              ],
            },
            {
              name: 'social',
              type: 'array',
              label: 'Sosiale medier',
              fields: [
                {
                  name: 'network',
                  type: 'select',
                  options: ['linkedin', 'facebook', 'instagram', 'youtube'].map((v) => ({ label: v, value: v })),
                  required: true,
                },
                { name: 'url', type: 'text', required: true },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: { afterChange: [revalidateDoc] },
}
