import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import zlib from 'node:zlib'

import { LIMITS, assess, classify, md, spread } from '../src/assess.js'
import { get as netGet } from '../src/net.js'
import { serve } from './server.js'

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'assess-'))
const page = (title, body, head = '') => ({ body: `<!doctype html><html lang="nb"><head><title>${title}</title>${head}</head><body>${body}</body></html>` })
const xml = (body) => ({ headers: { 'content-type': 'application/xml' }, body })
const urlset = (host, paths) => `<urlset>${paths.map((p) => `<url><loc>http://${host}${p}</loc></url>`).join('')}</urlset>`
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`
const NAV = '<header><nav><a href="/om-oss">Om oss</a> <a href="/tjenester">Tjenester</a> <a href="/nyheter">Nyheter</a> <a href="/kontakt">Kontakt</a></nav></header>'
const run = (s, extra = {}) => assess(s.url + '/', { out: tmp(), allowPrivate: true, delayMs: 0, ...extra })
const codes = (r) => r.reasons.map((x) => x.code)

/** A small content site: about, services, news, people, contact. Routes in `extra` replace or add pages. */
function contentSite(extra = {}, robots = 'User-agent: *\nDisallow: /private\n') {
  const paths = ['/', '/om-oss', '/tjenester', '/nyheter', '/nyheter/sommerfest', '/folk', '/kontakt']
  return serve({
    '/robots.txt': (req) => ({ headers: { 'content-type': 'text/plain' }, body: `${robots}Sitemap: http://${req.headers.host}/sitemap.xml\n` }),
    '/sitemap.xml': (req) => xml(urlset(req.headers.host, paths)),
    '/': page('Hjem', `${NAV}<main><h1>Velkommen</h1><p>Vi er et lite firma.</p><img src="/bilder/forside.jpg" alt=""><a href="/private/x">x</a></main>`),
    '/om-oss': page('Om oss', `${NAV}<main><p>Historien vår.</p></main>`),
    '/tjenester': page('Tjenester', `${NAV}<main><p>Det vi gjør.</p></main>`),
    '/nyheter': page('Nyheter', `${NAV}<main><a href="/nyheter/sommerfest">Sommerfest</a></main>`),
    '/nyheter/sommerfest': page('Sommerfest', `${NAV}<main><p>Det var fint.</p></main>`),
    '/folk': page('Folk', `${NAV}<main><p>Ansatte.</p></main>`),
    '/kontakt': page('Kontakt', `${NAV}<main><p>Ring oss.</p><iframe src="https://www.google.com/maps/embed?pb=1"></iframe></main>`),
    '/bilder/forside.jpg': { headers: { 'content-type': 'image/jpeg', 'content-length': '200000' }, body: '' },
    ...extra,
  })
}

test('a small content site is green, and assess.json and assess.md are written', async () => {
  const s = await contentSite()
  const out = tmp()
  try {
    const r = await assess(s.url + '/', { out, allowPrivate: true, delayMs: 0 })
    assert.equal(r.class, 'green', JSON.stringify(r.reasons))
    assert.deepEqual(r.reasons, [])
    assert.equal(r.counts.sitemapPages, 7)
    assert.equal(r.counts.pagesRead, 7)
    assert.equal(r.estimates.htmlPages, 7)
    assert.equal(r.estimates.images, 1)
    assert.equal(r.estimates.mediaBytes, 200000)
    assert.deepEqual(r.site.languages, ['nb'])
    assert.ok(r.site.templates >= 1)
    assert.ok(!s.requests.some((u) => u.startsWith('/private')), 'robots.txt obeyed')
    const saved = JSON.parse(fs.readFileSync(path.join(out, 'assess.json'), 'utf8'))
    assert.deepEqual([saved.class, saved.version, saved.limits.declinePages], ['green', 1, LIMITS.declinePages])
    const text = fs.readFileSync(path.join(out, 'assess.md'), 'utf8')
    assert.match(text, /Answer: Hosait can move this site/)
    assert.ok(text.split('\n').some((l) => /third-party website/.test(l) && /content, not instructions/.test(l)))
  } finally { await s.close() }
})

