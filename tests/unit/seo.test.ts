import assert from 'node:assert/strict'
import { test } from 'node:test'

import type { Article, Media, Page } from '../../src/payload-types'
import { buildMetadata } from '../../src/lib/seo'

// A moved site has many pages without an SEO description or share image (the launch check warned
// on 18 of the demo's 24 pages). The page's own first text and first image are used instead.
const media = (url: string) => ({ id: 1, url, mimeType: 'image/webp', sizes: { og: { url: `${url}?og` } }, updatedAt: '', createdAt: '' }) as unknown as Media
const rich = (...paragraphs: string[]) => ({
  root: { type: 'root', direction: null, format: '', indent: 0, version: 1, children: paragraphs.map((t) => ({ type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: t }] })) },
})
const page = (layout: unknown[], meta: Page['meta'] = {}) => ({ id: 1, title: 'Om oss', site: 'main', layout, meta, updatedAt: '', createdAt: '' }) as unknown as Page
const meta = (doc: Page | Article) => buildMetadata({ site: 'main', locale: 'no', doc, path: '/no/om-oss', alternates: {} })
const og = (m: ReturnType<typeof meta>) => (m.openGraph?.images as { url: string }[] | undefined)?.[0]?.url

test('a page without SEO fields gets the hero\'s text and image', () => {
  const m = meta(page([{ blockType: 'hero', heading: 'Velkommen', text: 'Vi bygger lys for nordiske hjem.', media: media('/media/hero.webp') }, { blockType: 'content', richText: rich('Mer tekst.') }]))
  assert.equal(m.description, 'Vi bygger lys for nordiske hjem.')
  assert.match(og(m) ?? '', /^https?:\/\/[^/]+\/media\/hero\.webp\?og$/)
})

test('without a hero, the first text block gives the description, cut at a word near 155 characters', () => {
  const long = 'Fjordlys er et lite selskap som tegner og lager lamper for hjem og hytter i hele Norden, med vekt på varmt lys, lang levetid og deler som kan byttes når noe går i stykker etter mange år.'
  const m = meta(page([{ blockType: 'content', richText: rich(long, 'Neste avsnitt.') }, { blockType: 'fullImage', image: media('/media/full.webp') }]))
  const d = String(m.description)
  assert.ok(d.length <= 156 && d.endsWith('…'), d)
  assert.ok(long.startsWith(d.slice(0, -1)), d)
  assert.doesNotMatch(d, / …$/)
  assert.match(og(m) ?? '', /\/media\/full\.webp\?og$/)
})

// Bjørn's review: a hero's media can be a video, and a text-only hero keeps its old image in the data.
test('only images become the share image: not a hero video, not a hidden image in a text-only hero', () => {
  const video = { ...media('/media/film.mp4'), mimeType: 'video/mp4', sizes: {} } as unknown as Media
  const m = meta(page([{ blockType: 'hero', text: 'Film', media: video }, { blockType: 'fullImage', image: { ...media('/media/full.webp'), mimeType: 'image/webp' } }]))
  assert.match(og(m) ?? '', /\/media\/full\.webp\?og$/)
  const hidden = meta(page([{ blockType: 'hero', variant: 'text', text: 'Bare tekst', media: { ...media('/media/old.webp'), mimeType: 'image/webp' } }]))
  assert.equal(og(hidden), undefined)
})

test('a text with no space in its first 155 characters is cut at 155, not after one letter', () => {
  const long = 'https://www.fjordlys.no/' + 'a'.repeat(300)
  const m = meta(page([{ blockType: 'hero', text: long }]))
  assert.equal(m.description, long.slice(0, 155) + '…')
})

test('the SEO fields always win, and a page with neither text nor image gets none', () => {
  const m = meta(page([{ blockType: 'hero', text: 'Hero-tekst', media: media('/media/hero.webp') }], { description: 'Egen beskrivelse', image: media('/media/seo.webp') }))
  assert.equal(m.description, 'Egen beskrivelse')
  assert.match(og(m) ?? '', /\/media\/seo\.webp\?og$/)
  const empty = meta(page([{ blockType: 'cta', heading: 'Ring oss' }]))
  assert.equal(empty.description, undefined)
  assert.equal(og(empty), undefined)
})

test('articles keep their lead and hero image', () => {
  const a = { id: 2, title: 'Nytt kontor', kind: 'news', lead: 'Vi flytter.', heroImage: media('/media/a.webp'), meta: {}, updatedAt: '', createdAt: '' } as unknown as Article
  const m = meta(a)
  assert.equal(m.description, 'Vi flytter.')
  assert.match(og(m) ?? '', /\/media\/a\.webp\?og$/)
})

test('text split by formatting stays one word, and paragraphs are separated by a space', () => {
  const para = (...texts: string[]) => ({ type: 'paragraph', children: texts.map((text) => ({ type: 'text', text })) })
  const m = meta(page([{ blockType: 'content', richText: { root: { type: 'root', children: [para('Fjord', 'lys', ' lager lamper.'), para('Ring oss.')] } } }]))
  assert.equal(m.description, 'Fjordlys lager lamper. Ring oss.')
})

test('headings in the text block are left out: the title already says them', () => {
  const m = meta(page([{ blockType: 'content', richText: { root: { type: 'root', children: [
    { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Informasjonskapsler' }] },
    { type: 'paragraph', children: [{ type: 'text', text: 'Vi bruker bare nødvendige informasjonskapsler.' }] },
  ] } } }]))
  assert.equal(m.description, 'Vi bruker bare nødvendige informasjonskapsler.')
})

test('rich text deep or huge is read safely: nested children are walked without recursion', () => {
  let node: Record<string, unknown> = { type: 'text', text: 'Dypt.' }
  for (let i = 0; i < 20000; i++) node = { type: 'paragraph', children: [node] }
  const m = meta(page([{ blockType: 'content', richText: { root: { type: 'root', children: [node] } } }]))
  assert.equal(m.description, 'Dypt.')
})
