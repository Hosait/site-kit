import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { resolveLocalFile } from '../../src/lib/site-plan/local-file'

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
