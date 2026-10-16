/**
 * The first deploy fills an empty site from seed/site-plan.json (media under seed/, or public
 * https URLs). The older SQL dump (seed/content.sql.gz) still works when there is no plan.
 */
import fs from 'node:fs'
import path from 'node:path'

import type { Payload } from 'payload'

import { importPlan, type ImportOptions, type ImportResult } from './import'
import type { SitePlan } from './types'
import { validateSitePlan } from './validate'

export type SeedSource = 'plan' | 'sql' | 'none'

export function seedSource(seedDir: string): SeedSource {
  if (fs.existsSync(path.join(seedDir, 'site-plan.json'))) return 'plan'
  if (fs.existsSync(path.join(seedDir, 'content.sql.gz'))) return 'sql'
  return 'none'
}

export function loadSeedPlan(seedDir: string): { ok: true; plan: SitePlan } | { ok: false; error: string } {
  let raw: unknown
  try {
    raw = JSON.parse(fs.readFileSync(path.join(seedDir, 'site-plan.json'), 'utf8'))
  } catch (e) {
    return { ok: false, error: `seed/site-plan.json: ${e instanceof Error ? e.message : String(e)}` }
  }
  const v = validateSitePlan(raw)
  return v.ok ? { ok: true, plan: v.plan } : { ok: false, error: `seed/site-plan.json: ${v.errors.slice(0, 10).join('; ')}` }
}

export type PlanSeedProgress = {
  running: boolean
  done: number
  total: number
  startedAt: string
  finishedAt?: string
  error?: string
  result?: ImportResult
}

/** Runs the import and keeps `progress` current. Never throws: a failure lands in progress.error. */
export async function runPlanSeed(
  payload: Payload,
  plan: SitePlan,
  seedDir: string,
  progress: PlanSeedProgress,
  opts: { reset: boolean; importer?: typeof importPlan; after?: () => Promise<void> } & Pick<ImportOptions, 'fetchMedia' | 'toLexical'>,
): Promise<void> {
  const importer = opts.importer ?? importPlan
  try {
    progress.result = await importer(payload, plan, {
      baseDir: seedDir,
      reset: opts.reset,
      fetchMedia: opts.fetchMedia,
      toLexical: opts.toLexical,
      onProgress: (done, total) => {
        progress.done = done
        progress.total = total
      },
    })
    await opts.after?.()
  } catch (e) {
    progress.error = e instanceof Error ? e.message : String(e)
  } finally {
    progress.running = false
    progress.finishedAt = new Date().toISOString()
  }
}
