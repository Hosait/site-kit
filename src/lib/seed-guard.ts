/**
 * The seed replaces content, so existing pages need an explicit replace. A plan import may also run
 * over pages while nobody has signed up: nobody can have made them, and an interrupted run may have
 * left them. The SQL seed may not: it starts with TRUNCATE … CASCADE, which also empties what
 * visitors made (forms, analytics, consent), and it runs in one transaction, so pages mean it
 * finished.
 */
export function seedDbDecision(i: { source: 'plan' | 'sql'; pages: number; users: number; replace: boolean; production: boolean }) {
  if (i.production) return 'refuse_production' as const
  if (i.pages > 0 && !i.replace && (i.source === 'sql' || i.users > 0)) return 'refuse_existing' as const
  return 'run' as const
}

/**
 * Whether a plan import may first delete all content. On a first deploy nobody can have made any;
 * once someone has signed up, only the admin's confirmed replace may delete what they made.
 */
export function planReset(i: { replace: boolean; users: number }): boolean {
  return i.replace || i.users === 0
}
