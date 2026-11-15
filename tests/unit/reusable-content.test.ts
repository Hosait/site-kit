/* eslint-disable @typescript-eslint/no-explicit-any -- the tests pass fake hook arguments */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { pageBlocks } from '../../src/blocks/configs'
import { pageLayoutBlocks, reusableBlocks } from '../../src/blocks/layouts'
import { GlobalSections } from '../../src/collections/GlobalSections'
import { PageTemplates } from '../../src/collections/PageTemplates'
import { Pages } from '../../src/collections/Pages'
import { SectionPresets } from '../../src/collections/SectionPresets'
import { expandPresets, startFromTemplate, withFreshIds } from '../../src/hooks/reusableContent'
import { tagsFor } from '../../src/lib/revalidate'

const slugs = (blocks: { slug: string }[]) => blocks.map((b) => b.slug)
const flat = (fields: any[]): any[] => fields.flatMap((f) => (f.tabs ? f.tabs.flatMap((t: any) => flat(t.fields)) : [f]))
const layoutOf = (c: { fields: any[] }) => flat(c.fields).find((f) => f.name === 'layout')
const hero = () => ({ id: 'b1', blockType: 'hero', heading: 'Hei', links: [{ id: 'r1', label: 'Mer' }], media: 4, body: { root: { type: 'root', children: [{ id: 'n1', type: 'paragraph' }] } } })

function fakeReq(docs: Record<string, any>, locale: string | undefined = 'no') {
  const calls: any[] = []
  return {
    calls,
    locale,
    payload: {
      findByID: async (args: any) => {
        calls.push(args)
        const doc = docs[`${args.collection}:${args.id}`]
        if (!doc) throw new Error('Not found')
        return doc
      },
    },
  } as any
}

test('a global section cannot hold a global section, so references never nest', () => {
  assert.ok(slugs(pageBlocks).includes('globalSection'))
  assert.ok(!slugs(reusableBlocks).includes('globalSection'))
  assert.equal(reusableBlocks.length, pageBlocks.length - 1)
  assert.deepEqual(slugs(layoutOf(GlobalSections).blocks), slugs(reusableBlocks))
  assert.ok(slugs(layoutOf(PageTemplates).blocks).includes('globalSection'), 'a template may use a global section')
})

/** Every block slug reachable from these blocks, through arrays, groups, rows and nested blocks fields. */
const reachable = (blocks: any[]): string[] => {
  const walk = (fields: any[]): string[] =>
    fields.flatMap((f) => [...(f.blocks ? reachable(f.blocks) : []), ...(f.fields ? walk(f.fields) : []), ...(f.tabs ? f.tabs.flatMap((t: any) => walk(t.fields)) : [])])
  return blocks.flatMap((b) => [b.slug, ...walk(b.fields)])
}

test('no block a global section can hold reaches a global section, not even through columns', () => {
  assert.ok(reachable(pageBlocks).includes('globalSection'))
  assert.ok(reachable(pageBlocks).includes('columns'), 'columns exist, so the check below sees them')
  assert.ok(!reachable(reusableBlocks).includes('globalSection'))
  assert.ok(!reachable(layoutOf(GlobalSections).blocks).includes('globalSection'))
})

test('pages can insert a saved section; saved sections and templates cannot nest the pointer', () => {
  assert.ok(slugs(pageLayoutBlocks).includes('preset'))
  assert.ok(slugs(layoutOf(Pages).blocks).includes('preset'))
  assert.ok(!slugs(pageBlocks).includes('preset'), 'plans never use it')
  assert.ok(!slugs(layoutOf(PageTemplates).blocks).includes('preset'))
  const block = SectionPresets.fields.find((f: any) => f.name === 'block') as any
  assert.ok(!slugs(block.blocks).includes('preset'))
  assert.equal(block.minRows, 1)
  assert.equal(block.maxRows, 1)
})

test('global sections are site-scoped like pages', () => {
  assert.equal(GlobalSections.access?.create, Pages.access?.create)
  assert.equal(GlobalSections.access?.update, Pages.access?.update)
  assert.equal(GlobalSections.access?.delete, Pages.access?.delete)
  assert.equal(GlobalSections.access?.read, Pages.access?.read)
  for (const c of [GlobalSections, PageTemplates, SectionPresets]) assert.ok(c.fields.some((f: any) => f.name === 'site'), c.slug)
  assert.ok(GlobalSections.versions && typeof GlobalSections.versions === 'object' && GlobalSections.versions.drafts)
})

test('publishing a global section expires the tags every page showing it carries', () => {
  assert.deepEqual(tagsFor('globalSections', 'no'), ['globalSections', 'globalSections:no', 'site:no'])
  assert.deepEqual(tagsFor('globalSections'), ['globalSections'])
  assert.ok(GlobalSections.hooks?.afterChange?.length)
  assert.ok(GlobalSections.hooks?.afterDelete?.length)
})

test('the template field is on pages and shown only while the page has no sections', () => {
  const field = flat(Pages.fields).find((f: any) => f.name === 'template') as any
  assert.equal(field.relationTo, 'pageTemplates')
  assert.equal(field.label, 'Start fra sidemal')
  assert.equal(field.admin.condition({}), true)
  assert.equal(field.admin.condition({ layout: [] }), true)
  assert.equal(field.admin.condition({ layout: [{ blockType: 'hero' }] }), false)
})

test('a copy has new ids on blocks and rows, and leaves rich text and relations alone', () => {
  const source = hero()
  const copy = withFreshIds(source) as any
  assert.notEqual(copy.id, 'b1')
  assert.match(copy.id, /^[0-9a-f]{24}$/)
  assert.notEqual(copy.links[0].id, 'r1')
  assert.equal(copy.links[0].label, 'Mer')
  assert.equal(copy.media, 4)
  assert.deepEqual(copy.body, source.body)
  assert.notEqual(copy.body, source.body, 'rich text is copied, not shared')
  assert.deepEqual(source, hero(), 'the source is not changed')
})

