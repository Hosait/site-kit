/**
 * How long a form's submissions are kept. A form chooses the site's default
 * (site/config.ts forms.retentionDays), its own number of days, or to keep them.
 */
export type RetentionChoice = 'default' | 'days' | 'keep'
export type FormRetention = { retention?: RetentionChoice | null; retentionDays?: number | null }

export const RETENTION_MAX_DAYS = 3650

/** Days this form's submissions are kept; null keeps them. A "days" choice without a valid number follows the site. */
export function retentionDaysFor(form: FormRetention, siteDefault: number | null): number | null {
  if (form.retention === 'keep') return null
  const days = form.retentionDays
  if (form.retention === 'days' && Number.isInteger(days) && (days as number) >= 1) return days as number
  return siteDefault
}

/** The plan's `retention` (days, "keep", or left out) as the form's admin fields. */
export function retentionFromPlan(r: number | 'keep' | undefined): { retention: RetentionChoice; retentionDays: number | null } {
  if (r === 'keep') return { retention: 'keep', retentionDays: null }
  if (typeof r === 'number') return { retention: 'days', retentionDays: r }
  return { retention: 'default', retentionDays: null }
}
