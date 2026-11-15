'use client'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { useEffect, useId, useState } from 'react'

import { newBlock, withNewIds } from '@/lib/visual-editor/presets'
import { defaultsFor, newId, type EdField, type EditorConfig } from '@/lib/visual-editor/schema'
import { moveItem } from '@/lib/visual-editor/leaves'

import { listDocs } from './api'
import s from './editor.module.css'
import p from './panels.module.css'

type Doc = Record<string, unknown>
export type FieldsCtx = { config: EditorConfig; locale: string; titles: Record<string, string> }

/** Every field of a block, generated from its schema; the form admin remains the full editor. */
export function FieldsForm({ fields, value, onChange, ctx }: { fields: EdField[]; value: Doc; onChange: (next: Doc) => void; ctx: FieldsCtx }) {
  return (
    <div className={p.fields}>
      {fields.map((f) => (
        <FieldInput key={f.name} field={f} value={value?.[f.name]} onChange={(v) => onChange({ ...value, [f.name]: v })} ctx={ctx} />
      ))}
    </div>
  )
}

function FieldInput({ field: f, value, onChange, ctx }: { field: EdField; value: unknown; onChange: (v: unknown) => void; ctx: FieldsCtx }) {
  const id = useId()
  switch (f.kind) {
    case 'text':
      return (
        <div className={s.field}>
          <label htmlFor={id}>{f.label}</label>
          {f.multiline ? (
            <textarea id={id} rows={3} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />
          ) : (
            <input id={id} type="text" value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />
          )}
        </div>
      )
    case 'number':
      return (
        <div className={s.field}>
          <label htmlFor={id}>{f.label}</label>
          <input id={id} type="number" min={f.min} max={f.max} value={value === null || value === undefined ? '' : String(value)} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} />
        </div>
      )
    case 'checkbox':
      return (
        <div className={p.check}>
          <input id={id} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          <label htmlFor={id}>{f.label}</label>
        </div>
      )
    case 'select':
      return (
        <div className={s.field}>
          <label htmlFor={id}>{f.label}</label>
          <select
            id={id}
            multiple={f.many}
            value={f.many ? ((value as string[] | undefined) ?? []) : String(value ?? '')}
            onChange={(e) => onChange(f.many ? Array.from(e.target.selectedOptions, (o) => o.value) : e.target.value || null)}
          >
            {!f.many && <option value="">–</option>}
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )
    case 'relationship':
      return <RelationshipInput field={f} value={value} onChange={onChange} ctx={ctx} />
    case 'upload':
      return (
        <p className={s.hint}>
          {f.label}: {value ? 'valgt' : 'ikke valgt'} – bytt under «Bilder».
        </p>
      )
    case 'richText':
      return <p className={s.hint}>{f.label}: klikk i teksten på siden for å endre den. Lenker og formatering endres i skjemaet.</p>
    case 'group':
      return (
        <fieldset className={p.group}>
          <legend>{f.label}</legend>
          <FieldsForm fields={f.fields} value={(value ?? {}) as Doc} onChange={onChange} ctx={ctx} />
        </fieldset>
      )
    case 'array':
      return (
        <Rows
          label={f.label}
          rows={(value as Doc[] | undefined) ?? []}
          onChange={onChange}
          canAdd={!f.maxRows || ((value as Doc[] | undefined)?.length ?? 0) < f.maxRows}
          add={() => [{ id: newId(), ...defaultsFor(f.fields) }]}
          title={(row, i) => String(row.title ?? row.label ?? row.year ?? row.value ?? `${f.label} ${i + 1}`)}
          render={(row, set) => <FieldsForm fields={f.fields} value={row} onChange={set} ctx={ctx} />}
        />
      )
    case 'blocks':
      return (
        <Rows
          label={f.label}
          rows={(value as Doc[] | undefined) ?? []}
          onChange={onChange}
          canAdd
          choices={f.blocks.map((slug) => ({ value: slug, label: ctx.config.blocks[slug]?.label ?? slug }))}
          add={(slug) => [newBlock(slug ?? f.blocks[0], ctx.config)]}
          title={(row) => ctx.config.blocks[String(row.blockType)]?.label ?? String(row.blockType)}
          render={(row, set) => {
            const def = ctx.config.blocks[String(row.blockType)]
            return def ? <FieldsForm fields={def.fields} value={row} onChange={set} ctx={ctx} /> : null
          }}
        />
      )
  }
}

