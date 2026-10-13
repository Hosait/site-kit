import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { crawl, normalize, sameSite } from '../src/crawl.js'
import { get as netGet } from '../src/net.js'
import { serve } from './server.js'

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'crawl-'))
const page = (title, body, lang = 'en', head = '') => ({ body: `<!doctype html><html lang="${lang}"><head><title>${title}</title>${head}</head><body>${body}</body></html>` })

function site(extra = {}) {
  return serve({
    '/robots.txt': (req) => ({ headers: { 'content-type': 'text/plain' }, body: `User-agent: *\nDisallow: /private\nSitemap: http://${req.headers.host}/sitemap.xml\n` }),
    '/sitemap.xml': (req) => ({ headers: { 'content-type': 'application/xml' }, body: `<urlset><url><loc>http://${req.headers.host}/</loc></url><url><loc>http://${req.headers.host}/news/a</loc></url></urlset>` }),
    '/': page('Home',
      `<nav><a href="/about">About</a> <a href="/contact?utm_source=x">Contact</a></nav>
       <main><img src="/wp-content/uploads/hero.jpg" alt="Hero"><p>Welcome</p>
       <a href="https://external.example/">Partner</a> <a href="/private/secret">Secret</a>
       <a href="/files/report.pdf">Report</a> <a href="/old">Old</a> <a href="/out">Out</a>
       <iframe src="https://www.youtube.com/embed/abc"></iframe></main>
       <script src="https://www.googletagmanager.com/gtm.js?id=GTM-X"></script>`,
      'en', '<link rel="alternate" hreflang="no" href="/no/">'),
    '/about': page('About', '<p>About us</p>'),
    '/contact': page('Contact', '<p>Call us</p>'),
    '/news/a': page('News A', '<p>Story</p>'),
    '/no/': page('Hjem', '<p>Velkommen</p>', 'no'),
    '/old': { status: 301, headers: { location: '/about' } },
    '/out': { status: 301, headers: { location: 'https://elsewhere.example/' } },
    ...extra,
  })
}

test('normalize drops hashes and tracking parameters; sameSite treats www and apex as one site', () => {
  assert.equal(normalize('/a?utm_source=x&id=2#top', 'https://x.no/'), 'https://x.no/a?id=2')
  assert.equal(normalize('mailto:a@x.no', 'https://x.no/'), null)
  assert.equal(sameSite('www.x.no', 'x.no'), true)
  assert.equal(sameSite('shop.x.no', 'x.no'), false)
})

test('crawls the site from the start page and sitemap, obeys robots.txt and records what it finds', async () => {
  const s = await site()
  const out = tmp()
  try {
    const inv = await crawl(s.url + '/', { out, allowPrivate: true, delayMs: 0 })
    const paths = inv.pages.map((p) => new URL(p.url).pathname + new URL(p.url).search)
    for (const p of ['/', '/about', '/contact', '/news/a', '/no/', '/old', '/out']) assert.ok(paths.includes(p), p)
    assert.ok(!s.requests.some((r) => r.startsWith('/private')), 'robots.txt obeyed')
    assert.ok(inv.robots.blocked.some((u) => u.includes('/private/secret')))
    assert.ok(!paths.some((p) => p.includes('external')))
    const old = inv.pages.find((p) => p.url.endsWith('/old'))
    assert.equal(old.status, 301)
    const outPage = inv.pages.find((p) => p.url.endsWith('/out'))
    assert.deepEqual([outPage.status, outPage.location], [301, 'https://elsewhere.example/'])
    assert.ok(!s.requests.includes('/elsewhere'), 'another host is never followed')
    assert.ok(inv.media.some((m) => m.url.endsWith('/wp-content/uploads/hero.jpg')))
    assert.ok(inv.documents.some((d) => d.url.endsWith('/files/report.pdf')))
    assert.deepEqual(inv.trackers.map((t) => t.name), ['Google Tag Manager'])
    assert.deepEqual(inv.embeds.map((t) => t.name), ['YouTube'])
    assert.deepEqual(inv.cms.map((t) => t.name), ['WordPress'])
    assert.deepEqual(inv.languages.sort(), ['en', 'no'])
    const home = inv.pages.find((p) => new URL(p.url).pathname === '/')
    assert.ok(fs.existsSync(path.join(out, home.file)))
    const urls = JSON.parse(fs.readFileSync(path.join(out, 'urls.json'), 'utf8'))
    assert.ok(urls.main.en.some((e) => e.path === '/about' && e.status === 200))
  } finally { await s.close() }
})

