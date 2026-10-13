import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const guide = readFileSync('AGENTS.md', 'utf8')
const scripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts as Record<string, string>

test('every pnpm command in the builder\'s guide is a real script', () => {
  const used = [...guide.matchAll(/pnpm ([a-z][\w:-]*)/g)].map((m) => m[1]).filter((s) => !['install', 'exec'].includes(s))
  assert.ok(used.length > 5)
  for (const s of used) assert.ok(s in scripts, `pnpm ${s} is not in package.json`)
})

test('the guide uses only real site-builder commands and points at the shipped files', () => {
  for (const m of guide.matchAll(/site-builder (\w+)/g)) if (m[1] !== 'install') assert.ok(['crawl', 'extract', 'theme', 'report'].includes(m[1]), m[1])
  for (const f of ['seed/site-plan.json', 'schema/site-plan.schema.json', 'schema/blocks.schema.json', 'site/questions.json', 'site/config.ts', 'site/theme.json'])
    assert.ok(guide.includes(f), f)
})

test('CLAUDE.md scopes the staff-only rules to the Hosait/site-kit repository itself', () => {
  const claude = readFileSync('CLAUDE.md', 'utf8')
  assert.match(claude.split('\n').slice(0, 12).join('\n'), /AGENTS\.md/)
  assert.match(claude, /Hosait\/site-kit/)
})
