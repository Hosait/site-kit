import { randomBytes } from 'node:crypto'

import type { CollectionBeforeChangeHook } from 'payload'
import { APIError } from 'payload'

import { DEFAULT_LOCALE, type Locale } from '@/lib/sites'

/** A block as stored in a `layout`: its own id and the block type, plus the block's fields. */
type Row = { id?: string; blockType?: string; [field: string]: unknown }

const newId = () => randomBytes(12).toString('hex')

/** Lexical state is `{ root: { type: 'root', children } }`; node ids inside it are not block ids. */
const isRichText = (o: Record<string, unknown>) => typeof o.root === 'object' && o.root !== null && (o.root as { type?: string }).type === 'root'

/**
 * A deep copy where every block and array row has a new id. Without it the copy and its source
 * share row ids, and Payload then treats the two as the same rows when versions are compared.
 * Rich text is copied as it is, and so are values that are not rows (relationship ids, numbers).
 */
export function withFreshIds<T>(value: T): T {
  if (Array.isArray(value)) return value.map(withFreshIds) as T
  if (!value || typeof value !== 'object') return value
  const o = value as Record<string, unknown>
  if (isRichText(o)) return structuredClone(o) as T
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(o)) out[k] = k === 'id' && typeof v === 'string' ? newId() : withFreshIds(v)
  return out as T
}

const idOf = (v: unknown): number | string | null => {
  if (v && typeof v === 'object') return idOf((v as { id?: unknown }).id)
  return typeof v === 'number' || (typeof v === 'string' && v !== '') ? v : null
}

const localeOf = (req: { locale?: string | null }): Locale => (req.locale && req.locale !== 'all' ? req.locale : DEFAULT_LOCALE) as Locale

/**
 * «Start fra sidemal»: a page that has no sections gets a copy of the template's sections, in the
 * language it is edited in, the moment a template is chosen. Payload's admin saves a blank draft as
 * soon as «create» opens, so the choice arrives as an update of that draft, not as the create: the
 * hook acts on create and on an update that sets a template different from the saved one, and in
 * both cases only while the page has no sections. A page with sections is never overwritten, and
 * saving again with the same template does nothing.
 */
export const startFromTemplate: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const templateId = idOf(data.template)
  if (templateId === null || templateId === idOf(originalDoc?.template)) return data
  // A partial update leaves `layout` out of `data`; what is saved then counts.
  const sections = data.layout ?? originalDoc?.layout
  if (Array.isArray(sections) && sections.length > 0) return data
  const template = await req.payload.findByID({
    collection: 'pageTemplates',
    id: templateId,
    locale: localeOf(req),
    depth: 0,
    overrideAccess: false,
    req,
  })
  const site = data.site ?? originalDoc?.site
  if (site && template.site !== site) throw new APIError('Sidemalen hører til et annet nettsted.', 400)
  data.layout = withFreshIds(template.layout ?? [])
  return data
}

/**
 * «Sett inn lagret seksjon»: a `preset` block in a layout is replaced by an independent copy of the
 * saved block it points at (new ids, same language). An unchosen one stays until the page is
 * published, where its required field stops it. The copy is a normal block, so it is validated and
 * rendered like any other.
 */
export const expandPresets: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const layout = data.layout as Row[] | undefined
  if (!Array.isArray(layout) || !layout.some((b) => b.blockType === 'preset')) return data
  const locale = localeOf(req)
  const out: Row[] = []
  for (const row of layout) {
    const presetId = row.blockType === 'preset' ? idOf(row.preset) : null
    if (row.blockType !== 'preset' || presetId === null) {
      out.push(row)
      continue
    }
    const preset = await req.payload.findByID({
      collection: 'sectionPresets',
      id: presetId,
      locale,
      depth: 0,
      overrideAccess: false,
      req,
    })
    const site = data.site ?? originalDoc?.site
    if (site && preset.site !== site) throw new APIError('Den lagrede seksjonen hører til et annet nettsted.', 400)
    const block = preset.block?.[0]
    if (!block) throw new APIError(`Den lagrede seksjonen «${preset.name}» har ikke innhold på dette språket.`, 400)
    out.push(withFreshIds(block) as Row)
  }
  data.layout = out
  return data
}
