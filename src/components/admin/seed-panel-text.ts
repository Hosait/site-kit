/**
 * What the admin seed panel says about the seed route's answers: the plan import
 * (seed/site-plan.json, in the background) and the older SQL dump (counts at once).
 */
export type DbBody = {
  ok?: boolean
  error?: string
  counts?: { pages: number; articles: number; media: number }
  started?: boolean
  mode?: string
  alreadyRunning?: boolean
}
export type PlanProgress = {
  running: boolean
  done: number
  total: number
  error?: string
  result?: { media: number; pages: number; articles: number }
}

export function dbResultMessage(body: DbBody): string {
  if (!body.ok) return `Feil: ${body.error ?? 'ukjent feil'}`
  if (body.alreadyRunning) return 'Innholdet legges allerede inn …'
  if (body.mode === 'plan') return 'Legger inn innholdet fra seed/site-plan.json …'
  if (body.counts) return `Ferdig: ${body.counts.pages} sider, ${body.counts.articles} artikler, ${body.counts.media} bilder registrert. Hent bildene i steg 2.`
  return 'Ferdig.'
}

export function planStatusMessage(plan: PlanProgress | null | undefined): string | null {
  if (!plan) return null
  if (plan.running) return `Legger inn innhold: ${plan.done} av ${plan.total || '…'}`
  if (plan.error) return `Feil: ${plan.error}`
  if (plan.result) return `Ferdig: ${plan.result.pages} sider, ${plan.result.articles} artikler, ${plan.result.media} bilder.`
  return null
}
