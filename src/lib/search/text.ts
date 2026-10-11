/**
 * Ren tekst ut av innhold til søkeindeksen: blokker (sidens seksjoner) og rik tekst (Lexical).
 * Henter bare felt som er tekst for besøkende; lenker, knapper, innstillinger og ID-er hoppes over.
 */

/** Feltnavn i blokkene (src/blocks/configs.ts) som inneholder tekst besøkende leser. */
const TEXT_KEYS = new Set([
  'heading',
  'eyebrow',
  'eyebrowHighlight',
  'title',
  'text',
  'intro',
  'quote',
  'author',
  'role',
  'caption',
  'label',
  'value',
  'year',
  'startLabel',
  'endLabel',
])

/** Grener som aldri har lesbar tekst (lenkeknapper, innbygging, media). */
const SKIP_KEYS = new Set(['link', 'links', 'url', 'embed', 'html', 'media', 'image', 'images', 'file', 'poster'])

type Lexical = { root?: unknown }
const isLexical = (v: unknown): v is Lexical =>
  Boolean(v && typeof v === 'object' && 'root' in v && (v as Lexical).root && typeof (v as Lexical).root === 'object')

/** Tekst fra et Lexical-tre. Avsnitt, overskrifter og listepunkter blir egne linjer. */
export function lexicalText(value: unknown): string {
  if (!isLexical(value)) return ''
  const out: string[] = []
  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    const n = node as { type?: string; text?: unknown; children?: unknown[]; fields?: unknown }
    if (typeof n.text === 'string') out.push(n.text)
    if (n.type === 'linebreak') out.push('\n')
    // Blokker inne i rik tekst har egne felt.
    if ((n.type === 'block' || n.type === 'inlineBlock') && n.fields) out.push(layoutText(n.fields), '\n')
    if (Array.isArray(n.children)) {
      for (const c of n.children) walk(c)
      if (n.type !== 'text' && n.type !== 'link' && n.type !== 'autolink') out.push('\n')
    }
  }
  walk(value.root)
  return normalize(out.join(''))
}

/** Tekst fra blokker eller andre felt (rekursivt), i rekkefølgen de vises. */
export function layoutText(value: unknown): string {
  const out: string[] = []
  const walk = (v: unknown, key: string | null) => {
    if (v === null || v === undefined) return
    if (typeof v === 'string') {
      if (key && TEXT_KEYS.has(key)) out.push(v)
      return
    }
    if (Array.isArray(v)) {
      for (const item of v) walk(item, key)
      return
    }
    if (typeof v !== 'object') return
    if (isLexical(v)) {
      out.push(lexicalText(v))
      return
    }
    for (const [k, child] of Object.entries(v)) {
      if (SKIP_KEYS.has(k)) continue
      walk(child, k)
    }
  }
  walk(value, null)
  return normalize(out.join('\n'))
}

/** Slår sammen mellomrom, fjerner tomme linjer og like linjer etter hverandre. */
export function normalize(text: string): string {
  const lines: string[] = []
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\s+/g, ' ').trim()
    if (line && line !== lines[lines.length - 1]) lines.push(line)
  }
  return lines.join('\n')
}

/**
 * Søkeord → tsquery for Postgres: hvert ord som prefiks, alle må være med.
 * «dør vin» → `dør:* & vin:*`. Tegn utenom bokstaver og tall fjernes (ingen injeksjon i tsquery).
 */
export function toTsQuery(q: string): string | null {
  const words = (q.toLowerCase().normalize('NFC').match(/[\p{L}\p{N}]+/gu) ?? []).slice(0, 8)
  if (!words.length) return null
  return words.map((w) => `${w}:*`).join(' & ')
}