test('the page cap is respected', async () => {
  const s = await site()
  try {
    const inv = await crawl(s.url + '/', { out: tmp(), allowPrivate: true, delayMs: 0, maxPages: 2 })
    assert.equal(inv.pages.length, 2)
  } finally { await s.close() }
})

test('a sitemap index that lists itself does not hang the crawl', async () => {
  const s = await site({ '/sitemap.xml': (req) => ({ headers: { 'content-type': 'application/xml' }, body: `<sitemapindex><sitemap><loc>http://${req.headers.host}/sitemap.xml</loc></sitemap></sitemapindex>` }) })
  try {
    const inv = await crawl(s.url + '/', { out: tmp(), allowPrivate: true, delayMs: 0 })
    assert.ok(inv.pages.length > 0)
  } finally { await s.close() }
})

test('without allowPrivate a local site is refused', async () => {
  await assert.rejects(crawl('http://localhost/', { out: tmp(), delayMs: 0 }), (e) => e.code === 'EPRIVATE')
})

// --- Review fixes ---------------------------------------------------------
test('robots.txt and sitemaps that redirect on the same site are followed; /sitemap-index.xml is read', async () => {
  const s = await serve({
    '/robots.txt': { status: 301, headers: { location: '/robots-real.txt' } },
    '/robots-real.txt': { headers: { 'content-type': 'text/plain' }, body: 'User-agent: *\nDisallow: /private\n' },
    '/sitemap.xml': { status: 301, headers: { location: '/maps/sitemap.xml' } },
    '/maps/sitemap.xml': (req) => ({ headers: { 'content-type': 'application/xml' }, body: `<urlset><url><loc>http://${req.headers.host}/deep</loc></url></urlset>` }),
    '/sitemap-index.xml': (req) => ({ headers: { 'content-type': 'application/xml' }, body: `<urlset><url><loc>http://${req.headers.host}/from-index</loc></url></urlset>` }),
    '/': page('Home', '<a href="/private/x">x</a>'),
    '/deep': page('Deep', '<p>d</p>'),
    '/from-index': page('From index', '<p>i</p>'),
  })
  try {
    const inv = await crawl(s.url + '/', { out: tmp(), allowPrivate: true, delayMs: 0 })
    const paths = inv.pages.map((p) => new URL(p.url).pathname)
    assert.ok(!s.requests.some((r) => r.startsWith('/private')), 'redirected robots.txt obeyed')
    assert.ok(paths.includes('/deep'), 'redirected sitemap read')
    assert.ok(paths.includes('/from-index'), '/sitemap-index.xml read')
  } finally { await s.close() }
})

test('a huge sitemap does not grow the queue without bound', async () => {
  const s = await serve({
    '/sitemap.xml': (req) => ({ headers: { 'content-type': 'application/xml' }, body: '<urlset>' + Array.from({ length: 2000 }, (_, i) => `<url><loc>http://${req.headers.host}/p${i}</loc></url>`).join('') + '</urlset>' }),
    '/': page('Home', '<p>h</p>'),
  })
  try {
    const inv = await crawl(s.url + '/', { out: tmp(), allowPrivate: true, delayMs: 0, maxPages: 5 })
    assert.equal(inv.pages.length, 5)
    assert.ok(inv.notQueued > 1900, `notQueued ${inv.notQueued}`)
  } finally { await s.close() }
})

