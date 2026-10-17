/**
 * The launch check (pnpm qa:launch <address>): before a site moves to its own domain, every page
 * in its sitemap must answer, carry no placeholder or demo text, have a title, and link only to
 * pages that exist. Missing descriptions, share images and alt texts are warnings. Reads the
 * running site over HTTP, so it works on a local install and on the hosait.com preview alike.
 */
import { JSDOM } from 'jsdom'

export type Finding = { page: string; text: string }
export type LaunchResult = { errors: Finding[]; warnings: Finding[]; notes: string[]; pages: number; linksChecked: number }
type Fetch = (url: string, init?: RequestInit) => Promise<Response>

// Text that only the demo or an unfilled template puts on a page.
const PLACEHOLDERS = [/Eksempeltekst/, /Example text/, /Lorem ipsum/i, /Nordlys Demo/, /\bexample\.com\b/i]
// Paths that are not pages a visitor follows.
const NOT_PAGES = /^\/(?:admin|api|next|_next)(?:\/|$)/
const MAX_BODY = 5 * 1024 * 1024
const CONCURRENCY = 4

const NOINDEX = 'search engines are told not to index the page (noindex)'

/**
 * What one page shows: errors, warnings, and the site's own links it has (absolute, no fragment).
 * With `ownHosts` (the page is on the site's own domain), a noindex and a canonical address on
 * another host are errors too.
 */
export function pageFindings(html: string, pageUrl: string, base: string, ownHosts?: string[]): { errors: string[]; warnings: string[]; links: string[] } {
  const { document } = new JSDOM(html, { url: pageUrl }).window
  const errors: string[] = []
  const warnings: string[] = []
  if (ownHosts) {
    const robots = [...document.querySelectorAll('meta[name]')].filter((m) => m.getAttribute('name')?.toLowerCase() === 'robots')
    if (robots.some((m) => /noindex/i.test(m.getAttribute('content') ?? ''))) errors.push(NOINDEX)
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href')
    let host: string | null = null
    try {
      host = canonical ? new URL(canonical, pageUrl).hostname : null
    } catch {
      // Not an address: left to the search engine.
    }
    if (host && !ownHosts.includes(host)) errors.push(`the canonical address is on ${host}, not on the site's own domain`)
  }
  // Next puts the page's data in inline scripts; that, styles and templates are not what a visitor reads.
  for (const el of document.querySelectorAll('body script, body style, body template')) el.remove()
  const text = document.body?.textContent ?? ''
  for (const re of PLACEHOLDERS) {
    const m = re.exec(text)
    if (m) errors.push(`placeholder or demo text left: "${m[0]}"`)
  }
  if (!document.title.trim()) errors.push('the page has no title')
  if (!document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim()) warnings.push('no description (meta description)')
  if (!document.querySelector('meta[property="og:image"]')?.getAttribute('content')?.trim()) warnings.push('no share image (og:image)')
  const scope = document.querySelector('main') ?? document.body
  const noAlt = scope ? [...scope.querySelectorAll('img')].filter((i) => !i.getAttribute('alt')?.trim()).length : 0
  if (noAlt) warnings.push(`${noAlt} image${noAlt === 1 ? '' : 's'} without alt text`)

  const origin = new URL(base).origin
  const links: string[] = []
  for (const a of document.querySelectorAll('a[href]')) {
    let u: URL
    try {
      u = new URL(a.getAttribute('href') ?? '', pageUrl)
    } catch {
      continue
    }
    if (u.origin !== origin || NOT_PAGES.test(u.pathname)) continue
    u.hash = ''
    if (u.href === pageUrl && (a.getAttribute('href') ?? '').startsWith('#')) continue
    if (!links.includes(u.href)) links.push(u.href)
  }
  return { errors, warnings, links }
}

type AxeViolation = { id: string; impact?: string | null; help?: string; nodes: unknown[] }

