import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { get as netGet } from '../src/net.js'
import { applyAccepted, qc, readAccepted, readConfig } from '../src/qc.js'
import { png } from './png.js'
import { serve } from './server.js'

const OLD = 'https://old.example'
const noBrowser = async () => { throw Object.assign(new Error('no browser in tests'), { code: 'NO_PLAYWRIGHT' }) }
const local = (u, o) => netGet(u, { ...o, allowPrivate: true })

const page = (p, { title, h, body, img = [], links = [] }) => ({
  url: OLD + p, path: p, title, description: undefined, headings: h.map((text, i) => ({ level: i ? 2 : 1, text })),
  mainHtml: `<main>${h.map((t) => `<h2>${t}</h2>`).join('')}<p>${body}</p>${links.map((l) => `<a href="${l}">${l.endsWith('/') ? 'Home' : 'About'}</a>`).join('')}</main>`, images: img.map((src) => ({ src, alt: '' })), links, template: 'tpl1',
})
const OLD_PAGES = [
  page('/', { title: 'Home', h: ['Welcome', 'Services'], body: 'We build bridges across fjords.', img: [OLD + '/img/bridge-800x600.jpg'], links: [OLD + '/about'] }),
  page('/about', { title: 'About', h: ['About us', 'Team'], body: 'Founded in 1999 in Bergen.', links: [OLD + '/'] }),
]

/** A crawl folder after extract: extract.json, inventory.json and urls.json. */
function folder({ pages = OLD_PAGES, accept, config } = {}) {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'qc-'))
  const nav = [{ label: 'About', href: OLD + '/about' }]
  fs.writeFileSync(path.join(out, 'extract.json'), JSON.stringify({ version: 1, source: OLD + '/', pages, templates: [{ id: 'tpl1', count: 2, examples: pages.map((p) => p.url) }], nav, footer: { text: '', links: [] } }))
  fs.writeFileSync(path.join(out, 'inventory.json'), JSON.stringify({ version: 1, source: OLD + '/', pages: [], documents: [], media: [{ url: OLD + '/img/bridge.jpg' }] }))
  fs.writeFileSync(path.join(out, 'urls.json'), JSON.stringify({ main: { en: pages.map((p) => ({ url: p.url, path: p.path, status: 200 })) } }))
  if (accept) fs.writeFileSync(path.join(out, 'qc.accept.json'), JSON.stringify(accept))
  if (config) fs.writeFileSync(path.join(out, 'qc.config.json'), JSON.stringify(config))
  return out
}