test('a malformed Location header is recorded, and the crawl goes on', async () => {
  const s = await serve({ '/': page('Home', '<a href="/bad">bad</a><a href="/ok">ok</a>'), '/bad': { status: 301, headers: { location: 'http://[bad' } }, '/ok': page('OK', '<p>ok</p>') })
  try {
    const inv = await crawl(s.url + '/', { out: tmp(), allowPrivate: true, delayMs: 0 })
    const bad = inv.pages.find((p) => p.url.endsWith('/bad'))
    assert.ok(bad && bad.error, 'bad redirect recorded with an error')
    assert.ok(inv.pages.some((p) => p.url.endsWith('/ok')))
  } finally { await s.close() }
})

// --- Hardening ------------------------------------------------------------
test('a page nested far too deep is recorded with an error, quickly, and the crawl goes on', async () => {
  const s = await serve({
    '/': page('Home', '<a href="/deep">deep</a> <a href="/ok">ok</a>'),
    '/deep': page('Deep', '<div>'.repeat(50_000) + '<a href="/hidden">x</a>'),
    '/ok': page('OK', '<p>ok</p>'),
  })
  try {
    const t = Date.now()
    const inv = await crawl(s.url + '/', { out: tmp(), allowPrivate: true, delayMs: 0 })
    assert.ok(Date.now() - t < 2000, `took ${Date.now() - t} ms`)
    const deep = inv.pages.find((p) => p.url.endsWith('/deep'))
    assert.match(deep.error, /nested/)
    assert.ok(inv.pages.some((p) => p.url.endsWith('/ok') && p.status === 200))
  } finally { await s.close() }
})

test('a sitemap with very many addresses is read in linear time', async () => {
  const s = await serve({
    '/sitemap.xml': (req) => ({ headers: { 'content-type': 'application/xml' }, body: '<urlset>' + Array.from({ length: 40_000 }, (_, i) => `<url><loc>http://${req.headers.host}/p${i}</loc></url>`).join('') + '</urlset>' }),
    '/': page('Home', '<p>h</p>'),
  })
  try {
    const t = Date.now()
    const inv = await crawl(s.url + '/', { out: tmp(), allowPrivate: true, delayMs: 0, maxPages: 2 })
    assert.ok(Date.now() - t < 1500, `took ${Date.now() - t} ms`)
    assert.ok(inv.notQueued > 39_000, `notQueued ${inv.notQueued}`)
  } finally { await s.close() }
})

test('the crawl stops at its time budget, lets requests in flight finish, writes what it has and says so', async () => {
  const routes = { '/': page('Home', Array.from({ length: 40 }, (_, i) => `<a href="/p${i}">${i}</a>`).join(' ')) }
  for (let i = 0; i < 40; i++) routes[`/p${i}`] = { ...page(`P${i}`, '<p>x</p>'), delay: 100 }
  const s = await serve(routes)
  const out = tmp()
  try {
    const t = Date.now()
    const inv = await crawl(s.url + '/', { out, allowPrivate: true, delayMs: 0, budgetMs: 500 })
    assert.ok(Date.now() - t < 1500, `took ${Date.now() - t} ms`)
    assert.ok(inv.pages.length > 2 && inv.pages.length < 41, `${inv.pages.length} pages`)
    assert.ok(inv.pages.every((p) => p.status === 200 && !p.error), 'requests in flight finish')
    assert.ok(inv.notes.some((n) => /budget/.test(n)), JSON.stringify(inv.notes))
    assert.equal(JSON.parse(fs.readFileSync(path.join(out, 'inventory.json'), 'utf8')).pages.length, inv.pages.length)
  } finally { await s.close() }
})