/** qa:axe: the serious and critical violations on one page are errors; the rest is left out. */
export function axeErrors(page: string, violations: AxeViolation[]): Finding[] {
  return violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => ({ page, text: `accessibility: ${v.id}, ${v.help ?? ''} (${v.nodes.length} element${v.nodes.length === 1 ? '' : 's'})` }))
}

/** qa:axe over the pages in turn: one that cannot be opened or checked is an error, and the rest are still checked. */
export async function axePages(urls: string[], analyse: (url: string) => Promise<AxeViolation[]>): Promise<Finding[]> {
  const errors: Finding[] = []
  for (const url of urls) {
    try {
      errors.push(...axeErrors(url, await analyse(url)))
    } catch (e) {
      const why = (e instanceof Error ? e.message : String(e)).split('\n')[0]
      errors.push({ page: url, text: `the page could not be checked for accessibility (${why})` })
    }
  }
  return errors
}

/** The paths (with any query) of the pages a sitemap lists, whatever host it names. */
export function sitemapPaths(xml: string): string[] {
  const out: string[] = []
  for (const m of xml.matchAll(/<loc>\s*([^<\s]{1,2048})\s*<\/loc>/g)) {
    try {
      const u = new URL(m[1].replace(/&amp;/g, '&'))
      const p = u.pathname + u.search
      if (!out.includes(p)) out.push(p)
    } catch {
      // Not an address: skipped.
    }
  }
  return out
}

/** The body as text, read only up to MAX_BODY bytes; the rest is not downloaded. */
export async function readBody(res: Response): Promise<string> {
  if (!res.body) return ''
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let text = ''
  let bytes = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) return text + decoder.decode()
    const room = MAX_BODY - bytes
    if (value.byteLength >= room) {
      await reader.cancel()
      return text + decoder.decode(value.subarray(0, room))
    }
    bytes += value.byteLength
    text += decoder.decode(value, { stream: true })
  }
}

/** Status after following up to three redirects on the same site; another site counts as fine. */
async function finalStatus(fetchImpl: Fetch, url: string): Promise<number> {
  let current = url
  for (let i = 0; i < 4; i++) {
    const res = await fetchImpl(current, { redirect: 'manual', signal: AbortSignal.timeout(20_000) })
    const loc = res.headers.get('location')
    if (res.status < 300 || res.status >= 400 || !loc) return res.status
    const next = new URL(loc, current)
    if (next.origin !== new URL(url).origin) return 200
    current = next.href
  }
  return 310
}

async function inParallel<T>(items: T[], work: (item: T, i: number) => Promise<void>): Promise<void> {
  let next = 0
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
    while (next < items.length) {
      const i = next++
      await work(items[i], i)
    }
  }))
}

