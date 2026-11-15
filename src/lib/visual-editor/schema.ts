import type { Block, Field } from 'payload'

/**
 * The visual editor's own description of the page blocks, generated from the Payload block configs
 * (`pageBlocks`). It is plain JSON, so the admin view can hand it to the client editor; functions in
 * the Payload configs (conditions, validation) stay on the server, and Payload still validates on save.
 */
export type Option = { label: string; value: string }

type Base = { name: string; label: string }
export type EdField =
  | (Base & { kind: 'text'; multiline: boolean; defaultValue?: string })
  | (Base & { kind: 'number'; min?: number; max?: number; defaultValue?: number })
  | (Base & { kind: 'select'; options: Option[]; many: boolean; defaultValue?: string | string[] })
  | (Base & { kind: 'checkbox'; defaultValue?: boolean })
  | (Base & { kind: 'upload'; relationTo: string })
  | (Base & { kind: 'relationship'; relationTo: string | string[]; many: boolean })
  | (Base & { kind: 'array'; fields: EdField[]; maxRows?: number })
  | (Base & { kind: 'group'; fields: EdField[] })
  | (Base & { kind: 'blocks'; blocks: string[] })
  | (Base & { kind: 'richText' })

export type EdBlock = {
  slug: string
  label: string
  fields: EdField[]
  /** Select fields shown as a picture picker («Oppsett»). */
  variants: string[]
  /** Has the block's own `background` select (shown as colour swatches). */
  background: boolean
  /** Has the shared `section` group («Seksjonsoppsett»). */
  section: boolean
}

export type EditorConfig = { blocks: Record<string, EdBlock>; library: string[] }

/** Select fields that change a block's layout; the editor shows them as pictures. */
export const VARIANT_FIELDS = ['variant', 'layout', 'imagePosition', 'columns', 'size', 'width', 'ratio'] as const

function labelOf(label: unknown, fallback: string): string {
  if (typeof label === 'string') return label
  if (label && typeof label === 'object') {
    const l = label as Record<string, string>
    return l.nb ?? l.no ?? Object.values(l)[0] ?? fallback
  }
  return fallback
}

function options(raw: unknown[]): Option[] {
  return raw.map((o) =>
    typeof o === 'string' ? { label: o, value: o } : { label: labelOf((o as Option).label, String((o as Option).value)), value: String((o as Option).value) },
  )
}

function staticDefault<T>(value: unknown, guard: (v: unknown) => v is T): T | undefined {
  return guard(value) ? value : undefined
}
const isString = (v: unknown): v is string => typeof v === 'string'
const isNumber = (v: unknown): v is number => typeof v === 'number'
const isBool = (v: unknown): v is boolean => typeof v === 'boolean'
const isSelectDefault = (v: unknown): v is string | string[] => typeof v === 'string' || (Array.isArray(v) && v.every(isString))

/** Maps Payload fields to editor fields. Layout-only fields (row, collapsible, unnamed tabs) are flattened. */
export function toEditorFields(fields: Field[], nested: Map<string, Block>): EdField[] {
  const out: EdField[] = []
  // Keys with undefined values are left out, so the config is the same after a JSON round trip.
  const push = (f: EdField) => out.push(Object.fromEntries(Object.entries(f).filter(([, v]) => v !== undefined)) as EdField)
  for (const f of fields) {
    if (f.type === 'row' || f.type === 'collapsible') {
      out.push(...toEditorFields(f.fields, nested))
      continue
    }
    if (f.type === 'tabs') {
      for (const tab of f.tabs) {
        const inner = toEditorFields(tab.fields, nested)
        if ('name' in tab && tab.name) push({ kind: 'group', name: tab.name, label: labelOf(tab.label, tab.name), fields: inner })
        else out.push(...inner)
      }
      continue
    }
    if (!('name' in f) || f.name === 'id' || f.name === 'blockName') continue
    if ((f.admin as { hidden?: boolean } | undefined)?.hidden === true) continue
    const base = { name: f.name, label: labelOf((f as { label?: unknown }).label, f.name) }
    const dv = (f as { defaultValue?: unknown }).defaultValue
    switch (f.type) {
      case 'text':
      case 'email':
      case 'code':
      case 'date':
        push({ ...base, kind: 'text', multiline: false, defaultValue: staticDefault(dv, isString) })
        break
      case 'textarea':
        push({ ...base, kind: 'text', multiline: true, defaultValue: staticDefault(dv, isString) })
        break
      case 'number':
        push({ ...base, kind: 'number', min: f.min, max: f.max, defaultValue: staticDefault(dv, isNumber) })
        break
      case 'select':
      case 'radio':
        push({
          ...base,
          kind: 'select',
          options: options(f.options as unknown[]),
          many: f.type === 'select' && Boolean(f.hasMany),
          defaultValue: staticDefault(dv, isSelectDefault),
        })
        break
      case 'checkbox':
        push({ ...base, kind: 'checkbox', defaultValue: staticDefault(dv, isBool) })
        break
      case 'upload':
        push({ ...base, kind: 'upload', relationTo: String(f.relationTo) })
        break
      case 'relationship':
        push({ ...base, kind: 'relationship', relationTo: f.relationTo as string | string[], many: Boolean(f.hasMany) })
        break
      case 'array':
        push({ ...base, kind: 'array', fields: toEditorFields(f.fields, nested), maxRows: f.maxRows })
        break
      case 'group':
        push({ ...base, kind: 'group', fields: toEditorFields(f.fields, nested) })
        break
      case 'blocks': {
        const blocks = (f.blocks ?? []) as Block[]
        for (const b of blocks) if (!nested.has(b.slug)) nested.set(b.slug, b)
        push({ ...base, kind: 'blocks', blocks: blocks.map((b) => b.slug) })
        break
      }
      case 'richText':
        push({ ...base, kind: 'richText' })
        break
      default:
        // ui, join, json, point: not edited in the simple editor (the form admin has them).
        break
    }
  }
  return out
}

