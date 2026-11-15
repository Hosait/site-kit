'use client'
import { Move, MoveDiagonal2 } from 'lucide-react'
import { useId, useState } from 'react'

import { clampPlace, GRID_COLUMNS, moveBy, resizeBy, type FreeformItem, type Place } from '@/blocks/freeform'

import s from './freeform.module.css'

/** The rendered grid of a «Fri plassering» section, in the frame's viewport coordinates. */
export type GridMetrics = { left: number; top: number; width: number; colW: number; gap: number; rowH: number; rowGap: number }

/** Null on mobile, where the elements stack instead of sitting on the grid. */
export function gridMetrics(doc: Document | null, index: number | null): GridMetrics | null {
  if (!doc || index === null) return null
  const grid = doc.querySelector<HTMLElement>(`[data-vb-block="${index}"] .ff-grid`)
  const win = doc.defaultView
  if (!grid || !win) return null
  const cs = win.getComputedStyle(grid)
  if (cs.display !== 'grid') return null
  const r = grid.getBoundingClientRect()
  const gap = parseFloat(cs.columnGap) || 0
  return {
    left: r.left,
    top: r.top,
    width: r.width,
    colW: (r.width - gap * (GRID_COLUMNS - 1)) / GRID_COLUMNS,
    gap,
    rowH: parseFloat(cs.gridAutoRows) || 48,
    rowGap: parseFloat(cs.rowGap) || 0,
  }
}

const boxOf = (m: GridMetrics, p: Place) => ({
  left: m.left + (p.x - 1) * (m.colW + m.gap),
  top: m.top + (p.y - 1) * (m.rowH + m.rowGap),
  width: p.w * m.colW + (p.w - 1) * m.gap,
  height: p.h * m.rowH + (p.h - 1) * m.rowGap,
})

const KIND: Record<string, string> = { text: 'Tekst', image: 'Bilde', button: 'Knapp', shape: 'Form' }

/** «Tekst 2: Fri plassering» – how an element is named in the editor. */
export function itemLabel(item: FreeformItem & { text?: string | null }, i: number): string {
  const text = item.kind === 'text' && item.text ? `: ${item.text.length > 30 ? `${item.text.slice(0, 30)}…` : item.text}` : ''
  return `${KIND[item.kind ?? ''] ?? 'Element'} ${i + 1}${text}`
}

const ARROWS: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
const same = (a: Place, b: Place) => a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h

type Drag = { i: number; mode: 'move' | 'resize'; x0: number; y0: number; start: Place; place: Place }

/**
 * Handles on each element of the selected «Fri plassering» section: drag the top-left handle to
 * move, the bottom-right one to resize, snapping to whole grid cells. Arrow keys move one cell;
 * with Shift (or on the resize handle) they resize. Text stays clickable for editing in place.
 */
export function FreeformOverlay({ metrics, items, onChange }: { metrics: GridMetrics | null; items: FreeformItem[]; onChange: (i: number, place: Place) => void }) {
  const [drag, setDrag] = useState<Drag | null>(null)
  const [said, setSaid] = useState('')
  const hintId = useId()
  if (!metrics) {
    return <p className={s.notice}>På mobil stables elementene. Flytt og endre størrelse i stor skjerm; rekkefølgen på mobil endrer du i panelet.</p>
  }
  const m = metrics

  const commit = (i: number, place: Place) => {
    onChange(i, place)
    setSaid(`Kolonne ${place.x}, rad ${place.y}, bredde ${place.w}, høyde ${place.h}.`)
  }
  const onKey = (e: React.KeyboardEvent, i: number, resize: boolean) => {
    const d = ARROWS[e.key]
    if (!d) return
    e.preventDefault()
    const p = clampPlace(items[i])
    const next = resize || e.shiftKey ? resizeBy(p, d[0], d[1]) : moveBy(p, d[0], d[1])
    if (!same(next, p)) commit(i, next)
  }
  const handlers = (i: number, mode: Drag['mode']) => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      const start = clampPlace(items[i])
      setDrag({ i, mode, x0: e.clientX, y0: e.clientY, start, place: start })
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (drag?.i !== i) return
      const dx = Math.round((e.clientX - drag.x0) / (m.colW + m.gap))
      const dy = Math.round((e.clientY - drag.y0) / (m.rowH + m.rowGap))
      const place = drag.mode === 'move' ? moveBy(drag.start, dx, dy) : resizeBy(drag.start, dx, dy)
      if (!same(place, drag.place)) setDrag({ ...drag, place })
    },
    onPointerUp: () => {
      if (drag?.i !== i) return
      setDrag(null)
      if (!same(drag.place, drag.start)) commit(i, drag.place)
    },
    onPointerCancel: () => setDrag(null),
  })

  const rows = Math.max(...items.map((it, i) => (drag?.i === i ? drag.place : clampPlace(it))).map((p) => p.y + p.h - 1), 1)
  return (
    <>
      {drag && (
        <div className={s.guides} style={{ left: m.left, top: m.top, width: m.width, height: rows * (m.rowH + m.rowGap) }} aria-hidden="true">
          {Array.from({ length: GRID_COLUMNS }, (_, n) => (
            <span key={n} style={{ left: n * (m.colW + m.gap), width: m.colW }} />
          ))}
        </div>
      )}
      {items.map((item, i) => {
        const place = drag?.i === i ? drag.place : clampPlace(item)
        const label = itemLabel(item as FreeformItem & { text?: string | null }, i)
        return (
          <div key={item.id ?? i} className={s.box} data-dragging={drag?.i === i || undefined} data-kind={item.kind ?? undefined} style={boxOf(m, place)}>
            <button type="button" className={s.grip} aria-label={`Flytt ${label}`} aria-describedby={hintId} title="Dra for å flytte" {...handlers(i, 'move')} onKeyDown={(e) => onKey(e, i, false)}>
              <Move size={16} aria-hidden />
            </button>
            <button type="button" className={s.resize} aria-label={`Endre størrelse på ${label}`} aria-describedby={hintId} title="Dra for å endre størrelse" {...handlers(i, 'resize')} onKeyDown={(e) => onKey(e, i, true)}>
              <MoveDiagonal2 size={16} aria-hidden />
            </button>
          </div>
        )
      })}
      <p id={hintId} hidden>
        Piltastene flytter elementet én rute. Med Shift, eller på håndtaket for størrelse, endrer de størrelsen.
      </p>
      <p className={s.live} role="status">
        {said}
      </p>
    </>
  )
}
