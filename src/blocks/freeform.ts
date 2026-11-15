/**
 * «Fri plassering»: elements placed on a 12-column grid. Plain data and functions (no Payload, no
 * React), shared by the block config, the renderer, the visual editor and the tests.
 *
 * On larger screens each element sits at its grid cells (CSS grid, no absolute positioning). On
 * mobile the elements stack. The DOM order is the mobile order, which is also the order screen
 * readers follow: by default the reading order (top to bottom, then left to right).
 */
export const GRID_COLUMNS = 12
export const MAX_ROW = 60
export const MAX_HEIGHT = 30

export const ROW_HEIGHTS = { s: '2rem', m: '3rem', l: '4rem' } as const
export type RowHeight = keyof typeof ROW_HEIGHTS
export const rowHeight = (v: unknown): string => ROW_HEIGHTS[(v as RowHeight) in ROW_HEIGHTS ? (v as RowHeight) : 'm']

export const FREEFORM_KINDS = ['text', 'image', 'button', 'shape'] as const
export type FreeformKind = (typeof FREEFORM_KINDS)[number]

export type Place = { x: number; y: number; w: number; h: number }
export type FreeformItem = {
  id?: string | null
  kind?: string | null
  x?: number | null
  y?: number | null
  w?: number | null
  h?: number | null
  mobileOrder?: number | null
  hideOnMobile?: boolean | null
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const whole = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : fallback)

/** Whole cells inside the grid: at least one wide and tall, never past column 12. */
export function clampPlace(p: { x?: unknown; y?: unknown; w?: unknown; h?: unknown }): Place {
  const w = clamp(whole(p.w, 6), 1, GRID_COLUMNS)
  const h = clamp(whole(p.h, 2), 1, MAX_HEIGHT)
  return { x: clamp(whole(p.x, 1), 1, GRID_COLUMNS - w + 1), y: clamp(whole(p.y, 1), 1, MAX_ROW), w, h }
}

/** Moving keeps the size; at the right edge the element stops instead of shrinking. */
export function moveBy(p: Place, dx: number, dy: number): Place {
  return clampPlace({ ...p, x: clamp(p.x + dx, 1, GRID_COLUMNS - p.w + 1), y: p.y + dy })
}

/** Resizing keeps the top-left corner. */
export function resizeBy(p: Place, dw: number, dh: number): Place {
  return clampPlace({ ...p, w: clamp(p.w + dw, 1, GRID_COLUMNS - p.x + 1), h: p.h + dh })
}

/** CSS `grid-area` for a placement (row start / column start / row span / column span). */
export const gridArea = (p: Place) => `${p.y} / ${p.x} / span ${p.h} / span ${p.w}`

/** Indices in reading order: by row, then column, then the order they were added. */
export function readingOrder(items: FreeformItem[]): number[] {
  const places = items.map(clampPlace)
  return items.map((_, i) => i).sort((a, b) => places[a].y - places[b].y || places[a].x - places[b].x || a - b)
}

/**
 * Indices in DOM order: the mobile order where one is set, the reading order otherwise. Elements
 * without a mobile place come after the numbered ones, in reading order.
 */
export function domOrder(items: FreeformItem[]): number[] {
  const reading = readingOrder(items)
  const rank = new Map(reading.map((index, n) => [index, n]))
  const key = (i: number) => (typeof items[i].mobileOrder === 'number' ? items[i].mobileOrder! : Infinity)
  return [...reading].sort((a, b) => key(a) - key(b) || rank.get(a)! - rank.get(b)!)
}

/** Numbers every element 1..n in the given DOM order (the editor's ↑/↓ on the mobile list). */
export function withMobileOrder<T extends FreeformItem>(items: T[], order: number[]): (T & { mobileOrder: number | null })[] {
  const pos = new Map(order.map((index, n) => [index, n + 1]))
  return items.map((item, i) => ({ ...item, mobileOrder: pos.get(i) ?? null }))
}

/** The first row under every element, where the editor puts a new one. */
export const nextRow = (items: FreeformItem[]) => items.map(clampPlace).reduce((row, p) => Math.max(row, p.y + p.h), 1)

/** The number of rows the grid needs. */
export const rowCount = (items: FreeformItem[]) => Math.max(1, nextRow(items) - 1)

/** An element must fit inside the 12 columns. */
export function validateWidth(w: unknown, x: unknown): true | string {
  if (typeof w !== 'number' || typeof x !== 'number') return true
  return x + w - 1 <= GRID_COLUMNS ? true : `Elementet går utenfor rutenettet: kolonne ${x} + bredde ${w} er mer enn ${GRID_COLUMNS} kolonner.`
}
