/** The seed's SQL starts with TRUNCATE: only an empty install, or an explicit replace, may run it. */
export function seedDbDecision(i: { pages: number; replace: boolean; production: boolean }) {
  if (i.production) return 'refuse_production' as const
  if (i.pages > 0 && !i.replace) return 'refuse_existing' as const
  return 'run' as const
}