/** Whether robots.txt shuts every search engine out: `Disallow: /` in the group for `*`. */
export function robotsBlocksAll(text: string): boolean {
  let agents: string[] = []
  let inRules = false
  for (const raw of text.split('\n')) {
    const line = raw.replace(/#.*/, '').trim()
    const m = /^([A-Za-z-]+)[ \t]*:[ \t]*(.*)$/.exec(line)
    if (!m) continue
    const [key, value] = [m[1].toLowerCase(), m[2].trim()]
    if (key === 'user-agent') {
      if (inRules) agents = []
      inRules = false
      agents.push(value)
    } else if (key === 'disallow' || key === 'allow') {
      inRules = true
      if (key === 'disallow' && value === '/' && agents.includes('*')) return true
    }
  }
  return false
}

/**
 * `ownHosts` are the site's own domains (site/config.ts). On one of them, the site must be open to
 * search engines: robots.txt, noindex and canonical addresses are checked. On a preview they are not.
 */
export async function launchCheck(base: string, opts: { fetch?: Fetch; maxPages?: number; maxLinks?: number; ownHosts?: string[] } = {}): Promise<LaunchResult> {
  const fetchImpl: Fetch = opts.fetch ?? ((u, init) => fetch(u, init))
  const maxPages = opts.maxPages ?? 500
  const maxLinks = opts.maxLinks ?? 2000
  const root = base.replace(/\/+$/, '')
  const result: LaunchResult = { errors: [], warnings: [], notes: [], pages: 0, linksChecked: 0 }
  const own = opts.ownHosts?.includes(new URL(root).hostname) ? opts.ownHosts : undefined
  if (opts.ownHosts && !own) {
    result.notes.push('Search engine access (robots.txt, noindex, canonical addresses) is not checked on a preview address, where it is blocked on purpose. Run the check on the own domain after the move.')
  }

  const map = await fetchImpl(`${root}/sitemap.xml`, { signal: AbortSignal.timeout(20_000) })
  if (map.status !== 200) {
    result.errors.push({ page: `${root}/sitemap.xml`, text: `the site has no sitemap.xml (${map.status})` })
    return result
  }
  const all = sitemapPaths(await readBody(map))
  const paths = all.slice(0, maxPages)
  if (all.length > paths.length) result.notes.push(`Checked the first ${paths.length} of ${all.length} pages in the sitemap.`)
  if (own) {
    const robots = await fetchImpl(`${root}/robots.txt`, { signal: AbortSignal.timeout(20_000) })
    if (robots.status === 200 && robotsBlocksAll(await readBody(robots))) {
      result.errors.push({ page: `${root}/robots.txt`, text: 'robots.txt blocks search engines on the site\'s own domain' })
    }
  }

  const perPage: { errors: Finding[]; warnings: Finding[]; links: string[] }[] = []
  const answered = new Set<string>()
  await inParallel(paths, async (p, i) => {
    const page = root + p
    const out = { errors: [] as Finding[], warnings: [] as Finding[], links: [] as string[] }
    perPage[i] = out
    try {
      const res = await fetchImpl(page, { redirect: 'manual', signal: AbortSignal.timeout(20_000) })
      if (res.status !== 200) {
        out.errors.push({ page, text: `the page answers ${res.status}` })
        return
      }
      answered.add(page)
      const f = pageFindings(await readBody(res), page, root, own)
      if (own && /noindex/i.test(res.headers.get('x-robots-tag') ?? '') && !f.errors.includes(NOINDEX)) f.errors.unshift(NOINDEX)
      out.errors.push(...f.errors.map((text) => ({ page, text })))
      out.warnings.push(...f.warnings.map((text) => ({ page, text })))
      out.links = f.links
    } catch (e) {
      out.errors.push({ page, text: `the page could not be read (${e instanceof Error ? e.message : String(e)})` })
    }
  })
  for (const p of perPage) {
    result.errors.push(...p.errors)
    result.warnings.push(...p.warnings)
  }
  result.pages = paths.length

  // Every internal link once, from the first page that has it; pages already read are fine.
  const linkedFrom = new Map<string, string>()
  perPage.forEach((p, i) => {
    for (const l of p.links) if (!answered.has(l) && !linkedFrom.has(l)) linkedFrom.set(l, root + paths[i])
  })
  const links = [...linkedFrom.keys()]
  const toCheck = links.slice(0, maxLinks)
  if (links.length > toCheck.length) result.notes.push(`Checked the first ${toCheck.length} of ${links.length} internal links.`)
  const broken: (Finding | null)[] = []
  await inParallel(toCheck, async (link, i) => {
    const u = new URL(link)
    try {
      const status = await finalStatus(fetchImpl, link)
      broken[i] = status >= 400 ? { page: linkedFrom.get(link)!, text: `broken link to ${u.pathname}${u.search} (${status})` } : null
    } catch (e) {
      broken[i] = { page: linkedFrom.get(link)!, text: `broken link to ${u.pathname}${u.search} (${e instanceof Error ? e.message : String(e)})` }
    }
  })
  for (const b of broken) if (b) result.errors.push(b)
  result.linksChecked = toCheck.length
  return result
}
