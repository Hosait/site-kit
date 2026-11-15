'use client'
import { ArrowDown, ArrowUp, Image, MousePointerClick, Square, Trash2, Type } from 'lucide-react'

import { domOrder, nextRow, withMobileOrder, type FreeformItem } from '@/blocks/freeform'
import { freeformItem } from '@/lib/visual-editor/presets'
import type { EdBlock, EdField } from '@/lib/visual-editor/schema'

import type { Block } from './api'
import { FieldsForm, type FieldsCtx } from './Fields'
import { itemLabel } from './FreeformOverlay'
import s from './editor.module.css'
import f from './freeform.module.css'
import p from './panels.module.css'

type Item = FreeformItem & Record<string, unknown>

const ADD = [
  { kind: 'text', label: 'Tekst', Icon: Type, size: { w: 6, h: 2 } },
  { kind: 'image', label: 'Bilde', Icon: Image, size: { w: 4, h: 4 } },
  { kind: 'button', label: 'Knapp', Icon: MousePointerClick, size: { w: 3, h: 1 } },
  { kind: 'shape', label: 'Form', Icon: Square, size: { w: 4, h: 3 } },
] as const

const ROWS = [
  { value: 's', label: 'Lav' },
  { value: 'm', label: 'Middels' },
  { value: 'l', label: 'Høy' },
]

/** «Fri plassering» in the settings panel: add elements, their mobile order, and each element's settings. */
export function FreeformPanel({ block, def, ctx, onChange }: { block: Block; def: EdBlock; ctx: FieldsCtx; onChange: (next: Block, opts?: { typing?: boolean }) => void }) {
  const items = (block.items as Item[] | undefined) ?? []
  const itemFields = (def.fields.find((x) => x.name === 'items') as Extract<EdField, { kind: 'array' }> | undefined)?.fields ?? []
  const set = (next: Item[], opts?: { typing?: boolean }) => onChange({ ...block, items: next }, opts)
  const order = domOrder(items)
  const custom = items.some((it) => typeof it.mobileOrder === 'number')

  const swap = (n: number, dir: -1 | 1) => {
    const next = [...order]
    ;[next[n], next[n + dir]] = [next[n + dir], next[n]]
    set(withMobileOrder(items, next))
  }

  return (
    <fieldset className={p.pickGroup}>
      <legend>Elementer</legend>
      <div className={f.adds}>
        {ADD.map(({ kind, label, Icon, size }) => (
          <button key={kind} type="button" className={s.btn} onClick={() => set([...items, freeformItem(kind, { x: 1, y: nextRow(items), ...size }) as Item])}>
            <Icon size={16} aria-hidden /> {label}
          </button>
        ))}
      </div>
      <p className={s.hint}>
        Flytt et element med håndtaket øverst til venstre og endre størrelsen i hjørnet nede til høyre. Piltastene virker også (med Shift endrer de størrelsen).
      </p>

      <p className={s.hint} id="ff-order">
        Rekkefølgen under gjelder på mobil og for skjermlesere.
      </p>
      <ol className={f.list} aria-labelledby="ff-order">
        {order.map((i, n) => {
          const label = itemLabel(items[i], i)
          return (
            <li key={String(items[i].id ?? i)}>
              <div className={f.itemHead}>
                <span className={f.itemLabel}>{label}</span>
                <button type="button" className={s.iconBtn} aria-label={`Flytt ${label} opp på mobil`} disabled={n === 0} onClick={() => swap(n, -1)}>
                  <ArrowUp size={16} aria-hidden />
                </button>
                <button type="button" className={s.iconBtn} aria-label={`Flytt ${label} ned på mobil`} disabled={n === order.length - 1} onClick={() => swap(n, 1)}>
                  <ArrowDown size={16} aria-hidden />
                </button>
                <button type="button" className={s.iconBtn} aria-label={`Fjern ${label}`} onClick={() => set(items.filter((_, k) => k !== i))}>
                  <Trash2 size={16} aria-hidden />
                </button>
              </div>
              <details className={p.row}>
                <summary>Innstillinger</summary>
                <FieldsForm fields={itemFields} value={items[i]} onChange={(next) => set(items.map((it, k) => (k === i ? (next as Item) : it)), { typing: true })} ctx={ctx} />
              </details>
            </li>
          )
        })}
      </ol>
      {custom && (
        <button type="button" className={s.btn} onClick={() => set(items.map((it) => ({ ...it, mobileOrder: null })))}>
          Bruk lesrekkefølgen på mobil
        </button>
      )}

      <fieldset className={p.pickGroup}>
        <legend>Radhøyde</legend>
        <div className={p.segments}>
          {ROWS.map((o) => (
            <button key={o.value} type="button" aria-pressed={String(block.rowHeight ?? 'm') === o.value} onClick={() => onChange({ ...block, rowHeight: o.value })}>
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>
    </fieldset>
  )
}
