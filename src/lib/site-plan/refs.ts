import type { Locale } from '../sites'
import type { SitePlan } from './types'

type Ids = { media: Map<string, number>; pages: Map<string, number>; people?: Map<string, number>; documents?: Map<string, number>; forms?: Map<string, number> }

function walk(value: unknown, visit: (marker: string, ref: string) => void) {
  if (Array.isArray(value)) return value.forEach((v) => walk(v, visit))
  if (!value || typeof value !== 'object') return
  const o = value as Record<string, unknown>
  for (const m of ['$media', '$page', '$pageLink', '$person', '$document', '$form'])
    if (typeof o[m] === 'string' && Object.keys(o).length === 1) return visit(m, o[m] as string)
  for (const v of Object.values(o)) walk(v, visit)
}

/** Every ref the plan uses that it does not define, as 'media "x"' or 'page "y"'. */
export function findMissingRefs(plan: SitePlan): string[] {
  const media = new Set(plan.media.map((m) => m.ref))
  const pages = new Set(plan.pages.map((p) => p.ref))
  const people = new Set((plan.people ?? []).map((p) => p.ref))
  const documents = new Set((plan.documents ?? []).map((d) => d.ref))
  const forms = new Set((plan.forms ?? []).map((f) => f.ref))
  const missing = new Set<string>()
  const needMedia = (r?: string) => r && !media.has(r) && missing.add(`media "${r}"`)
  const needPage = (r?: string) => r && !pages.has(r) && missing.add(`page "${r}"`)
  walk(plan, (marker, ref) => {
    if (marker === '$media') needMedia(ref)
    else if (marker === '$person') void (!people.has(ref) && missing.add(`person "${ref}"`))
    else if (marker === '$document') void (!documents.has(ref) && missing.add(`document "${ref}"`))
    else if (marker === '$form') void (!forms.has(ref) && missing.add(`form "${ref}"`))
    else needPage(ref)
  })
  for (const p of plan.pages) {
    needPage(p.parent)
    needMedia(p.cardImage)
  }
  for (const a of plan.articles ?? []) needMedia(a.heroImage)
  for (const person of plan.people ?? []) needMedia(person.image)
  for (const items of Object.values(plan.settings.nav)) for (const i of items ?? []) needPage(i.page)
  for (const c of Object.values(plan.settings.contact ?? {})) needPage(c?.page)
  for (const cols of Object.values(plan.settings.footer ?? {})) for (const col of cols ?? []) for (const l of col.links) needPage(l.page)
  for (const r of plan.redirects ?? []) needPage(r.toPage)
  return [...missing]
}

export function orderPages(pages: SitePlan['pages']): SitePlan['pages'] {
  const byRef = new Map(pages.map((p) => [p.ref, p]))
  const done = new Set<string>()
  const out: SitePlan['pages'] = []
  const visit = (ref: string, trail: string[]) => {
    if (done.has(ref)) return
    if (trail.includes(ref)) throw new Error(`Page parent cycle: ${[...trail, ref].join(' → ')}`)
    const page = byRef.get(ref)
    if (!page) return
    if (page.parent) visit(page.parent, [...trail, ref])
    done.add(ref)
    out.push(page)
  }
  for (const p of pages) visit(p.ref, [])
  return out
}

export async function resolveValue(value: unknown, ids: Ids, html: (h: string) => Promise<unknown>): Promise<unknown> {
  if (Array.isArray(value)) return Promise.all(value.map((v) => resolveValue(v, ids, html)))
  if (!value || typeof value !== 'object') return value
  const o = value as Record<string, unknown>
  const keys = Object.keys(o)
  if (keys.length === 1) {
    if (typeof o.$media === 'string') return ids.media.get(o.$media)
    if (typeof o.$page === 'string') return ids.pages.get(o.$page)
    if (typeof o.$pageLink === 'string') return { relationTo: 'pages', value: ids.pages.get(o.$pageLink) }
    if (typeof o.$person === 'string') return ids.people?.get(o.$person)
    if (typeof o.$document === 'string') return ids.documents?.get(o.$document)
    if (typeof o.$form === 'string') return ids.forms?.get(o.$form)
    if (typeof o.$html === 'string') return html(o.$html)
  }
  const out: Record<string, unknown> = {}
  for (const k of keys) out[k] = await resolveValue(o[k], ids, html)
  return out
}

const isLocalized = (v: unknown) => !!v && typeof v === 'object' && !Array.isArray(v) && !('$media' in (v as object))

/** One locale's values of the given fields: localized objects give that locale's value, plain values pass through. */
export function localeData<T extends Record<string, unknown>>(item: T, locale: Locale, fields: (keyof T)[]) {
  const out: Partial<Record<keyof T, unknown>> = {}
  for (const f of fields) {
    const v = item[f]
    if (v === undefined) continue
    out[f] = isLocalized(v) && f !== 'address' ? (v as Record<string, unknown>)[locale] : v
  }
  return out
}
