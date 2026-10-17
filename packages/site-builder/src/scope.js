// The customer's limits on a move: content parts of the site that are not moved or counted (an
// intranet, an archive). A shop, a catalogue or a member area is never left out: the fit check
// still sees them and declines the site. assess and crawl use the same scope (assess.json keeps it).
// crawl.js imports this module, and signals.js imports crawl.js: use signals.js only inside functions.
import { isCartUrl, isLoginUrl, isProductPath } from './signals.js'

/** At most this many excluded paths. */
export const MAX_EXCLUDE = 20
// A plain site path, written as it is: no percent-encoding, query, fragment, space, "//" or "..",
// and not the whole site.
const PATH = /^\/[A-Za-z0-9._~\/-]{1,199}$/

/**
 * The limits, checked: each excluded path lower-cased, without a trailing slash, once.
 * Throws on a path that is not a plain site path.
 * @param {{ exclude?: unknown[] }} [o]
 * @returns {{ exclude: string[] }}
 */
export function makeScope({ exclude = [] } = {}) {
  if (!Array.isArray(exclude) || exclude.length > MAX_EXCLUDE) throw new Error(`exclude: at most ${MAX_EXCLUDE} paths`)
  const paths = []
  for (const raw of exclude) {
    const p = String(raw).toLowerCase().replace(/\/+$/, '')
    if (!PATH.test(String(raw)) || !p || p.includes('//') || p.split('/').includes('..')) throw new Error(`exclude: "${String(raw).slice(0, 60)}" is not a path on the site, such as /intranett`)
    // A shop, a catalogue and a member area are never left out: the check decides on them.
    const u = new URL(p, 'https://site.invalid')
    if (isCartUrl(u) || isProductPath(u.pathname) || isLoginUrl(u)) throw new Error(`exclude: "${p}" is a shop, catalogue or login path. Those are never left out: the fit check decides on them.`)
    if (!paths.includes(p)) paths.push(p)
  }
  return { exclude: paths }
}

/**
 * The excluded path an address is under (whole segments, any case), or undefined.
 * @param {{ exclude: string[] }} scope @param {URL} u
 */
export function excludedBy(scope, u) {
  // Percent-encoding is undone, so /%61rkiv/ is /arkiv/.
  let path = u.pathname
  try { path = decodeURIComponent(path) } catch { /* not valid encoding: compared as written */ }
  const p = path.toLowerCase().replace(/\/+$/, '')
  return scope.exclude.find((x) => p === x || p.startsWith(x + '/'))
}

/** True when an address is left out of the move. @param {{ exclude: string[] }} scope @param {URL} u */
export const leftOut = (scope, u) => excludedBy(scope, u) !== undefined
