import type { Field, GroupField } from 'payload'

export type LinkAppearance = 'primary' | 'secondary' | 'text'

type LinkOptions = {
  name?: string
  label?: string
  required?: boolean
  appearance?: boolean
}

/** Lenke til en side/artikkel (også på et annet av våre nettsteder) eller en fri URL. */
export const link = ({ name = 'link', label, required = true, appearance = true }: LinkOptions = {}): GroupField => ({
  name,
  label,
  type: 'group',
  admin: { hideGutter: true },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'radio',
          label: 'Type',
          defaultValue: 'reference',
          admin: { layout: 'horizontal', width: '50%' },
          options: [
            { label: 'Intern side', value: 'reference' },
            { label: 'URL', value: 'custom' },
          ],
        },
        {
          name: 'newTab',
          type: 'checkbox',
          label: 'Åpne i ny fane',
          admin: { width: '50%', style: { alignSelf: 'flex-end' } },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'reference',
          type: 'relationship',
          label: 'Side',
          relationTo: ['pages', 'articles'],
          required,
          admin: { width: '50%', condition: (_, s) => s?.type === 'reference' },
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL',
          required,
          admin: { width: '50%', condition: (_, s) => s?.type === 'custom' },
        },
        { name: 'label', type: 'text', label: 'Tekst', admin: { width: '50%' } },
      ],
    },
    ...(appearance
      ? ([
          {
            name: 'appearance',
            type: 'select',
            label: 'Utseende',
            defaultValue: 'primary',
            options: [
              { label: 'Knapp (blå)', value: 'primary' },
              { label: 'Knapp (kontur)', value: 'secondary' },
              { label: 'Tekstlenke med pil', value: 'text' },
            ],
          },
        ] as Field[])
      : []),
  ],
})

export const linkArray = (name = 'links', maxRows = 3): Field => ({
  name,
  label: 'Lenker',
  type: 'array',
  maxRows,
  fields: [link({ name: 'link' })],
  admin: { initCollapsed: true },
})
