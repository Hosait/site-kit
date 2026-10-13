/** The seed's SQL starts with TRUNCATE: only an empty install, or an explicit replace, may run it. */
export function seedDbDecision(i: { pages: number; replace: boolean; production: boolean }) {
  if (i.production) return 'refuse_production' as const
  if (i.pages > 0 && !i.replace) return 'refuse_existing' as const
  return 'run' as const
}

/**
 * Whether a plan import may first delete all content. On a first deploy nobody can have made any;
 * once someone has signed up, only the admin's confirmed replace may delete what they made.
 */
export function planReset(i: { replace: boolean; users: number }): boolean {
  return i.replace || i.users === 0
}
