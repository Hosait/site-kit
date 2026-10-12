import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { validateSitePlan } from '../../src/lib/site-plan/validate'

const minimal = () => JSON.parse(readFileSync('tests/fixtures/plan-minimal.json', 'utf8'))

test('the minimal plan is valid', () => {
  const r = validateSitePlan(minimal())
  assert.equal(r.ok, true, JSON.stringify(r))
})

test('an unknown block type is refused with its path', () => {
  const p = minimal()
  p.pages[0].layout.no[0].blockType = 'carousel3d'
  const r = validateSitePlan(p)
  assert.equal(r.ok, false)
  assert.ok(!r.ok && r.errors.some((e) => e.includes('/pages/0/layout/no/0')))
})

test('a locale the site does not have is refused', () => {
  const p = minimal()
  p.pages[0].title.de = 'Startseite'
  assert.equal(validateSitePlan(p).ok, false)
})

test('a missing version is refused', () => {
  const p = minimal()
  delete p.version
  assert.equal(validateSitePlan(p).ok, false)
})

// What the import would refuse (or silently get wrong) is refused here, before anything is written.
const doc = { ref: 'g', source: 'media/guide.pdf', title: { no: 'Veiledning' }, docType: 'manual', language: 'multi' }
test('documents and articles with the site\'s own types, kinds and languages are accepted', () => {
  const p = minimal()
  p.documents = [doc, { ...doc, ref: 'h', docType: 'other', language: 'en' }]
  p.articles = [{ ref: 'n', kind: 'blog', publishedAt: '2026-01-01', title: { no: 'Nytt' } }]
  const r = validateSitePlan(p)
  assert.equal(r.ok, true, JSON.stringify(r))
})

test('a plan the import cannot use is refused with its path', () => {
  const cases: [string, (p: ReturnType<typeof minimal>) => void, string][] = [
    ['duplicate page ref', (p) => p.pages.push({ ...structuredClone(p.pages[0]), isHome: false }), '/pages/1/ref'],
    ['duplicate media ref', (p) => p.media.push({ ...p.media[0] }), '/media/1/ref'],
    ['page parent cycle', (p) => {
      p.pages.push({ ref: 'a', parent: 'b', title: { no: 'A' }, layout: {} }, { ref: 'b', parent: 'a', title: { no: 'B' }, layout: {} })
    }, '/pages'],
    ['redirect with no target', (p) => (p.redirects = [{ from: '/old' }]), '/redirects/0'],
    ['page without a title in the default language', (p) => (p.pages[0].title = { en: 'Home' }), '/pages/0/title'],
    ['article without a title in the default language', (p) => (p.articles = [{ ref: 'n', kind: 'news', publishedAt: '2026-01-01', title: { en: 'News' } }]), '/articles/0/title'],
    ['document without a title in the default language', (p) => (p.documents = [{ ...doc, title: { en: 'Guide' } }]), '/documents/0/title'],
    ['document type that is not one of the site\'s', (p) => (p.documents = [{ ...doc, docType: 'leaflet' }]), '/documents/0/docType'],
    ['document language that is not one of the site\'s', (p) => (p.documents = [{ ...doc, language: 'xx' }]), '/documents/0/language'],
    ['article kind that is not one of the site\'s', (p) => (p.articles = [{ ref: 'n', kind: 'story', publishedAt: '2026-01-01', title: { no: 'Nytt' } }]), '/articles/0/kind'],
    ['the same old address redirected twice', (p) => (p.redirects = [{ from: '/a', toUrl: '/b' }, { from: '/a', toUrl: '/c' }]), '/redirects/1/from'],
  ]
  for (const [what, change, path] of cases) {
    const p = minimal()
    change(p)
    const r = validateSitePlan(p)
    assert.equal(r.ok, false, what)
    assert.ok(!r.ok && r.errors.some((e) => e.startsWith(path)), `${what}: ${JSON.stringify(r)}`)
  }
})

const withForm = () => {
  const p = minimal()
  p.forms = [
    {
      ref: 'contact',
      title: { no: 'Kontakt' },
      fields: [
        { type: 'text', name: 'navn', label: { no: 'Navn' }, required: true, width: 50 },
        { type: 'select', name: 'emne', label: { no: 'Emne' }, options: [{ value: 'pris', label: { no: 'Pris' } }] },
        { type: 'message', text: { no: 'Vi svarer snart.' } },
      ],
      submitLabel: { no: 'Send' },
      confirmation: { no: 'Takk!' },
      retention: 30,
    },
  ]
  p.pages[0].layout.no.push({ blockType: 'formBlock', form: { $form: 'contact' } })
  return p
}

test('a plan with a form is valid', () => {
  const r = validateSitePlan(withForm())
  assert.equal(r.ok, true, JSON.stringify(r))
  const keep = withForm()
  keep.forms[0].retention = 'keep'
  assert.equal(validateSitePlan(keep).ok, true)
  const dflt = withForm()
  delete dflt.forms[0].retention
  assert.equal(validateSitePlan(dflt).ok, true)
})

test('a broken form is refused with its path', () => {
  const cases: [string, (p: any) => void, string][] = [
    ['unknown field type', (p) => (p.forms[0].fields[0].type = 'radio'), '/forms/0/fields/0/type'],
    ['select without options', (p) => delete p.forms[0].fields[1].options, '/forms/0/fields/1'],
    ['field name with capitals', (p) => (p.forms[0].fields[0].name = 'Navn'), '/forms/0/fields/0/name'],
    ['field without a label', (p) => delete p.forms[0].fields[0].label, '/forms/0/fields/0'],
    ['info text without text', (p) => delete p.forms[0].fields[2].text, '/forms/0/fields/2'],
    ['width 40', (p) => (p.forms[0].fields[0].width = 40), '/forms/0/fields/0/width'],
    ['retention 0', (p) => (p.forms[0].retention = 0), '/forms/0/retention'],
    ['retention 3651', (p) => (p.forms[0].retention = 3651), '/forms/0/retention'],
    ['retention forever', (p) => (p.forms[0].retention = 'forever'), '/forms/0/retention'],
    ['no confirmation', (p) => delete p.forms[0].confirmation, '/forms/0'],
    ['duplicate field name', (p) => (p.forms[0].fields[1].name = 'navn'), '/forms/0/fields/1/name'],
    ['duplicate form ref', (p) => p.forms.push(structuredClone(p.forms[0])), '/forms/1/ref'],
  ]
  for (const [what, change, path] of cases) {
    const p = withForm()
    change(p)
    const r = validateSitePlan(p)
    assert.equal(r.ok, false, what)
    assert.ok(!r.ok && r.errors.some((e) => e.startsWith(path)), `${what}: ${JSON.stringify(r)}`)
  }
})
