import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { localFileProblem, resolveLocalFile } from '../../src/lib/site-plan/local-file'

// A plan's local media must be ordinary files inside the plan's folder: a symbolic link that
// points elsewhere would otherwise be uploaded as public media.
function folder() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'local-file-'))
  const seed = path.join(root, 'seed')
  fs.mkdirSync(path.join(seed, 'media'), { recursive: true })
  fs.writeFileSync(path.join(seed, 'media', 'hero.jpg'), 'jpg')
  fs.writeFileSync(path.join(root, 'outside.txt'), 'secret')
  fs.symlinkSync(path.join(root, 'outside.txt'), path.join(seed, 'media', 'logo.jpg'))
  fs.symlinkSync(path.join(seed, 'media', 'hero.jpg'), path.join(seed, 'media', 'alias.jpg'))
  fs.mkdirSync(path.join(seed, 'media', 'dir.jpg'))
  return { root, seed }
}

test('an ordinary file inside the folder resolves, also through a link that stays inside', async () => {
  const { seed } = folder()
  assert.equal(await resolveLocalFile(seed, 'media/hero.jpg'), fs.realpathSync(path.join(seed, 'media', 'hero.jpg')))
  assert.equal(await resolveLocalFile(seed, 'media/alias.jpg'), fs.realpathSync(path.join(seed, 'media', 'hero.jpg')))
})

test('a link that points out of the folder, a path with .., a directory and a missing file are refused', async () => {
  const { seed } = folder()
  await assert.rejects(resolveLocalFile(seed, 'media/logo.jpg'), /media\/logo\.jpg: outside the plan's folder/)
  await assert.rejects(resolveLocalFile(seed, '../outside.txt'), /outside the plan's folder/)
  await assert.rejects(resolveLocalFile(seed, 'media/dir.jpg'), /not a regular file/)
  await assert.rejects(resolveLocalFile(seed, 'media/none.jpg'), /not found/)
})

test('the plan folder itself may be reached through a link', async () => {
  const { root, seed } = folder()
  const link = path.join(root, 'seed-link')
  fs.symlinkSync(seed, link)
  assert.equal(await resolveLocalFile(link, 'media/hero.jpg'), fs.realpathSync(path.join(seed, 'media', 'hero.jpg')))
})

// Files from seed/ are checked by their first bytes like downloaded ones: media must be an image or
// a video, documents PDF, Office, zip or DWG. SVG is never imported (the logo goes in public/brand/).
test('a local file is accepted only if its first bytes are a type its collection allows', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'local-type-'))
  const file = (name: string, bytes: Buffer | string) => {
    fs.writeFileSync(path.join(dir, name), bytes)
    return path.join(dir, name)
  }
  const jpeg = file('photo.jpg', Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10]))
  const svg = file('logo.svg', '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"><script>x</script></svg>')
  const html = file('page.jpg', '<html><body>hi</body></html>')
  const pdf = file('guide.pdf', '%PDF-1.7\n')
  const docx = file('report.docx', Buffer.from('PK\x03\x04\x14\x00', 'latin1'))
  const doc = file('old.doc', Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))
  const dwg = file('plan.dwg', 'AC1032\x00\x00')

  assert.equal(await localFileProblem('media', jpeg, 'media/photo.jpg'), null)
  assert.match(String(await localFileProblem('media', svg, 'media/logo.svg')), /media\/logo\.svg: SVG is not imported.*public\/brand\//)
  assert.match(String(await localFileProblem('media', html, 'media/page.jpg')), /media\/page\.jpg: not an allowed file type for media/)
  assert.match(String(await localFileProblem('media', pdf, 'media/guide.pdf')), /not an allowed file type for media/)
  for (const [f, name] of [[pdf, 'guide.pdf'], [docx, 'report.docx'], [doc, 'old.doc'], [dwg, 'plan.dwg']]) {
    assert.equal(await localFileProblem('documents', f, `media/${name}`), null, name)
  }
  assert.match(String(await localFileProblem('documents', html, 'media/page.jpg')), /not an allowed file type for documents/)
  assert.match(String(await localFileProblem('documents', jpeg, 'media/photo.jpg')), /not an allowed file type for documents/)
  assert.match(String(await localFileProblem('documents', svg, 'media/logo.svg')), /SVG is not imported/)
})
