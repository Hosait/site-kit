import assert from 'node:assert/strict'
import { test } from 'node:test'

import { PNG } from 'pngjs'

import { png } from './png.js'
import { bands, headingScore, imageKey, linkListScore, matchImages, matchLinks, metaProblems, textSimilarity, visualScore, words } from '../src/qc-score.js'

test('words come from text or HTML, lower case, letters and digits only', () => {
  assert.deepEqual(words('<p>Hello, <b>World</b> 2024!</p>'), ['hello', 'world', '2024'])
  assert.deepEqual(words('Blåbær og øl'), ['blåbær', 'og', 'øl'])
})

test('text similarity counts shared words, order aside', () => {
  const hundred = Array.from({ length: 100 }, (_, i) => `w${i}`).join(' ')
  assert.equal(textSimilarity(hundred, hundred), 1)
  assert.equal(textSimilarity('', ''), 1)
  assert.equal(textSimilarity('a b c', 'x y z'), 0)
  assert.equal(textSimilarity(hundred, hundred.replace('w5 ', 'changed ')), 0.99)
  assert.equal(textSimilarity('<p>Om oss</p>', 'om   OSS'), 1)
})

test('headings are compared by text and order, not level', () => {
  const old = [{ level: 2, text: 'About us' }, { level: 2, text: 'Team' }, { level: 3, text: 'Contact' }]
  assert.equal(headingScore(old, [{ level: 1, text: 'About us' }, { level: 2, text: 'Team' }, { level: 3, text: 'Contact' }]).score, 1)
  const r = headingScore(old, [{ level: 1, text: 'About us' }, { level: 3, text: 'Contact' }])
  assert.equal(r.score, 2 / 3)
  assert.deepEqual(r.missing, ['team'])
  const swapped = headingScore(old, [{ text: 'Team' }, { text: 'About us' }, { text: 'Contact' }])
  assert.ok(swapped.score < 1)
})

test('image keys drop what CMSs add to a file name', () => {
  assert.equal(imageKey('https://old.example/wp-content/uploads/2023/05/Team-Photo-1024x683.jpg'), 'team-photo')
  assert.equal(imageKey('https://new.example/api/media/file/team-photo-1-1600x900.webp'), 'team-photo')
  assert.equal(imageKey('/img/logo@2x.png'), 'logo')
  assert.equal(imageKey('/uploads/hall-scaled.jpg'), 'hall')
  assert.equal(imageKey('/uploads/hall-e1690000000123.jpg'), 'hall')
  assert.equal(imageKey('/uploads/annual-report-2024.png'), 'annual-report-2024')
})

test('old images are found by file name or alt text, each new image once', () => {
  const old = [{ src: 'https://o/a/team-800x600.jpg', alt: '' }, { src: 'https://o/b/x.png', alt: 'Our office' }, { src: 'https://o/c/gone.jpg', alt: '' }, { src: 'data:image/gif;base64,R0lGOD', alt: '' }]
  const fresh = [{ src: 'https://n/api/media/file/team-1-1600x900.webp', alt: 'Team' }, { src: 'https://n/api/media/file/office.webp', alt: 'Our office' }]
  const r = matchImages(old, fresh)
  assert.deepEqual(r.missing, ['https://o/c/gone.jpg'])
  assert.equal(r.score, 2 / 3)
  assert.equal(matchImages([{ src: '/a/x.jpg' }, { src: '/b/x.jpg' }], [{ src: '/x.webp' }]).missing.length, 1)
})

test('links to the old site count when the new page links to the same or the moved path', () => {
  const opts = { oldOrigin: 'https://www.old.example', newOrigin: 'http://127.0.0.1:3000', moved: new Map([['/om-oss', '/no/om-oss']]) }
  const r = matchLinks(
    ['https://old.example/kontakt/', 'https://www.old.example/om-oss', 'https://partner.example/x', 'mailto:Post@old.example', 'https://www.old.example/gone', 'javascript:void(0)'],
    ['http://127.0.0.1:3000/kontakt', 'http://127.0.0.1:3000/no/om-oss', 'https://partner.example/x', 'mailto:post@old.example'],
    opts,
  )
  assert.deepEqual(r.missing, ['https://www.old.example/gone'])
  assert.equal(r.score, 4 / 5)
})

