import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { kitBlocks, makeRef, map, sectionSettings } from '../src/map.js'

const OLD = 'https://www.old.example'
const BLOCKS = { definitions: { HeroBlock: { properties: { blockType: { const: 'hero' }, section: {} } }, ContentBlock: { properties: { blockType: { const: 'content' }, background: {}, section: {} } } } }
const PLAN = { definitions: { text: { propertyNames: { enum: ['no', 'en'] } } }, properties: { articles: { items: { properties: { kind: { enum: ['news', 'blog'] } } } } } }

const page = (p, { lang, title, main, alternates = [], nav = [], footer, article, published, description }) => ({
  url: OLD + p, path: p, lang, title, h1: undefined, description, mainHtml: `<main>${main}</main>`, images: [], links: [], template: p.split('/')[1] || 'home',
  nav, footer: footer ?? { text: '', links: [] }, alternates: alternates.map((a) => ({ lang: a[0], href: OLD + a[1] })), ...(article ? { article } : {}), ...(published ? { published } : {}),
})
const NAV_NO = [{ label: 'Tjenester', href: OLD + '/tjenester' }, { label: 'Partner', href: 'https://partner.example' }]
const NAV_EN = [{ label: 'Services', href: OLD + '/en/services' }]
const FOOTER = { text: 'Acme AS | Bergen', links: [{ label: '55 12 34 56', href: 'tel:+4755123456' }, { label: 'post@acme.no', href: 'mailto:post@acme.no' }, { label: 'Personvern', href: OLD + '/personvern' }] }

function folder() {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'map-'))
  const pages = [
    page('/', { lang: 'no', title: 'Forside | Acme', main: '<section><h1>Velkommen</h1><p>Vi bygger.</p></section><section><h2>Om</h2><p>Tekst.</p></section>', nav: NAV_NO, footer: FOOTER, alternates: [['en', '/en']] }),
    page('/en', { lang: 'en', title: 'Home | Acme', main: '<section><h1>Welcome</h1><p>We build.</p></section><section><h2>About</h2><p>Text.</p></section>', nav: NAV_EN, alternates: [['nb', '/']] }),
    page('/tjenester', { lang: 'no', title: 'Tjenester | Acme', main: '<h2>Tjenester</h2><p>Mye.</p>', nav: NAV_NO, alternates: [['en', '/en/services']], description: 'Det vi gjør.' }),
    page('/en/services', { lang: 'en', title: 'Services | Acme', main: '<h2>Services</h2><p>Lots.</p>', nav: NAV_EN, alternates: [['nb', '/tjenester']] }),
    page('/tjenester/rad', { lang: 'no', title: 'Råd | Acme', main: '<h2>Råd</h2><p>Gode råd.</p>', nav: NAV_NO }),
    page('/personvern', { lang: 'no', title: 'Personvern | Acme', main: '<p>Om personvern.</p>', nav: NAV_NO }),
    page('/aktuelt/2024/ny-side', { lang: 'no', title: 'Ny side | Acme', main: '<article><header><p>Kort.</p></header><figure><img src="/n.jpg" alt="N"></figure><p>Hele saken.</p><aside><h2>Les også</h2></aside></article>', nav: NAV_NO, article: true, published: '2024-05-01', description: 'Kort.' }),
  ]
  fs.writeFileSync(path.join(out, 'extract.json'), JSON.stringify({ version: 1, source: OLD + '/', pages, templates: [], nav: NAV_NO, footer: FOOTER }))
  fs.writeFileSync(path.join(out, 'inventory.json'), JSON.stringify({ version: 1, source: OLD + '/', pages: [] }))
  return out
}

test('refs are slugs, unique, and Norwegian letters are spelled out', () => {
  const used = new Set()
  assert.equal(makeRef('Råd og tjenester', used), 'rad-og-tjenester')
  assert.equal(makeRef('Råd og tjenester', used), 'rad-og-tjenester-2')
  assert.equal(makeRef('Ærlig talt', used), 'aerlig-talt')
  assert.equal(makeRef('', used, 'page'), 'page')
})

