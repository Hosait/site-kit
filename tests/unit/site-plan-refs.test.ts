import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { findMissingRefs, localeData, orderPages, resolveValue } from '../../src/lib/site-plan/refs'

const plan = () => JSON.parse(readFileSync('tests/fixtures/plan-minimal.json', 'utf8'))

test('a complete plan has no missing refs', () => {
  assert.deepEqual(findMissingRefs(plan()), [])
})

test('every dangling ref is named, before anything is written', () => {
  const p = plan()
  p.pages[0].layout.no[0].media = { $media: 'nope' }
  p.pages.push({ ref: 'about', parent: 'ghost', title: { no: 'Om' }, layout: {} })
  p.settings.nav.en.push({ label: 'X', page: 'missing' })
  assert.deepEqual(findMissingRefs(p).sort(), ['media "nope"', 'page "ghost"', 'page "missing"'])
})

test('orderPages puts parents first and refuses cycles', () => {
  const pages = [
    { ref: 'c', parent: 'b', title: {}, layout: {} },
    { ref: 'a', title: {}, layout: {} },
    { ref: 'b', parent: 'a', title: {}, layout: {} },
  ] as never
  assert.deepEqual(orderPages(pages).map((p: any) => p.ref), ['a', 'b', 'c'])
  assert.throws(() => orderPages([{ ref: 'x', parent: 'y' }, { ref: 'y', parent: 'x' }] as never), /cycle/)
})

test('resolveValue swaps markers for ids, links and rich text', async () => {
  const ids = { media: new Map([['hero', 7]]), pages: new Map([['about', 3]]) }
  const out = await resolveValue(
    { image: { $media: 'hero' }, parent: { $page: 'about' }, link: { type: 'reference', reference: { $pageLink: 'about' } }, body: { $html: '<p>Hi</p>' } },
    ids,
    async (h) => ({ html: h }),
  )
  assert.deepEqual(out, { image: 7, parent: 3, link: { type: 'reference', reference: { relationTo: 'pages', value: 3 } }, body: { html: '<p>Hi</p>' } })
})

test('localeData picks one locale of localized fields and keeps plain ones', () => {
  const item = { ref: 'a', title: { no: 'Om', en: 'About' }, order: 2 }
  assert.deepEqual(localeData(item, 'en', ['title', 'order']), { title: 'About', order: 2 })
})

test('people and documents blocks point at records with $person and $document', async () => {
  const p = plan()
  p.people = [{ ref: 'kari', name: 'Kari' }]
  p.documents = [{ ref: 'guide', source: 'media/guide.pdf', title: { no: 'Guide' }, docType: 'manual' }]
  p.pages[0].layout.no.push({ blockType: 'people', people: [{ $person: 'kari' }, { $person: 'ola' }] })
  p.pages[0].layout.no.push({ blockType: 'documents', documents: [{ $document: 'guide' }, { $document: 'gone' }] })
  assert.deepEqual(findMissingRefs(p).sort(), ['document "gone"', 'person "ola"'])
  const ids = { media: new Map(), pages: new Map(), people: new Map([['kari', 4]]), documents: new Map([['guide', 9]]) }
  assert.deepEqual(await resolveValue([{ $person: 'kari' }, { $document: 'guide' }], ids, async () => null), [4, 9])
})

test('a form block points at a form with $form, checked and resolved like the other refs', async () => {
  const p = plan()
  p.forms = [{ ref: 'contact', title: { no: 'Kontakt' }, fields: [{ type: 'email', name: 'epost', label: { no: 'E-post' } }], confirmation: { no: 'Takk!' } }]
  p.pages[0].layout.no.push({ blockType: 'formBlock', form: { $form: 'contact' } }, { blockType: 'formBlock', form: { $form: 'ghost' } })
  assert.deepEqual(findMissingRefs(p), ['form "ghost"'])
  const ids = { media: new Map(), pages: new Map(), forms: new Map([['contact', 12]]) }
  assert.deepEqual(await resolveValue({ blockType: 'formBlock', form: { $form: 'contact' } }, ids, async () => null), { blockType: 'formBlock', form: 12 })
})
