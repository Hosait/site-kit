'use client'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useState } from 'react'

import type { EditorConfig } from '@/lib/visual-editor/schema'

import type { Block } from './api'
import type { Drag } from './Frame'
import { thumbSrc } from './Inspector'
import s from './editor.module.css'
import p from './panels.module.css'

type Props = {
  config: EditorConfig
  layout: Block[]
  selected: number | null
  onAdd: (slug: string) => void
  onSelect: (i: number) => void
  onMove: (from: number, to: number) => void
  onDragStart: (drag: Drag) => void
  onDragEnd: () => void
}

/** A short name for a section in the list: its heading or first text. */
function summary(block: Block): string {
  for (const key of ['heading', 'title', 'quote', 'text', 'caption']) {
    const v = block[key]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

export function Sidebar({ config, layout, selected, onAdd, onSelect, onMove, onDragStart, onDragEnd }: Props) {
  const [over, setOver] = useState<number | null>(null)
  return (
    <>
      <section aria-labelledby="vb-library" className={s.panel}>
        <h2 id="vb-library" className={s.panelTitle}>
          Legg til seksjon
        </h2>
        <p className={s.hint}>Dra en seksjon inn på siden, eller klikk for å legge den til under den valgte.</p>
        <ul className={p.libraryGrid}>
          {config.library.map((slug) => (
            <li key={slug}>
              <button
                type="button"
                className={p.libraryItem}
                draggable
                data-block={slug}
                onClick={() => onAdd(slug)}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', `new:${slug}`)
                  e.dataTransfer.effectAllowed = 'copy'
                  onDragStart({ kind: 'new', slug })
                }}
                onDragEnd={onDragEnd}
              >
                <LibraryThumb slug={slug} />
                <span>{config.blocks[slug]?.label ?? slug}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="vb-outline" className={s.panel}>
        <h2 id="vb-outline" className={s.panelTitle}>
          Seksjoner på siden
        </h2>
        {layout.length === 0 && <p className={s.hint}>Ingen ennå.</p>}
        <ol className={p.outline}>
          {layout.map((block, i) => {
            const label = config.blocks[block.blockType]?.label ?? block.blockType
            const text = summary(block)
            return (
              <li
                key={block.id ?? i}
                draggable
                data-over={over === i || undefined}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', `move:${i}`)
                  e.dataTransfer.effectAllowed = 'move'
                  onDragStart({ kind: 'move', from: i })
                }}
                onDragEnd={() => {
                  setOver(null)
                  onDragEnd()
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  setOver(i)
                }}
                onDragLeave={() => setOver(null)}
                onDrop={(e) => {
                  e.preventDefault()
                  setOver(null)
                  const data = e.dataTransfer.getData('text/plain')
                  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                  const to = e.clientY > r.top + r.height / 2 ? i + 1 : i
                  if (data.startsWith('move:')) onMove(Number(data.slice(5)), to)
                  onDragEnd()
                }}
              >
                <button type="button" className={p.outlineItem} aria-current={selected === i || undefined} onClick={() => onSelect(i)}>
                  <span className={p.outlineLabel}>
                    {i + 1}. {label}
                  </span>
                  {text && <span className={p.outlineText}>{text}</span>}
                </button>
                <button type="button" className={s.iconBtn} aria-label={`Flytt «${text || label}» opp`} disabled={i === 0} onClick={() => onMove(i, i - 1)}>
                  <ArrowUp size={16} aria-hidden />
                </button>
                <button type="button" className={s.iconBtn} aria-label={`Flytt «${text || label}» ned`} disabled={i === layout.length - 1} onClick={() => onMove(i, i + 2)}>
                  <ArrowDown size={16} aria-hidden />
                </button>
              </li>
            )
          })}
        </ol>
      </section>
    </>
  )
}

function LibraryThumb({ slug }: { slug: string }) {
  const [ok, setOk] = useState(true)
  // eslint-disable-next-line @next/next/no-img-element
  return ok ? <img src={thumbSrc(slug)} alt="" loading="lazy" onError={() => setOk(false)} /> : <span className={s.noThumb} aria-hidden />
}
