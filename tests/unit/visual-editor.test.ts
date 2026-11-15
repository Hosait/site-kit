import assert from 'node:assert/strict'
import { test } from 'node:test'

import type { Block } from 'payload'

import { pageBlocks } from '../../src/blocks/configs'
import { link } from '../../src/fields/link'
import { applyText, historyOf, imageLeaves, mediaUrls, moveItem, pushHistory, redo, textLeaves, undo } from '../../src/lib/visual-editor/leaves'
import { newBlock, richText, withNewIds } from '../../src/lib/visual-editor/presets'
import { buildEditorConfig, defaultsFor, normalizeLayout, setAt, type EdField } from '../../src/lib/visual-editor/schema'

const Leaf: Block = {
  slug: 'leafText',
  labels: { singular: 'Tekstbit', plural: 'Tekstbiter' },
  fields: [{ name: 'heading', type: 'text', label: 'Overskrift' }],
}

/** Every field type the editor maps, plus a nested-blocks field like the columns block. */
const Sample: Block = {
  slug: 'sample',
  labels: { singular: 'Prøve', plural: 'Prøver' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'variant', type: 'select', label: 'Variant', defaultValue: 'a', options: [{ label: 'A', value: 'a' }, 'b'] },
        { name: 'background', type: 'select', label: 'Bakgrunn', options: ['none', 'muted'] },
      ],
    },
    { name: 'heading', type: 'text', label: 'Overskrift', defaultValue: 'Hei' },
    { name: 'text', type: 'textarea', label: 'Ingress' },
    { name: 'count', type: 'number', label: 'Antall', min: 1, max: 9, defaultValue: 3 },
    { name: 'flag', type: 'checkbox', label: 'Flagg' },
    { name: 'tags', type: 'select', hasMany: true, label: 'Tagger', options: ['x', 'y'] },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Bilde' },
    { name: 'people', type: 'relationship', relationTo: 'people', hasMany: true, label: 'Personer' },
    { name: 'body', type: 'richText', label: 'Tekst' },
    { name: 'items', type: 'array', label: 'Punkter', maxRows: 4, fields: [{ name: 'title', type: 'text', label: 'Tittel' }, { name: 'image', type: 'upload', relationTo: 'media' }] },
    link({ name: 'link', required: false }),
    { name: 'secret', type: 'text', admin: { hidden: true } },
    { name: 'note', type: 'ui', admin: { components: { Field: '/x#y' } } },
    { name: 'columns', type: 'blocks', label: 'Kolonner', blocks: [Leaf] },
    { name: 'section', type: 'group', label: 'Seksjonsoppsett', fields: [{ name: 'spaceTop', type: 'select', defaultValue: 'auto', options: ['auto', 's'] }, { name: 'backgroundMedia', type: 'upload', relationTo: 'media' }] },
  ],
}

const cfg = buildEditorConfig([Sample])
const def = cfg.blocks.sample
const field = (name: string) => def.fields.find((f) => f.name === name) as EdField

test('config generation maps every Payload field type the simple editor edits', () => {
  assert.deepEqual(
    def.fields.map((f) => `${f.name}:${f.kind}`),
    [
      'variant:select', 'background:select', 'heading:text', 'text:text', 'count:number', 'flag:checkbox', 'tags:select',
      'image:upload', 'people:relationship', 'body:richText', 'items:array', 'link:group', 'columns:blocks', 'section:group',
    ],
  )
  assert.equal(def.label, 'Prøve')
  assert.deepEqual(field('variant'), { name: 'variant', label: 'Variant', kind: 'select', many: false, defaultValue: 'a', options: [{ label: 'A', value: 'a' }, { label: 'b', value: 'b' }] })
  assert.equal((field('text') as { multiline: boolean }).multiline, true)
  assert.equal((field('heading') as { multiline: boolean }).multiline, false)
  assert.equal((field('tags') as { many: boolean }).many, true)
  assert.deepEqual(field('count'), { name: 'count', label: 'Antall', kind: 'number', min: 1, max: 9, defaultValue: 3 })
  assert.deepEqual(field('people'), { name: 'people', label: 'Personer', kind: 'relationship', relationTo: 'people', many: true })
  assert.equal((field('items') as { maxRows: number }).maxRows, 4)
  // The link group: its radio becomes a select, the polymorphic reference keeps both collections.
  const linkFields = (field('link') as { fields: EdField[] }).fields
  assert.deepEqual(linkFields.map((f) => `${f.name}:${f.kind}`), ['type:select', 'newTab:checkbox', 'reference:relationship', 'url:text', 'label:text', 'appearance:select'])
  assert.deepEqual((linkFields[2] as { relationTo: string[] }).relationTo, ['pages', 'articles'])
})

test('nested blocks are registered, and layout hints come from the field names', () => {
  assert.deepEqual(field('columns'), { name: 'columns', label: 'Kolonner', kind: 'blocks', blocks: ['leafText'] })
  assert.equal(cfg.blocks.leafText.label, 'Tekstbit')
  assert.deepEqual(cfg.library, ['sample'])
  assert.deepEqual(def.variants, ['variant'])
  assert.equal(def.background, true)
  assert.equal(def.section, true)
  assert.deepEqual(defaultsFor(def.fields), { variant: 'a', heading: 'Hei', count: 3, link: { type: 'reference', appearance: 'primary' }, section: { spaceTop: 'auto' } })
})

test('the real page blocks all map, and every one has the section group and a library entry', () => {
  const real = buildEditorConfig(pageBlocks)
  assert.equal(real.library.length, pageBlocks.length)
  for (const slug of real.library) assert.equal(real.blocks[slug].section, true, slug)
  assert.deepEqual(real.blocks.hero.variants, ['variant'])
  assert.deepEqual(real.blocks.textImage.variants, ['imagePosition', 'layout'])
  assert.equal(real.blocks.cards.background, true)
  // JSON-safe: the config crosses from the server view to the client editor.
  assert.deepEqual(JSON.parse(JSON.stringify(real)), real)
  for (const slug of real.library) assert.equal(newBlock(slug, real).blockType, slug)
})

