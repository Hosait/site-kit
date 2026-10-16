import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

import { LAUNCH, allowRequest, compare } from '../src/compare.js'
import { get as netGet } from '../src/net.js'
import { serve } from './server.js'

const OLD = 'https://old.example'
const NO_PLAYWRIGHT = 'Screenshots skipped: Playwright is not available (pnpm exec playwright install chromium).'
const noBrowser = async () => { throw Object.assign(new Error('no browser in tests'), { code: 'NO_PLAYWRIGHT' }) }
// The old site in these tests is on localhost, which compare never allows for the old site.
const localOld = (u, o) => netGet(u, { ...o, allowPrivate: true })
const pathOf = (u) => new URL(u).pathname + new URL(u).search
const byPath = (results) => Object.fromEntries(results.map((r) => [pathOf(r.old), r]))

/** A crawl folder: urls.json (from [path, status] pairs, or as given), inventory.json (with documents, when given) and, with templates, extract.json. */
function folder(entries, { templates, urls, source = OLD, documents } = {}) {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'compare-'))
  urls ??= { main: { en: entries.map(([p, status]) => ({ url: OLD + p, path: p.split('?')[0], status })) } }
  fs.writeFileSync(path.join(out, 'urls.json'), JSON.stringify(urls))
  const inventory = { version: 1, source: source + '/', pages: [] }
  if (documents) inventory.documents = documents.map((url) => ({ url, foundOn: [source + '/'] }))
  fs.writeFileSync(path.join(out, 'inventory.json'), JSON.stringify(inventory))
  if (templates) fs.writeFileSync(path.join(out, 'extract.json'), JSON.stringify({ version: 1, source: OLD + '/', pages: [], templates }))
  return out
}

/** The part of Playwright's Browser that compare uses; records every screenshot, context and route. */
function fakeBrowser({ failOn, gotoMs = 0 } = {}) {
  const calls = { launched: false, launchOptions: null, closed: false, shots: [], contexts: [], routes: [], webSockets: 0, timeouts: [] }
  const browser = {
    async newContext(options) {
      calls.contexts.push(options)
      const { viewport } = options
      return {
        async route(pattern, handler) { calls.routes.push({ pattern, handler }) },
        async routeWebSocket() { calls.webSockets++ },
        async newPage() {
          let url
          return {
            setDefaultTimeout(ms) { calls.timeouts.push(ms) },
            setDefaultNavigationTimeout(ms) { calls.timeouts.push(ms) },
            async goto(u) { url = u; if (gotoMs) await new Promise((r) => setTimeout(r, gotoMs)); if (failOn && u.endsWith(failOn)) throw new Error('net::ERR_CONNECTION_REFUSED') },
            async screenshot(opts) { calls.shots.push({ url, viewport, ...opts }); fs.writeFileSync(opts.path, 'png') },
            async close() {},
          }
        },
        async close() {},
      }
    },
    async close() { calls.closed = true },
  }
  return { calls, launchBrowser: async (options) => { calls.launched = true; calls.launchOptions = options; return browser } }
}

test('a page that answers 200 on the new site is OK', async () => {
  const s = await serve({ '/about': { body: 'ok' } })
  try {
    const { results } = await compare(folder([['/about', 200]]), { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser, get: localOld })
    assert.equal(results.length, 1)
    const [r] = results
    assert.deepEqual([r.old, r.target, r.status, r.final, r.ok, r.note], [OLD + '/about', s.url + '/about', 200, undefined, true, undefined])
  } finally { await s.close() }
})

test('301 and 308 to a page that answers 200 are OK, with the final address', async () => {
  const s = await serve({ '/ok': { body: 'ok' }, '/moved': { status: 301, headers: { location: '/ok' } }, '/kept': { status: 308, headers: { location: '/ok' } } })
  try {
    const r = byPath((await compare(folder([['/moved', 200], ['/kept', 200]]), { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser, get: localOld })).results)
    for (const p of ['/moved', '/kept']) assert.deepEqual([r[p].ok, r[p].status, r[p].final], [true, 200, s.url + '/ok'], p)
  } finally { await s.close() }
})

