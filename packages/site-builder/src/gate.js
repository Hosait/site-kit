// The gate before crawl: the site is rebuilt only after a recent fit check (assess) of the same
// site that is not red. After yellow the customer has accepted the scope (--accepted-scope); a check
// that could not read enough is never accepted, it runs again.
import fs from 'node:fs'
import path from 'node:path'

import { normalize, sameSite } from './crawl.js'
import { makeScope } from './scope.js'

/** How old a fit check may be before crawl asks for a new one. */
export const MAX_AGE_DAYS = 7

/**
 * Why crawl must not start in `out` for `target`, or null when it may.
 * @param {string} out @param {string} target @param {boolean} acceptedScope
 * @returns {string | null}
 */
export function crawlGate(out, target, acceptedScope) {
  const file = path.join(out, 'assess.json')
  const again = `Run "site-builder assess ${target}" first.`
  let a
  try { a = JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return `No fit check in ${out}. ${again}` }
  const t = normalize(target, target)
  if (!t) return `${target}: not an http(s) address`
  const host = new URL(t).hostname
  let checked = ''
  try { checked = new URL(String(a.source)).hostname } catch { /* not a site */ }
  if (!checked || !sameSite(checked, host)) return `The fit check in ${file} is for ${checked || 'another site'}, not ${host}. ${again}`
  // A site changes: a check older than this is run again.
  const at = Date.parse(String(a.assessedAt ?? ''))
  if (Number.isNaN(at)) return `The fit check in ${file} has no date. ${again}`
  // A date in the future would never grow old; an hour covers a clock that is a little off.
  if (at - Date.now() > 60 * 60 * 1000) return `The fit check in ${file} is dated in the future (${new Date(at).toISOString().slice(0, 10)}). ${again}`
  if (Date.now() - at > MAX_AGE_DAYS * 24 * 60 * 60 * 1000) return `The fit check in ${file} is more than ${MAX_AGE_DAYS} days old (${new Date(at).toISOString().slice(0, 10)}). ${again}`
  const reasons = Array.isArray(a.reasons) ? a.reasons : []
  const codes = (cls) => reasons.filter((r) => r?.class === cls).map((r) => String(r.code)).join(', ')
  if (a.class === 'red') return `The fit check is red (${codes('red')}): Hosait Sites does not move this kind of site, so nothing is crawled.`
  if (a.class === 'yellow' && reasons.some((r) => r?.code === 'not-enough-read')) return `The fit check could not read enough of the site. Run "site-builder assess ${target}" again, with a larger --budget or at the address its notes name.`
  if (a.class === 'yellow') return acceptedScope ? null : `The fit check is yellow (${codes('yellow')}): get the customer's yes on the scope and storage in assess.md, then run crawl with --accepted-scope.`
  if (a.class === 'green') return null
  return `${file} has no fit class. ${again}`
}

/**
 * The customer's limits the fit check in `out` was made with (assess --exclude), so crawl
 * leaves out the same. A check without them has none.
 * Throws when they are not valid limits.
 * @param {string} out
 */
export function assessedScope(out) {
  const a = JSON.parse(fs.readFileSync(path.join(out, 'assess.json'), 'utf8'))
  return makeScope(a.scope ?? {})
}
