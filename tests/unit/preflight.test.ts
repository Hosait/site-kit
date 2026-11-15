import assert from 'node:assert/strict'
import { test } from 'node:test'

import { atLeast, preflight, report } from '../../scripts/kit/preflight.mjs'

type Env = Parameters<typeof preflight>[0]

// A machine where everything is in place; each test breaks one thing.
const env = (over: Partial<Env> = {}): Env => ({
  nodeVersion: '22.11.0',
  minNode: '20.18.1',
  pnpmMajors: [9, 10, 11],
  run: (cmd) => (cmd === 'pnpm' ? '10.33.0' : 'ok'),
  exists: () => true,
  chromium: async () => '/cache/ms-playwright/chromium/chrome',
  ...over,
})

const row = async (e: Env, name: string) => {
  const r = (await preflight(e)).find((x) => x.name === name)
  assert.ok(r, `no row ${name}`)
  return r
}

test('versions are compared as numbers, not as text', () => {
  assert.equal(atLeast('20.18.1', '20.18.1'), true)
  assert.equal(atLeast('20.18.0', '20.18.1'), false)
  assert.equal(atLeast('20.9.0', '20.18.1'), false)
  assert.equal(atLeast('22.0.0', '20.18.1'), true)
  assert.equal(atLeast('v24.1.0', '20.18.1'), true)
})

test('a machine with everything passes, with exit code 0', async () => {
  const rows = await preflight(env())
  assert.deepEqual(rows.map((r) => r.name), ['Node.js', 'pnpm', 'git', 'Docker', 'Site Kit packages', 'site-builder', 'Chromium for Playwright'])
  assert.ok(rows.every((r) => r.ok))
  const { text, code } = report(rows)
  assert.equal(code, 0)
  assert.match(text, /All set/)
})

test('an old Node is the user\'s to fix, and names the version needed', async () => {
  const r = await row(env({ nodeVersion: '18.19.0' }), 'Node.js')
  assert.equal(r.ok, false)
  assert.equal(r.who, 'user')
  assert.match(r.fix ?? '', /20\.18\.1/)
})

test('pnpm missing or too old is found', async () => {
  const missing = await row(env({ run: (cmd) => (cmd === 'pnpm' ? null : 'ok') }), 'pnpm')
  assert.equal(missing.ok, false)
  const old = await row(env({ run: (cmd) => (cmd === 'pnpm' ? '8.15.0' : 'ok') }), 'pnpm')
  assert.equal(old.ok, false)
  assert.match(old.detail, /8\.15\.0/)
})

test('Docker: not installed and not running get different fixes', async () => {
  const absent = await row(env({ run: (cmd) => (cmd === 'docker' ? null : cmd === 'pnpm' ? '10.33.0' : 'ok') }), 'Docker')
  assert.equal(absent.ok, false)
  assert.match(absent.fix ?? '', /Install Docker/)
  const stopped = await row(
    env({ run: (cmd, args) => (cmd === 'docker' && args[0] === 'info' ? null : cmd === 'pnpm' ? '10.33.0' : 'ok') }),
    'Docker',
  )
  assert.equal(stopped.ok, false)
  assert.match(stopped.fix ?? '', /Start Docker/)
  assert.equal(stopped.who, 'user')
})

test('missing packages are the agent\'s to install, and Chromium waits for them instead of failing', async () => {
  const e = env({ exists: (p) => !p.startsWith('node_modules'), chromium: async () => null })
  const kit = await row(e, 'Site Kit packages')
  assert.equal(kit.ok, false)
  assert.equal(kit.who, 'agent')
  assert.equal(kit.fix, 'pnpm install')
  const chrome = await row(e, 'Chromium for Playwright')
  assert.equal(chrome.ok, false)
  assert.match(chrome.detail, /packages first/)
})

test('site-builder and Chromium each name their own install command', async () => {
  const sb = await row(env({ exists: (p) => !p.startsWith('packages/site-builder') }), 'site-builder')
  assert.equal(sb.fix, 'pnpm site-builder:install')
  const chrome = await row(env({ exists: (p) => !p.startsWith('/cache/ms-playwright') }), 'Chromium for Playwright')
  assert.equal(chrome.fix, 'pnpm exec playwright install chromium')
  assert.equal(chrome.who, 'agent')
})

test('the report exits 1 and splits what the agent runs from what the user must do', async () => {
  const rows = await preflight(env({ nodeVersion: '18.0.0', exists: (p) => !p.startsWith('packages/site-builder') }))
  const { text, code } = report(rows)
  assert.equal(code, 1)
  assert.match(text, /MISSING\s+Node\.js/)
  assert.match(text, /Ask the user to:[\s\S]*Node\.js/)
  assert.match(text, /Run yourself:[\s\S]*pnpm site-builder:install/)
  assert.match(text, /run the check again/)
})
