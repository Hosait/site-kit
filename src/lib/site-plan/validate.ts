import Ajv, { type ErrorObject } from 'ajv'

import blocks from '../../../schema/blocks.schema.json'
import planSchema from '../../../schema/site-plan.schema.json'
import { DEFAULT_LOCALE, LOCALES } from '../sites'
import { PLAN_CHOICES } from './choices'
import { orderPages } from './refs'
import { stampSchema } from './stamp-schema'
import type { SitePlan } from './types'

const BLOCK_TYPES: string[] = blocks.blockTypes

const ajv = new Ajv({ allErrors: true, strict: false })
const check = ajv.compile(stampSchema(planSchema, LOCALES, BLOCK_TYPES, PLAN_CHOICES) as object)

const fmt = (e: ErrorObject) => {
  const allowed = (e.params as { allowedValues?: unknown[] }).allowedValues
  return `${e.instancePath || '/'} ${e.message}${allowed ? ` (${allowed.join(', ')})` : ''}`
}

/**
 * What JSON Schema cannot say, and the import would refuse or get wrong: unique refs per kind,
 * unique redirect addresses, no cycle among page parents, and a title in the default language.
 * Paths as Ajv writes them.
 */
function crossCheck(plan: SitePlan): string[] {
  const errors: string[] = []
  const kinds = [['media', plan.media], ['people', plan.people], ['documents', plan.documents], ['pages', plan.pages], ['articles', plan.articles]] as const
  for (const [kind, list] of kinds) {
    const seen = new Set<string>()
    ;(list ?? []).forEach((item, i) => {
      if (seen.has(item.ref)) errors.push(`/${kind}/${i}/ref duplicate ref "${item.ref}"`)
      seen.add(item.ref)
    })
  }
  try {
    orderPages(plan.pages)
  } catch (e) {
    errors.push(`/pages ${e instanceof Error ? e.message : String(e)}`)
  }
  const from = new Set<string>()
  ;(plan.redirects ?? []).forEach((r, i) => {
    if (from.has(r.from)) errors.push(`/redirects/${i}/from duplicate redirect from "${r.from}"`)
    from.add(r.from)
  })
  for (const [kind, list] of [['pages', plan.pages], ['articles', plan.articles], ['documents', plan.documents]] as const)
    (list ?? []).forEach((item, i) => {
      if (!item.title[DEFAULT_LOCALE]) errors.push(`/${kind}/${i}/title needs a title in "${DEFAULT_LOCALE}", the default language`)
    })
  return errors
}

export function validateSitePlan(input: unknown): { ok: true; plan: SitePlan } | { ok: false; errors: string[] } {
  if (!check(input)) return { ok: false, errors: (check.errors ?? []).map(fmt) }
  const errors = crossCheck(input as SitePlan)
  return errors.length ? { ok: false, errors } : { ok: true, plan: input as SitePlan }
}