test('a new page gets a copy of the template, in the language it is created in', async () => {
  const req = fakeReq({ 'pageTemplates:7': { id: 7, site: 'main', layout: [hero()] } }, 'en')
  const data: any = { site: 'main', template: 7 }
  const out: any = await startFromTemplate({ data, operation: 'create', req } as any)
  assert.equal(out.layout.length, 1)
  assert.equal(out.layout[0].heading, 'Hei')
  assert.notEqual(out.layout[0].id, 'b1')
  assert.equal(req.calls[0].locale, 'en')
  assert.equal(req.calls[0].collection, 'pageTemplates')
  assert.equal(req.calls[0].overrideAccess, false)
})

// Payload's admin saves a blank draft when «create» opens, so the editor's choice is an update.
test('a template chosen on the blank draft the admin saved first is applied', async () => {
  const docs = { 'pageTemplates:7': { id: 7, site: 'main', layout: [hero()] } }
  const blank = { id: 13, site: 'main', layout: [] }
  const out: any = await startFromTemplate({ data: { site: 'main', template: 7, layout: [] }, originalDoc: blank, operation: 'update', req: fakeReq(docs) } as any)
  assert.equal(out.layout.length, 1)
  const partial: any = await startFromTemplate({ data: { template: 7 }, originalDoc: blank, operation: 'update', req: fakeReq(docs) } as any)
  assert.equal(partial.layout.length, 1, 'a partial update has no layout in the data; the saved one is empty')
})

test('a template never overwrites sections, and the same template saved again does nothing', async () => {
  const docs = { 'pageTemplates:7': { id: 7, site: 'main', layout: [hero()] } }
  const own = [{ id: 'mine', blockType: 'content' }]
  const kept: any = await startFromTemplate({ data: { template: 7, layout: own }, operation: 'create', req: fakeReq(docs) } as any)
  assert.deepEqual(kept.layout, own)
  const req = fakeReq(docs)
  const saved = await startFromTemplate({ data: { template: 7 }, originalDoc: { template: 7, layout: own }, operation: 'update', req } as any)
  assert.equal((saved as any).layout, undefined, 'partial update of a page that has sections')
  const again: any = await startFromTemplate({ data: { template: 7, layout: [] }, originalDoc: { template: 7, layout: [] }, operation: 'update', req } as any)
  assert.deepEqual(again.layout, [], 'the template was already chosen; clearing sections is not undone')
  const none: any = await startFromTemplate({ data: { site: 'main' }, operation: 'create', req } as any)
  assert.equal(none.layout, undefined)
  assert.equal(req.calls.length, 0, 'no new template, no lookup')
  const empty: any = await startFromTemplate({ data: { template: { id: 7 }, layout: [] }, operation: 'create', req: fakeReq(docs) } as any)
  assert.equal(empty.layout.length, 1, 'an empty list counts as empty; a populated relation is read by its id')
})

test('a template of another site is refused', async () => {
  const req = fakeReq({ 'pageTemplates:7': { id: 7, site: 'other', layout: [hero()] } })
  await assert.rejects(startFromTemplate({ data: { site: 'main', template: 7 }, operation: 'create', req } as any), /annet nettsted/)
  await assert.rejects(startFromTemplate({ data: { template: 7 }, originalDoc: { site: 'main', layout: [] }, operation: 'update', req } as any), /annet nettsted/)
})

test('a saved section replaces the pointer at its place, as a copy', async () => {
  const req = fakeReq({ 'sectionPresets:3': { id: 3, site: 'main', name: 'Kontakt', block: [hero()] } })
  const before = { id: 'a', blockType: 'content' }
  const after = { id: 'z', blockType: 'cta' }
  const data: any = { site: 'main', layout: [before, { id: 'p', blockType: 'preset', preset: 3 }, after] }
  const out: any = await expandPresets({ data, req } as any)
  assert.deepEqual(out.layout.map((b: any) => b.blockType), ['content', 'hero', 'cta'])
  assert.equal(out.layout[0], before)
  assert.notEqual(out.layout[1].id, 'b1')
  assert.notEqual(out.layout[1].id, 'p')
  assert.equal(req.calls[0].locale, 'no')
})

test('layouts without a pointer are not looked up, and an unchosen pointer stays', async () => {
  const req = fakeReq({})
  const plain: any = { layout: [{ id: 'a', blockType: 'content' }] }
  assert.equal(await expandPresets({ data: plain, req } as any), plain)
  assert.deepEqual(await expandPresets({ data: {}, req } as any), {})
  const unchosen: any = await expandPresets({ data: { layout: [{ id: 'p', blockType: 'preset' }] }, req } as any)
  assert.deepEqual(unchosen.layout, [{ id: 'p', blockType: 'preset' }])
  assert.equal(req.calls.length, 0)
})

test('a saved section of another site, or without content in this language, is refused', async () => {
  const layout = [{ id: 'p', blockType: 'preset', preset: 3 }]
  const other = fakeReq({ 'sectionPresets:3': { id: 3, site: 'other', name: 'X', block: [hero()] } })
  await assert.rejects(expandPresets({ data: { site: 'main', layout }, req: other } as any), /annet nettsted/)
  const empty = fakeReq({ 'sectionPresets:3': { id: 3, site: 'main', name: 'Kontakt', block: [] } })
  await assert.rejects(expandPresets({ data: { site: 'main', layout }, req: empty } as any), /«Kontakt» har ikke innhold/)
})
