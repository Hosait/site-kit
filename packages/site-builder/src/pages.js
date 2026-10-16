// Counting a site's pages per language, with articles apart, for assess. Only the pages read are
// parsed; every other address is counted by its path.
import { sameSite } from './crawl.js'

// Articles: a dated path, or a page under a news-like section (not the section's own page).
const NEWS = new Set(['news', 'nyheter', 'aktuelt', 'blog', 'blogg', 'artikler', 'articles', 'article', 'presse', 'press', 'pressemeldinger', 'arkiv', 'insights', 'innsikt', 'stories'])
const DATED = /(^|[/-])(19|20)\d\d[/-](0[1-9]|1[0-2])([/-]|$)/
// A group of addresses needs this many pages read before its share of articles is used.
const MIN_GROUP_READ = 3
/** Country codes used as language prefixes. */
const ALIASES = new Map([['no', ['nb', 'nn']], ['se', ['sv']], ['dk', ['da']], ['uk', ['en']], ['gb', ['en']]])
const primary = (lang) => lang.split('-')[0]
const segs = (pathname) => pathname.split('/').filter(Boolean).map((s) => s.toLowerCase())
const afterLanguage = (pathname, prefixes) => { const s = segs(pathname); return s.length && prefixes.has(s[0]) ? s.slice(1) : s }

/** A dated path, or a page under a news-like section. @param {string} pathname @param {Set<string>} prefixes */
export function isArticle(pathname, prefixes) {
  if (DATED.test(pathname)) return true
  const s = afterLanguage(pathname, prefixes)
  return s.length >= 2 && NEWS.has(s[0])
}

/** The first segment after a language prefix; `*` for a top-level page, `/` for a home page. */
const shape = (pathname, prefixes) => { const s = afterLanguage(pathname, prefixes); return s.length === 0 ? '/' : s.length === 1 ? '*' : s[0] }

/**
 * Pages per language, with articles apart. A first path segment is a language prefix when it
 * names the language (or a country used for it, `se` for sv), or when an alternate link for
 * that language points at the segment's own home page. Articles are dated or news-section
 * paths, and in a group of addresses whose pages read mostly carry article markup (posts on
 * top-level addresses), that share of the group.
 * @param {{ read: { url: string, role: string, sig: { lang?: string, alternates: { lang: string, href: string }[], article: boolean } }[], pool: Iterable<string>, host: string, uncapped?: number }} opts
 */
export function countPages({ read, pool, host, uncapped = 0 }) {
  const prefixes = new Map()
  for (const p of read) {
    for (const [href, lang, alternate] of [[p.url, p.sig.lang, false], ...p.sig.alternates.map((a) => [a.href, a.lang, true])]) {
      if (!lang) continue
      const u = new URL(href)
      const s = segs(u.pathname)
      const names = s.length && (s[0] === lang || s[0] === primary(lang) || (ALIASES.get(s[0]) ?? []).includes(primary(lang)))
      if (s.length && sameSite(u.hostname, host) && (names || (alternate && s.length === 1))) prefixes.set(s[0], primary(lang))
    }
  }
  const prefixSet = new Set(prefixes.keys())
  const homeLang = read.find((p) => p.role === 'home')?.sig.lang
  const defaultLanguage = homeLang ? primary(homeLang) : 'default'
  const groupsRead = new Map()
  for (const p of read) {
    const g = shape(new URL(p.url).pathname, prefixSet)
    const x = groupsRead.get(g) ?? { n: 0, articles: 0 }
    x.n++
    if (p.sig.article) x.articles++
    groupsRead.set(g, x)
  }
  const byLanguageAndShape = new Map()
  let articles = 0
  for (const u of pool) {
    const p = new URL(u).pathname
    if (isArticle(p, prefixSet)) { articles++; continue }
    const key = `${prefixes.get(segs(p)[0]) ?? defaultLanguage}\n${shape(p, prefixSet)}`
    byLanguageAndShape.set(key, (byLanguageAndShape.get(key) ?? 0) + 1)
  }
  const pagesPerLanguage = {}
  for (const [key, n] of byLanguageAndShape) {
    const [lang, g] = key.split('\n')
    const x = groupsRead.get(g)
    const a = x && x.n >= MIN_GROUP_READ ? Math.round((n * x.articles) / x.n) : 0
    articles += a
    pagesPerLanguage[lang] = (pagesPerLanguage[lang] ?? 0) + n - a
  }
  if (uncapped) pagesPerLanguage[defaultLanguage] = (pagesPerLanguage[defaultLanguage] ?? 0) + uncapped
  const largestLanguagePages = Math.max(0, ...Object.values(pagesPerLanguage))
  return { pagesPerLanguage, largestLanguagePages, articles }
}