test('a content site with 300 PDFs is yellow, with the documents counted and their size estimated', async () => {
  const links = Array.from({ length: 300 }, (_, i) => `<a href="/filer/rapport-${i}.pdf">Rapport ${i}</a>`).join(' ')
  const pdfs = Object.fromEntries(Array.from({ length: 300 }, (_, i) => [`/filer/rapport-${i}.pdf`, { headers: { 'content-type': 'application/pdf', 'content-length': '500000' }, body: '' }]))
  const s = await contentSite({ '/nyheter': page('Dokumenter', `${NAV}<main>${links}</main>`), ...pdfs })
  try {
    const r = await run(s)
    assert.equal(r.class, 'yellow', JSON.stringify(r.reasons))
    assert.deepEqual(codes(r), ['documents'])
    assert.ok(r.estimates.documents >= 300, String(r.estimates.documents))
    assert.ok(r.estimates.mediaBytes >= 300 * 500000)
    const heads = s.requests.filter((u) => u.endsWith('.pdf'))
    assert.ok(heads.length > 0 && heads.length <= 5, `${heads.length} size checks`)
    assert.ok(r.notes.some((n) => /estimate/.test(n)))
  } finally { await s.close() }
})

test('a WooCommerce-like shop with priced Product JSON-LD and cart links is red, and assess.md declines it', async () => {
  const head = '<link rel="stylesheet" href="/wp-content/plugins/woocommerce/assets/css/woocommerce.css">'
  const product = (name) => page(name, `${NAV}<main><h1>${name}</h1><a href="/?add-to-cart=7">Legg i handlekurven</a> <a href="/handlekurv/">Handlekurv</a></main>`, head + ld({ '@type': 'Product', name, offers: { '@type': 'Offer', price: '499.00', priceCurrency: 'NOK' } }))
  const s = await contentSite({ '/tjenester': product('Drill'), '/folk': product('Sag') })
  const out = tmp()
  try {
    const r = await assess(s.url + '/', { out, allowPrivate: true, delayMs: 0 })
    assert.equal(r.class, 'red')
    assert.ok(codes(r).includes('shop'))
    const matches = r.reasons.find((x) => x.code === 'shop').evidence.map((e) => e.match)
    for (const m of ['WooCommerce shop system', 'product markup with a price', 'link to /handlekurv/']) assert.ok(matches.includes(m), m)
    assert.ok(!s.requests.some((u) => u.startsWith('/handlekurv') || u.includes('add-to-cart')), 'cart actions are never requested')
    const text = fs.readFileSync(path.join(out, 'assess.md'), 'utf8')
    assert.match(text, /Hosait does not move this site/)
    assert.doesNotMatch(text, /part of the site|partial/i)
  } finally { await s.close() }
})

test('a site with a login form is red', async () => {
  const s = await contentSite({ '/kontakt': page('Kontakt', `${NAV}<main><form action="/kunde" method="post"><input name="user"><input type="password" name="pw"></form></main>`) })
  try {
    const r = await run(s)
    assert.equal(r.class, 'red')
    assert.deepEqual(codes(r), ['login'])
    assert.ok(r.reasons[0].evidence.some((e) => e.match === 'password field' && e.url.endsWith('/kontakt')))
  } finally { await s.close() }
})

test('a sitemap of 900 product pages with Product markup on the sampled pages is red, without reading more than the page cap', async () => {
  const items = Array.from({ length: 900 }, (_, i) => `/utstyr/modell-${i}`)
  const routes = Object.fromEntries(items.map((p, i) => [p, page(`Modell ${i}`, `${NAV}<main><h1>Modell ${i}</h1><p>Datablad.</p></main>`, ld({ '@type': 'Product', name: `Modell ${i}`, sku: String(i) }))]))
  const s = await contentSite({ '/sitemap.xml': (req) => xml(urlset(req.headers.host, ['/', '/om-oss', '/kontakt', ...items])), ...routes })
  try {
    const r = await run(s)
    assert.equal(r.class, 'red')
    assert.ok(codes(r).includes('catalogue'), JSON.stringify(codes(r)))
    assert.ok(codes(r).includes('pages'), 'more than 500 pages')
    assert.ok(r.estimates.productPages > 700, String(r.estimates.productPages))
    const pagesAsked = s.requests.filter((u) => !/robots|sitemap|\.(jpg|pdf)$/.test(u))
    assert.ok(pagesAsked.length <= 40, `${pagesAsked.length} pages requested`)
    assert.equal(r.counts.sitemapPages, 903)
  } finally { await s.close() }
})

