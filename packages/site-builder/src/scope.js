// The customer's limits on a move: parts of the site that are never read or moved (an intranet,
// an archive), and the member area, so nothing behind a login is ever requested. assess and crawl
// use the same scope (assess.json keeps it), so they leave out the same addresses.
// crawl.js imports this module, and signals.js imports crawl.js: use isLoginUrl only inside functions.
import { isLoginUrl } from './signals.js'

/** At most this many excluded paths. */
export const MAX_EXCLUDE = 20
// A plain site path: no query, fragment, space or "..", and not the whole site.
const PATH = /^\/[A-Za-z0-9._~%\/-]{1,199}$/

/**
 * The limits, checked: each excluded path lower-cased, without a trailing slash, once.
 * Throws on a path that is not a plain site path.
 * @param {{ exclude?: unknown[], withoutMemberArea?: unknown }} [o]
 * @returns {{ exclude: string[], withoutMemberArea: boolean }}
 */
export function makeScope({ exclude = [], withoutMemberArea = false } = {}) {
  if (!Array.isArray(exclude) || exclude.length > MAX_EXCLUDE) throw new Error(`exclude: at most ${MAX_EXCLUDE} paths`)
  const paths = []
  for (const raw of exclude) {
    const p = String(raw).toLowerCase().replace(/\/+$/, '')
    if (!PATH.test(String(raw)) || !p || p.split('/').includes('..')) throw new Error(`exclude: "${String(raw).slice(0, 60)}" is not a path on the site, such as /intranett`)
    if (!paths.includes(p)) paths.push(p)
  }
  return { exclude: paths, withoutMemberArea: withoutMemberArea === true }
}

/**
 * True when an address is left out: under an excluded path (whole segments, any case), or a
 * login or «min side» address when the member area is left out.
 * @param {{ exclude: string[], withoutMemberArea: boolean }} scope @param {URL} u
 */
export function leftOut(scope, u) {
  const p = u.pathname.toLowerCase().replace(/\/+$/, '')
  if (scope.exclude.some((x) => p === x || p.startsWith(x + '/'))) return true
  return scope.withoutMemberArea && isLoginUrl(u)
}
