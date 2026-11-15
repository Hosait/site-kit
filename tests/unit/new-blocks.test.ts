import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { COLUMN_EXCLUDED, COLUMN_LAYOUTS, columnCount, columnGrid, validateColumnCount } from '../../src/blocks/columnLayouts'
import { pageBlocks } from '../../src/blocks/configs'
import { validateHttpsUrl } from '../../src/blocks/fields'
import { ICONS } from '../../src/blocks/icons'
import { ICON_OPTIONS } from '../../src/blocks/iconNames'
import { fitRow, keyTarget, quoted, slideInterval, telHref, wrapIndex } from '../../src/blocks/interaction'
import { moreBlocks } from '../../src/blocks/moreBlocks'
import { STRINGS } from '../../src/lib/i18n'
import { validateSitePlan } from '../../src/lib/site-plan/validate'
import plan from '../../seed/site-plan.json'

const NEW = ['columns', 'tabs', 'pricing', 'logoWall', 'testimonials', 'carousel', 'table', 'contactCard', 'newsletter', 'iconFeatures', 'banner', 'buttonGroup', 'divider']
const block = (slug: string) => pageBlocks.find((b) => b.slug === slug)!
// A field by name, looking inside rows (they only lay fields out).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const find = (fields: any[], name: string): any => {
  for (const f of fields) {
    if (f.name === name) return f
    if (f.type === 'row') {
      const inner = find(f.fields, name)
      if (inner) return inner
    }
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const field = (slug: string, name: string): any => find(block(slug).fields, name)

/* ---------- configs ---------- */

test('columns and the twelve new blocks are page blocks with Norwegian labels, a type name and section settings', () => {
  assert.equal(moreBlocks.length, 12)
  for (const slug of NEW) {
    const b = block(slug)
    assert.ok(b, `${slug} is a page block`)
    assert.ok(b.interfaceName, `${slug} interfaceName`)
    const label = (b.labels?.singular ?? '') as string
    assert.ok(label.length > 0 && !/^[a-z]+$/.test(label), `${slug} has a Norwegian label`)
    assert.ok(b.fields.some((f) => 'name' in f && f.name === 'section'), `${slug} section group`)
  }
})

test('a column holds the same block definitions as the page, and never columns, forms, the page header or the newsletter', () => {
  const cols = field('columns', 'columns')
  const nested: { slug: string }[] = cols.fields.find((f: { name?: string }) => f.name === 'blocks').blocks
  const slugs = nested.map((b) => b.slug)
  for (const slug of COLUMN_EXCLUDED) assert.ok(!slugs.includes(slug), `${slug} not in a column`)
  for (const slug of ['content', 'accordion', 'tabs', 'pricing', 'table', 'banner', 'buttonGroup', 'divider']) assert.ok(slugs.includes(slug), `${slug} in a column`)
  // Payload keeps one table per block slug: a nested block must be the page's own definition.
  for (const b of nested) assert.equal(b, block(b.slug), `${b.slug} is the page's definition`)
})

test('columns has between 2 and 4 columns, and the count has to match the layout', () => {
  const cols = field('columns', 'columns')
  assert.equal(cols.minRows, 2)
  assert.equal(cols.maxRows, 4)
  assert.deepEqual(
    field('columns', 'layout').options.map((o: { value: string }) => o.value),
    ['1-1', '2-1', '1-2', '1-1-1', '1-1-1-1'],
  )
})

test('layout presets give the column count, grid classes and a fallback', () => {
  assert.deepEqual(Object.entries(COLUMN_LAYOUTS).map(([k, v]) => [k, v.count]), [['1-1', 2], ['2-1', 2], ['1-2', 2], ['1-1-1', 3], ['1-1-1-1', 4]])
  assert.equal(columnCount('1-1-1'), 3)
  assert.equal(columnCount('nope'), 2)
  assert.equal(columnGrid('2-1', 2), 'md:grid-cols-[2fr_1fr]')
  assert.equal(columnGrid('2-1', 3), 'md:grid-cols-3') // preset and number disagree: equal columns
  assert.equal(validateColumnCount([{}, {}], '1-1'), true)
  assert.match(String(validateColumnCount([{}, {}], '1-1-1')), /3 kolonner/)
})

test('map and embed addresses must be https', () => {
  assert.equal(validateHttpsUrl(''), true)
  assert.equal(validateHttpsUrl('https://www.google.com/maps/embed?pb=1'), true)
  for (const bad of ['http://x.no', 'javascript:alert(1)', 'not a url', 42]) assert.notEqual(validateHttpsUrl(bad), true, String(bad))
  const mapUrl = field('contactCard', 'mapUrl')
  assert.notEqual(mapUrl.validate('javascript:alert(1)'), true)
  const embed = field('newsletter', 'embedUrl')
  assert.notEqual(embed.validate('', { siblingData: { mode: 'embed' } }), true)
  assert.equal(embed.validate('', { siblingData: { mode: 'form' } }), true)
})

test('the newsletter needs a form or an embed address, depending on the mode', () => {
  const form = field('newsletter', 'form')
  assert.notEqual(form.validate(undefined, { siblingData: { mode: 'form' } }), true)
  assert.equal(form.validate(3, { siblingData: { mode: 'form' } }), true)
  assert.equal(form.validate(undefined, { siblingData: { mode: 'embed' } }), true)
})

test('the carousel does not start by itself', () => {
  assert.equal(field('carousel', 'autoplay').defaultValue, false)
})

/* ---------- pure logic ---------- */

test('keys move tabs and slides: arrows wrap, Home and End jump, other keys are left alone', () => {
  assert.equal(keyTarget('ArrowRight', 2, 3), 0)
  assert.equal(keyTarget('ArrowLeft', 0, 3), 2)
  assert.equal(keyTarget('Home', 2, 3), 0)
  assert.equal(keyTarget('End', 0, 3), 2)
  assert.equal(keyTarget('Tab', 1, 3), null)
  assert.equal(keyTarget('a', 1, 3), null)
  assert.equal(wrapIndex(-1, 4), 3)
  assert.equal(wrapIndex(5, 0), 0)
})

test('slide interval stays between 3 and 30 seconds', () => {
  assert.equal(slideInterval(undefined), 6)
  assert.equal(slideInterval(1), 3)
  assert.equal(slideInterval(500), 30)
  assert.equal(slideInterval(10), 10)
})

test('table rows line up under the header, phone numbers become tel: addresses, quotes follow the language', () => {
  assert.deepEqual(fitRow([{ text: 'a' }], 3), ['a', '', ''])
  assert.deepEqual(fitRow([{ text: 'a' }, { text: 'b' }, { text: 'c' }], 2), ['a', 'b'])
  assert.deepEqual(fitRow(null, 2), ['', ''])
  assert.equal(telHref('+47 22 33 44 55'), 'tel:+4722334455')
  assert.equal(telHref('22-33 (44) 55 +1'), 'tel:22334455' + '1')
  assert.equal(telHref('ring oss'), '')
  assert.equal(quoted('«Hei»', 'no'), '«Hei»')
  assert.equal(quoted('Hello', 'en'), '“Hello”')
})

test('every icon in the list has a drawing, and no drawing is unlisted', () => {
  assert.deepEqual(Object.keys(ICONS).sort(), ICON_OPTIONS.map((o) => o.value).sort())
  const option = field('iconFeatures', 'items').fields.find((f: { name: string }) => f.name === 'icon')
  assert.deepEqual(option.options.map((o: { value: string }) => o.value), ICON_OPTIONS.map((o) => o.value))
})

test('the visitor strings the new blocks use exist in both languages', () => {
  const keys = ['tabsLabel', 'carouselLabel', 'carouselPrevious', 'carouselNext', 'carouselPause', 'carouselPlay', 'carouselSlide', 'recommended', 'bannerInfo', 'bannerWarning', 'bannerSuccess', 'address', 'openingHours', 'newsletter']
  for (const k of keys) for (const l of ['no', 'en'] as const) assert.ok((STRINGS[l] as Record<string, string>)[k], `${l}.${k}`)
})

/* ---------- rendering ---------- */

const html = async (mod: string, name: string, props: Record<string, unknown>) => {
  const C = (await import(mod))[name]
  return renderToStaticMarkup(createElement(C, props))
}
const base = { site: 'main', locale: 'no' }

test('banner announces its type to screen readers and takes its colours from the variant', async () => {
  const out = await html('../../src/blocks/MoreComponents', 'BannerComponent', { ...base, block: { variant: 'warning', title: 'Obs', text: 'Les dette' } })
  assert.match(out, /role="note"/)
  assert.match(out, /sr-only">Advarsel: /)
  assert.match(out, /bg-amber-50/)
  const unknown = await html('../../src/blocks/MoreComponents', 'BannerComponent', { ...base, block: { variant: 'x', text: 'a' } })
  assert.match(unknown, /bg-sky-50/)
})

test('table has a caption, column headers, row headers on request, and a labelled focusable scroll region', async () => {
  const block = {
    caption: 'Priser',
    rowHeaders: true,
    header: [{ text: 'Plan' }, { text: 'Pris' }],
    rows: [{ cells: [{ text: 'Start' }] }],
  }
  const out = await html('../../src/blocks/TableComponent', 'TableComponent', { block })
  assert.match(out, /<caption[^>]*>Priser<\/caption>/)
  assert.match(out, /<th scope="col"[^>]*>Plan<\/th>/)
  assert.match(out, /<th scope="row"[^>]*>Start<\/th>/)
  assert.match(out, /<td[^>]*><\/td>/) // the missing cell is padded
  const region = out.match(/<div role="region" aria-labelledby="([^"]+)" tabindex="0"/)
  assert.ok(region, 'scroll region is labelled and focusable')
  assert.ok(out.includes(`<caption id="${region![1]}"`), 'the region is labelled by the caption')
  assert.match(out, /overflow-x-auto/)
  assert.equal(await html('../../src/blocks/TableComponent', 'TableComponent', { block: { caption: 'x', header: [] } }), '')
})

test('tabs: one tab in the tab order, panels wired to their tabs, the others hidden', async () => {
  const block = { heading: 'Faner', items: [{ id: 'a', label: 'En', content: null }, { id: 'b', label: 'To', content: null }] }
  const out = await html('../../src/blocks/TabsComponent', 'TabsComponent', { ...base, block })
  assert.match(out, /role="tablist" aria-label="Faner"/)
  assert.equal((out.match(/role="tab"/g) ?? []).length, 2)
  assert.match(out, /aria-selected="true"[^>]*tabindex="0"|tabindex="0"[^>]*aria-selected="true"/)
  assert.equal((out.match(/tabindex="-1"/g) ?? []).length, 1)
  assert.equal((out.match(/role="tabpanel"/g) ?? []).length, 2)
  assert.equal((out.match(/ hidden=""/g) ?? []).length, 1)
  const ctrl = [...out.matchAll(/aria-controls="([^"]+)"/g)].map((m) => m[1])
  for (const id of ctrl) assert.ok(out.includes(`id="${id}"`), `panel ${id} exists`)
})

test('carousel: roledescription, slide groups, only the first slide shown, no pause button when it does not move', async () => {
  const media = { id: 1, url: '/a.jpg', alt: 'A', mimeType: 'image/jpeg', width: 10, height: 10 }
  const block = { heading: 'Bilder', autoplay: false, slides: [{ id: 's1', image: media, heading: 'En' }, { id: 's2', image: media }, { id: 's3', image: media }] }
  const out = await html('../../src/blocks/CarouselComponent', 'CarouselComponent', { ...base, block })
  assert.match(out, /aria-roledescription="carousel" aria-label="Bilder"/)
  assert.equal((out.match(/aria-roledescription="slide"/g) ?? []).length, 3)
  assert.match(out, /aria-label="Lysbilde 1 av 3"/)
  assert.equal((out.match(/ hidden=""/g) ?? []).length, 2)
  assert.match(out, /aria-label="Forrige lysbilde"/)
  assert.match(out, /aria-label="Neste lysbilde"/)
  assert.ok(!out.includes('automatisk bytte'), 'no pause button without autoplay')
  assert.match(out, /aria-live="polite"/)
})

test('carousel with autoplay still renders paused on the server (nothing moves before the browser has answered)', async () => {
  const media = { id: 1, url: '/a.jpg', alt: 'A', mimeType: 'image/jpeg', width: 10, height: 10 }
  const block = { autoplay: true, interval: 5, slides: [{ image: media }, { image: media }] }
  const out = await html('../../src/blocks/CarouselComponent', 'CarouselComponent', { ...base, block })
  assert.match(out, /aria-live="polite"/)
  assert.ok(!out.includes('automatisk bytte'))
})

test('columns draw the blocks of each column through the page switch, stacked on mobile, side by side from md', async () => {
  const calls: string[] = []
  const block = {
    layout: '2-1',
    verticalAlign: 'center',
    columns: [
      { id: 'c1', blocks: [{ id: 'x', blockType: 'content' }, { id: 'y', blockType: 'banner' }] },
      { id: 'c2', blocks: [{ id: 'z', blockType: 'divider' }] },
    ],
  }
  const { ColumnsComponent } = await import('../../src/blocks/ColumnsComponent')
  const out = renderToStaticMarkup(
    createElement(ColumnsComponent, {
      block: block as never,
      renderNested: (b: { blockType: string }, i: number) => {
        calls.push(`${b.blockType}@${i}`)
        return createElement('p', { key: i }, b.blockType)
      },
    }),
  )
  assert.deepEqual(calls, ['content@0', 'banner@1', 'divider@0'])
  assert.match(out, /grid-cols-1/)
  assert.match(out, /md:grid-cols-\[2fr_1fr\]/)
  assert.match(out, /md:items-center/)
  assert.equal((out.match(/col-cell/g) ?? []).length, 2)
})

test('pricing marks the highlighted plan and gives it a badge', async () => {
  const block = { plans: [{ name: 'A', price: '1 kr' }, { name: 'B', price: '2 kr', highlighted: true, features: [{ text: 'x' }] }] }
  const out = await html('../../src/blocks/MoreComponents', 'PricingComponent', { ...base, block })
  assert.match(out, /ring-2 ring-brand/)
  assert.match(out, />Anbefalt</)
  assert.equal((out.match(/ring-2 ring-brand/g) ?? []).length, 1)
})

test('divider: a line is a separator, space is hidden from assistive technology, unknown sizes fall back', async () => {
  const line = await html('../../src/blocks/MoreComponents', 'DividerComponent', { block: { kind: 'line', size: 'l' } })
  assert.match(line, /<hr/)
  assert.match(line, /var\(--space-l\)/)
  const space = await html('../../src/blocks/MoreComponents', 'DividerComponent', { block: { kind: 'space', size: 'huge' } })
  assert.match(space, /aria-hidden="true"/)
  assert.match(space, /var\(--space-m\)/)
})

test('contact card: tel and mailto links, hours as a list, the map is only a button until clicked', async () => {
  const block = {
    name: 'Nordlys',
    address: 'Storgata 1\n9008 Tromsø',
    phone: '+47 000 00 000',
    email: 'a@b.no',
    hours: [{ days: 'Man–fre', time: '08–16' }],
    mapUrl: 'https://www.google.com/maps/embed?pb=1',
    mapTitle: 'Kart',
  }
  const out = await html('../../src/blocks/ContactCardComponent', 'ContactCardComponent', { ...base, block })
  assert.match(out, /href="tel:\+4700000000"/)
  assert.match(out, /href="mailto:a@b.no"/)
  assert.match(out, /<dt[^>]*>Man–fre<\/dt>/)
  assert.ok(!out.includes('<iframe'), 'no iframe before the visitor clicks')
  assert.match(out, />Vis kart</)
})

test('newsletter embed loads nothing before the click; with no form and no address it draws nothing', async () => {
  const embed = { mode: 'embed', embedUrl: 'https://mail.example.org/f', embedTitle: 'Påmelding' }
  const out = await html('../../src/blocks/NewsletterComponent', 'NewsletterComponent', { ...base, block: embed })
  assert.ok(!out.includes('<iframe') && !out.includes('mail.example.org'))
  assert.match(out, />Vis innhold</)
  assert.equal(await html('../../src/blocks/NewsletterComponent', 'NewsletterComponent', { ...base, block: { mode: 'form' } }), '')
})

/* ---------- demo content and database names ---------- */

test('the seed plan validates and its demo page shows every new block in both languages', () => {
  const v = validateSitePlan(plan)
  assert.ok(v.ok, v.ok ? '' : v.errors.join('\n'))
  const demo = plan.pages.find((p) => p.ref === 'blocks')
  assert.ok(demo, 'demo page')
  for (const loc of ['no', 'en'] as const) {
    type Demo = { blockType: string; layout?: string; columns?: { blocks: { blockType: string }[] }[] }
    const layout: Demo[] = (demo!.layout as unknown as Record<string, Demo[]>)[loc]
    const types = new Set(layout.map((b: Demo) => b.blockType))
    for (const slug of NEW) assert.ok(types.has(slug), `${loc}: ${slug} on the demo page`)
    for (const b of layout.filter((x: Demo) => x.blockType === 'columns')) {
      assert.equal(b.columns!.length, columnCount(b.layout), `${loc}: column count matches ${b.layout}`)
      for (const col of b.columns!) for (const n of col.blocks) assert.ok(!(COLUMN_EXCLUDED as readonly string[]).includes(n.blockType), `${loc}: ${n.blockType} in a column`)
    }
  }
})

test('migrations keep table, type and index names within 63 characters and unique after Postgres truncates them', () => {
  const names = { table: [] as string[], type: [] as string[], index: [] as string[] }
  for (const f of readdirSync('src/migrations').filter((n) => n.endsWith('.ts') && n !== 'index.ts')) {
    const up = readFileSync(`src/migrations/${f}`, 'utf8').split('export async function down')[0]
    for (const m of up.matchAll(/CREATE TABLE(?: IF NOT EXISTS)? "([^"]+)"/g)) names.table.push(m[1])
    for (const m of up.matchAll(/CREATE TYPE "public"\."([^"]+)"/g)) names.type.push(m[1])
    for (const m of up.matchAll(/CREATE (?:UNIQUE )?INDEX(?: IF NOT EXISTS)? "([^"]+)"/g)) names.index.push(m[1])
  }
  for (const [kind, list] of Object.entries(names)) {
    assert.ok(list.length > 0, `${kind} names found`)
    for (const n of list) assert.ok(n.length <= 63, `${kind} ${n} is ${n.length} characters`)
    assert.equal(new Set(list).size, list.length, `${kind} names are unique`)
  }
})