test('a robots.txt that keeps crawlers out of cart actions is red', async () => {
  const s = await contentSite({}, 'User-agent: *\nDisallow: /ajax?action=add*\nDisallow: /handlekurv\n')
  try {
    const r = await run(s)
    assert.equal(r.class, 'red')
    assert.deepEqual(codes(r), ['shop'])
    assert.deepEqual(r.reasons[0].evidence.map((e) => e.match), ['Disallow: /ajax?action=add*', 'Disallow: /handlekurv'])
    assert.ok(r.reasons[0].evidence[0].url.endsWith('/robots.txt'))
  } finally { await s.close() }
})

test('a booking iframe is listed as an integration and makes the site yellow', async () => {
  const s = await contentSite({ '/kontakt': page('Kontakt', `${NAV}<main><iframe src="https://booking.timma.no/firma"></iframe></main>`) })
  try {
    const r = await run(s)
    assert.equal(r.class, 'yellow')
    assert.deepEqual(codes(r), ['integrations'])
    assert.deepEqual(r.site.integrations.map((i) => i.match), ['booking: embedded booking.timma.no'])
  } finally { await s.close() }
})

test('the page cap is respected, and a sample is spread across the sitemap', async () => {
  const items = Array.from({ length: 100 }, (_, i) => `/${i % 2 ? 'artikler' : 'prosjekter'}/${i}`)
  const routes = Object.fromEntries(items.map((p) => [p, page(p, '<p>x</p>')]))
  const s = await contentSite({ '/sitemap.xml': (req) => xml(urlset(req.headers.host, ['/', ...items])), ...routes })
  try {
    const r = await run(s, { maxPages: 5 })
    assert.equal(r.counts.pagesTried, 5)
    const asked = s.requests.filter((u) => !/robots|sitemap|\.(jpg|pdf)$/.test(u))
    assert.equal(asked.length, 5)
    assert.ok(asked.some((u) => u.startsWith('/artikler')) && asked.some((u) => u.startsWith('/prosjekter')), JSON.stringify(asked))
  } finally { await s.close() }
})

test('assess stops at its time budget, says so, and still answers (never "unknown")', async () => {
  const items = Array.from({ length: 30 }, (_, i) => `/side/${i}`)
  const routes = Object.fromEntries(items.map((p) => [p, { ...page(p, '<p>x</p>'), delay: 150 }]))
  const s = await serve({ '/sitemap.xml': (req) => xml(urlset(req.headers.host, ['/', ...items])), '/': { ...page('Hjem', '<p>h</p>'), delay: 150 }, ...routes })
  try {
    const t = Date.now()
    const r = await run(s, { budgetMs: 400 })
    assert.ok(Date.now() - t < 2000, `took ${Date.now() - t} ms`)
    assert.ok(r.counts.pagesRead < 31)
    assert.ok(r.notes.some((n) => /time budget/.test(n)), JSON.stringify(r.notes))
    assert.ok(['green', 'yellow', 'red'].includes(r.class))
  } finally { await s.close() }
})

test('when too little can be read the answer is yellow with the reason, not unknown', async () => {
  const s = await contentSite({ '/robots.txt': { status: 503, body: 'busy' } })
  try {
    const r = await run(s)
    assert.equal(r.class, 'yellow')
    assert.deepEqual(codes(r), ['not-enough-read'])
    assert.match(r.reasons[0].text, /robots\.txt did not answer/)
    assert.deepEqual(s.requests, ['/robots.txt'])
  } finally { await s.close() }
  const s2 = await contentSite({}, 'User-agent: *\nDisallow: /\n')
  try {
    const r = await run(s2)
    assert.equal(r.class, 'yellow')
    assert.match(r.reasons.find((x) => x.code === 'not-enough-read').text, /home page/)
  } finally { await s2.close() }
})

test('a page that cannot be read fails alone and is recorded', async () => {
  const s = await contentSite({ '/folk': { status: 500, body: 'oops' } })
  try {
    const r = await run(s)
    assert.equal(r.class, 'green')
    assert.equal(r.counts.pagesFailed, 1)
    assert.ok(r.pages.some((p) => p.url.endsWith('/folk') && p.status === 500))
    assert.ok(r.notes.some((n) => /could not be read/.test(n)))
  } finally { await s.close() }
})

