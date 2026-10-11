import Ajv, { type ErrorObject } from 'ajv'

import blocks from '../../../schema/blocks.schema.json'
import planSchema from '../../../schema/site-plan.schema.json'
import { LOCALES } from '../sites'
import type { SitePlan } from './types'

const BLOCK_TYPES: string[] = blocks.blockTypes

/** Replace every { propertyNames: { enum: [...] } } with the configured locales. */
function withLocales(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(withLocales)
  if (!node || typeof node !== 'object') return node
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(node)) out[k] = withLocales(v)
  if ((out.propertyNames as { enum?: unknown } | undefined)?.enum) out.propertyNames = { enum: LOCALES }
  if (out.$comment === 'blockType') out.enum = BLOCK_TYPES
  return out
}

const ajv = new Ajv({ allErrors: true, strict: false })
const check = ajv.compile(withLocales(planSchema) as object)

const fmt = (e: ErrorObject) => {
  const allowed = (e.params as { allowedValues?: unknown[] }).allowedValues
  return `${e.instancePath || '/'} ${e.message}${allowed ? ` (${allowed.join(', ')})` : ''}`
}

export function validateSitePlan(input: unknown): { ok: true; plan: SitePlan } | { ok: false; errors: string[] } {
  if (check(input)) return { ok: true, plan: input as SitePlan }
  return { ok: false, errors: (check.errors ?? []).map(fmt) }
}
