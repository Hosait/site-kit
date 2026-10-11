import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

// Migrations are history: they must not read site/config.ts or app code that changes with it.
test('migrations are frozen SQL, not live config', () => {
  for (const f of readdirSync('src/migrations').filter((n) => n.endsWith('.ts') && n !== 'index.ts')) {
    const s = readFileSync(`src/migrations/${f}`, 'utf8')
    assert.ok(!/from '\.\.\/lib\//.test(s) && !/from '@\//.test(s), `${f} imports app code`)
  }
})