test('a temporary redirect (302, 303, 307) fails even when it ends at a 200', async () => {
  const s = await serve({ '/ok': { body: 'ok' }, '/t302': { status: 302, headers: { location: '/ok' } }, '/t303': { status: 303, headers: { location: '/ok' } }, '/t307': { status: 307, headers: { location: '/ok' } } })
  try {
    const r = byPath((await compare(folder([['/t302', 200], ['/t303', 200], ['/t307', 200]]), { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser, get: localOld })).results)
    for (const code of [302, 303, 307]) assert.deepEqual([r[`/t${code}`].ok, r[`/t${code}`].status, r[`/t${code}`].note], [false, code, `temporary redirect (${code})`])
  } finally { await s.close() }
})

test('a page missing on the new site fails with its status', async () => {
  const s = await serve({ '/broken': { status: 500, body: 'oops' } })
  try {
    const r = byPath((await compare(folder([['/gone', 200], ['/broken', 200]]), { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser, get: localOld })).results)
    assert.deepEqual([r['/gone'].ok, r['/gone'].status], [false, 404])
    assert.deepEqual([r['/broken'].ok, r['/broken'].status], [false, 500])
  } finally { await s.close() }
})

test('at most 3 redirects are followed; a loop or a longer chain fails', async () => {
  const s = await serve({
    '/ok': { body: 'ok' },
    '/loop': { status: 301, headers: { location: '/loop' } },
    '/r1': { status: 301, headers: { location: '/r2' } }, '/r2': { status: 301, headers: { location: '/r3' } }, '/r3': { status: 308, headers: { location: '/ok' } },
    '/s1': { status: 301, headers: { location: '/s2' } }, '/s2': { status: 301, headers: { location: '/s3' } }, '/s3': { status: 301, headers: { location: '/s4' } }, '/s4': { status: 301, headers: { location: '/ok' } },
  })
  try {
    const r = byPath((await compare(folder([['/loop', 200], ['/r1', 200], ['/s1', 200]]), { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser, get: localOld })).results)
    assert.deepEqual([r['/loop'].ok, r['/loop'].note], [false, 'too many redirects'])
    assert.equal(s.requests.filter((u) => u === '/loop').length, 4, 'the first request and 3 redirects')
    assert.deepEqual([r['/r1'].ok, r['/r1'].final], [true, s.url + '/ok'])
    assert.deepEqual([r['/s1'].ok, r['/s1'].note], [false, 'too many redirects'])
    assert.ok(s.requests.includes('/s4'))
    assert.equal(s.requests.filter((u) => u === '/ok').length, 1, 'only the 3-redirect chain reaches /ok')
  } finally { await s.close() }
})

test('a redirect to another origin fails and is not followed', async () => {
  const other = await serve({ '/x': { body: 'elsewhere' } })
  const s = await serve({ '/away': { status: 301, headers: { location: other.url + '/x' } }, '/abroad': { status: 308, headers: { location: 'https://elsewhere.example/' } } })
  try {
    const r = byPath((await compare(folder([['/away', 200], ['/abroad', 200]]), { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser, get: localOld })).results)
    assert.deepEqual([r['/away'].ok, r['/away'].status, r['/away'].note, r['/away'].final], [false, 301, 'leaves the new site', other.url + '/x'])
    assert.deepEqual([r['/abroad'].ok, r['/abroad'].note], [false, 'leaves the new site'])
    assert.deepEqual(other.requests, [])
  } finally { await s.close(); await other.close() }
})

test('without allowPrivate a local new site is refused, and no screenshots are attempted', async () => {
  const fake = fakeBrowser()
  const { results, shots, notes } = await compare(folder([['/', 200], ['/about', 200]]), { newBase: 'http://127.0.0.1', launchBrowser: fake.launchBrowser })
  assert.equal(results.length, 2)
  for (const r of results) {
    assert.deepEqual([r.status, r.ok], [0, false])
    assert.match(r.note, /private address\. Use --allow-private only for your own local or intranet sites\./)
  }
  assert.equal(fake.calls.launched, false)
  assert.deepEqual(shots, [])
  assert.ok(notes.some((n) => /^Screenshots skipped: .*private address.*--allow-private/.test(n)), notes.join('\n'))
})

