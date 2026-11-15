import assert from 'node:assert/strict'
import { test } from 'node:test'

import { classify, richHtml, sectionsOf, txt } from '../src/map-rules.js'

const ctx = (over = {}) => {
  const media = []
  return {
    media: (src, alt) => { media.push({ src, alt }); return `m${media.length}` },
    link: (href, label) => ({ type: 'custom', url: href, label }),
    person: (p) => `p-${p.name.split(' ')[0].toLowerCase()}`,
    document: (d) => `d-${d.title.split(' ')[0].toLowerCase()}`,
    has: () => false,
    isArticle: () => false,
    oldOrigin: 'https://old.example',
    first: false,
    mediaCalls: media,
    ...over,
  }
}
/** Classifies the only section of a fragment. */
// A sibling paragraph keeps main from being a single wrapper that sectionsOf would step into.
const one = (html, c = ctx()) => { const { $, sections } = sectionsOf(`<main>${html}<p>Next section.</p></main>`); return classify($, sections[0], c) }

test('text is read with a space between elements', () => {
  const { $ } = sectionsOf('<main><div><span>2011</span><h3>Founded</h3><p>In Bergen.</p></div></main>')
  assert.equal(txt($, $('div')), '2011 Founded In Bergen.')
})

test('a flat page of headings and paragraphs is split at each h2', () => {
  const { sections } = sectionsOf('<main><h2>A</h2><p>a</p><p>a2</p><h2>B</h2><p>b</p></main>')
  assert.equal(sections.length, 2)
})

test('the top of the page with its h1 is a hero: eyebrow, heading, lead, image, buttons', () => {
  const r = one('<section><p class="eyebrow">Advisory</p><h1>We help</h1><p>A longer lead text.</p><img src="/hero.jpg" alt="Hero"><a class="btn" href="/contact">Contact</a></section>', ctx({ first: true }))
  assert.deepEqual(r.block, { blockType: 'hero', variant: 'split', heading: 'We help', eyebrow: 'Advisory', text: 'A longer lead text.', media: { $media: 'm1' }, links: [{ link: { type: 'custom', url: '/contact', label: 'Contact' } }] })
})

test('repeated items with headings are cards', () => {
  const r = one('<section><h2>Services</h2><ul><li><img src="/a.jpg"><h3>Advice</h3><p>Plans.</p><a href="/advice">Read</a></li><li><h3>Projects</h3><p>Delivery.</p></li><li><h3>Support</h3><p>Help.</p></li></ul></section>')
  assert.equal(r.block.blockType, 'cards')
  assert.equal(r.block.heading, 'Services')
  assert.equal(r.block.columns, '3')
  assert.deepEqual(r.block.items[0], { title: 'Advice', text: 'Plans.', image: { $media: 'm1' }, link: { type: 'custom', url: '/advice', label: 'Read' } })
})

test('figures with labels are stats, dated steps a timeline', () => {
  const stats = one('<div><div class="s"><strong>15</strong> years</div><div class="s"><strong>120+</strong> projects</div></div>')
  assert.deepEqual(stats.block.items, [{ value: '15', label: 'years' }, { value: '120+', label: 'projects' }])
  const tl = one('<ol><li><span>2011</span><h3>Founded</h3><p>In Bergen.</p></li><li><span>2018</span><h3>Oslo</h3><p>New office.</p></li></ol>')
  assert.equal(tl.block.blockType, 'timeline')
  assert.deepEqual(tl.block.items[0], { year: '2011', title: 'Founded', text: 'In Bergen.' })
})

test('details are an accordion, a blockquote a quote with author and role', () => {
  const acc = one('<div><details><summary>Price?</summary><p>Fixed.</p></details><details><summary>Time?</summary><p>4 weeks.</p></details></div>')
  assert.deepEqual(acc.block.items[0], { title: 'Price?', content: { $html: '<p>Fixed.</p>' } })
  const { $ } = sectionsOf('<main><p><b>bold</b> <i>text</i></p></main>')
  assert.equal(richHtml($, $('p').toArray(), {}), '<p><b>bold</b> <i>text</i></p>') // the space between inline tags stays
  const q = one('<figure><blockquote><p>They delivered on time.</p></blockquote><figcaption><strong>Kari Nordmann</strong><span>CEO</span></figcaption></figure>')
  assert.deepEqual(q.block, { blockType: 'quote', quote: 'They delivered on time.', author: 'Kari Nordmann', role: 'CEO' })
})

