import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { axeErrors, axePages, launchCheck, pageFindings, sitemapPaths } from '../../src/lib/launch-check'

// The launch check runs against the preview before the site moves to its own domain. Errors stop
// the move; warnings go into the hand-off.
const BASE = 'https://fjordlys.hosait.com'
const doc = (body: string, head = '<title>Om oss | Fjordlys</title><meta name="description" content="Hvem vi er."><meta property="og:image" content="https://fjordlys.hosait.com/media/a.webp">') =>
  `<!doctype html><html lang="nb"><head>${head}</head><body><main>${body}</main></body></html>`

test('demo or placeholder text left on a page is an error', () => {
  for (const text of ['Eksempeltekst. Erstatt med virksomhetens egen personvernerklæring.', "Example text. Replace with the organisation's own privacy notice.", 'Lorem ipsum dolor sit amet', 'Kontakt Nordlys Demo', 'Skriv til nettsted@example.com']) {
    const f = pageFindings(doc(`<p>${text}</p>`), `${BASE}/no/personvern`, BASE)
    assert.equal(f.errors.length, 1, text)
    assert.match(f.errors[0], /placeholder|demo/i)
  }
  assert.deepEqual(pageFindings(doc('<p>Fjordlys AS behandler personopplysninger slik.</p>'), `${BASE}/no/personvern`, BASE).errors, [])
})

test('a page without a title is an error; no description, no share image or images without alt text are warnings', () => {
  const f = pageFindings(doc('<img src="/a.webp"><img src="/b.webp" alt=""><img src="/c.webp" alt="Kontoret">', ''), `${BASE}/no`, BASE)
  assert.deepEqual(f.errors, ['the page has no title'])
  assert.deepEqual(f.warnings, ['no description (meta description)', 'no share image (og:image)', '2 images without alt text'])
  const ok = pageFindings(doc('<img src="/c.webp" alt="Kontoret">'), `${BASE}/no`, BASE)
  assert.deepEqual([ok.errors, ok.warnings], [[], []])
})

test('the links to check are the site\'s own pages, without fragments, admin, API or assets', () => {
  const f = pageFindings(doc('<a href="/no/om-oss#team">a</a><a href="https://fjordlys.hosait.com/no/kontakt?x=1">b</a><a href="nyheter">c</a><a href="https://other.no/x">d</a><a href="mailto:a@b.no">e</a><a href="tel:123">f</a><a href="#top">g</a><a href="/admin">h</a><a href="/api/x">i</a><a href="/next/preview">j</a><a href="/media/a.pdf">k</a>'), `${BASE}/no/`, BASE)
  assert.deepEqual(f.links, [`${BASE}/no/om-oss`, `${BASE}/no/kontakt?x=1`, `${BASE}/no/nyheter`, `${BASE}/media/a.pdf`])
})

test('the sitemap gives the paths of the pages, whatever host it names', () => {
  const xml = readFileSync('tests/fixtures/sitemap-sample.xml', 'utf8')
  assert.deepEqual(sitemapPaths(xml), ['/no', '/no/om-oss', '/en/about'])
})

type Route = { status?: number; body?: string; location?: string; headers?: Record<string, string> }
function fakeFetch(routes: Record<string, Route>) {
  const seen: string[] = []
  const fetchImpl = async (url: string) => {
    seen.push(url)
    const r = routes[url] ?? { status: 404, body: 'not found' }
    return new Response(r.body ?? '', { status: r.status ?? 200, headers: { ...r.headers, ...(r.location ? { location: r.location } : {}) } })
  }
  return { fetchImpl, seen }
}
const sitemap = (paths: string[]) => `<urlset>${paths.map((p) => `<url><loc>https://fjordlys.hosait.com${p}</loc></url>`).join('')}</urlset>`

test('a clean site passes: every sitemap page answers, every internal link leads to a page', async () => {
  const { fetchImpl } = fakeFetch({
    [`${BASE}/sitemap.xml`]: { body: sitemap(['/no', '/no/om-oss']) },
    [`${BASE}/no`]: { body: doc('<a href="/no/om-oss">Om oss</a><a href="/gammel">Gammel</a>') },
    [`${BASE}/no/om-oss`]: { body: doc('<p>Hvem vi er.</p>') },
    [`${BASE}/gammel`]: { status: 308, location: '/no/om-oss' },
  })
  const r = await launchCheck(BASE, { fetch: fetchImpl })
  assert.deepEqual(r.errors, [])
  assert.equal(r.pages, 2)
  assert.equal(r.linksChecked, 1)
})