/** Array rows and nested blocks: open one, move, remove, add. */
function Rows(props: {
  label: string
  rows: Doc[]
  onChange: (rows: Doc[]) => void
  canAdd: boolean
  add: (choice?: string) => Doc[]
  choices?: { value: string; label: string }[]
  title: (row: Doc, i: number) => string
  render: (row: Doc, set: (next: Doc) => void) => React.ReactNode
}) {
  const { rows, onChange } = props
  const [choice, setChoice] = useState(props.choices?.[0]?.value)
  const id = useId()
  return (
    <fieldset className={p.group}>
      <legend>{props.label}</legend>
      {rows.map((row, i) => (
        <details key={String(row.id ?? i)} className={p.row}>
          <summary>{props.title(row, i)}</summary>
          <div className={p.rowActions}>
            <button type="button" className={s.iconBtn} aria-label={`Flytt ${props.title(row, i)} opp`} disabled={i === 0} onClick={() => onChange(moveItem(rows, i, i - 1))}>
              <ArrowUp size={16} aria-hidden />
            </button>
            <button type="button" className={s.iconBtn} aria-label={`Flytt ${props.title(row, i)} ned`} disabled={i === rows.length - 1} onClick={() => onChange(moveItem(rows, i, i + 2))}>
              <ArrowDown size={16} aria-hidden />
            </button>
            <button type="button" className={s.iconBtn} aria-label={`Kopier ${props.title(row, i)}`} onClick={() => onChange([...rows.slice(0, i + 1), withNewIds(row), ...rows.slice(i + 1)])}>
              <Plus size={16} aria-hidden />
            </button>
            <button type="button" className={s.iconBtn} aria-label={`Fjern ${props.title(row, i)}`} onClick={() => onChange(rows.filter((_, n) => n !== i))}>
              <Trash2 size={16} aria-hidden />
            </button>
          </div>
          {props.render(row, (next) => onChange(rows.map((r, n) => (n === i ? next : r))))}
        </details>
      ))}
      {props.canAdd && (
        <div className={p.addRow}>
          {props.choices && props.choices.length > 1 && (
            <>
              <label htmlFor={id} className={s.srOnly}>
                Type
              </label>
              <select id={id} value={choice} onChange={(e) => setChoice(e.target.value)}>
                {props.choices.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </>
          )}
          <button type="button" className={s.btn} onClick={() => onChange([...rows, ...props.add(choice)])}>
            <Plus size={16} aria-hidden /> Legg til
          </button>
        </div>
      )}
    </fieldset>
  )
}

type Ref = { relationTo: string; value: unknown } | number | string | { id: unknown } | null
const refKey = (v: Ref, poly: boolean): string => {
  if (v === null || v === undefined) return ''
  if (poly && typeof v === 'object' && 'relationTo' in v) {
    const val = v.value as { id?: unknown } | number | string
    return `${v.relationTo}:${typeof val === 'object' ? val?.id : val}`
  }
  return String(typeof v === 'object' && 'id' in v ? v.id : v)
}

function RelationshipInput({ field: f, value, onChange, ctx }: { field: Extract<EdField, { kind: 'relationship' }>; value: unknown; onChange: (v: unknown) => void; ctx: FieldsCtx }) {
  const id = useId()
  const poly = Array.isArray(f.relationTo)
  const collections = poly ? (f.relationTo as string[]) : [f.relationTo as string]
  const [options, setOptions] = useState<{ collection: string; id: number | string; title: string }[]>([])
  useEffect(() => {
    Promise.all(collections.map((c) => listDocs(c, ctx.titles[c] ?? 'id', ctx.locale).then((docs) => docs.map((d) => ({ collection: c, ...d })))))
      .then((lists) => setOptions(lists.flat()))
      .catch(() => setOptions([]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.name, ctx.locale])
  const keyOf = (o: { collection: string; id: number | string }) => (poly ? `${o.collection}:${o.id}` : String(o.id))
  const fromKey = (k: string) => {
    const o = options.find((x) => keyOf(x) === k)
    if (!o) return null
    return poly ? { relationTo: o.collection, value: o.id } : o.id
  }
  const current = f.many ? ((value as Ref[] | undefined) ?? []).map((v) => refKey(v, poly)) : refKey(value as Ref, poly)
  return (
    <div className={s.field}>
      <label htmlFor={id}>{f.label}</label>
      <select
        id={id}
        multiple={f.many}
        value={current}
        onChange={(e) => onChange(f.many ? Array.from(e.target.selectedOptions, (o) => fromKey(o.value)).filter(Boolean) : fromKey(e.target.value))}
      >
        {!f.many && <option value="">–</option>}
        {options.map((o) => (
          <option key={keyOf(o)} value={keyOf(o)}>
            {poly ? `${o.title} (${o.collection === 'pages' ? 'side' : o.collection === 'articles' ? 'artikkel' : o.collection})` : o.title}
          </option>
        ))}
      </select>
    </div>
  )
}