test('only old addresses that answered 200 are checked, each once, with their query strings', async () => {
  const s = await serve({ '/a': { body: 'a' }, '/b': { body: 'b' }, '/c': { body: 'c' } })
  const urls = {
    main: {
      en: [
        { url: OLD + '/a?x=1', path: '/a', status: 200 }, { url: OLD + '/a?x=1', path: '/a', status: 200 }, { url: OLD + '/a?x=2', path: '/a', status: 200 },
        { url: OLD + '/b', path: '/b', status: 200 }, { url: OLD + '/gone', path: '/gone', status: 404 }, { url: OLD + '/moved', path: '/moved', status: 301 }, { url: OLD + '/err', path: '/err', status: 0 },
      ],
      no: [{ url: OLD + '/b', path: '/b', status: 200 }, { url: OLD + '/c', path: '/c', status: 200 }],
    },
  }
  try {
    const { results } = await compare(folder(null, { urls }), { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser, get: localOld })
    assert.deepEqual(results.map((r) => pathOf(r.old)), ['/a?x=1', '/a?x=2', '/b', '/c'])
    assert.deepEqual(results.map((r) => r.target), ['/a?x=1', '/a?x=2', '/b', '/c'].map((p) => s.url + p))
    assert.deepEqual([...s.requests].sort(), ['/a?x=1', '/a?x=2', '/b', '/c'])
  } finally { await s.close() }
})

test('compare.md and compare.json give the counts and one line per failure', async () => {
  const s = await serve({ '/ok': { body: 'ok' }, '/temp': { status: 302, headers: { location: '/ok' } } })
  try {
    const out = folder([['/ok', 200], ['/gone', 200], ['/temp', 200]])
    await compare(out, { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser, get: localOld })
    const md = fs.readFileSync(path.join(out, 'compare.md'), 'utf8')
    for (const line of [
      `# Compare with ${s.url}`,
      '3 old addresses checked: 1 OK, 2 fail.',
      `- 404 /gone → ${s.url}/gone`,
      `- 302 /temp → ${s.url}/ok (temporary redirect (302))`,
      '## Screenshots',
      NO_PLAYWRIGHT,
    ]) assert.ok(md.includes(line), line)
    assert.ok(!md.includes('/ok →'), 'OK addresses are not listed')
    assert.ok(md.indexOf('## Screenshots') > md.indexOf('- 404'))
    const json = JSON.parse(fs.readFileSync(path.join(out, 'compare.json'), 'utf8'))
    assert.equal(json.newBase, s.url)
    assert.ok(!Number.isNaN(Date.parse(json.checkedAt)))
    assert.deepEqual(json.results.map((r) => [pathOf(r.old), r.status, r.ok]), [['/ok', 200, true], ['/gone', 404, false], ['/temp', 302, false]])
    assert.deepEqual(json.shots, [])
    assert.deepEqual(json.notes, [NO_PLAYWRIGHT])
  } finally { await s.close() }
})

test('an old document that answers 200 on the old site and 301 to a 200 on the new site is OK, in documents', async () => {
  const old = await serve({ '/files/prices.pdf': { headers: { 'content-type': 'application/pdf' }, body: '%PDF' + 'x'.repeat(100 * 1024) } })
  const s = await serve({ '/about': { body: 'ok' }, '/files/prices.pdf': { status: 301, headers: { location: '/media/prices.pdf' } }, '/media/prices.pdf': { body: '%PDF' } })
  try {
    const out = folder([['/about', 200]], { source: old.url, documents: [old.url + '/files/prices.pdf', old.url + '/files/prices.pdf#p2'] })
    const { results, documents } = await compare(out, { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser, get: localOld })
    assert.deepEqual(results.map((r) => [pathOf(r.old), r.ok]), [['/about', true]])
    assert.equal(documents.length, 1, 'once per path and query')
    const [d] = documents
    assert.deepEqual([d.old, d.target, d.status, d.final, d.ok, d.note], [old.url + '/files/prices.pdf', s.url + '/files/prices.pdf', 200, s.url + '/media/prices.pdf', true, undefined])
    assert.deepEqual(old.requests, ['/files/prices.pdf'])
    const json = JSON.parse(fs.readFileSync(path.join(out, 'compare.json'), 'utf8'))
    assert.deepEqual(json.documents.map((r) => [r.old, r.final, r.ok]), [[d.old, d.final, true]])
    assert.ok(fs.readFileSync(path.join(out, 'compare.md'), 'utf8').includes('1 old documents checked: 1 OK, 0 fail.'))
  } finally { await old.close(); await s.close() }
})