test('meta: words of the title, the description, a share image and the canonical path', () => {
  const old = { title: 'About – Acme', description: 'We make things.', ogImage: 'https://o/og.jpg', canonical: 'https://old.example/about/' }
  assert.deepEqual(metaProblems(old, { title: 'About | Acme', description: 'We make things', ogImage: 'https://n/og.webp', canonical: 'https://new.example/about' }, { expectedPath: '/about' }), [])
  const p = metaProblems(old, { title: 'About', description: 'Other', canonical: 'https://new.example/en/about' }, { expectedPath: '/about' })
  assert.equal(p.length, 4)
  assert.match(p.join(' '), /title «About – Acme» is «About»/)
  assert.match(p.join(' '), /canonical is https:\/\/new.example\/en\/about, expected the path \/about/)
})

test('menu and footer items match by label and (moved) path', () => {
  const opts = { oldOrigin: 'https://old.example', newOrigin: 'https://new.example', moved: new Map([['/services', '/en/services']]) }
  const r = linkListScore(
    [{ label: 'Services', href: 'https://old.example/services' }, { label: 'Contact', href: 'https://old.example/contact' }],
    [{ label: 'Services', href: 'https://new.example/en/services' }, { label: 'Contact us', href: 'https://new.example/contact' }],
    opts,
  )
  assert.equal(r.score, 0.5)
  assert.deepEqual(r.missing, ['contact → site:/contact'])
})

test('bands cut both pages at the headings they share, in order', () => {
  const b = bands([{ text: 'A', y: 100 }, { text: 'B', y: 300 }], [{ text: 'A', y: 140 }, { text: 'B', y: 340 }], 500, 560)
  assert.deepEqual(b, [{ old: [0, 100], new: [0, 140] }, { old: [100, 300], new: [140, 340] }, { old: [300, 500], new: [340, 560] }])
  assert.deepEqual(bands([], [], 400, 420), [{ old: [0, 400], new: [0, 420] }])
})

test('identical screenshots score 1, different ones much lower', () => {
  const a = png(200, 300, [{ y: 50, h: 40 }])
  assert.equal(visualScore(a, a).similarity, 1)
  const b = png(200, 300, [{ y: 0, h: 300 }])
  assert.ok(visualScore(a, b).similarity < 0.2)
})

test('a section pushed down scores high with heading bands and low without', () => {
  // Old: a heading block at 100 and one at 300. New: everything 60 px lower (a taller header).
  const old = png(200, 500, [{ y: 100, h: 20 }, { y: 300, h: 20 }])
  const fresh = png(200, 560, [{ y: 160, h: 20 }, { y: 360, h: 20 }])
  const without = visualScore(old, fresh).similarity
  const withBands = visualScore(old, fresh, { oldBoxes: [{ text: 'A', y: 100 }, { text: 'B', y: 300 }], newBoxes: [{ text: 'A', y: 160 }, { text: 'B', y: 360 }] }).similarity
  assert.ok(withBands > without, `${withBands} > ${without}`)
  assert.ok(withBands > 0.85)
})

test('missing height counts as different, and the diff image covers every band', () => {
  const r = visualScore(png(100, 200), png(100, 100))
  assert.equal(r.similarity, 1) // white padding on white: no differing pixels
  const dark = visualScore(png(100, 200, [{ y: 0, h: 200 }]), png(100, 100, [{ y: 0, h: 100 }]))
  assert.equal(Math.round(dark.similarity * 100) / 100, 0.5)
  assert.equal(PNG.sync.read(dark.diff).height, 200)
})
