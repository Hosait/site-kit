import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { localFileProblem, resolveLocalFile } from '../../src/lib/site-plan/local-file'

// A plan's local media must be ordinary files inside the plan's folder: a symbolic link that
// points elsewhere would otherwise be uploaded as public media.

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

test('an ordinary file inside the folder resolves, also through a link that stays inside', links, async () => {
  const { seed } = folder()
  assert.equal(await resolveLocalFile(seed, 'media/hero.jpg'), fs.realpathSync(path.join(seed, 'media', 'hero.jpg')))
  assert.equal(await resolveLocalFile(seed, 'media/alias.jpg'), fs.realpathSync(path.join(seed, 'media', 'hero.jpg')))
})

test('a link that points out of the folder, a path with .., a directory and a missing file are refused', links, async () => {
  const { seed } = folder()
  await assert.rejects(resolveLocalFile(seed, 'media/logo.jpg'), /media\/logo\.jpg: outside the plan's folder/)
  await assert.rejects(resolveLocalFile(seed, '../outside.txt'), /outside the plan's folder/)
  await assert.rejects(resolveLocalFile(seed, 'media/dir.jpg'), /not a regular file/)
  await assert.rejects(resolveLocalFile(seed, 'media/none.jpg'), /not found/)
})

test('the plan folder itself may be reached through a link', links, async () => {
  const { root, seed } = folder()
  const link = path.join(root, 'seed-link')
  fs.symlinkSync(seed, link)
  assert.equal(await resolveLocalFile(link, 'media/hero.jpg'), fs.realpathSync(path.join(seed, 'media', 'hero.jpg')))
})

// Files from seed/ are checked by their type, read from the file (never its name) the way Payload
// reads it, against the collection's own list, so a plan the check passes is one the import takes.
// SVG is never imported (the logo goes in public/brand/).
const fixture = (name: string) => path.resolve('tests/fixtures/files', name)

test('a local file passes when its collection takes the type read from the file', async () => {
  const photo = path.resolve('tests/fixtures/media/hero.jpg')
  assert.equal(await localFileProblem('media', photo, 'media/hero.jpg'), null)
  for (const name of ['guide.pdf', 'report.docx', 'old.xls', 'files.zip', 'plan.dwg']) {
    assert.equal(await localFileProblem('documents', fixture(name), `media/${name}`), null, name)
  }
  assert.match(String(await localFileProblem('media', fixture('logo.svg'), 'media/logo.svg')), /media\/logo\.svg: SVG is not imported.*public\/brand\//)
  assert.match(String(await localFileProblem('documents', fixture('logo.svg'), 'media/logo.svg')), /SVG is not imported/)
  assert.match(String(await localFileProblem('media', fixture('guide.pdf'), 'media/guide.pdf')), /not an allowed file type for media/)
  assert.match(String(await localFileProblem('media', fixture('notes.txt'), 'media/notes.txt')), /not an allowed file type for media/)
  assert.match(String(await localFileProblem('documents', fixture('notes.txt'), 'media/notes.txt')), /not an allowed file type for documents/)
  assert.match(String(await localFileProblem('documents', fixture('text.odt'), 'media/text.odt')), /not an allowed file type for documents/)
  assert.match(String(await localFileProblem('documents', photo, 'media/hero.jpg')), /not an allowed file type for documents/)
})

test('every type the check takes is one the collection itself accepts', async () => {
  const { fileTypeFromFile } = await import('file-type')
  const { validateMimeType } = await import('payload/shared')
  const { DOCUMENT_MIME_TYPES, MEDIA_MIME_TYPES } = await import('../../src/lib/upload-types')
  const photo = await fileTypeFromFile(path.resolve('tests/fixtures/media/hero.jpg'))
  assert.ok(photo && validateMimeType(photo.mime, MEDIA_MIME_TYPES))
  for (const name of ['guide.pdf', 'report.docx', 'old.xls', 'files.zip', 'plan.dwg']) {
    const type = await fileTypeFromFile(fixture(name))
    assert.ok(type && validateMimeType(type.mime, DOCUMENT_MIME_TYPES), `${name}: ${type?.mime}`)
  }
})