test('the kit blocks and their fields come from blocks.schema.json', () => {
  const b = kitBlocks(BLOCKS)
  assert.deepEqual([...b.keys()], ['hero', 'content'])
  assert.ok(b.get('content').has('background'))
})

test('a measured section gets the nearest spacing step and a background', () => {
  const fields = new Set(['section', 'background'])
  assert.deepEqual(sectionSettings({ paddingTop: 62, paddingBottom: 0, background: 'rgb(20, 33, 61)' }, { m: '4rem', l: '6rem' }, fields), { section: { spaceTop: 'm', spaceBottom: 'none' }, background: 'dark' })
  assert.deepEqual(sectionSettings({ paddingTop: 100, paddingBottom: 90, background: 'rgba(0, 0, 0, 0)' }, { m: '4rem', l: '6rem' }, new Set(['section'])), { section: { spaceTop: 'l', spaceBottom: 'l' } })
})

test('map writes a plan: translations paired, the tree, articles, menus, footer and loop-free redirects', () => {
  const out = folder()
  const planFile = path.join(out, 'plan.json')
  const r = map(out, { planFile, blocksSchema: BLOCKS, planSchema: PLAN })
  const plan = JSON.parse(fs.readFileSync(planFile, 'utf8'))
  const byRef = Object.fromEntries(plan.pages.map((p) => [p.ref, p]))

  // Pages: the home pages and services pages are one page each in two languages (hreflang).
  assert.deepEqual(plan.pages.map((p) => p.ref).sort(), ['home', 'personvern', 'rad', 'tjenester'])
  assert.deepEqual(byRef.home.title, { no: 'Forside', en: 'Home' }) // the site name after « | » is dropped
  assert.equal(byRef.home.isHome, true)
  assert.deepEqual(byRef.tjenester.slug, { no: 'tjenester', en: 'services' })
  assert.deepEqual(byRef.tjenester.meta, { no: { description: 'Det vi gjør.' } })
  assert.equal(byRef.rad.parent, 'tjenester')
  assert.equal(byRef.home.layout.no[0].blockType, 'hero')

  // The article: date, lead from its header, the first image as hero, no side content.
  assert.equal(plan.articles.length, 1)
  const a = plan.articles[0]
  assert.equal(a.publishedAt, '2024-05-01')
  assert.deepEqual(a.lead, { no: 'Kort.' })
  assert.equal(plan.media.find((m) => m.ref === a.heroImage).source, OLD + '/n.jpg')
  assert.equal(a.contentHtml.no, '<p>Hele saken.</p>')

  // Menus per language (pages only), phone and e-mail as contact settings, the rest in the footer.
  assert.deepEqual(plan.settings.nav, { no: [{ label: 'Tjenester', page: 'tjenester' }], en: [{ label: 'Services', page: 'tjenester' }] })
  assert.equal(plan.settings.phone, '55 12 34 56')
  assert.equal(plan.settings.email, 'post@acme.no')
  assert.deepEqual(plan.settings.footer.no[0], { heading: 'Acme AS', links: [{ label: 'Personvern', page: 'personvern' }] })
  assert.ok(r.todo.some((t) => t.kind === 'nav' && /Partner/.test(t.detail)))

  // Redirects: the Norwegian pages move under /no; English ones are already where they will be.
  assert.deepEqual(plan.redirects.map((x) => x.from).sort(), ['/personvern', '/tjenester', '/tjenester/rad'])
  assert.ok(plan.redirects.every((x) => x.permanent))
  // The article's old address has a year in it, so it will not be where the kit puts articles: a redirect by hand.
  assert.ok(r.todo.some((t) => t.kind === 'redirect' && t.page === '/aktuelt/2024/ny-side'))

  for (const f of ['map.json', 'map.html']) assert.ok(fs.existsSync(path.join(out, f)), f)
})
