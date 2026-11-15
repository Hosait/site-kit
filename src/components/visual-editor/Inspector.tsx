'use client'
import { ImageUp, Images } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import { imageLeaves } from '@/lib/visual-editor/leaves'
import { getAt, setAt, type EdBlock, type EdField, type Path } from '@/lib/visual-editor/schema'

import { listMedia, type Block, type MediaDoc } from './api'
import { FieldsForm, type FieldsCtx } from './Fields'
import s from './editor.module.css'
import p from './panels.module.css'

export type Swatch = { value: string; label: string; color: string }

/** Spacing the simple editor offers; the form admin has the full scale (none, XL). */
const SPACES = [
  { value: 'auto', label: 'Auto' },
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
]

export const thumbSrc = (slug: string, field?: string, value?: string) => `/kit/editor/${field ? `${slug}--${field}-${value}` : slug}.webp`

export const mediaThumb = (m: unknown): string | null => {
  const doc = m as MediaDoc | null
  return doc && typeof doc === 'object' ? (doc.sizes?.thumb?.url ?? doc.sizes?.sm?.url ?? doc.url ?? null) : null
}

type Props = {
  block: Block
  def: EdBlock
  swatches: Swatch[]
  ctx: FieldsCtx
  focusImage: Path | null
  onChange: (next: Block, opts?: { typing?: boolean }) => void
  onImageFile: (path: Path, file: File) => void
}

export function Inspector({ block, def, swatches, ctx, focusImage, onChange, onImageFile }: Props) {
  const set = (path: Path, value: unknown) => onChange(setAt(block, path, value))
  const field = (name: string) => def.fields.find((f) => f.name === name) as Extract<EdField, { kind: 'select' }> | undefined
  const images = imageLeaves(block, def.fields, ctx.config)
  const [allOpen, setAllOpen] = useState(false)

  return (
    <div className={p.inspector}>
      <h2 className={s.panelTitle}>{def.label}</h2>

      {def.variants.map((name) => {
        const f = field(name)
        if (!f) return null
        const current = String(block[name] ?? f.defaultValue ?? '')
        return (
          <fieldset key={name} className={p.pickGroup}>
            <legend>{f.label}</legend>
            <div className={p.pictures}>
              {f.options.map((o) => (
                <button key={o.value} type="button" className={p.picture} aria-pressed={current === o.value} onClick={() => set([name], o.value)}>
                  <Thumb src={thumbSrc(def.slug, name, o.value)} />
                  <span>{o.label}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )
      })}

      {def.section && (
        <>
          {(['spaceTop', 'spaceBottom'] as const).map((key) => {
            const current = String(getAt(block, ['section', key]) ?? 'auto')
            return (
              <fieldset key={key} className={p.pickGroup}>
                <legend>{key === 'spaceTop' ? 'Luft over' : 'Luft under'}</legend>
                <div className={p.segments}>
                  {SPACES.map((o) => (
                    <button key={o.value} type="button" aria-pressed={current === o.value} onClick={() => set(['section', key], o.value)}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            )
          })}
        </>
      )}

      {def.background && (
        <fieldset className={p.pickGroup}>
          <legend>Bakgrunn</legend>
          <div className={p.swatches}>
            {swatches.map((w) => (
              <button
                key={w.value}
                type="button"
                className={p.swatch}
                aria-pressed={String(block.background ?? 'none') === w.value}
                aria-label={w.label}
                title={w.label}
                onClick={() => set(['background'], w.value)}
              >
                <span style={{ background: w.color }} />
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {images.length > 0 && (
        <fieldset className={p.pickGroup}>
          <legend>Bilder</legend>
          {images.map((leaf) => (
            <ImageSlot
              key={leaf.path.join('.')}
              label={leaf.label}
              media={leaf.media}
              focused={focusImage?.join('.') === leaf.path.join('.')}
              locale={ctx.locale}
              onFile={(file) => onImageFile(leaf.path, file)}
              onPick={(m) => set(leaf.path, m)}
            />
          ))}
        </fieldset>
      )}

      <details className={p.all} onToggle={(e) => setAllOpen(e.currentTarget.open)}>
        <summary>Alle innstillinger for seksjonen</summary>
        {allOpen && <FieldsForm fields={def.fields} value={block} onChange={(next) => onChange(next as Block, { typing: true })} ctx={ctx} />}
      </details>
    </div>
  )
}

/** A picture in the picker; missing pictures (new or site blocks) fall back to the text label. */
function Thumb({ src }: { src: string }) {
  const [ok, setOk] = useState(true)
  // eslint-disable-next-line @next/next/no-img-element
  return ok ? <img src={src} alt="" loading="lazy" onError={() => setOk(false)} /> : <span className={s.noThumb} aria-hidden />
}

function ImageSlot(props: { label: string; media: unknown; focused: boolean; locale: string; onFile: (f: File) => void; onPick: (m: MediaDoc) => void }) {
  const inputId = useId()
  const ref = useRef<HTMLDivElement>(null)
  const [library, setLibrary] = useState<MediaDoc[] | null>(null)
  const [over, setOver] = useState(false)
  const src = mediaThumb(props.media)
  useEffect(() => {
    if (props.focused) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [props.focused])
  return (
    <div
      ref={ref}
      className={p.imageSlot}
      data-focused={props.focused || undefined}
      data-over={over || undefined}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes('Files')) return
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        const file = e.dataTransfer.files[0]
        if (file?.type.startsWith('image/')) props.onFile(file)
      }}
    >
      <div className={p.imageRow}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {src ? <img src={src} alt="" /> : <span className={s.noThumb} aria-hidden />}
        <span className={p.imageLabel}>{props.label}</span>
      </div>
      <div className={p.imageActions}>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className={s.srOnly}
          aria-label={`Last opp nytt bilde: ${props.label}`}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) props.onFile(file)
            e.target.value = ''
          }}
        />
        <label htmlFor={inputId} className={s.btn}>
          <ImageUp size={16} aria-hidden /> Last opp
        </label>
        <button
          type="button"
          className={s.btn}
          aria-expanded={library !== null}
          onClick={() => (library ? setLibrary(null) : listMedia(props.locale).then(setLibrary).catch(() => setLibrary([])))}
        >
          <Images size={16} aria-hidden /> Velg fra biblioteket
        </button>
      </div>
      {library && (
        <ul className={p.library} aria-label="Bilder i biblioteket">
          {library.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => {
                  props.onPick(m)
                  setLibrary(null)
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mediaThumb(m) ?? ''} alt={m.alt || m.filename || `Bilde ${m.id}`} />
              </button>
            </li>
          ))}
          {library.length === 0 && <li className={s.hint}>Ingen bilder ennå.</li>}
        </ul>
      )}
      <p className={s.hint}>Eller slipp en bildefil her eller på bildet i forhåndsvisningen.</p>
    </div>
  )
}
