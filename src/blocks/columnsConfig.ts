import type { Block } from 'payload'

import { COLUMN_LAYOUTS, validateColumnCount, type ColumnLayout } from './columnLayouts'
import { background } from './fields'

/**
 * The «Kolonner» block: 2–4 columns, each holding blocks from `leaf` (the caller leaves out
 * columns itself and forms, so columns never nest). `leaf` must be the same block definitions the
 * page uses (section settings included): Payload shares one table per block slug.
 */
export function columnsBlock(leaf: Block[]): Block {
  return {
    slug: 'columns',
    labels: { singular: 'Kolonner', plural: 'Kolonner' },
    interfaceName: 'ColumnsBlock',
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'layout',
            type: 'select',
            label: 'Oppsett',
            defaultValue: '1-1',
            options: (Object.keys(COLUMN_LAYOUTS) as ColumnLayout[]).map((value) => ({ label: COLUMN_LAYOUTS[value].label, value })),
          },
          {
            name: 'verticalAlign',
            type: 'select',
            label: 'Loddrett plassering',
            defaultValue: 'top',
            options: [
              { label: 'Øverst', value: 'top' },
              { label: 'Midt', value: 'center' },
              { label: 'Nederst', value: 'bottom' },
            ],
          },
        ],
      },
      {
        name: 'columns',
        type: 'array',
        label: 'Kolonner',
        labels: { singular: 'Kolonne', plural: 'Kolonner' },
        minRows: 2,
        maxRows: 4,
        admin: { initCollapsed: false, description: 'Like mange kolonner som oppsettet sier. På mobil ligger de under hverandre.' },
        validate: (value: unknown, { siblingData }: { siblingData: unknown }) => validateColumnCount(value, (siblingData as { layout?: string })?.layout),
        fields: [{ name: 'blocks', type: 'blocks', label: 'Innhold i kolonnen', blocks: leaf }],
      },
      background,
    ],
  }
}
