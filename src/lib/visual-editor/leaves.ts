import { getAt, setAt, type EdField, type EditorConfig, type Path } from './schema'

/**
 * What can be edited directly on the page: text the visitor sees, and images. Each leaf has the
 * path from the block to its value, so a click on the rendered page can be written back to `layout`.
 */
export type TextLeaf = { path: Path; value: string; rich: boolean; multiline: boolean }
export type ImageLeaf = { path: Path; label: string; media: unknown }

type Doc = Record<string, unknown>
type LexicalNode = { type?: string; text?: string; format?: number; children?: LexicalNode[] }

/** Collapses whitespace the way the browser shows text, for matching values to rendered elements. */
export const normalizeText = (s: string) => s.replace(/\s+/g, ' ').trim()

/** A node whose children are text runs with one format, so editing it as plain text loses nothing. */
const isTextContainer = (n: LexicalNode) =>
  Array.isArray(n.children) &&
  n.children.length > 0 &&
  n.children.every(
    (c) => c.type === 'text' && typeof c.text === 'string' && (c.format ?? 0) === (n.children![0].format ?? 0) && (c as { style?: string }).style === (n.children![0] as { style?: string }).style,
  )

/** Lexical nodes whose children are all text runs in one format (a paragraph, heading, list item or link text). */
function richLeaves(node: LexicalNode, path: Path, out: TextLeaf[]) {
  if (!Array.isArray(node.children)) return
  node.children.forEach((child, i) => {
    const p = [...path, 'children', i]
    if (isTextContainer(child)) {
      const value = child.children!.map((c) => c.text).join('')
      if (normalizeText(value)) out.push({ path: p, value, rich: true, multiline: false })
    } else richLeaves(child, p, out)
  })
}

export function textLeaves(data: Doc, fields: EdField[], cfg: EditorConfig, base: Path = []): TextLeaf[] {
  const out: TextLeaf[] = []
  for (const f of fields) {
    const v = data?.[f.name]
    if (v === undefined || v === null) continue
    const p = [...base, f.name]
    if (f.kind === 'text' && typeof v === 'string' && normalizeText(v)) out.push({ path: p, value: v, rich: false, multiline: f.multiline })
    else if (f.kind === 'richText' && typeof v === 'object') {
      const root = (v as { root?: LexicalNode }).root
      if (root) richLeaves(root, [...p, 'root'], out)
    } else if (f.kind === 'group' && typeof v === 'object') out.push(...textLeaves(v as Doc, f.fields, cfg, p))
    else if (f.kind === 'array' && Array.isArray(v)) v.forEach((row, i) => out.push(...textLeaves(row as Doc, f.fields, cfg, [...p, i])))
    else if (f.kind === 'blocks' && Array.isArray(v))
      v.forEach((b, i) => {
        const def = cfg.blocks[String((b as Doc).blockType)]
        if (def) out.push(...textLeaves(b as Doc, def.fields, cfg, [...p, i]))
      })
  }
  return out
}

export function imageLeaves(data: Doc, fields: EdField[], cfg: EditorConfig, base: Path = [], prefix = ''): ImageLeaf[] {
  const out: ImageLeaf[] = []
  for (const f of fields) {
    const v = data?.[f.name]
    const p = [...base, f.name]
    const label = prefix ? `${prefix} – ${f.label}` : f.label
    if (f.kind === 'upload' && f.relationTo === 'media') out.push({ path: p, label, media: v ?? null })
    else if (f.kind === 'group') out.push(...imageLeaves((v ?? {}) as Doc, f.fields, cfg, p, f.name === 'section' ? f.label : prefix))
    else if (f.kind === 'array' && Array.isArray(v))
      v.forEach((row, i) => out.push(...imageLeaves(row as Doc, f.fields, cfg, [...p, i], `${f.label} ${i + 1}`)))
    else if (f.kind === 'blocks' && Array.isArray(v))
      v.forEach((b, i) => {
        const def = cfg.blocks[String((b as Doc).blockType)]
        if (def) out.push(...imageLeaves(b as Doc, def.fields, cfg, [...p, i], `${def.label} ${i + 1}`))
      })
  }
  return out
}

/** Writes edited text back: a plain field gets the string, a rich-text node keeps its first run's format. */
export function applyText<T>(block: T, leaf: Pick<TextLeaf, 'path' | 'rich'>, text: string): T {
  if (!leaf.rich) return setAt(block, leaf.path, text)
  const node = getAt(block, leaf.path) as LexicalNode | undefined
  const first = node?.children?.[0] ?? { type: 'text', format: 0 }
  return setAt(block, [...leaf.path, 'children'], [{ ...first, type: 'text', text }])
}

/** The URLs one media document can be shown with (original and generated sizes), as paths. */
export function mediaUrls(media: unknown): string[] {
  if (!media || typeof media !== 'object') return []
  const m = media as { url?: string | null; sizes?: Record<string, { url?: string | null } | undefined> }
  const urls = [m.url, ...Object.values(m.sizes ?? {}).map((s) => s?.url)].filter((u): u is string => Boolean(u))
  return urls.map((u) => {
    try {
      return decodeURIComponent(new URL(u, 'http://x').pathname)
    } catch {
      return u
    }
  })
}

/** Undo/redo over layout snapshots. */
export type History<T> = { past: T[]; present: T; future: T[] }
export const HISTORY_LIMIT = 100

export const historyOf = <T>(present: T): History<T> => ({ past: [], present, future: [] })

export function pushHistory<T>(h: History<T>, next: T): History<T> {
  if (next === h.present) return h
  return { past: [...h.past, h.present].slice(-HISTORY_LIMIT), present: next, future: [] }
}

export function undo<T>(h: History<T>): History<T> {
  if (!h.past.length) return h
  return { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] }
}

export function redo<T>(h: History<T>): History<T> {
  if (!h.future.length) return h
  return { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) }
}

/** Moves an item; `to` is the index before which it lands, in the list as it was. */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from + 1 === to) return list
  const copy = [...list]
  const [item] = copy.splice(from, 1)
  copy.splice(to > from ? to - 1 : to, 0, item)
  return copy
}
