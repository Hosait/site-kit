/**
 * Checks a site plan without a database: the schema and what validateSitePlan adds (unique refs,
 * no parent cycle, default-language titles), every ref, every local media or document file (an
 * ordinary file inside the plan's folder), and every media URL by the import's own rules. `pnpm kit:check-plan` runs it, so an agent writing a
 * plan gets fast answers before `pnpm kit:import`.
 */
import path from 'node:path'

import { mediaUrlProblem } from './fetch-media'
import { resolveLocalFile } from './local-file'
import { findMissingRefs } from './refs'
import { validateSitePlan } from './validate'

export type PlanCheck = {
  ok: boolean
  errors: string[]
  summary: { pages: number; articles: number; media: number; documents: number; redirects: number; gaps: number }
}

export async function checkPlan(raw: unknown, baseDir: string): Promise<PlanCheck> {
  const v = validateSitePlan(raw)
  if (!v.ok) return { ok: false, errors: v.errors, summary: { pages: 0, articles: 0, media: 0, documents: 0, redirects: 0, gaps: 0 } }
  const plan = v.plan
  const errors = findMissingRefs(plan).map((r) => `missing ${r}`)
  const base = path.resolve(baseDir)
  for (const item of [...plan.media, ...(plan.documents ?? [])]) {
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(item.source)) {
      if (!/^https:\/\//i.test(item.source)) errors.push(`${item.ref}: ${item.source} — only https URLs or files next to the plan`)
      else {
        const problem = mediaUrlProblem(item.source)
        if (problem) errors.push(`${item.ref}: ${item.source} — ${problem.message}`)
      }
      continue
    }
    if (path.isAbsolute(item.source)) {
      errors.push(`${item.ref}: ${item.source} — use a path relative to the plan`)
      continue
    }
    try {
      await resolveLocalFile(base, item.source)
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e)
      const why = /outside/.test(m) ? 'is outside the plan\'s folder' : /not found/.test(m) ? 'does not exist' : 'is not a regular file'
      errors.push(`${item.ref}: ${item.source} ${why}`)
    }
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
