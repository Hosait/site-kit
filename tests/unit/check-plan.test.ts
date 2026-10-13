import assert from 'node:assert/strict'
import fs, { readFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { checkPlan } from '../../src/lib/site-plan/check'

const plan = () => JSON.parse(readFileSync('tests/fixtures/plan-minimal.json', 'utf8'))

// Windows allows symbolic links only with developer mode or as administrator.
const links = (() => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'can-link-'))
  try {
    fs.symlinkSync(dir, path.join(dir, 'link'))
    return { skip: false }
  } catch {
    return { skip: 'this system does not allow symbolic links' }
  }
})()

test('a valid plan with its files in place passes, with a summary', async () => {
  const r = await checkPlan(plan(), 'tests/fixtures')
  assert.deepEqual(r.errors, [])
  assert.equal(r.ok, true)
  assert.equal(r.summary.pages, plan().pages.length)
})

test('schema errors come back with their path', async () => {
  const p = plan()
  p.pages[0].layout.no[0].blockType = 'carousel3d'
  const r = await checkPlan(p, 'tests/fixtures')
  assert.equal(r.ok, false)
  assert.ok(r.errors.some((e) => e.includes('/pages/0/layout/no/0')))
})

test('a missing ref, a missing file, a path outside the folder and an http URL are all reported together', async () => {
  const p = plan()
  p.pages[0].parent = 'no-such-page'
  p.media[0].source = 'media/not-there.jpg'
  p.media.push({ ref: 'up', source: '../../package.json' }, { ref: 'plain', source: 'http://old.example/x.jpg' })
  const errors = (await checkPlan(p, 'tests/fixtures')).errors.join('\n')
  assert.match(errors, /missing page "no-such-page"/)
  assert.match(errors, /media\/not-there\.jpg does not exist/)
  assert.match(errors, /outside the plan's folder/)
  assert.match(errors, /only https URLs or files next to the plan/)
})

test('public https media are accepted without being fetched', async () => {
  const p = plan()
  p.media[0].source = 'https://old.example/hero.jpg'
  assert.equal((await checkPlan(p, 'tests/fixtures')).ok, true)
})

test('an absolute path is refused even when it points into the plan folder', async () => {
  const p = plan()
  const inside = p.media.find((m: { source: string }) => !/^https:/.test(m.source))
  inside.source = path.resolve('tests/fixtures', inside.source)
  const r = await checkPlan(p, 'tests/fixtures')
  assert.equal(r.ok, false)
  assert.match(r.errors.join('\n'), /use a path relative to the plan/)
})

// The check refuses what the import would refuse, so an agent learns it before media are uploaded.
test('media URLs the import would refuse are reported: another port, a private address', async () => {
  const p = plan()
  p.media.push(
    { ref: 'port', source: 'https://old.example:8443/x.jpg' },
    { ref: 'lan', source: 'https://10.0.0.5/x.jpg' },
    { ref: 'mapped', source: 'https://[::ffff:127.0.0.1]/x.jpg' },
  )
  const errors = (await checkPlan(p, 'tests/fixtures')).errors.join('\n')
  assert.match(errors, /port: .*only the standard https port/)
  assert.match(errors, /lan: .*10\.0\.0\.5 is a private address/)
  assert.match(errors, /mapped: .*is a private address/)
})

test('a symbolic link out of the plan folder is reported', links, async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-plan-'))
  fs.mkdirSync(path.join(root, 'seed', 'media'), { recursive: true })
  fs.copyFileSync('tests/fixtures/media/hero.jpg', path.join(root, 'seed', 'media', 'hero.jpg'))
  fs.writeFileSync(path.join(root, 'outside.txt'), 'x')
  fs.symlinkSync(path.join(root, 'outside.txt'), path.join(root, 'seed', 'media', 'logo.jpg'))
  const p = plan()
  p.media.push({ ref: 'logo', source: 'media/logo.jpg' })
  const errors = (await checkPlan(p, path.join(root, 'seed'))).errors.join('\n')
  assert.match(errors, /logo: media\/logo\.jpg is outside the plan's folder/)
})

test('duplicate refs, a parent cycle, a redirect without target and a missing default-language title are reported', async () => {
  const p = plan()
  p.media.push({ ...p.media[0] })
  p.pages.push({ ref: 'a', parent: 'b', title: { no: 'A' }, layout: {} }, { ref: 'b', parent: 'a', title: { no: 'B' }, layout: {} })
  p.redirects = [{ from: '/old' }]
  const r = await checkPlan(p, 'tests/fixtures')
  assert.equal(r.ok, false)
  assert.ok(r.errors.some((e) => e.startsWith('/redirects/0')), r.errors.join('\n'))
  const p2 = plan()
  p2.media.push({ ...p2.media[0] })
  p2.pages.push({ ref: 'a', parent: 'b', title: { no: 'A' }, layout: {} }, { ref: 'b', parent: 'a', title: { en: 'B' }, layout: {} })
  const errors = (await checkPlan(p2, 'tests/fixtures')).errors.join('\n')
  assert.match(errors, /\/media\/1\/ref duplicate/)
  assert.match(errors, /\/pages .*cycle/)
  assert.match(errors, /\/pages\/2\/title needs a title/)
})

test('a document or media URL of a type the import refuses (Office files, SVG) is reported with what to do', async () => {
  const p = plan()
  p.documents = [
    { ref: 'price', source: 'https://old.example/files/prisliste.docx', title: { no: 'Prisliste' }, docType: 'other' },
    { ref: 'list', source: 'https://old.example/files/list.csv', title: { no: 'Liste' }, docType: 'other' },
  ]
  p.media.push({ ref: 'logo', source: 'https://old.example/logo.svg' }, { ref: 'plain', source: 'https://cdn.example/image?id=7' })
  const errors = (await checkPlan(p, 'tests/fixtures')).errors.join('\n')
  assert.match(errors, /price: .*prisliste\.docx.*download it into seed\/media\/ and list it under documents/)
  assert.match(errors, /logo: .*logo\.svg.*SVG is not imported.*public\/brand\//)
  assert.match(errors, /list: .*list\.csv.*not a type Site Kit imports/)
  assert.doesNotMatch(errors, /plain:/, 'a URL without a file extension is left to the import, which reads the file type')
})

test('local files of a type the import refuses are reported, by their first bytes', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-plan-types-'))
  const media = path.join(root, 'seed', 'media')
  fs.mkdirSync(media, { recursive: true })
  fs.copyFileSync('tests/fixtures/media/hero.jpg', path.join(media, 'hero.jpg'))
  fs.writeFileSync(path.join(media, 'logo.svg'), '<svg xmlns="http://www.w3.org/2000/svg"></svg>')
  fs.writeFileSync(path.join(media, 'notes.txt'), 'plain text')
  fs.writeFileSync(path.join(media, 'report.docx'), Buffer.from('PK\x03\x04\x14\x00', 'latin1'))
  const p = plan()
  p.media.push({ ref: 'logo', source: 'media/logo.svg' })
  p.documents = [
    { ref: 'notes', source: 'media/notes.txt', title: { no: 'Notater' }, docType: 'other' },
    { ref: 'report', source: 'media/report.docx', title: { no: 'Rapport' }, docType: 'other' },
  ]
  const errors = (await checkPlan(p, path.join(root, 'seed'))).errors
  assert.equal(errors.length, 2, errors.join('\n'))
  assert.match(errors.join('\n'), /logo: media\/logo\.svg: SVG is not imported/)
  assert.match(errors.join('\n'), /notes: media\/notes\.txt: not an allowed file type for documents/)
})