const media = (id: number, name: string) => ({ id, url: `/api/media/file/${name}.jpg`, sizes: { md: { url: `/api/media/file/${name}-md.webp` } } })

test('text leaves cover plain fields, rich-text runs, arrays, groups and nested blocks', () => {
  const block = {
    blockType: 'sample',
    heading: 'Velkommen',
    text: '  ',
    body: { root: { children: [
      { type: 'paragraph', children: [{ type: 'text', text: 'Første ', format: 1 }, { type: 'text', text: 'avsnitt', format: 1 }] },
      { type: 'paragraph', children: [{ type: 'text', text: 'Les ' }, { type: 'link', children: [{ type: 'text', text: 'mer' }] }] },
      // Mixed formats are left to the form, so bold or italic is never lost by editing on the page.
      { type: 'paragraph', children: [{ type: 'text', text: 'Delvis ' }, { type: 'text', text: 'fet', format: 1 }] },
    ] } },
    items: [{ title: 'Punkt 1' }],
    link: { label: 'Kontakt oss' },
    columns: [{ blockType: 'leafText', heading: 'Inni' }],
  }
  const leaves = textLeaves(block, def.fields, cfg)
  assert.deepEqual(
    leaves.map((l) => [l.path.join('.'), l.value, l.rich]),
    [
      ['heading', 'Velkommen', false],
      ['body.root.children.0', 'Første avsnitt', true],
      ['body.root.children.1.children.1', 'mer', true],
      ['items.0.title', 'Punkt 1', false],
      ['link.label', 'Kontakt oss', false],
      ['columns.0.heading', 'Inni', false],
    ],
  )
  const edited = applyText(block, leaves[1], 'Nytt avsnitt')
  assert.deepEqual(edited.body.root.children[0].children, [{ type: 'text', text: 'Nytt avsnitt', format: 1 }])
  assert.equal(block.body.root.children[0].children.length, 2, 'the original is not changed')
  assert.equal(applyText(block, leaves[5], 'Ute').columns[0].heading, 'Ute')
})

test('image leaves list every media upload, populated or empty, with readable labels', () => {
  const block = { image: media(1, 'a'), items: [{ title: 'x', image: media(2, 'b') }], section: { backgroundMedia: null } }
  assert.deepEqual(
    imageLeaves(block, def.fields, cfg).map((l) => [l.path.join('.'), l.label, (l.media as { id?: number } | null)?.id ?? null]),
    [['image', 'Bilde', 1], ['items.0.image', 'Punkter 1 – image', 2], ['section.backgroundMedia', 'Seksjonsoppsett – backgroundMedia', null]],
  )
  assert.deepEqual(mediaUrls(media(1, 'æ b')), ['/api/media/file/æ b.jpg', '/api/media/file/æ b-md.webp'])
})

test('saving turns populated uploads and relations back into ids, also in rows and nested blocks', () => {
  const layout = [
    {
      blockType: 'sample',
      image: media(5, 'a'),
      people: [{ id: 7, name: 'Kari' }, 8],
      link: { reference: { relationTo: 'pages', value: { id: 3, title: 'Om' } } },
      items: [{ image: media(6, 'b') }],
      section: { backgroundMedia: media(9, 'c') },
      columns: [{ blockType: 'leafText', heading: 'x' }],
    },
    { blockType: 'unknownSiteBlock', image: { id: 1 } },
  ]
  const [saved, other] = normalizeLayout(layout, cfg)
  assert.equal(saved.image, 5)
  assert.deepEqual(saved.people, [7, 8])
  assert.deepEqual((saved.link as { reference: unknown }).reference, { relationTo: 'pages', value: 3 })
  assert.deepEqual(saved.items, [{ image: 6 }])
  assert.deepEqual(saved.section, { backgroundMedia: 9 })
  assert.deepEqual(other, layout[1], 'blocks the editor does not know are left alone')
})

test('history: undo, redo, and a new change clears the redo stack', () => {
  let h = historyOf([1])
  h = pushHistory(h, [1, 2])
  h = pushHistory(h, [1, 2, 3])
  h = undo(h)
  assert.deepEqual(h.present, [1, 2])
  h = redo(h)
  assert.deepEqual(h.present, [1, 2, 3])
  h = undo(undo(h))
  assert.deepEqual(h.present, [1])
  assert.equal(undo(h), h, 'nothing to undo')
  h = pushHistory(h, [9])
  assert.deepEqual(h.future, [])
  assert.equal(redo(h), h)
})

test('moving and copying sections', () => {
  assert.deepEqual(moveItem(['a', 'b', 'c'], 0, 3), ['b', 'c', 'a'])
  assert.deepEqual(moveItem(['a', 'b', 'c'], 2, 0), ['c', 'a', 'b'])
  assert.deepEqual(moveItem(['a', 'b', 'c'], 1, 2), ['a', 'b', 'c'])
  const block = { id: 'aaa', blockType: 'cards', image: { id: 4 }, items: [{ id: 'bbb', title: 'x' }], body: richText('Hei') }
  const copy = withNewIds(block)
  assert.notEqual(copy.id, 'aaa')
  assert.notEqual(copy.items[0].id, 'bbb')
  assert.equal(copy.image.id, 4, 'media keep their ids')
  assert.deepEqual(copy.body, block.body)
  assert.deepEqual(setAt({ a: [{ b: 1 }] }, ['a', 0, 'b'], 2), { a: [{ b: 2 }] })
})
