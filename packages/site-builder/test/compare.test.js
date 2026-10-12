import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

import { compare } from '../src/compare.js'
import { serve } from './server.js'

const OLD = 'https://old.example'
const NO_PLAYWRIGHT = 'Screenshots skipped: Playwright is not available (pnpm exec playwright install chromium).'
const noBrowser = async () => { throw new Error('no browser in tests') }
const pathOf = (u) => new URL(u).pathname + new URL(u).search
const byPath = (results) => Object.fromEntries(results.map((r) => [pathOf(r.old), r]))

/** A crawl folder: urls.json (from [path, status] pairs, or as given), inventory.json and, with templates, extract.json. */
function folder(entries, { templates, urls } = {}) {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'compare-'))
  urls ??= { main: { en: entries.map(([p, status]) => ({ url: OLD + p, path: p.split('?')[0], status })) } }
  fs.writeFileSync(path.join(out, 'urls.json'), JSON.stringify(urls))
  fs.writeFileSync(path.join(out, 'inventory.json'), JSON.stringify({ version: 1, source: OLD + '/', pages: [] }))
  if (templates) fs.writeFileSync(path.join(out, 'extract.json'), JSON.stringify({ version: 1, source: OLD + '/', pages: [], templates }))
  return out
}

/** The part of Playwright's Browser that compare uses; records every screenshot. */
function fakeBrowser({ failOn } = {}) {
  const calls = { launched: false, closed: false, shots: [] }
  const browser = {
    async newPage({ viewport }) {
      let url
      return {
        async goto(u) { url = u; if (failOn && u.endsWith(failOn)) throw new Error('net::ERR_CONNECTION_REFUSED') },
        async screenshot(opts) { calls.shots.push({ url, viewport, ...opts }); fs.writeFileSync(opts.path, 'png') },
        async close() {},
      }
    },
    async close() { calls.closed = true },
  }
  return { calls, launchBrowser: async () => { calls.launched = true; return browser } }
}

test('a page that answers 200 on the new site is OK', async () => {
  const s = await serve({ '/about': { body: 'ok' } })
  try {
    const { results } = await compare(folder([['/about', 200]]), { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser })
    assert.equal(results.length, 1)
    const [r] = results
    assert.deepEqual([r.old, r.target, r.status, r.final, r.ok, r.note], [OLD + '/about', s.url + '/about', 200, undefined, true, undefined])
  } finally { await s.close() }
})

test('301 and 308 to a page that answers 200 are OK, with the final address', async () => {
  const s = await serve({ '/ok': { body: 'ok' }, '/moved': { status: 301, headers: { location: '/ok' } }, '/kept': { status: 308, headers: { location: '/ok' } } })
  try {
    const r = byPath((await compare(folder([['/moved', 200], ['/kept', 200]]), { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser })).results)
    for (const p of ['/moved', '/kept']) assert.deepEqual([r[p].ok, r[p].status, r[p].final], [true, 200, s.url + '/ok'], p)
  } finally { await s.close() }
})

test('a temporary redirect (302, 303, 307) fails even when it ends at a 200', async () => {
  const s = await serve({ '/ok': { body: 'ok' }, '/t302': { status: 302, headers: { location: '/ok' } }, '/t303': { status: 303, headers: { location: '/ok' } }, '/t307': { status: 307, headers: { location: '/ok' } } })
  try {
    const r = byPath((await compare(folder([['/t302', 200], ['/t303', 200], ['/t307', 200]]), { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser })).results)
    for (const code of [302, 303, 307]) assert.deepEqual([r[`/t${code}`].ok, r[`/t${code}`].status, r[`/t${code}`].note], [false, code, `temporary redirect (${code})`])
  } finally { await s.close() }
})

test('a page missing on the new site fails with its status', async () => {
  const s = await serve({ '/broken': { status: 500, body: 'oops' } })
  try {
    const r = byPath((await compare(folder([['/gone', 200], ['/broken', 200]]), { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser })).results)
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
    const r = byPath((await compare(folder([['/loop', 200], ['/r1', 200], ['/s1', 200]]), { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser })).results)
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
    const r = byPath((await compare(folder([['/away', 200], ['/abroad', 200]]), { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser })).results)
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
    const { results } = await compare(folder(null, { urls }), { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser })
    assert.deepEqual(results.map((r) => pathOf(r.old)), ['/a?x=1', '/a?x=2', '/b', '/c'])
    assert.deepEqual(results.map((r) => r.target), ['/a?x=1', '/a?x=2', '/b', '/c'].map((p) => s.url + p))
    assert.deepEqual([...s.requests].sort(), ['/a?x=1', '/a?x=2', '/b', '/c'])
  } finally { await s.close() }
})

test('compare.md and compare.json give the counts and one line per failure', async () => {
  const s = await serve({ '/ok': { body: 'ok' }, '/temp': { status: 302, headers: { location: '/ok' } } })
  try {
    const out = folder([['/ok', 200], ['/gone', 200], ['/temp', 200]])
    await compare(out, { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser })
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
    const { results, shots, notes } = await compare(out, { newBase: s.url, allowPrivate: true, launchBrowser: noBrowser })
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
    assert.match(help.stdout, /compare {7}Check every old URL on the new site and take old\/new screenshots side by side/)
  } finally { await s.close() }
})