test('nothing private or on another site is fetched', async () => {
  await assert.rejects(assess('http://localhost/', { out: tmp(), delayMs: 0 }), (e) => e.code === 'EPRIVATE')
  const s = await contentSite({
    '/robots.txt': (req) => ({ headers: { 'content-type': 'text/plain' }, body: `User-agent: *\nSitemap: http://other.example/sitemap.xml\nSitemap: http://${req.headers.host}/sitemap.xml\n` }),
    '/sitemap.xml': (req) => xml(urlset(req.headers.host, ['/', '/om-oss']).replace('</urlset>', '<url><loc>http://10.0.0.1/admin</loc></url><url><loc>http://other.example/x</loc></url></urlset>')),
    '/om-oss': page('Om oss', '<a href="http://169.254.169.254/latest">x</a><img src="http://10.0.0.2/a.jpg"><a href="http://other.example/f.pdf">pdf</a>'),
  })
  const asked = []
  const get = (url, o) => { asked.push(url); return new URL(url).host === new URL(s.url).host ? netGet(url, o) : Promise.reject(new Error('not sent')) }
  try {
    await run(s, { get })
    assert.deepEqual(asked.filter((u) => new URL(u).host !== new URL(s.url).host), [])
  } finally { await s.close() }
})

test('a page cap or budget that is not a positive number is refused', async () => {
  for (const maxPages of [0, -1, 2.5, NaN, '5']) await assert.rejects(assess('http://localhost/', { out: tmp(), maxPages }), /maxPages/, String(maxPages))
  for (const budgetMs of [0, -1, NaN, Infinity]) await assert.rejects(assess('http://localhost/', { out: tmp(), budgetMs }), /budgetMs/, String(budgetMs))
})

// --- Classification rules, one per threshold in LIMITS -------------------------------------
const none = { shop: [], payment: [], catalogue: [], login: [], integrations: [], htmlPages: 10, documents: 0, mediaBytes: 0, enough: true }
const ev = [{ url: 'https://x.no/', match: 'm' }]
const verdict = (f) => classify({ ...none, ...f })

test('classify: nothing found is green', () => assert.deepEqual(verdict({}), { class: 'green', reasons: [] }))
test('classify: any shop signal is red', () => assert.equal(verdict({ shop: ev }).class, 'red'))
test('classify: a payment service is red', () => assert.equal(verdict({ payment: ev }).class, 'red'))
test('classify: a product catalogue is red', () => assert.equal(verdict({ catalogue: ev }).class, 'red'))
test('classify: a login or member area is red', () => assert.equal(verdict({ login: ev }).class, 'red'))
test('classify: more than declinePages pages is red', () => {
  assert.equal(verdict({ htmlPages: LIMITS.declinePages }).class, 'yellow')
  assert.equal(verdict({ htmlPages: LIMITS.declinePages + 1 }).class, 'red')
})
test('classify: more than scopePages pages is yellow', () => {
  assert.equal(verdict({ htmlPages: LIMITS.scopePages }).class, 'green')
  assert.equal(verdict({ htmlPages: LIMITS.scopePages + 1 }).class, 'yellow')
})
test('classify: more than scopeDocuments documents is yellow', () => {
  assert.equal(verdict({ documents: LIMITS.scopeDocuments }).class, 'green')
  assert.equal(verdict({ documents: LIMITS.scopeDocuments + 1 }).class, 'yellow')
})
test('classify: an estimated media size over scopeMediaBytes is yellow', () => {
  assert.equal(verdict({ mediaBytes: LIMITS.scopeMediaBytes }).class, 'green')
  assert.equal(verdict({ mediaBytes: LIMITS.scopeMediaBytes + 1 }).class, 'yellow')
})
test('classify: integrations are yellow, not red', () => assert.equal(verdict({ integrations: ev }).class, 'yellow'))
test('classify: too little read is yellow with its reason', () => {
  const v = verdict({ enough: false, enoughWhy: 'the time budget ran out' })
  assert.equal(v.class, 'yellow')
  assert.match(v.reasons[0].text, /time budget ran out/)
})
test('classify: red wins over yellow, and evidence is capped', () => {
  const many = Array.from({ length: 20 }, (_, i) => ({ url: `https://x.no/${i}`, match: 'm' }))
  const v = verdict({ shop: many, documents: 1000 })
  assert.equal(v.class, 'red')
  assert.equal(v.reasons[0].evidence.length, 5)
})

