import Ajv, { type ErrorObject } from 'ajv'

import blocks from '../../../schema/blocks.schema.json'
import planSchema from '../../../schema/site-plan.schema.json'
import { LOCALES } from '../sites'
import { stampSchema } from './stamp-schema'
import type { SitePlan } from './types'

const BLOCK_TYPES: string[] = blocks.blockTypes

const ajv = new Ajv({ allErrors: true, strict: false })
const check = ajv.compile(stampSchema(planSchema, LOCALES, BLOCK_TYPES) as object)

const fmt = (e: ErrorObject) => {
  const allowed = (e.params as { allowedValues?: unknown[] }).allowedValues
  return `${e.instancePath || '/'} ${e.message}${allowed ? ` (${allowed.join(', ')})` : ''}`
}

export function validateSitePlan(input: unknown): { ok: true; plan: SitePlan } | { ok: false; errors: string[] } {
  if (check(input)) return { ok: true, plan: input as SitePlan }
  return { ok: false, errors: (check.errors ?? []).map(fmt) }
}