test('placeholder text, a sitemap page that fails and a broken link are errors, with the page they are on', async () => {
  const { fetchImpl } = fakeFetch({
    [`${BASE}/sitemap.xml`]: { body: sitemap(['/no', '/no/personvern', '/no/borte']) },
    [`${BASE}/no`]: { body: doc('<a href="/no/finnes-ikke">x</a><a href="/no/personvern">Personvern</a>') },
    [`${BASE}/no/personvern`]: { body: doc('<p>Eksempeltekst. Erstatt med virksomhetens egen personvernerklæring.</p>') },
    [`${BASE}/no/borte`]: { status: 500, body: 'error' },
  })
  const r = await launchCheck(BASE, { fetch: fetchImpl })
  assert.deepEqual(r.errors.map((e) => e.page), [`${BASE}/no/personvern`, `${BASE}/no/borte`, `${BASE}/no`])
  assert.match(r.errors[1].text, /answers 500/)
  assert.match(r.errors[2].text, /broken link to \/no\/finnes-ikke \(404\)/)
})

test('a site without a sitemap fails at once, and the page and link caps are kept', async () => {
  const none = await launchCheck(BASE, { fetch: fakeFetch({}).fetchImpl })
  assert.deepEqual(none.errors.map((e) => e.text), ['the site has no sitemap.xml (404)'])

  const many = Array.from({ length: 30 }, (_, i) => `/no/side-${i}`)
  const routes: Record<string, Route> = { [`${BASE}/sitemap.xml`]: { body: sitemap(many) } }
  for (const p of many) routes[BASE + p] = { body: doc(Array.from({ length: 10 }, (_, j) => `<a href="/no/lenke-${j}">x</a>`).join('')) }
  const { fetchImpl, seen } = fakeFetch(routes)
  const r = await launchCheck(BASE, { fetch: fetchImpl, maxPages: 5, maxLinks: 3 })
  assert.equal(r.pages, 5)
  assert.equal(r.linksChecked, 3)
  assert.ok(seen.length <= 1 + 5 + 3, `fetched ${seen.length}`)
  assert.ok(r.notes.some((n) => /first 5 of 30 pages/.test(n)))
})

// The M8 eval: after the move, the site must be open to search engines on its own domain. A site
// still in staging there blocks them; on a preview address, blocking them is right.
const OWN = 'https://www.fjordlys.no'
const OWN_HOSTS = ['www.fjordlys.no', 'fjordlys.no']
const live = (head: string) =>
  `<!doctype html><html><head><title>Om oss | Fjordlys</title><meta name="description" content="Hvem vi er."><meta property="og:image" content="${OWN}/media/a.webp">${head}</head><body><main><p>Hei.</p></main></body></html>`
const ownSitemap = `<urlset><url><loc>${OWN}/no</loc></url><url><loc>${OWN}/no/om-oss</loc></url></urlset>`

test('on the own domain, a site that still blocks search engines fails: robots.txt, noindex and a canonical elsewhere', async () => {
  const { fetchImpl } = fakeFetch({
    [`${OWN}/sitemap.xml`]: { body: ownSitemap },
    [`${OWN}/robots.txt`]: { body: 'User-agent: *\nDisallow: /\n' },
    [`${OWN}/no`]: { body: live('<meta name="robots" content="noindex, nofollow"><link rel="canonical" href="https://fjordlys.hosait.com/no">') },
    [`${OWN}/no/om-oss`]: { body: live(`<link rel="canonical" href="${OWN}/no/om-oss">`), headers: { 'x-robots-tag': 'noindex' } },
  })
  const r = await launchCheck(OWN, { fetch: fetchImpl, ownHosts: OWN_HOSTS })
  assert.deepEqual(r.errors.map((e) => [e.page.slice(OWN.length), e.text]), [
    ['/robots.txt', 'robots.txt blocks search engines on the site\'s own domain'],
    ['/no', 'search engines are told not to index the page (noindex)'],
    ['/no', 'the canonical address is on fjordlys.hosait.com, not on the site\'s own domain'],
    ['/no/om-oss', 'search engines are told not to index the page (noindex)'],
  ])
})

test('on the own domain, a site open to search engines passes, the bare domain counting as its own', async () => {
  const { fetchImpl } = fakeFetch({
    [`${OWN}/sitemap.xml`]: { body: ownSitemap },
    [`${OWN}/robots.txt`]: { body: `User-agent: *\nDisallow: /admin\nDisallow: /api\n\nUser-agent: BadBot\nDisallow: /\n\nSitemap: ${OWN}/sitemap.xml\n` },
    [`${OWN}/no`]: { body: live('<link rel="canonical" href="https://fjordlys.no/no">') },
    [`${OWN}/no/om-oss`]: { body: live(`<meta name="robots" content="index, follow"><link rel="canonical" href="${OWN}/no/om-oss">`) },
  })
  const r = await launchCheck(OWN, { fetch: fetchImpl, ownHosts: OWN_HOSTS })
  assert.deepEqual(r.errors, [])
})

