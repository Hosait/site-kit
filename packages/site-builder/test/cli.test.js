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

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'cli-'))
const exitCode = (p) => p.then(() => 0, (e) => e.code)
const nb = (body) => ({ body: `<html lang="nb"><head><title>Side</title></head><body>${body}</body></html>` })

test('assess, crawl, extract, theme and report run end to end from the command line', async () => {
  const s = await serve({ '/': { body: '<html lang="en"><head><title>Home</title><style>body{color:#222;background:#fff}</style></head><body><main><h1>Hi</h1><p>Text</p><a href="/about">About</a></main></body></html>' }, '/about': { body: '<html lang="en"><head><title>About</title></head><body><main><p>Us</p></main></body></html>' } })
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-'))
  try {
    await run('node', [BIN, 'assess', s.url + '/', '--out', out, '--allow-private'])
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
  const green = await serve({ '/': { body: '<html lang="en"><head><title>Home</title></head><body><main><p>Hello</p><a href="/about">About</a></main></body></html>' }, '/about': { body: '<html lang="en"><head><title>About</title></head><body><main><p>Us</p></main></body></html>' } })
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

test('crawl refuses to start without a fit check, and names the command to run', async () => {
  await assert.rejects(run('node', [BIN, 'crawl', 'http://127.0.0.1:9/', '--out', tmp(), '--allow-private']), (e) => e.code === 3 && /site-builder assess/.test(e.stderr))
})

test('after red crawl refuses even with --accepted-scope; after yellow it needs --accepted-scope', async () => {
  const red = await serve({ '/': nb('<form action="/login"><input type="password"></form><a href="/om">Om</a>'), '/om': nb('<p>Om</p>') })
  const pdfs = Array.from({ length: 150 }, (_, i) => `<a href="/filer/${i}.pdf">PDF</a>`).join(' ')
  const yellow = await serve({ '/': nb(`${pdfs} <a href="/om">Om</a>`), '/om': nb('<p>Om oss</p>') })
  const [redOut, yellowOut] = [tmp(), tmp()]
  try {
    assert.equal(await exitCode(run('node', [BIN, 'assess', red.url + '/', '--out', redOut, '--allow-private'])), 3)
    for (const extra of [[], ['--accepted-scope']]) assert.equal(await exitCode(run('node', [BIN, 'crawl', red.url + '/', '--out', redOut, '--allow-private', ...extra])), 3)
    assert.equal(await exitCode(run('node', [BIN, 'assess', yellow.url + '/', '--out', yellowOut, '--allow-private'])), 0)
    assert.equal(JSON.parse(fs.readFileSync(path.join(yellowOut, 'assess.json'), 'utf8')).class, 'yellow')
    await assert.rejects(run('node', [BIN, 'crawl', yellow.url + '/', '--out', yellowOut, '--allow-private']), (e) => e.code === 3 && /--accepted-scope/.test(e.stderr))
    await run('node', [BIN, 'crawl', yellow.url + '/', '--out', yellowOut, '--allow-private', '--accepted-scope'])
    assert.ok(fs.existsSync(path.join(yellowOut, 'inventory.json')))
  } finally { await red.close(); await yellow.close() }
})

// The customer's limits: set on assess, kept in assess.json, used by crawl.
test('assess takes the customer\'s limits; crawl uses them from assess.json and refuses its own', async () => {
  const s = await serve({ '/': nb('<p>Hei</p><a href="/om">Om</a> <a href="/intranett">Intern</a>'), '/om': nb('<p>Om oss</p>'), '/intranett': nb('<p>Intern</p>') })
  const out = tmp()
  try {
    assert.equal(await exitCode(run('node', [BIN, 'assess', s.url + '/', '--out', out, '--allow-private', '--exclude', '/intranett', '--without-member-area'])), 0)
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(out, 'assess.json'), 'utf8')).scope, { exclude: ['/intranett'], withoutMemberArea: true })
    for (const own of [['--exclude', '/om'], ['--without-member-area']]) {
      await assert.rejects(run('node', [BIN, 'crawl', s.url + '/', '--out', out, '--allow-private', ...own]), (e) => e.code === 2 && /assess\.json/.test(e.stderr), own.join(' '))
    }
    const before = s.requests.length
    await run('node', [BIN, 'crawl', s.url + '/', '--out', out, '--allow-private'])
    assert.ok(!s.requests.slice(before).some((r) => r.startsWith('/intranett')), JSON.stringify(s.requests.slice(before)))
    assert.equal(JSON.parse(fs.readFileSync(path.join(out, 'inventory.json'), 'utf8')).leftOut, 1)
  } finally { await s.close() }
})

// Steinar's decision on #31: a member area is never opened, and the site is still declined.
test('with --without-member-area a site with a member area is still red, and its login pages are never opened', async () => {
  const s = await serve({ '/': nb('<p>Hei</p><a href="/om">Om</a> <a href="/min-side">Min side</a>'), '/om': nb('<p>Om oss</p>'), '/min-side': nb('<form action="/login"><input type="password"></form>') })
  try {
    assert.equal(await exitCode(run('node', [BIN, 'assess', s.url + '/', '--out', tmp(), '--allow-private', '--without-member-area'])), 3)
    assert.ok(!s.requests.some((r) => /^\/(min-side|login)/.test(r)), JSON.stringify(s.requests))
  } finally { await s.close() }
})

test('an --exclude that is not a path on the site is a usage error', async () => {
  for (const v of [['intranett'], ['/'], ['/a/../b'], [''], ['/produkter']]) {
    await assert.rejects(run('node', [BIN, 'assess', 'http://localhost/', '--exclude', ...v]), (e) => e.code === 2 && /exclude/.test(e.stderr), v[0])
  }
  await assert.rejects(run('node', [BIN, 'assess', 'http://localhost/', '--exclude']), (e) => e.code === 2 && /exclude/.test(e.stderr), 'no value')
})
