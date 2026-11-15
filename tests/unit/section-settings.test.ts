import assert from 'node:assert/strict'
import { test } from 'node:test'

import type { Block } from 'payload'

import {
  isDefaultSection,
  sectionFrameProps,
  validateAnchor,
  validateStyleClass,
  withSection,
} from '../../src/blocks/variants'

test('a block whose settings are all default gets no frame', () => {
  assert.equal(isDefaultSection(undefined), true)
  assert.equal(isDefaultSection(null), true)
  assert.equal(isDefaultSection({ spaceTop: 'auto', spaceBottom: 'auto', width: 'auto', hide: 'none', overlay: 'dark', anchor: '' }), true)
  assert.equal(isDefaultSection({ spaceTop: 'l' }), false)
  assert.equal(isDefaultSection({ anchor: 'kontakt' }), false)
  assert.equal(isDefaultSection({ backgroundMedia: 3 }), false)
  assert.equal(isDefaultSection({ hide: 'mobile' }), false)
})

test('the frame carries spacing, width, visibility, overlay and anchor', () => {
  const p = sectionFrameProps({ spaceTop: 'none', spaceBottom: 'xl', width: 'full', hide: 'mobile', backgroundMedia: { id: 1 }, overlay: 'dark', anchor: 'om-oss' }, [])
  assert.equal(p.id, 'om-oss')
  assert.equal(p['data-pt'], 'none')
  assert.equal(p['data-pb'], 'xl')
  assert.equal(p['data-width'], 'full')
  for (const c of ['sec-frame', 'max-md:hidden', 'sec-has-media', 'sec-overlay-dark', 'on-dark']) assert.ok(p.className.split(' ').includes(c), c)
})

test('the frame refuses values it does not know instead of passing them on', () => {
  const p = sectionFrameProps({ spaceTop: 'huge', width: '100vw"', hide: 'tablet', overlay: 'dark', anchor: 'Bad Anchor', styleClass: 'site-x' }, ['site-y'])
  assert.equal(p['data-pt'], 'auto')
  assert.equal(p['data-width'], 'auto')
  assert.equal(p.id, undefined)
  assert.equal(p.className, 'sec-frame') // no media, so no overlay; unknown style class dropped
})

test('a declared style class is applied', () => {
  assert.ok(sectionFrameProps({ styleClass: 'site-quiet' }, ['site-quiet']).className.includes('site-quiet'))
})

test('anchors are slugs and unique on the page', () => {
  const data = { layout: [{ section: { anchor: 'kontakt' } }, { section: { anchor: 'kontakt' } }, { section: { anchor: 'om' } }] }
  assert.equal(validateAnchor('', data), true)
  assert.equal(validateAnchor(undefined, data), true)
  assert.equal(validateAnchor('om', data), true)
  assert.match(String(validateAnchor('kontakt', data)), /brukt på en annen seksjon/)
  assert.match(String(validateAnchor('Kontakt Oss', {})), /små bokstaver/)
  assert.match(String(validateAnchor('-start', {})), /små bokstaver/)
})

test('a style class must be declared in theme.json', () => {
  assert.equal(validateStyleClass('', []), true)
  assert.equal(validateStyleClass('site-quiet', ['site-quiet']), true)
  assert.match(String(validateStyleClass('site-loud', ['site-quiet'])), /site-quiet/)
  assert.match(String(validateStyleClass('site-loud', [])), /ingen stiler/)
})

test('withSection adds the group last to every block, once', () => {
  const blocks: Block[] = [
    { slug: 'a', fields: [{ name: 'heading', type: 'text' }] },
    { slug: 'b', fields: [] },
  ]
  const out = withSection(blocks, [])
  for (const b of out) {
    const last = b.fields.at(-1) as { name?: string; type?: string }
    assert.equal(last.name, 'section')
    assert.equal(last.type, 'group')
  }
  assert.equal(withSection(out, []).every((b) => b.fields.filter((f) => 'name' in f && f.name === 'section').length === 1), true)
  assert.equal(blocks[0].fields.length, 1) // input not mutated
})