/** The new site: the same pages unless changed, a sitemap and the two count endpoints. */
function newSite({ about, sitemapCount = 2, extra = {} } = {}) {
  const html = (title, h, body, img = '', links = '') => `<!doctype html><html lang="en"><head><title>${title}</title></head><body><header><nav><a href="/about">About</a></nav></header><main>${h.map((t) => `<h2>${t}</h2>`).join('')}<p>${body}</p>${img}${links}</main><footer></footer></body></html>`
  return serve({
    '/': { body: html('Home', ['Welcome', 'Services'], 'We build bridges across fjords.', '<img src="/api/media/file/bridge-1-1600x900.webp" alt="">', '<a href="/about">About</a>') },
    '/about': about ?? { body: html('About', ['About us', 'Team'], 'Founded in 1999 in Bergen.', '', '<a href="/">Home</a>') },
    '/sitemap.xml': { headers: { 'content-type': 'application/xml' }, body: `<urlset>${Array.from({ length: sitemapCount }, (_, i) => `<url><loc>http://x/${i}</loc></url>`).join('')}</urlset>` },
    '/api/documents': { headers: { 'content-type': 'application/json' }, body: '{"totalDocs":0}' },
    '/api/media': { headers: { 'content-type': 'application/json' }, body: '{"totalDocs":1}' },
    ...extra,
  })
}

/**
 * A stand-in for Playwright: each screenshot is a PNG drawn from shots[url] (rectangles, height),
 * and the page reports heading boxes from the same entry.
 */
function fakeBrowser(shots) {
  const calls = { goto: [], launched: false }
  const browser = {
    async newContext({ viewport }) {
      return {
        async route() {}, async routeWebSocket() {}, async close() {},
        async newPage() {
          let url
          const spec = () => shots(url, viewport)
          return {
            setDefaultTimeout() {}, setDefaultNavigationTimeout() {}, async close() {},
            async goto(u) { url = u; calls.goto.push(u) },
            async addStyleTag() {},
            async waitForLoadState() {},
            async evaluate(_fn, arg) { if (Array.isArray(arg)) return { height: spec().height, boxes: spec().boxes ?? [] } },
            async screenshot(o) { const s = spec(); fs.writeFileSync(o.path, png(viewport.width > 500 ? 160 : 80, s.height, s.rects)) },
          }
        },
      }
    },
    async close() {},
  }
  return { calls, launchBrowser: async () => { calls.launched = true; return browser } }
}
const same = () => ({ height: 300, rects: [{ y: 40, h: 30 }], boxes: [{ text: 'Welcome', y: 40 }] })

test('a rebuild that matches in content and pixels passes', async () => {
  const s = await newSite()
  try {
    const out = folder()
    const fake = fakeBrowser(same)
    const r = await qc(out, { newBase: s.url, allowPrivate: true, get: local, launchBrowser: fake.launchBrowser })
    assert.equal(r.pass, true, JSON.stringify(r.pages.map((p) => p.problems).concat(r.site.problems, r.notes)))
    assert.equal(r.summary.screenshotted, 2)
    assert.equal(r.site.nav.score, 1)
    for (const f of ['qc.json', 'qc.md', 'qc.html']) assert.ok(fs.existsSync(path.join(out, f)), f)
    assert.ok(fs.existsSync(path.join(out, 'shots/qc/about-desktop-diff.png')))
    assert.match(fs.readFileSync(path.join(out, 'qc.md'), 'utf8'), /\*\*Passed\.\*\*/)
    // Old pages are screenshotted from the old site, new ones from the new site.
    assert.ok(fake.calls.goto.includes(OLD + '/about') && fake.calls.goto.includes(s.url + '/about'))
  } finally { await s.close() }
})

test('changed text, a missing heading and a missing image fail the page with the reasons', async () => {
  const about = { body: '<html><head><title>About</title></head><body><main><h2>About us</h2><p>Founded somewhere else entirely.</p></main></body></html>' }
  const s = await newSite({ about, extra: { '/': { body: '<html><head><title>Home</title></head><body><header><nav><a href="/about">About</a></nav></header><main><h2>Welcome</h2><h2>Services</h2><p>We build bridges across fjords.</p><a href="/about">About</a></main></body></html>' } } })
  try {
    const r = await qc(folder(), { newBase: s.url, allowPrivate: true, get: local, launchBrowser: fakeBrowser(same).launchBrowser })
    assert.equal(r.pass, false)
    const kinds = (p) => r.pages.find((x) => x.path === p).problems.map((x) => x.kind)
    assert.deepEqual(kinds('/about').sort(), ['headings', 'links', 'text']) // the Home link went too
    assert.deepEqual(kinds('/'), ['images'])
  } finally { await s.close() }
})

test('a page that does not answer on the new site is missing', async () => {
  const s = await newSite({ about: { status: 404, body: 'gone' } })
  try {
    const r = await qc(folder(), { newBase: s.url, allowPrivate: true, get: local, launchBrowser: fakeBrowser(same).launchBrowser })
    assert.equal(r.pass, false)
    assert.equal(r.pages.find((x) => x.path === '/about').problems[0].kind, 'missing')
  } finally { await s.close() }
})

test('pixels: a different look fails, a section pushed down by a taller header does not', async () => {
  const s = await newSite()
  try {
    const different = await qc(folder(), { newBase: s.url, allowPrivate: true, get: local, launchBrowser: fakeBrowser((u) => (u.startsWith(OLD) ? same() : { height: 300, rects: [{ y: 0, h: 300 }] })).launchBrowser })
    assert.equal(different.pass, false)
    assert.ok(different.pages[0].problems.some((p) => p.kind === 'visual-desktop'))
    const pushed = (u) => (u.startsWith(OLD) ? { height: 300, rects: [{ y: 40, h: 30 }, { y: 200, h: 30 }], boxes: [{ text: 'Welcome', y: 40 }, { text: 'Services', y: 200 }] } : { height: 330, rects: [{ y: 70, h: 30 }, { y: 230, h: 30 }], boxes: [{ text: 'Welcome', y: 70 }, { text: 'Services', y: 230 }] })
    const r = await qc(folder(), { newBase: s.url, allowPrivate: true, get: local, launchBrowser: fakeBrowser(pushed).launchBrowser })
    for (const p of r.pages) assert.ok(p.visual.desktop.similarity >= 0.95, `${p.path} ${p.visual.desktop.similarity}`)
  } finally { await s.close() }
})

test('without a browser qc cannot pass, and says why', async () => {
  const s = await newSite()
  try {
    const r = await qc(folder(), { newBase: s.url, allowPrivate: true, get: local, launchBrowser: noBrowser })
    assert.equal(r.pass, false)
    assert.equal(r.complete, false)
    assert.ok(r.notes.some((n) => /Visual parity was not checked/.test(n)))
  } finally { await s.close() }
})

test('a count that differs fails the site; an accepted difference passes and is listed', async () => {
  const s = await newSite({ sitemapCount: 3 })
  try {
    const r = await qc(folder(), { newBase: s.url, allowPrivate: true, get: local, launchBrowser: fakeBrowser(same).launchBrowser })
    assert.equal(r.pass, false)
    assert.deepEqual(r.site.problems.map((p) => p.kind), ['count-pages'])
    const out = folder({ accept: [{ page: '*', kind: 'count-pages', reason: 'The new site has a privacy page' }] })
    const accepted = await qc(out, { newBase: s.url, allowPrivate: true, get: local, launchBrowser: fakeBrowser(same).launchBrowser })
    assert.equal(accepted.pass, true)
    assert.match(fs.readFileSync(path.join(out, 'qc.md'), 'utf8'), /## Accepted differences\n\n- \* count-pages: old site 2, new site 3 \(accepted: The new site has a privacy page\)/)
  } finally { await s.close() }
})

test('qc.accept.json and qc.config.json are checked', () => {
  const bad = folder({ accept: [{ page: 'about', kind: 'text', reason: 'x' }] })
  assert.throws(() => readAccepted(bad), /page must be a path/)
  assert.throws(() => readAccepted(folder({ accept: [{ page: '/a', kind: 'colour', reason: 'x' }] })), /kind must be one of/)
  assert.throws(() => readAccepted(folder({ accept: [{ page: '/a', kind: 'text', reason: ' ' }] })), /reason is required/)
  assert.throws(() => readConfig(folder({ config: { thresholds: { visual: 1.5 } } })), /thresholds.visual/)
  assert.throws(() => readConfig(folder({ config: { masks: { old: [42] } } })), /masks.old/)
  assert.deepEqual(readConfig(folder({ config: { thresholds: { visual: 0.9 }, masks: { new: ['.ticker'] } } })).masks, { old: [], new: ['.ticker'] })
  const marked = applyAccepted([{ kind: 'text', detail: 'x' }, { kind: 'images', detail: 'y' }], '/a', [{ page: '/a', kind: 'text', reason: 'Shortened with the customer' }])
  assert.equal(marked[0].accepted, 'Shortened with the customer')
  assert.equal(marked[1].accepted, undefined)
})

test('the menu is compared on a page that had it, not on the first page read', async () => {
  const no = { ...page('/no', { title: 'Hjem', h: ['Velkommen'], body: 'Vi bygger bruer.' }), nav: [{ label: 'Om oss', href: OLD + '/no/om' }] }
  const pages = [no, ...OLD_PAGES.map((p) => ({ ...p, nav: [{ label: 'About', href: OLD + '/about' }] }))]
  const s = await newSite({ sitemapCount: 3, extra: { '/no': { body: '<html><head><title>Hjem</title></head><body><header><nav><a href="/no/om">Om oss</a></nav></header><main><h2>Velkommen</h2><p>Vi bygger bruer.</p></main></body></html>' } } })
  try {
    const r = await qc(folder({ pages }), { newBase: s.url, allowPrivate: true, get: local, launchBrowser: fakeBrowser(same).launchBrowser })
    assert.equal(r.site.nav.score, 1, JSON.stringify(r.site.problems))
    assert.deepEqual(r.site.problems, [])
  } finally { await s.close() }
})
