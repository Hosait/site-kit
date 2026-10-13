// A small robots.txt reader: the group for our user agent (or *), Allow/Disallow by longest
// match (Allow wins a tie), * and $ in paths, and Sitemap lines. A group is ours only when the
// product token of its User-agent (the letters, _ and - it starts with) is ours, in any case; an
// empty value selects nothing.

/** @param {string} text @param {string} [agent] */
export function parseRobots(text, agent = 'HosaitSiteBuilder') {
  const groups = []
  const sitemaps = []
  let current = null
  for (const raw of String(text).split(/\r\n|\r|\n/)) {
    const line = raw.replace(/#.*/, '').trim()
    if (!line) continue
    const m = /^([A-Za-z-]+)[ \t]*:[ \t]*(.*)$/.exec(line)
    if (!m) continue
    const key = m[1].toLowerCase()
    const value = m[2].trim()
    if (key === 'sitemap') { if (value) sitemaps.push(value); continue }
    if (key === 'user-agent') {
      if (!current || current.rules.length) { current = { agents: [], rules: [] }; groups.push(current) }
      current.agents.push(value === '*' ? '*' : /^[A-Za-z_-]*/.exec(value)[0].toLowerCase())
      continue
    }
    if ((key === 'allow' || key === 'disallow') && current) current.rules.push({ allow: key === 'allow', path: value })
  }
  const me = agent.toLowerCase()
  const mine = groups.filter((g) => g.agents.includes(me))
  const rules = (mine.length ? mine : groups.filter((g) => g.agents.includes('*')))
    .flatMap((g) => g.rules)
    .filter((r) => r.path)
    .map((r) => ({ ...r, match: compile(r.path) }))
  return {
    sitemaps,
    /** @param {string} path the path and query */
    allowed(path) {
      let best = null
      for (const r of rules) {
        if (!r.match(path)) continue
        if (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow)) best = r
      }
      return !best || best.allow
    },
  }
}

/**
 * A robots.txt path pattern as a matcher: a prefix, * for any run of characters, $ for the end.
 * Each piece is found with indexOf in order, so matching is linear (a regex with several .*
 * backtracks badly on a hostile rule).
 */
function compile(pattern) {
  const anchored = pattern.endsWith('$')
  const parts = (anchored ? pattern.slice(0, -1) : pattern).split('*')
  return (path) => {
    if (!path.startsWith(parts[0])) return false
    let pos = parts[0].length
    for (let i = 1; i < parts.length; i++) {
      if (anchored && i === parts.length - 1) return path.length - parts[i].length >= pos && path.endsWith(parts[i])
      const at = path.indexOf(parts[i], pos)
      if (at === -1) return false
      pos = at + parts[i].length
    }
    return !anchored || pos === path.length
  }
}