test('an old document that answers 200 on the old site and 404 on the new site fails, listed under documents', async () => {
  const old = await serve({ '/files/a.pdf': { body: '%PDF' } })
  const s = await serve({ '/about': { body: 'ok' } })
  try {
    const out = folder([['/about', 200]], { source: old.url, documents: [old.url + '/files/a.pdf'] })
    const { results, documents } = await compare(out, { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser, get: localOld })
    assert.deepEqual(results.map((r) => r.ok), [true])
    assert.deepEqual(documents.map((d) => [pathOf(d.old), d.status, d.ok]), [['/files/a.pdf', 404, false]])
    const md = fs.readFileSync(path.join(out, 'compare.md'), 'utf8')
    const pages = md.indexOf('1 old addresses checked: 1 OK, 0 fail.')
    const docs = md.indexOf('1 old documents checked: 0 OK, 1 fail.')
    const line = md.indexOf(`- 404 /files/a.pdf → ${s.url}/files/a.pdf`)
    assert.ok(pages !== -1 && docs > pages && line > docs && md.indexOf('## Screenshots') > line, md)
  } finally { await old.close(); await s.close() }
})

test('an old document that does not answer 200 on the old site is not checked on the new one, only named in a note', async () => {
  const more = Array.from({ length: 9 }, (_, i) => `/x${i}.pdf`)
  const old = await serve({ '/moved.pdf': { status: 301, headers: { location: '/a.pdf' } }, '/reset.pdf': (req) => { req.socket.destroy(); return { body: '' } } })
  const s = await serve({ '/about': { body: 'ok' } })
  try {
    const out = folder([['/about', 200]], { source: old.url, documents: ['/gone.pdf', '/moved.pdf', '/reset.pdf', ...more].map((p) => old.url + p) })
    const { results, documents, notes } = await compare(out, { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser, get: localOld })
    assert.deepEqual(results.map((r) => r.ok), [true])
    assert.deepEqual(documents, [])
    assert.deepEqual(s.requests, ['/about'], 'the new site never got a document request')
    const listed = ['/gone.pdf (404)', '/moved.pdf (301)', '/reset.pdf (socket hang up)', ...more.slice(0, 7).map((p) => `${p} (404)`)]
    const note = `12 documents did not work on the old site either and were not checked: ${listed.join(', ')}, …`
    assert.deepEqual(notes, [note, NO_PLAYWRIGHT])
    const md = fs.readFileSync(path.join(out, 'compare.md'), 'utf8')
    assert.ok(md.indexOf(`- ${note}`) > md.indexOf('## Notes'), md)
    assert.ok(!md.includes('old documents checked'), 'no documents line when none was checked')
  } finally { await old.close(); await s.close() }
})

test('documents on another origin than the crawled site are ignored', async () => {
  const old = await serve({})
  const other = await serve({ '/elsewhere.pdf': { body: '%PDF' } })
  const s = await serve({ '/about': { body: 'ok' }, '/elsewhere.pdf': { body: '%PDF' } })
  try {
    const out = folder([['/about', 200]], { source: old.url, documents: [other.url + '/elsewhere.pdf'] })
    const { documents, notes } = await compare(out, { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser, get: localOld })
    assert.deepEqual(documents, [])
    assert.deepEqual([old.requests, other.requests, s.requests], [[], [], ['/about']])
    assert.deepEqual(notes, [NO_PLAYWRIGHT])
  } finally { await old.close(); await other.close(); await s.close() }
})

