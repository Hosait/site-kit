import type { Block, Field } from 'payload'

import { link } from '@/fields/link'

import { background } from './fields'
import { GRID_COLUMNS, MAX_HEIGHT, MAX_ROW, validateWidth } from './freeform'

const when = (kind: string) => (_: unknown, s: { kind?: string } | undefined) => s?.kind === kind
const whenAny = (...kinds: string[]) => (_: unknown, s: { kind?: string } | undefined) => kinds.includes(s?.kind ?? '')

const place: Field = {
  type: 'row',
  fields: [
    { name: 'x', type: 'number', label: 'Kolonne', required: true, defaultValue: 1, min: 1, max: GRID_COLUMNS, admin: { width: '25%' } },
    {
      name: 'w',
      type: 'number',
      label: 'Bredde (kolonner)',
      required: true,
      defaultValue: 6,
      min: 1,
      max: GRID_COLUMNS,
      admin: { width: '25%' },
      validate: (w: unknown, { siblingData }: { siblingData: unknown }) => validateWidth(w, (siblingData as { x?: unknown } | undefined)?.x),
    },
    { name: 'y', type: 'number', label: 'Rad', required: true, defaultValue: 1, min: 1, max: MAX_ROW, admin: { width: '25%' } },
    { name: 'h', type: 'number', label: 'Høyde (rader)', required: true, defaultValue: 2, min: 1, max: MAX_HEIGHT, admin: { width: '25%' } },
  ],
}

/**
 * «Fri plassering»: text, images, buttons and shapes placed on a 12-column grid. It is easiest to
 * arrange in «Visuell redigering»; rendering is in FreeformComponent.tsx, helpers in freeform.ts.
 */
export const Freeform: Block = {
  slug: 'freeform',
  labels: { singular: 'Fri plassering', plural: 'Fri plassering' },
  interfaceName: 'FreeformBlock',
  fields: [
    {
      name: 'rowHeight',
      type: 'select',
      label: 'Radhøyde',
      defaultValue: 'm',
      options: [
        { label: 'Lav', value: 's' },
        { label: 'Middels', value: 'm' },
        { label: 'Høy', value: 'l' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      label: 'Elementer',
      maxRows: 24,
      admin: { description: 'Plasseres på et rutenett med 12 kolonner. Enklest å ordne i «Visuell redigering».' },
      fields: [
        {
          name: 'kind',
          type: 'select',
          label: 'Type',
          required: true,
          defaultValue: 'text',
          options: [
            { label: 'Tekst', value: 'text' },
            { label: 'Bilde', value: 'image' },
            { label: 'Knapp', value: 'button' },
            { label: 'Form', value: 'shape' },
          ],
        },
        place,
        { name: 'text', type: 'textarea', label: 'Tekst', admin: { condition: when('text') } },
        {
          name: 'textStyle',
          type: 'select',
          label: 'Tekststil',
          defaultValue: 'body',
          options: [
            { label: 'Overskrift', value: 'heading' },
            { label: 'Undertittel', value: 'subheading' },
            { label: 'Ingress', value: 'lead' },
            { label: 'Brødtekst', value: 'body' },
          ],
          admin: { condition: when('text') },
        },
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Bilde', admin: { condition: when('image') } },
        {
          name: 'fit',
          type: 'select',
          label: 'Bildeutsnitt',
          defaultValue: 'cover',
          options: [
            { label: 'Fyll rammen', value: 'cover' },
            { label: 'Hele bildet', value: 'contain' },
          ],
          admin: { condition: when('image') },
        },
        (() => {
          const field = link({ name: 'link', required: false })
          return { ...field, label: 'Knapp', admin: { ...field.admin, condition: when('button') } }
        })(),
        {
          name: 'shapeColor',
          type: 'select',
          label: 'Farge',
          defaultValue: 'tint',
          options: [
            { label: 'Lys merkefarge', value: 'tint' },
            { label: 'Lys grå', value: 'muted' },
            { label: 'Merkefarge', value: 'brand' },
            { label: 'Mørk', value: 'dark' },
          ],
          admin: { condition: when('shape') },
        },
        {
          name: 'shapeRadius',
          type: 'select',
          label: 'Hjørner',
          defaultValue: 'rounded',
          options: [
            { label: 'Rette', value: 'none' },
            { label: 'Avrundet', value: 'rounded' },
            { label: 'Rund', value: 'circle' },
          ],
          admin: { condition: when('shape') },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'align',
              type: 'select',
              label: 'Justering',
              defaultValue: 'left',
              options: [
                { label: 'Venstre', value: 'left' },
                { label: 'Midtstilt', value: 'center' },
                { label: 'Høyre', value: 'right' },
              ],
              admin: { condition: whenAny('text', 'button'), width: '50%' },
            },
            {
              name: 'valign',
              type: 'select',
              label: 'Loddrett',
              defaultValue: 'top',
              options: [
                { label: 'Øverst', value: 'top' },
                { label: 'Midten', value: 'center' },
                { label: 'Nederst', value: 'bottom' },
              ],
              admin: { condition: whenAny('text', 'button'), width: '50%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'mobileOrder',
              type: 'number',
              label: 'Plass på mobil',
              min: 1,
              admin: { width: '50%', description: 'Også rekkefølgen for skjermlesere. Tomt = ovenfra og ned, venstre mot høyre.' },
            },
            { name: 'hideOnMobile', type: 'checkbox', label: 'Skjul på mobil', defaultValue: false, admin: { width: '50%' } },
          ],
        },
      ],
    },
    background,
  ],
}
