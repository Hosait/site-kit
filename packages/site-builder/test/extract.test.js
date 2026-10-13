import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { extract, extractPage } from '../src/extract.js'

const shell = (main, title = 'Page') => `<!doctype html><html lang="en"><head><title>${title}</title>
  <meta name="description" content="About ${title}"><meta property="og:image" content="/og.jpg"></head>
  <body><header class="site-header"><nav><a href="/">Home</a><a href="/about">About</a></nav></header>
  ${main}
  <footer class="site-footer"><p>© Acme AS · Org 123</p><a href="/privacy">Privacy</a></footer></body></html>`

test('main content comes from <main>, without scripts, nav or event handlers', () => {
  const p = extractPage(shell('<main><h1>About</h1><p onclick="x()">We make things that last for many years in Norway and beyond.</p><script>evil()</script><nav>skip</nav></main>', 'About'), 'https://acme.no/about')
  assert.equal(p.h1, 'About')
  assert.match(p.mainHtml, /We make things/)
  assert.doesNotMatch(p.mainHtml, /evil|onclick|skip/)
  assert.equal(p.description, 'About About')
  assert.equal(p.ogImage, 'https://acme.no/og.jpg')
  assert.deepEqual(p.nav.map((n) => n.label), ['Home', 'About'])
  assert.match(p.footer.text, /Acme AS/)
})

test('without main or article, the largest block of paragraph text is the content, never the footer', () => {
  const body = `<div class="wrap"><div class="side"><p>Short.</p></div>
    <div class="content"><p>${'Long story. '.repeat(40)}</p><p>${'More text. '.repeat(30)}</p></div></div>`
  const p = extractPage(shell(body), 'https://acme.no/x')
  assert.match(p.mainHtml, /Long story/)
  assert.doesNotMatch(p.mainHtml, /Acme AS/)
  assert.doesNotMatch(p.mainHtml, /Short\./)
})

test('images use the largest srcset candidate, as absolute URLs, with alt text', () => {
  const p = extractPage(shell('<main><p>x</p><img src="/a-400.jpg" srcset="/a-400.jpg 400w, /a-1600.jpg 1600w, /a-800.jpg 800w" alt="A"></main>'), 'https://acme.no/')
  assert.deepEqual(p.images, [{ src: 'https://acme.no/a-1600.jpg', alt: 'A' }])
})

test('pages with the same structure share a template; a different layout gets another', () => {
  const article = (t) => shell(`<main class="article"><h1>${t}</h1><div class="lead"><p>Lead</p></div><div class="body"><p>Text</p></div></main>`, t)
  const a = extractPage(article('One'), 'https://acme.no/news/1')
  const b = extractPage(article('Two'), 'https://acme.no/news/2')
  const home = extractPage(shell('<main class="home"><section class="hero"><h1>Hi</h1></section><section class="cards"></section></main>'), 'https://acme.no/')
  assert.equal(a.template, b.template)
  assert.notEqual(a.template, home.template)
})

test('extract(dir) reads the crawl, groups templates and picks the most common nav and footer', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'extract-'))
  fs.mkdirSync(path.join(dir, 'raw'))
  const pages = []
  for (const [i, url] of ['https://acme.no/news/1', 'https://acme.no/news/2', 'https://acme.no/'].entries()) {
    const html = i < 2 ? shell(`<main class="article"><h1>N${i}</h1><p>Text ${i}</p></main>`) : shell('<main class="home"><section class="hero"><h1>Hi</h1></section></main>')
    fs.writeFileSync(path.join(dir, 'raw', `${i}.html`), html)
    pages.push({ url, status: 200, file: `raw/${i}.html` })
  }
  pages.push({ url: 'https://acme.no/old', status: 301, location: 'https://acme.no/' })
  fs.writeFileSync(path.join(dir, 'inventory.json'), JSON.stringify({ version: 1, source: 'https://acme.no/', pages }))
  const model = extract(dir)
  assert.equal(model.pages.length, 3)
  assert.deepEqual(model.templates.map((t) => t.count), [2, 1])
  assert.deepEqual(model.nav.map((n) => n.href), ['https://acme.no/', 'https://acme.no/about'])
  assert.ok(fs.existsSync(path.join(dir, 'extract.json')))
})

// --- Review fixes ---------------------------------------------------------
test('article headers and embedded videos inside main stay in the content', () => {
  const p = extractPage(shell('<main><article><header><h1>Story</h1><p class="lead">The lead text.</p><time>1 Oct</time></header><p>Body.</p><iframe src="https://www.youtube.com/embed/abc"></iframe></article></main>'), 'https://acme.no/a')
  assert.match(p.mainHtml, /The lead text\./)
  assert.match(p.mainHtml, /youtube\.com\/embed\/abc/)
})

