/**
 * Ratio presets for the «Kolonner» block. Plain data and functions (no Payload, no React), so
 * the config, the renderer and the tests share them. The class names are written out in full
 * so Tailwind finds them; every layout is one column on mobile.
 */
export const COLUMN_LAYOUTS = {
  '1-1': { count: 2, label: 'To like kolonner (1:1)', grid: 'md:grid-cols-2' },
  '2-1': { count: 2, label: 'Bred og smal (2:1)', grid: 'md:grid-cols-[2fr_1fr]' },
  '1-2': { count: 2, label: 'Smal og bred (1:2)', grid: 'md:grid-cols-[1fr_2fr]' },
  '1-1-1': { count: 3, label: 'Tre like kolonner (1:1:1)', grid: 'md:grid-cols-3' },
  '1-1-1-1': { count: 4, label: 'Fire like kolonner (1:1:1:1)', grid: 'md:grid-cols-2 lg:grid-cols-4' },
} as const

export type ColumnLayout = keyof typeof COLUMN_LAYOUTS

export const isColumnLayout = (v: unknown): v is ColumnLayout => typeof v === 'string' && v in COLUMN_LAYOUTS

export const columnCount = (layout: unknown): number => (isColumnLayout(layout) ? COLUMN_LAYOUTS[layout].count : 2)

export const VERTICAL_ALIGN = {
  top: 'md:items-start',
  center: 'md:items-center',
  bottom: 'md:items-end',
} as const

/** The grid classes for `count` columns; equal columns when the preset and the number of columns disagree. */
export function columnGrid(layout: unknown, count: number): string {
  if (isColumnLayout(layout) && COLUMN_LAYOUTS[layout].count === count) return COLUMN_LAYOUTS[layout].grid
  return ({ 1: '', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-2 lg:grid-cols-4' } as Record<number, string>)[count] ?? 'md:grid-cols-2'
}

/** The number of columns must match the ratio preset. */
export function validateColumnCount(rows: unknown, layout: unknown): true | string {
  const n = Array.isArray(rows) ? rows.length : 0
  const want = columnCount(layout)
  return n === want ? true : `Oppsettet har ${want} kolonner, men det er ${n}. Legg til eller fjern kolonner.`
}

/**
 * The block types a column may hold. Never columns again, and no forms. Not a global section either:
 * global sections may hold columns, so one inside a column would let sections nest.
 */
export const COLUMN_EXCLUDED = ['columns', 'formBlock', 'hero', 'newsletter', 'globalSection'] as const
