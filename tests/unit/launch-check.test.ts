import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { launchCheck, pageFindings, sitemapPaths } from '../../src/lib/launch-check'

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

type Route = { status?: number; body?: string; location?: string }
function fakeFetch(routes: Record<string, Route>) {
  const seen: string[] = []
  const fetchImpl = async (url: string) => {
    seen.push(url)
    const r = routes[url] ?? { status: 404, body: 'not found' }
    return new Response(r.body ?? '', { status: r.status ?? 200, headers: r.location ? { location: r.location } : {} })
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

test('the kit has a qa:launch command, and AGENTS.md runs it before the move to the own domain', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> }
  assert.equal(pkg.scripts['qa:launch'], 'tsx scripts/qa/launch-check.ts')
  const guide = readFileSync('AGENTS.md', 'utf8')
  assert.match(guide, /pnpm qa:launch <preview address>/)
})
