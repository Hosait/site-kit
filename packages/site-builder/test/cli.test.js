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

test('a --budget that is not a positive number is a usage error', async () => {
  for (const v of ['abc', '0', '-5', '']) await assert.rejects(run('node', [BIN, 'crawl', 'http://localhost/', '--budget', v]), (e) => e.code === 2 && /--budget/.test(e.stderr), v)
})

test('a --max that is not a positive whole number is a usage error', async () => {
  for (const v of ['abc', '0', '-1', '2.5', '']) await assert.rejects(run('node', [BIN, 'crawl', 'http://localhost/', '--max', v]), (e) => e.code === 2 && /--max/.test(e.stderr), v)
})

test('assess writes assess.json and assess.md, exits 0 for a green site and 3 for a red one', async () => {
  const green = await serve({ '/': { body: '<html lang="en"><head><title>Home</title></head><body><main><p>Hello</p></main></body></html>' } })
  const red = await serve({ '/': { body: '<html><body><form action="/login"><input type="password"></form></body></html>' } })
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-'))
  try {
    const { stdout } = await run('node', [BIN, 'assess', green.url + '/', '--out', out, '--allow-private'])
    assert.match(stdout, /GREEN/)
    for (const f of ['assess.json', 'assess.md']) assert.ok(fs.existsSync(path.join(out, f)), f)
    await assert.rejects(run('node', [BIN, 'assess', red.url + '/', '--out', out, '--allow-private']), (e) => e.code === 3 && /RED/.test(e.stdout))
    assert.equal(JSON.parse(fs.readFileSync(path.join(out, 'assess.json'), 'utf8')).class, 'red')
  } finally { await green.close(); await red.close() }
})

test('assess refuses a private address without --allow-private, and checks --max-pages and --budget', async () => {
  await assert.rejects(run('node', [BIN, 'assess', 'http://localhost/', '--out', fs.mkdtempSync(path.join(os.tmpdir(), 'cli-'))]), (e) => e.code === 1 && /--allow-private/.test(e.stderr))
  for (const v of ['abc', '0', '-1', '2.5', '']) await assert.rejects(run('node', [BIN, 'assess', 'http://localhost/', '--max-pages', v]), (e) => e.code === 2 && /--max-pages/.test(e.stderr), v)
  for (const v of ['abc', '0']) await assert.rejects(run('node', [BIN, 'assess', 'http://localhost/', '--budget', v]), (e) => e.code === 2 && /--budget/.test(e.stderr), v)
  await assert.rejects(run('node', [BIN, 'assess']), (e) => e.code === 2 && /assess needs a URL/.test(e.stderr))
})
