/**
 * The seed replaces content: only an install nobody has signed up to yet (so nobody can have made
 * any of its pages, even if an interrupted run left some), or an explicit replace, may run it.
 */
export function seedDbDecision(i: { pages: number; users: number; replace: boolean; production: boolean }) {
  if (i.production) return 'refuse_production' as const
  if (i.pages > 0 && i.users > 0 && !i.replace) return 'refuse_existing' as const
  return 'run' as const
}

/**
 * Whether a plan import may first delete all content. On a first deploy nobody can have made any;
 * once someone has signed up, only the admin's confirmed replace may delete what they made.
 */
export function planReset(i: { replace: boolean; users: number }): boolean {
  return i.replace || i.users === 0
}
