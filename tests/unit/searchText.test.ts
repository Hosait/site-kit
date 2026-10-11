import assert from 'node:assert/strict'
import { test } from 'node:test'

import { layoutText, lexicalText, toTsQuery } from '../../src/lib/search/text'

const lexical = (...paragraphs: string[]) => ({
  root: {
    type: 'root',
    children: paragraphs.map((p) => ({ type: 'paragraph', children: [{ type: 'text', text: p }] })),
  },
})

test('lexicalText gir avsnitt på egne linjer', () => {
  assert.equal(lexicalText(lexical('Første avsnitt.', 'Andre avsnitt.')), 'Første avsnitt.\nAndre avsnitt.')
  assert.equal(lexicalText(null), '')
  assert.equal(lexicalText({ foo: 1 }), '')
})

test('layoutText henter tekstfelt fra blokker og hopper over lenker, media og innstillinger', () => {
  const layout = [
    { blockType: 'hero', heading: 'Vinduer og dører', eyebrow: 'Nordlys', media: { alt: 'bilde' }, link: { label: 'Les mer' } },
    { blockType: 'content', richText: lexical('Brødtekst om fasader.') },
    { blockType: 'cards', intro: 'Utvalg', items: [{ title: 'Fixade', text: 'Glassfasade' }], columns: '3' },
    { blockType: 'embed', url: 'https://example.com', heading: 'Kart' },
  ]
  const text = layoutText(layout)
  for (const want of ['Vinduer og dører', 'Nordlys', 'Brødtekst om fasader.', 'Utvalg', 'Fixade', 'Glassfasade', 'Kart']) {
    assert.ok(text.includes(want), `mangler «${want}»`)
  }
  for (const unwanted of ['Les mer', 'bilde', 'https://example.com', 'hero', '3']) {
    assert.ok(!text.split('\n').includes(unwanted) && !text.includes(unwanted === '3' ? '\n3\n' : unwanted), `skal ikke ha «${unwanted}»`)
  }
})

test('toTsQuery: prefiks på hvert ord, ingen spesialtegn', () => {
  assert.equal(toTsQuery('Dør vin'), 'dør:* & vin:*')
  assert.equal(toTsQuery("fixade' | !solar & (x)"), 'fixade:* & solar:* & x:*')
  assert.equal(toTsQuery('  ... '), null)
  assert.equal((toTsQuery('a b c d e f g h i j') ?? '').split(' & ').length, 8)
})