test('catalogue rules: product markup needs catalogueMinSampled pages and catalogueMinProducts estimated; product paths need productPathMin and productPathShare', async () => {
  // Product markup on one page only: not a catalogue.
  const one = await contentSite({ '/tjenester': page('Tjenester', `${NAV}<main><p>x</p></main>`, ld({ '@type': 'Product', name: 'Tjeneste' })) })
  try { assert.equal((await run(one)).class, 'green') } finally { await one.close() }
  // Product paths: 60 of 67 sitemap pages under /produkter/ (no markup) is a catalogue.
  const items = Array.from({ length: 60 }, (_, i) => `/produkter/${i}`)
  const s = await contentSite({ '/sitemap.xml': (req) => xml(urlset(req.headers.host, ['/', '/om-oss', '/tjenester', '/nyheter', '/nyheter/sommerfest', '/folk', '/kontakt', ...items])) })
  try {
    const r = await run(s, { maxPages: 8 })
    assert.equal(r.class, 'red')
    assert.ok(r.reasons.find((x) => x.code === 'catalogue').evidence.some((e) => /60 of 67 sitemap pages have product addresses/.test(e.match)))
  } finally { await s.close() }
})

test('spread picks deterministically across path groups and positions, never more than asked', () => {
  const urls = [...Array.from({ length: 90 }, (_, i) => `https://x.no/produkt/${i}`), ...Array.from({ length: 9 }, (_, i) => `https://x.no/nyheter/${i}`), 'https://x.no/om-oss']
  const a = spread(urls, 10)
  assert.deepEqual(a, spread(urls, 10))
  assert.equal(a.length, 10)
  assert.equal(new Set(a).size, 10)
  assert.ok(a.includes('https://x.no/om-oss'))
  assert.ok(a.some((u) => u.includes('/nyheter/')))
  assert.ok(a.filter((u) => u.includes('/produkt/')).length >= 7, 'in proportion to group size')
  const at = a.filter((u) => u.includes('/produkt/')).map((u) => Number(u.split('/').pop()))
  assert.ok(Math.min(...at) < 10 && Math.max(...at) > 80, 'spread by position: ' + at)
  assert.deepEqual(spread(urls.slice(0, 3), 10), urls.slice(0, 3))
  assert.deepEqual(spread(urls, 0), [])
})

test('assess.md escapes Markdown in text taken from the site', () => {
  assert.equal(md('[a](http://x) *b* <img src=x> `c`'), '\\[a\\]\\(http://x\\) \\*b\\* \\<img src=x\\> \\`c\\`')
  assert.equal(md('a\nb\u202Ec'), 'a b c')
})

test('a gzipped sitemap is read', async () => {
  const s = await serve({
    '/robots.txt': (req) => ({ headers: { 'content-type': 'text/plain' }, body: `Sitemap: http://${req.headers.host}/sitemap.xml.gz\n` }),
    '/sitemap.xml.gz': (req) => ({ headers: { 'content-type': 'application/gzip' }, body: zlib.gzipSync(urlset(req.headers.host, ['/', '/om-oss', '/kontakt'])) }),
    '/': page('Hjem', `${NAV}<main><p>Hei</p></main>`),
    '/om-oss': page('Om oss', `${NAV}<main><p>x</p></main>`),
    '/kontakt': page('Kontakt', `${NAV}<main><p>x</p></main>`),
  })
  try {
    const r = await run(s)
    assert.equal(r.counts.sitemapPages, 3)
  } finally { await s.close() }
})

test('a home page that leads to another site, by redirect, meta refresh or frameset, is not enough to decide, and the note names it', async () => {
  for (const [what, home] of [
    ['redirect', { status: 301, headers: { location: 'https://www.acme-ny.example/' } }],
    ['meta refresh', page('Acme', '<p>Vent</p>', '<meta http-equiv="refresh" content="0; url=https://www.acme-ny.example/">')],
    ['frameset', { body: '<html><head><title>Acme</title></head><frameset><frame src="https://www.acme-ny.example/"></frameset></html>' }],
  ]) {
    const s = await serve({ '/': home })
    try {
      const r = await run(s)
      assert.deepEqual([r.class, codes(r)], ['yellow', ['not-enough-read']], what)
      assert.ok(r.notes.some((n) => /www\.acme-ny\.example/.test(n)), `${what}: ${JSON.stringify(r.notes)}`)
      assert.ok(!s.requests.some((u) => /acme/.test(u)))
    } finally { await s.close() }
  }
})

test('no sitemap and a home page that links to nothing is not enough to decide', async () => {
  const s = await serve({ '/': page('App', '<div id="root"></div><script src="/app.js"></script>') })
  try {
    const r = await run(s)
    assert.deepEqual([r.class, codes(r)], ['yellow', ['not-enough-read']])
  } finally { await s.close() }
})