function toEdBlock(b: Block, nested: Map<string, Block>): EdBlock {
  const fields = toEditorFields(b.fields, nested)
  return {
    slug: b.slug,
    label: labelOf(b.labels?.singular, b.slug),
    fields,
    variants: fields.filter((f) => f.kind === 'select' && !f.many && (VARIANT_FIELDS as readonly string[]).includes(f.name)).map((f) => f.name),
    background: fields.some((f) => f.kind === 'select' && f.name === 'background'),
    section: fields.some((f) => f.kind === 'group' && f.name === 'section'),
  }
}

/** The editor config for a list of page blocks (kit and site blocks), including blocks nested in them. */
export function buildEditorConfig(pageBlocks: Block[]): EditorConfig {
  const nested = new Map<string, Block>()
  const blocks: Record<string, EdBlock> = {}
  for (const b of pageBlocks) blocks[b.slug] = toEdBlock(b, nested)
  // Blocks only used inside others (e.g. a column's content); each registered once.
  for (let i = 0; i < 20 && [...nested.keys()].some((s) => !blocks[s]); i++) {
    for (const [slug, b] of [...nested]) if (!blocks[slug]) blocks[slug] = toEdBlock(b, nested)
  }
  return { blocks, library: pageBlocks.map((b) => b.slug) }
}

/** Default values from the schema, for a new block or array row. */
export function defaultsFor(fields: EdField[]): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const f of fields) {
    if ('defaultValue' in f && f.defaultValue !== undefined) out[f.name] = f.defaultValue
    else if (f.kind === 'group') {
      const inner = defaultsFor(f.fields)
      if (Object.keys(inner).length) out[f.name] = inner
    }
  }
  return out
}

/** Block and array row ids in the same shape Payload uses (24 hex characters). */
export function newId(): string {
  const bytes = new Uint8Array(12)
  globalThis.crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export type Path = (string | number)[]

export function getAt(obj: unknown, path: Path): unknown {
  let cur = obj
  for (const key of path) {
    if (cur === null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string | number, unknown>)[key]
  }
  return cur
}

/** Returns a copy of `obj` with `value` at `path`; only the objects along the path are copied. */
export function setAt<T>(obj: T, path: Path, value: unknown): T {
  if (path.length === 0) return value as T
  const [key, ...rest] = path
  const src = (obj ?? (typeof key === 'number' ? [] : {})) as Record<string | number, unknown>
  const copy = (Array.isArray(src) ? [...src] : { ...src }) as Record<string | number, unknown>
  copy[key] = setAt(src[key], rest, value)
  return copy as T
}

type Doc = Record<string, unknown>
const idOf = (v: unknown): unknown => (v && typeof v === 'object' && 'id' in v ? (v as { id: unknown }).id : v)

/** Turns populated uploads and relationships back into ids before the layout is saved. */
export function normalizeForSave(data: Doc, fields: EdField[], cfg: EditorConfig): Doc {
  const out: Doc = { ...data }
  for (const f of fields) {
    const v = data[f.name]
    if (v === undefined || v === null) continue
    if (f.kind === 'upload') out[f.name] = idOf(v)
    else if (f.kind === 'relationship') {
      const one = (x: unknown) =>
        Array.isArray(f.relationTo) && x && typeof x === 'object' && 'relationTo' in x
          ? { relationTo: (x as { relationTo: string }).relationTo, value: idOf((x as unknown as { value: unknown }).value) }
          : idOf(x)
      out[f.name] = Array.isArray(v) ? v.map(one) : one(v)
    } else if (f.kind === 'array' && Array.isArray(v)) out[f.name] = v.map((row) => normalizeForSave(row as Doc, f.fields, cfg))
    else if (f.kind === 'group' && typeof v === 'object') out[f.name] = normalizeForSave(v as Doc, f.fields, cfg)
    else if (f.kind === 'blocks' && Array.isArray(v)) out[f.name] = normalizeLayout(v as Doc[], cfg)
  }
  return out
}

export function normalizeLayout<T extends Doc>(layout: T[], cfg: EditorConfig): T[] {
  return layout.map((b) => {
    const def = cfg.blocks[String(b.blockType)]
    return (def ? normalizeForSave(b, def.fields, cfg) : b) as T
  })
}