test('on a preview address, blocking search engines is right: not checked, with a note to check the domain after the move', async () => {
  const { fetchImpl, seen } = fakeFetch({
    [`${BASE}/sitemap.xml`]: { body: sitemap(['/no']) },
    [`${BASE}/robots.txt`]: { body: 'User-agent: *\nDisallow: /\n' },
    [`${BASE}/no`]: { body: doc('<p>Hei.</p>', '<title>Fjordlys</title><meta name="robots" content="noindex"><link rel="canonical" href="https://fjordlys.hosait.com/no">') },
  })
  const r = await launchCheck(BASE, { fetch: fetchImpl, ownHosts: OWN_HOSTS })
  assert.deepEqual(r.errors, [])
  assert.ok(!seen.includes(`${BASE}/robots.txt`))
  assert.ok(r.notes.some((n) => /not checked on a preview address/.test(n) && /after the move/.test(n)), JSON.stringify(r.notes))
})

test('qa:launch knows the site\'s own domains from site/config.ts, not localhost', () => {
  const script = readFileSync('scripts/qa/launch-check.ts', 'utf8')
  assert.match(script, /ownHosts/)
  assert.match(script, /SITES/)
  assert.match(script, /localhost/)
  assert.match(readFileSync('AGENTS.md', 'utf8'), /pnpm qa:launch https:\/\/<domain>/)
})

test('the kit has a qa:launch command, and AGENTS.md runs it before the move to the own domain', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> }
  assert.equal(pkg.scripts['qa:launch'], 'tsx scripts/qa/launch-check.ts')
  const guide = readFileSync('AGENTS.md', 'utf8')
  assert.match(guide, /pnpm qa:launch <preview address>/)
  assert.match(guide, /pnpm qa:axe <preview address>/)
})

// qa:axe used to print only, and only for the demo's own pages (om-oss, about).
test('accessibility: serious and critical axe violations are errors, the rest is not reported', () => {
  const v = (id: string, impact: string, n: number) => ({ id, impact, help: `${id} help`, nodes: Array.from({ length: n }, () => ({ target: ['img'] })) })
  assert.deepEqual(axeErrors(`${BASE}/no`, [v('image-alt', 'critical', 2), v('color-contrast', 'serious', 1), v('region', 'moderate', 4), v('x', 'minor', 1)]), [
    { page: `${BASE}/no`, text: 'accessibility: image-alt, image-alt help (2 elements)' },
    { page: `${BASE}/no`, text: 'accessibility: color-contrast, color-contrast help (1 element)' },
  ])
})

// Bjørn's review of #18: Next puts the page's data in inline scripts, and styles and templates are
// not shown, so their text is not the page's.
test('text in a script, style or template is not page text; text a visitor sees still is', () => {
  const hidden = '<script>self.__next_f.push([1,"Lorem ipsum"])</script><style>.x::after{content:"Example text"}</style><template><p>Eksempeltekst</p></template>'
  assert.deepEqual(pageFindings(doc(`<p>Fjordlys AS.</p>${hidden}`), `${BASE}/no`, BASE).errors, [])
  assert.equal(pageFindings(doc(`<p>Lorem ipsum</p>${hidden}`), `${BASE}/no`, BASE).errors.length, 1)
})

test('a huge page is read only up to the cap, not loaded whole', async () => {
  let pulled = 0
  const mb = new TextEncoder().encode(`<p>${'a'.repeat(1024 * 1024 - 7)}</p>`)
  const huge = new ReadableStream<Uint8Array>({
    start: (c) => c.enqueue(new TextEncoder().encode('<!doctype html><html><head><title>T</title></head><body>')),
    pull: (c) => (pulled++ < 64 ? c.enqueue(mb) : c.close()),
  })
  const fetchImpl = async (url: string) => (url.endsWith('/sitemap.xml') ? new Response(sitemap(['/no'])) : new Response(huge))
  const r = await launchCheck(BASE, { fetch: fetchImpl })
  assert.ok(pulled <= 8, `read ${pulled} MB of 64`)
  assert.equal(r.pages, 1)
  assert.ok(!r.errors.some((e) => /could not be read/.test(e.text)), JSON.stringify(r.errors))
})

test('qa:axe: a page that cannot be opened is an error, and the other pages are still checked', async () => {
  const checked: string[] = []
  const errors = await axePages([`${BASE}/no`, `${BASE}/no/treg`, `${BASE}/en`], async (url) => {
    checked.push(url)
    if (url.endsWith('/treg')) throw new Error('page.goto: Timeout 30000ms exceeded.\nCall log: ...')
    return url.endsWith('/en') ? [{ id: 'image-alt', impact: 'critical', help: 'Images need alt', nodes: [{}] }] : []
  })
  assert.deepEqual(checked, [`${BASE}/no`, `${BASE}/no/treg`, `${BASE}/en`])
  assert.deepEqual(errors, [
    { page: `${BASE}/no/treg`, text: 'the page could not be checked for accessibility (page.goto: Timeout 30000ms exceeded.)' },
    { page: `${BASE}/en`, text: 'accessibility: image-alt, Images need alt (1 element)' },
  ])
})

test('qa:axe checks the site\'s own pages from its sitemap, not the demo\'s', () => {
  const script = readFileSync('scripts/qa/axe-report.ts', 'utf8')
  assert.doesNotMatch(script, /om-oss|about/)
  assert.match(script, /sitemapPaths/)
  assert.match(script, /process\.exit\(/)
})
