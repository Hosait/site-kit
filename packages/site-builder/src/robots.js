// A small robots.txt reader: the group for our user agent (or *), Allow/Disallow by longest
// match (Allow wins a tie), * and $ in paths, and Sitemap lines.

/** @param {string} text @param {string} [agent] */
export function parseRobots(text, agent = 'HosaitSiteBuilder') {
  const groups = []
  const sitemaps = []
  let current = null
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim()
    if (!line) continue
    const m = /^([A-Za-z-]+)[ \t]*:[ \t]*(.*)$/.exec(line)
    if (!m) continue
    const key = m[1].toLowerCase()
    const value = m[2].trim()
    if (key === 'sitemap') { if (value) sitemaps.push(value); continue }
    if (key === 'user-agent') {
      if (!current || current.rules.length) { current = { agents: [], rules: [] }; groups.push(current) }
      current.agents.push(value.toLowerCase())
      continue
    }
    if ((key === 'allow' || key === 'disallow') && current) current.rules.push({ allow: key === 'allow', path: value })
  }
  const me = agent.toLowerCase()
  const mine = groups.filter((g) => g.agents.some((a) => a !== '*' && me.includes(a)))
  const rules = (mine.length ? mine : groups.filter((g) => g.agents.includes('*'))).flatMap((g) => g.rules).filter((r) => r.path)
  return {
    sitemaps,
    /** @param {string} pathname */
    allowed(pathname) {
      let best = null
      for (const r of rules) {
        if (!matches(r.path, pathname)) continue
        if (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow)) best = r
      }
      return !best || best.allow
    },
  }
}

function matches(pattern, pathname) {
  const anchored = pattern.endsWith('$')
  const body = (anchored ? pattern.slice(0, -1) : pattern).split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*')
  return new RegExp('^' + body + (anchored ? '$' : '')).test(pathname)
}
