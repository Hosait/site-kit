/**
 * Checks a site plan without a database: the schema, every ref, and that every local media or
 * document file exists next to the plan. `pnpm kit:check-plan` runs it, so an agent writing a
 * plan gets fast answers before `pnpm kit:import`.
 */
import fs from 'node:fs'
import path from 'node:path'

import { findMissingRefs } from './refs'
import { validateSitePlan } from './validate'

export type PlanCheck = {
  ok: boolean
  errors: string[]
  summary: { pages: number; articles: number; media: number; documents: number; redirects: number; gaps: number }
}

export function checkPlan(raw: unknown, baseDir: string): PlanCheck {
  const v = validateSitePlan(raw)
  if (!v.ok) return { ok: false, errors: v.errors, summary: { pages: 0, articles: 0, media: 0, documents: 0, redirects: 0, gaps: 0 } }
  const plan = v.plan
  const errors = findMissingRefs(plan).map((r) => `missing ${r}`)
  const base = path.resolve(baseDir)
  for (const item of [...plan.media, ...(plan.documents ?? [])]) {
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(item.source)) {
      if (!/^https:\/\//i.test(item.source)) errors.push(`${item.ref}: ${item.source} — only https URLs or files next to the plan`)
      continue
    }
    const abs = path.resolve(base, item.source)
    if (!abs.startsWith(base + path.sep)) errors.push(`${item.ref}: ${item.source} is outside the plan's folder`)
    else if (!fs.existsSync(abs)) errors.push(`${item.ref}: ${item.source} does not exist`)
  }
  return {
    ok: errors.length === 0,
    errors,
    summary: {
      pages: plan.pages.length,
      articles: plan.articles?.length ?? 0,
      media: plan.media.length,
      documents: plan.documents?.length ?? 0,
      redirects: plan.redirects?.length ?? 0,
      gaps: plan.gaps?.length ?? 0,
    },
  }
}
