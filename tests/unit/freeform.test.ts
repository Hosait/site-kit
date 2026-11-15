import assert from 'node:assert/strict'
import { test } from 'node:test'

import { pageBlocks } from '../../src/blocks/configs'
import { COLUMN_EXCLUDED } from '../../src/blocks/columnLayouts'
import {
  clampPlace,
  domOrder,
  gridArea,
  moveBy,
  nextRow,
  readingOrder,
  resizeBy,
  rowCount,
  rowHeight,
  validateWidth,
  withMobileOrder,
} from '../../src/blocks/freeform'
import { freeformItem, newBlock } from '../../src/lib/visual-editor/presets'
import { buildEditorConfig, type EdField } from '../../src/lib/visual-editor/schema'

test('a placement is whole cells inside the 12 columns', () => {
  assert.deepEqual(clampPlace({}), { x: 1, y: 1, w: 6, h: 2 })
  assert.deepEqual(clampPlace({ x: 10, w: 6, y: 0, h: 0 }), { x: 7, y: 1, w: 6, h: 1 })
  assert.deepEqual(clampPlace({ x: 2.4, y: 3.6, w: 20, h: 99 }), { x: 1, y: 4, w: 12, h: 30 })
  assert.equal(gridArea({ x: 3, y: 2, w: 4, h: 2 }), '2 / 3 / span 2 / span 4')
  assert.equal(rowHeight('l'), '4rem')
  assert.equal(rowHeight('nonsense'), '3rem')
})

test('moving keeps the size and stops at the edges; resizing keeps the corner', () => {
  const p = { x: 8, y: 1, w: 4, h: 2 }
  assert.deepEqual(moveBy(p, 1, 0), { x: 9, y: 1, w: 4, h: 2 })
  assert.deepEqual(moveBy(p, 5, -3), { x: 9, y: 1, w: 4, h: 2 }, 'never past column 12 or above row 1')
  assert.deepEqual(moveBy(p, -10, 2), { x: 1, y: 3, w: 4, h: 2 })
  assert.deepEqual(resizeBy(p, 3, 1), { x: 8, y: 1, w: 5, h: 3 }, 'width stops at column 12')
  assert.deepEqual(resizeBy(p, -9, -9), { x: 8, y: 1, w: 1, h: 1 })
})

test('reading order is top to bottom, then left to right; the mobile order wins where set', () => {
  const items = [
    { x: 7, y: 1, w: 6, h: 3 }, // right column, top
    { x: 1, y: 4, w: 12, h: 1 }, // full row below
    { x: 1, y: 1, w: 6, h: 2 }, // left column, top
  ]
  assert.deepEqual(readingOrder(items), [2, 0, 1])
  assert.deepEqual(domOrder(items), [2, 0, 1])
  assert.deepEqual(domOrder([{ ...items[0], mobileOrder: 1 }, items[1], items[2]]), [0, 2, 1], 'numbered first, the rest in reading order')
  const renumbered = withMobileOrder(items, [1, 2, 0])
  assert.deepEqual(renumbered.map((i) => i.mobileOrder), [3, 1, 2])
  assert.deepEqual(domOrder(renumbered), [1, 2, 0])
  assert.equal(nextRow(items), 5)
  assert.equal(rowCount(items), 4)
  assert.equal(nextRow([]), 1)
})

test('an element must fit inside the grid', () => {
  assert.equal(validateWidth(4, 9), true)
  assert.match(String(validateWidth(5, 9)), /utenfor rutenettet/)
  assert.equal(validateWidth(undefined, 9), true)
})

test('«Fri plassering» is a page block, never inside a column, and the editor maps its fields', () => {
  const block = pageBlocks.find((b) => b.slug === 'freeform')
  assert.ok(block, 'registered')
  assert.ok((COLUMN_EXCLUDED as readonly string[]).includes('freeform'))
  const cfg = buildEditorConfig(pageBlocks)
  const items = cfg.blocks.freeform.fields.find((f) => f.name === 'items') as Extract<EdField, { kind: 'array' }>
  assert.deepEqual(
    items.fields.map((f) => `${f.name}:${f.kind}`),
    [
      'kind:select', 'x:number', 'w:number', 'y:number', 'h:number', 'text:text', 'textStyle:select', 'image:upload', 'fit:select',
      'link:group', 'shapeColor:select', 'shapeRadius:select', 'align:select', 'valign:select', 'mobileOrder:number', 'hideOnMobile:checkbox',
    ],
  )
  assert.equal(cfg.blocks.freeform.section, true)
  assert.equal(cfg.blocks.freeform.background, true)
})

test('a new freeform section and new elements start with content and a valid place', () => {
  const cfg = buildEditorConfig(pageBlocks)
  const block = newBlock('freeform', cfg) as { items: { kind: string; x: number; w: number; id: string }[] }
  assert.deepEqual(block.items.map((i) => i.kind), ['shape', 'text', 'text', 'button', 'image'])
  for (const i of block.items) assert.equal(validateWidth(i.w, i.x), true)
  assert.equal(new Set(block.items.map((i) => i.id)).size, block.items.length, 'each element has its own id')
  const shape = freeformItem('shape', { x: 1, y: 3, w: 4, h: 2 })
  assert.equal(shape.hideOnMobile, true, 'decorative shapes are left out of the mobile stack')
  assert.equal(freeformItem('text', { x: 1, y: 1, w: 6, h: 2 }).text, 'Ny tekst')
})