test('people with photo and contact links become people refs', () => {
  const r = one('<div><div class="p"><img src="/kari.jpg"><h3>Kari Nordmann</h3><p>CEO</p><a href="tel:+4712345678">12 34 56 78</a></div><div class="p"><img src="/ola.jpg"><h3>Ola Nordmann</h3><p>CTO</p><a href="mailto:ola@x.no">ola@x.no</a></div></div>')
  assert.deepEqual(r.block.people, [{ $person: 'p-kari' }, { $person: 'p-ola' }])
})

test('a list of documents, images only, and an article list', () => {
  const docs = one('<ul><li><a href="/a.pdf">Annual report</a></li><li><a href="/b.pdf">Price list</a></li></ul>')
  assert.deepEqual(docs.block.documents, [{ $document: 'd-annual' }, { $document: 'd-price' }])
  const grid = one('<div><figure class="g"><img src="/a.jpg"><figcaption>Fjord</figcaption></figure><figure class="g"><img src="/b.jpg"></figure></div>')
  assert.equal(grid.block.blockType, 'imageGrid')
  assert.equal(grid.block.images[0].caption, 'Fjord')
  const feed = one('<div><article class="a"><a href="/news/x">X</a></article><article class="a"><a href="/news/y">Y</a></article></div>', ctx({ isArticle: (h) => h.startsWith('/news/') }))
  assert.deepEqual(feed.block, { blockType: 'articleFeed', kind: 'all', limit: 2 })
})

test('text with one image, a video, a map, and what becomes a gap', () => {
  const ti = one('<div><img src="/office.jpg" alt="Office"><h2>Who we are</h2><p>A small team in Bergen that builds websites for others.</p></div>')
  assert.equal(ti.block.blockType, 'textImage')
  assert.equal(ti.block.imagePosition, 'left')
  assert.equal(one('<div><iframe src="https://www.youtube.com/embed/x"></iframe></div>').block.blockType, 'video')
  assert.equal(one('<div><iframe src="https://www.google.com/maps/embed?pb=1"></iframe></div>').block.provider, 'google-maps')
  assert.equal(one('<div><form><input name="q"></form></div>').block, null)
  assert.equal(one('<div><iframe src="https://booking.example/widget"></iframe></div>').block, null)
})

test('a table and side-by-side quotes use the kit blocks only when they have the expected fields', () => {
  const html = '<div><table><tr><th>A</th></tr><tr><td>1</td></tr></table></div>'
  assert.equal(one(html).block.blockType, 'content')
  const t = one('<div><h2>Prices</h2><table><tr><th>Item</th><th>Price</th></tr><tr><td>A</td><td>10</td></tr></table></div>', ctx({ has: (slug) => slug === 'table' }))
  assert.deepEqual(t.block, { blockType: 'table', caption: 'Prices', header: [{ text: 'Item' }, { text: 'Price' }], rows: [{ cells: [{ text: 'A' }, { text: '10' }] }] })
  const q = one('<div><figure class="t"><blockquote>Great work, on time and on budget.</blockquote><figcaption><b>Kari</b><span>CEO</span></figcaption></figure><figure class="t"><blockquote>Fast.</blockquote><figcaption><b>Ola</b></figcaption></figure></div>', ctx({ has: (slug) => slug === 'testimonials' }))
  assert.deepEqual(q.block, { blockType: 'testimonials', items: [{ quote: 'Great work, on time and on budget.', author: 'Kari', role: 'CEO' }, { quote: 'Fast.', author: 'Ola' }] })
})

test('plain text is a content block; rich html keeps content tags only and makes links and images usable', () => {
  const r = one('<div><h2>About</h2><p onclick="x()" class="c">We <a href="https://old.example/team?x=1" target="_blank">work</a> <img src="/i.jpg" alt="i"></p><script>bad()</script></div>')
  assert.equal(r.block.blockType, 'content')
  assert.equal(r.confidence, 0.8)
  assert.equal(r.block.richText.$html, '<h2>About</h2><p>We <a href="/team?x=1">work</a> <img src="https://old.example/i.jpg" alt="i"></p>')
  const { $ } = sectionsOf('<main><p>x</p></main>')
  assert.equal(richHtml($, $('p').toArray(), {}), '<p>x</p>')
})
