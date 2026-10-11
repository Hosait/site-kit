import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

import { serve } from './server.js'

const run = promisify(execFile)
const BIN = fileURLToPath(new URL('../bin/site-builder.js', import.meta.url))

test('crawl, extract, theme and report run end to end from the command line', async () => {
  const s = await serve({ '/': { body: '<html lang="en"><head><title>Home</title><style>body{color:#222;background:#fff}</style></head><body><main><h1>Hi</h1><p>Text</p></main></body></html>' } })
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-'))
  try {
    await run('node', [BIN, 'crawl', s.url + '/', '--out', out, '--allow-private'])
    for (const cmd of ['extract', 'theme', 'report']) await run('node', [BIN, cmd, '--out', out, ...(cmd === 'theme' ? ['--allow-private'] : [])])
    for (const f of ['inventory.json', 'urls.json', 'extract.json', 'theme.draft.json', 'report.md']) assert.ok(fs.existsSync(path.join(out, f)), f)
  } finally { await s.close() }
})

test('an unknown command prints the help and exits 2', async () => {
  await assert.rejects(run('node', [BIN, 'fly']), (e) => e.code === 2 && /site-builder <command>/.test(e.stdout + e.stderr))
})