test('a crawl that finishes within its budget has no budget note', async () => {
  const s = await site()
  try {
    const inv = await crawl(s.url + '/', { out: tmp(), allowPrivate: true, delayMs: 0 })
    assert.ok(!inv.notes.some((n) => /budget/.test(n)))
  } finally { await s.close() }
})

test('a budget that is not a positive number is refused', async () => {
  for (const budgetMs of [0, -1, NaN, '5', Infinity]) await assert.rejects(crawl('http://localhost/', { out: tmp(), budgetMs }), /budgetMs/, String(budgetMs))
})

test('media and document lists are capped with a note; languages must look like language tags; titles are cut', async () => {
  const imgs = Array.from({ length: 6000 }, (_, i) => `<img src="/i/${i}.jpg">`).join('')
  const docs = Array.from({ length: 2500 }, (_, i) => `<a href="/d/${i}.pdf">d</a>`).join('')
  const head = `<title>${'T'.repeat(1000)}</title><link rel="alternate" hreflang="nb" href="/nb/"><link rel="alternate" hreflang="not a language" href="/x/"><link rel="alternate" hreflang="x-default" href="/">`
  const s = await serve({
    '/': { body: `<!doctype html><html lang=" EN-GB "><head>${head}</head><body><a href="/x/">x</a>${imgs}${docs}</body></html>` },
    '/nb/': page('Hjem', '<p>Hei</p>', 'nb'),
    '/x/': page('X', '<p>x</p>', 'see the list below'),
  })
  try {
    const inv = await crawl(s.url + '/', { out: tmp(), allowPrivate: true, delayMs: 0 })
    assert.equal(inv.media.length, 5000)
    assert.equal(inv.documents.length, 2000)
    assert.ok(inv.notes.some((n) => /5000 images/.test(n)), JSON.stringify(inv.notes))
    assert.ok(inv.notes.some((n) => /2000 documents/.test(n)), JSON.stringify(inv.notes))
    const home = inv.pages.find((p) => new URL(p.url).pathname === '/')
    assert.equal(home.lang, 'en-gb')
    assert.equal(home.title.length, 300)
    assert.deepEqual(home.alternates.map((a) => a.lang), ['nb', 'x-default'])
    const x = inv.pages.find((p) => p.url.endsWith('/x/'))
    assert.ok(x && x.status === 200 && x.lang === undefined)
    assert.deepEqual(inv.languages.sort(), ['en', 'nb'])
  } finally { await s.close() }
})

test('sitemaps are read only from the same site, whether robots.txt or a sitemap index lists them', async () => {
  const xml = (body) => ({ headers: { 'content-type': 'application/xml' }, body })
  const s = await serve({
    '/robots.txt': (req) => ({ headers: { 'content-type': 'text/plain' }, body: `User-agent: *\nSitemap: http://other.example/sitemap.xml\nSitemap: http://${req.headers.host}/index.xml\n` }),
    '/index.xml': (req) => xml(`<sitemapindex><sitemap><loc>http://elsewhere.example/s.xml</loc></sitemap><sitemap><loc>http://${req.headers.host}/pages.xml</loc></sitemap></sitemapindex>`),
    '/pages.xml': (req) => xml(`<urlset><url><loc>http://${req.headers.host}/listed</loc></url></urlset>`),
    '/': page('Home', '<p>h</p>'),
    '/listed': page('Listed', '<p>l</p>'),
  })
  // Requests to any other host are recorded and never sent.
  const asked = []
  const get = (url, o) => { asked.push(url); return new URL(url).host === new URL(s.url).host ? netGet(url, o) : Promise.reject(new Error('not sent')) }
  try {
    const inv = await crawl(s.url + '/', { out: tmp(), allowPrivate: true, delayMs: 0, get })
    assert.deepEqual(asked.filter((u) => /\.example\//.test(u)), [])
    assert.ok(inv.pages.some((p) => p.url.endsWith('/listed')), 'same-site sitemaps still read')
  } finally { await s.close() }
})
