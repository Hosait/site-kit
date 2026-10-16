/**
 * site/questions.json: the intake questions both Hosait Sites paths ask (the Hosait wizard,
 * and the hosait-sites skill in the user's own Claude), and what each answer sets.
 */
import { STRING_LOCALES } from './string-locales'

export type Question = {
  id: string
  text: string
  help?: string
  type: 'text' | 'url' | 'choice' | 'multi' | 'boolean' | 'people'
  options?: { value: string; label: string }[]
  /** Dot paths into site/config.ts (* matches any key), or report.<name> / cms.<name>. */
  sets: string[]
  required?: boolean
}

const TYPES = new Set(['text', 'url', 'choice', 'multi', 'boolean', 'people'])

function hasPath(obj: unknown, parts: string[]): boolean {
  if (!parts.length) return true
  if (!obj || typeof obj !== 'object') return false
  const [head, ...rest] = parts
  const o = obj as Record<string, unknown>
  if (head === '*') return Object.values(o).some((v) => hasPath(v, rest))
  return head in o && hasPath(o[head], rest)
}

export function checkQuestions(input: unknown, config: Record<string, unknown>): string[] {
  const problems: string[] = []
  const doc = input as { version?: unknown; questions?: unknown }
  if (doc?.version !== 1) problems.push('version must be 1')
  if (!Array.isArray(doc?.questions)) return [...problems, 'questions must be a list']
  const seen = new Set<string>()
  for (const q of doc.questions as Question[]) {
    const id = String(q?.id ?? '')
    if (!/^[a-z][a-zA-Z0-9]*$/.test(id)) problems.push(`"${id}": id must be camelCase letters and digits`)
    if (seen.has(id)) problems.push(`${id}: duplicate id`)
    seen.add(id)
    if (!q.text) problems.push(`${id}: text is missing`)
    if (!TYPES.has(q.type)) problems.push(`${id}: unknown type ${String(q.type)}`)
    if ((q.type === 'choice' || q.type === 'multi') && (!Array.isArray(q.options) || q.options.length < 2)) problems.push(`${id}: needs at least two options`)
    if (!Array.isArray(q.sets) || !q.sets.length) problems.push(`${id}: sets is missing`)
    for (const p of q.sets ?? []) {
      if (/^(report|cms)\.[a-zA-Z0-9]+$/.test(p)) continue
      if (!hasPath(config, p.split('.'))) problems.push(`${id}: ${p} is not in site/config.ts`)
    }
    if (q.sets?.includes('locales'))
      for (const o of q.options ?? [])
        if (!(STRING_LOCALES as readonly string[]).includes(o.value))
          problems.push(`${id}: ${o.value} is not a locale the kit supports (${STRING_LOCALES.join(', ')})`)
  }
  return problems
}