test('the template fingerprint looks past single wrapper elements, and ignores how many paragraphs a page has', () => {
  const wrapped = (inner) => shell(`<main><div class="pb-16">${inner}</div></main>`)
  const home = extractPage(wrapped('<section class="hero"></section><section class="cards"></section><section class="news"></section>'), 'https://acme.no/')
  const video = extractPage(wrapped('<section class="bg-off-white"></section><section class="py-16"></section>'), 'https://acme.no/videos/a')
  assert.notEqual(home.template, video.template)
  const a = extractPage(wrapped('<h1>A</h1><p>1</p><p>2</p>'), 'https://acme.no/news/a')
  const b = extractPage(wrapped('<h1>B</h1><p>1</p><p>2</p><p>3</p><p>4</p>'), 'https://acme.no/news/b')
  assert.equal(a.template, b.template)
})

// --- Hardening ------------------------------------------------------------
const deep = (levels) => shell('<main>' + '<div>'.repeat(levels) + '<p>Deep</p>' + '</div>'.repeat(levels) + '</main>', 'Deep')

test('a page nested far too deep fails alone, quickly, and the other pages are extracted', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'extract-'))
  fs.mkdirSync(path.join(dir, 'raw'))
  fs.writeFileSync(path.join(dir, 'raw', 'deep.html'), deep(50_000))
  fs.writeFileSync(path.join(dir, 'raw', 'ok.html'), shell('<main><h1>Fine</h1><p>Text</p></main>'))
  const pages = [{ url: 'https://acme.no/deep', status: 200, file: 'raw/deep.html' }, { url: 'https://acme.no/ok', status: 200, file: 'raw/ok.html' }]
  fs.writeFileSync(path.join(dir, 'inventory.json'), JSON.stringify({ version: 1, source: 'https://acme.no/', pages }))
  const t = Date.now()
  const model = extract(dir)
  assert.ok(Date.now() - t < 1000, `took ${Date.now() - t} ms`)
  assert.deepEqual(model.pages.map((p) => p.url), ['https://acme.no/ok'])
  assert.equal(model.errors.length, 1)
  assert.equal(model.errors[0].url, 'https://acme.no/deep')
  assert.match(model.errors[0].error, /nested/)
})

test('without a landmark, deep but allowed nesting is searched for the content in one pass', () => {
  const chain = (i) => '<div>'.repeat(250) + `<p>Chain ${i} ${'text '.repeat(i + 1)}</p>` + '</div>'.repeat(250)
  const t = Date.now()
  const p = extractPage(shell(Array.from({ length: 32 }, (_, i) => chain(i)).join('')), 'https://acme.no/x')
  assert.ok(Date.now() - t < 1000, `took ${Date.now() - t} ms`)
  assert.match(p.mainHtml, /Chain 31/)
})

test('a page without a body tag still gives its content', () => {
  const p = extractPage('<!doctype html><title>Bare</title><div class="content"><p>Only a paragraph here.</p></div>', 'https://acme.no/bare')
  assert.equal(p.title, 'Bare')
  assert.match(p.mainHtml, /Only a paragraph here\./)
})

test('a page with very many links, headings and images is read in linear time', () => {
  const group = (i) => `<div>${`<h2>H${i}</h2><a href="/a${i}">A${i}</a><img src="/i${i}.jpg" alt="">`.repeat(100)}</div>`
  const t = Date.now()
  const p = extractPage(shell(`<main>${Array.from({ length: 300 }, (_, i) => group(i)).join('')}</main>`), 'https://acme.no/many')
  assert.ok(Date.now() - t < 1500, `took ${Date.now() - t} ms`)
  assert.equal(p.headings.length, 30_000)
  assert.equal(p.images.length, 30_000)
})

test('lang must look like a language tag, and titles are cut at 300 characters', () => {
  const page = (lang, title) => `<!doctype html><html lang="${lang}"><head><title>${title}</title></head><body><main><p>x</p></main></body></html>`
  assert.equal(extractPage(page('NB-no', 'Hjem'), 'https://acme.no/').lang, 'nb-no')
  assert.equal(extractPage(page('read this first', 'x'), 'https://acme.no/').lang, undefined)
  assert.equal(extractPage(page('en', 'T'.repeat(1000)), 'https://acme.no/').title.length, 300)
})