test('screenshots: the home page and the first page of each template, at most 12, desktop and mobile, old and new', async () => {
  const s = await serve({ '/': { body: 'home' } })
  const templates = [
    { id: 'h', count: 20, examples: [OLD + '/'] },
    { id: 'x', count: 19, examples: [OLD + '/a/<script>b', OLD + '/a/second'] },
    ...Array.from({ length: 13 }, (_, i) => ({ id: `t${i}`, count: 18 - i, examples: [`${OLD}/t${i}`, `${OLD}/t${i}-second`] })),
  ]
  const out = folder([['/', 200]], { templates })
  const fake = fakeBrowser({ failOn: s.url + '/t1' })
  try {
    const { shots, notes } = await compare(out, { newBase: s.url, allowPrivate: true, launchBrowser: fake.launchBrowser })
    const oldPages = [...new Set(fake.calls.shots.filter((c) => c.url.startsWith(OLD)).map((c) => c.url))]
    assert.deepEqual(oldPages, [OLD + '/', OLD + '/a/<script>b', ...Array.from({ length: 10 }, (_, i) => `${OLD}/t${i}`)])
    const newPages = [...new Set(fake.calls.shots.filter((c) => c.url.startsWith(s.url)).map((c) => c.url))]
    assert.equal(newPages[0], s.url + '/')
    assert.ok(newPages.every((u) => !u.includes('second')))
    assert.equal(fake.calls.shots.length, 12 * 2 * 2 - 2, 'one new page failed, on both viewports')
    for (const c of fake.calls.shots) {
      assert.equal(c.fullPage, true)
      assert.deepEqual(c.clip, { x: 0, y: 0, width: c.viewport.width, height: 4000 })
      assert.ok([[1280, 800], [390, 844]].some(([w, h]) => c.viewport.width === w && c.viewport.height === h))
    }
    assert.equal(shots.length, 24)
    assert.deepEqual(shots[0], { page: '/', viewport: 'desktop', old: 'shots/home-desktop-old.png', new: 'shots/home-desktop-new.png' })
    assert.deepEqual(shots[1], { page: '/', viewport: 'mobile', old: 'shots/home-mobile-old.png', new: 'shots/home-mobile-new.png' })
    for (const f of ['home-desktop-old.png', 'home-mobile-new.png', 't0-desktop-old.png', 't9-mobile-new.png']) assert.ok(fs.existsSync(path.join(out, 'shots', f)), f)
    for (const sh of shots) for (const f of [sh.old, sh.new].filter(Boolean)) assert.match(f, /^shots\/[a-z0-9-]{1,60}-(desktop|mobile)-(old|new)\.png$/)
    const failed = shots.find((sh) => sh.page === '/t1' && sh.viewport === 'desktop')
    assert.deepEqual([failed.old, failed.new], ['shots/t1-desktop-old.png', null])
    assert.ok(notes.some((n) => n.includes(s.url + '/t1') && n.includes('ERR_CONNECTION_REFUSED')), notes.join('\n'))
    assert.equal(fake.calls.closed, true)
    const html = fs.readFileSync(path.join(out, 'compare.html'), 'utf8')
    assert.ok(!html.includes('<script'), 'nothing from a page address becomes markup')
    assert.ok(html.includes('&lt;script&gt;'))
    assert.ok(html.includes('src="shots/home-desktop-old.png"') && html.includes('src="shots/home-desktop-new.png"'))
    assert.ok(html.indexOf('home-desktop-old.png') < html.indexOf('home-desktop-new.png'), 'old left, new right')
    assert.ok(!/(href|src)="https?:/.test(html), 'no external resources')
    const md = fs.readFileSync(path.join(out, 'compare.md'), 'utf8')
    assert.ok(md.includes('compare.html'))
  } finally { await s.close() }
})

test('screenshot file names: home for /, path segments joined, only [a-z0-9-], at most 60 characters, never two the same', async () => {
  const s = await serve({ '/': { body: 'home' } })
  const long = '/' + 'Ab_c/'.repeat(30)
  const templates = [{ id: 'a', examples: [OLD + '/Om-Oss/Ansatte/'] }, { id: 'b', examples: [OLD + long] }, { id: 'c', examples: [OLD + '/om/oss'] }, { id: 'd', examples: [OLD + '/om-oss'] }]
  const out = folder([['/', 200]], { templates })
  const fake = fakeBrowser()
  try {
    const { shots } = await compare(out, { newBase: s.url, allowPrivate: true, launchBrowser: fake.launchBrowser })
    const names = shots.filter((sh) => sh.viewport === 'desktop').map((sh) => sh.old.replace(/^shots\/|-desktop-old\.png$/g, ''))
    assert.equal(names[0], 'home')
    assert.equal(names[1], 'om-oss-ansatte')
    assert.ok(names[2].length <= 60 && /^[a-z0-9-]+$/.test(names[2]), names[2])
    assert.equal(names[3], 'om-oss')
    assert.notEqual(names[4], 'om-oss', 'a second page with the same name does not overwrite the first')
    assert.equal(new Set(names).size, names.length)
  } finally { await s.close() }
})

test('without extract.json only the home page is screenshotted, with a note', async () => {
  const s = await serve({ '/': { body: 'home' } })
  const fake = fakeBrowser()
  try {
    const { shots, notes } = await compare(folder([['/', 200]]), { newBase: s.url, allowPrivate: true, launchBrowser: fake.launchBrowser })
    assert.deepEqual(shots.map((sh) => [sh.page, sh.viewport]), [['/', 'desktop'], ['/', 'mobile']])
    assert.ok(notes.some((n) => n.includes('extract.json')), notes.join('\n'))
  } finally { await s.close() }
})

test('when the browser cannot start, screenshots are skipped with a note and the URL check is still done', async () => {
  const s = await serve({ '/about': { body: 'ok' } })
  try {
    const out = folder([['/about', 200]], { templates: [{ id: 'a', examples: [OLD + '/about'] }] })
    const { results, shots, notes } = await compare(out, { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser, get: localOld })
    assert.deepEqual(results.map((r) => r.ok), [true])
    assert.deepEqual(shots, [])
    assert.deepEqual(notes, [NO_PLAYWRIGHT])
    assert.equal(fs.existsSync(path.join(out, 'compare.html')), false)
    assert.ok(fs.readFileSync(path.join(out, 'compare.md'), 'utf8').includes(NO_PLAYWRIGHT))
  } finally { await s.close() }
})

// The command line runs the real default browser launcher; with no browsers where Playwright
// looks, it skips screenshots, so the test needs no Playwright browsers.
const run = promisify(execFile)
const BIN = fileURLToPath(new URL('../bin/site-builder.js', import.meta.url))
const env = { ...process.env, PLAYWRIGHT_BROWSERS_PATH: path.join(os.tmpdir(), 'site-builder-no-browsers') }

test('command line: usage errors exit 2, a failing address exits 1, all OK exits 0', async () => {
  const s = await serve({ '/': { body: 'home' }, '/about': { body: 'about' } })
  try {
    const ok = folder([['/', 200], ['/about', 200]])
    const bad = folder([['/', 200], ['/gone', 200]])
    for (const argv of [['compare', '--out', ok], ['compare', '--out', ok, '--new', 'ftp://x.example'], ['compare', '--out', ok, '--new', 'not a url'], ['compare', '--out', fs.mkdtempSync(path.join(os.tmpdir(), 'compare-empty-')), '--new', s.url]])
      await assert.rejects(run('node', [BIN, ...argv], { env }), (e) => e.code === 2, argv.join(' '))
    await assert.rejects(run('node', [BIN, 'compare', '--out', bad, '--new', s.url, '--allow-private'], { env }), (e) => e.code === 1 && e.stdout.includes('1 fail'))
    const { stdout } = await run('node', [BIN, 'compare', '--out', ok, '--new', s.url, '--allow-private'], { env })
    assert.ok(stdout.includes('2 OK, 0 fail'), stdout)
    assert.ok(stdout.includes(path.join(ok, 'compare.md')), stdout)
    const help = await run('node', [BIN, '--help']).catch((e) => e)
    assert.match(help.stdout, /compare {7}Check every old URL and document on the new site and take old\/new screenshots side by side/)
  } finally { await s.close() }
})

test('command line: with --allow-private, old documents on a private address are not fetched, only named in a note', async () => {
  const old = await serve({ '/a.pdf': { body: '%PDF' } })
  const s = await serve({ '/': { body: 'home' } })
  try {
    const out = folder([['/', 200]], { source: old.url, documents: [old.url + '/a.pdf'] })
    const { stdout } = await run('node', [BIN, 'compare', '--out', out, '--new', s.url, '--allow-private', '--budget', '1'], { env })
    assert.ok(stdout.includes('1 old addresses checked: 1 OK, 0 fail.'), stdout)
    assert.match(stdout, /note: 1 documents did not work on the old site either/)
    assert.deepEqual(old.requests, [], '--allow-private is for the new site only')
  } finally { await old.close(); await s.close() }
})


// --- Bjørn's review of #8: sandbox, where the browser may go, and a time limit ---------------

test('the browser starts with its sandbox; when it cannot, screenshots are skipped, never run without one', async () => {
  assert.equal(LAUNCH.chromiumSandbox, true)
  const s = await serve({ '/': { body: 'ok' } })
  try {
    const fake = fakeBrowser()
    await compare(folder([['/', 200]]), { newBase: s.url, allowPrivate: true, launchBrowser: fake.launchBrowser, get: localOld })
    assert.equal(fake.calls.launchOptions.chromiumSandbox, true)
    const noSandbox = async () => { throw new Error('Failed to launch: No usable sandbox!') }
    const { shots, notes } = await compare(folder([['/', 200]]), { newBase: s.url, allowPrivate: true, launchBrowser: noSandbox, get: localOld })
    assert.deepEqual(shots, [])
    assert.ok(notes.some((n) => /^Screenshots skipped: .*sandbox/.test(n)), notes.join('\n'))
  } finally { await s.close() }
})

test('allowRequest: public http(s) and the page\'s own data: are allowed; private, metadata and other schemes are not', async () => {
  const PRIVATE = new Set(['127.0.0.1', '169.254.169.254', '10.0.0.5', 'intranet.local'])
  const lookup = (host, _o, cb) => (PRIVATE.has(host) ? cb(Object.assign(new Error(`${host} private`), { code: 'EPRIVATE' })) : cb(null, '93.184.216.34', 4))
  const newOrigin = 'http://127.0.0.1:3000'
  const ask = (url, allowPrivate = false) => allowRequest(url, { newOrigin, allowPrivate, lookup })
  assert.equal(await ask('https://www.fjordlys.no/a.css'), true)
  assert.equal(await ask('data:image/png;base64,AAAA'), true)
  for (const bad of ['http://169.254.169.254/latest/meta-data/', 'http://127.0.0.1:3000/', 'http://10.0.0.5/', 'http://intranet.local/', 'file:///etc/passwd', 'ws://www.fjordlys.no/', 'ftp://x.no/', 'not a url'])
    assert.equal(await ask(bad), false, bad)
  assert.equal(await ask('http://127.0.0.1:3000/no', true), true, 'the --new address itself with --allow-private')
  assert.equal(await ask('http://169.254.169.254/', true), false, 'never another private address, also with --allow-private')
  assert.equal(await ask('http://127.0.0.1:9999/', true), false, 'another port is another origin')
})

test('every browser request goes through the address check; service workers, downloads and WebSockets are blocked', async () => {
  const s = await serve({ '/': { body: 'ok' } })
  try {
    const fake = fakeBrowser()
    await compare(folder([['/', 200]]), { newBase: s.url, allowPrivate: true, launchBrowser: fake.launchBrowser, get: localOld })
    assert.ok(fake.calls.contexts.length > 0)
    for (const c of fake.calls.contexts) assert.deepEqual([c.serviceWorkers, c.acceptDownloads], ['block', false])
    assert.equal(fake.calls.routes.length, fake.calls.contexts.length)
    assert.equal(fake.calls.webSockets, fake.calls.contexts.length)
    const { handler } = fake.calls.routes[0]
    const route = (url) => { const r = { aborted: false, continued: false, request: () => ({ url: () => url }), abort: async () => { r.aborted = true }, continue: async () => { r.continued = true } }; return r }
    const meta = route('http://169.254.169.254/latest/meta-data/')
    await handler(meta)
    assert.deepEqual([meta.aborted, meta.continued], [true, false])
    const own = route(s.url + '/style.css')
    await handler(own)
    assert.deepEqual([own.aborted, own.continued], [false, true], 'the --new address is allowed with --allow-private')
  } finally { await s.close() }
})

test('old-site documents are never fetched from a private address, even with --allow-private', async () => {
  const seen = []
  const spy = (u, o) => { seen.push([u, o.allowPrivate]); return localOld(u, o) }
  const old = await serve({ '/f.pdf': { body: '%PDF' } })
  const s = await serve({ '/about': { body: 'ok' }, '/f.pdf': { body: '%PDF' } })
  try {
    await compare(folder([['/about', 200]], { source: old.url, documents: [old.url + '/f.pdf'] }), { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser, get: spy })
    assert.deepEqual(seen.filter(([u]) => u.startsWith(old.url)).map(([, p]) => p), [false])
    assert.ok(seen.filter(([u]) => u.startsWith(s.url)).every(([, p]) => p === true), 'the new site with --allow-private')
  } finally { await old.close(); await s.close() }
})

test('screenshots stop at the time budget with a note, and each page gets a timeout within it', async () => {
  const s = await serve({ '/': { body: 'ok' } })
  try {
    const fake = fakeBrowser({ gotoMs: 40 })
    const templates = Array.from({ length: 6 }, (_, i) => ({ id: `t${i}`, examples: [`${OLD}/p${i}`] }))
    const { notes } = await compare(folder([['/', 200]], { templates }), { newBase: s.url, allowPrivate: true, launchBrowser: fake.launchBrowser, get: localOld, budgetMs: 150 })
    assert.ok(fake.calls.shots.length < 7 * 2 * 2, `took ${fake.calls.shots.length} screenshots`)
    assert.ok(notes.some((n) => /time budget/.test(n)), notes.join('\n'))
    assert.ok(fake.calls.timeouts.length > 0 && fake.calls.timeouts.every((ms) => ms > 0 && ms <= 30_000), String(fake.calls.timeouts))
  } finally { await s.close() }
})

// Bjørn's review of #8, round 2: the route check sees only the first address of a redirect, and the
// browser resolves names itself (DNS rebinding). Its only way out is the filtering proxy.
test('the browser is started with the filtering proxy for every request, loopback included, and the proxy is closed after', async () => {
  const s = await serve({ '/': { body: 'ok' } })
  try {
    const fake = fakeBrowser()
    await compare(folder([['/', 200]]), { newBase: s.url, allowPrivate: true, launchBrowser: fake.launchBrowser, get: localOld })
    const { proxy, chromiumSandbox } = fake.calls.launchOptions
    assert.equal(chromiumSandbox, true)
    assert.match(proxy.server, /^http:\/\/127\.0\.0\.1:\d+$/)
    assert.equal(proxy.bypass, '<-loopback>')
    await assert.rejects(fetch(proxy.server), 'the proxy is closed once the screenshots are done')
  } finally { await s.close() }
})

test('the address and document checks stop at the time budget too, with a note', async () => {
  const slow = (u, o) => new Promise((r) => setTimeout(r, 40)).then(() => localOld(u, o))
  const s = await serve(Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`/p${i}`, { body: 'ok' }])))
  try {
    const { results, notes } = await compare(folder(Array.from({ length: 40 }, (_, i) => [`/p${i}`, 200])), { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser, get: slow, budgetMs: 100 })
    assert.ok(results.length > 0 && results.length < 40, `checked ${results.length}`)
    assert.ok(notes.some((n) => /time budget/.test(n) && /of 40 old addresses/.test(n)), notes.join('\n'))
  } finally { await s.close() }
})
