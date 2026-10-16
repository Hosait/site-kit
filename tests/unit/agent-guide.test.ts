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
  for (const m of guide.matchAll(/site-builder (\w+)/g)) if (m[1] !== 'install') assert.ok(['assess', 'crawl', 'extract', 'theme', 'report'].includes(m[1]), m[1])
  for (const f of ['seed/site-plan.json', 'schema/site-plan.schema.json', 'schema/blocks.schema.json', 'site/questions.json', 'site/config.ts', 'site/theme.json'])
    assert.ok(guide.includes(f), f)
})

test('step 0 checks that the site fits before anything is set up or read: red stops, yellow asks', () => {
  const at = guide.indexOf('## 0.')
  assert.ok(at !== -1 && at < guide.indexOf('## 1.') && at < guide.indexOf('site-builder crawl'))
  const step0 = guide.slice(at, guide.indexOf('## 1.')).replace(/\s+/g, ' ')
  assert.match(step0, /pnpm site-builder assess /)
  assert.match(step0, /assess\.md/)
  assert.match(step0, /\*\*red\*\*.*exits 3.*stop/)
  assert.match(step0, /Do not offer to move part of the site/)
  assert.match(step0, /\*\*yellow\*\*.*ask them to accept the scope and the storage/)
  assert.match(step0, /\*\*green\*\*: go on to step 1/)
})

test('CLAUDE.md scopes the staff-only rules to the Hosait/site-kit repository itself', () => {
  const claude = readFileSync('CLAUDE.md', 'utf8')
  assert.match(claude.split('\n').slice(0, 12).join('\n'), /AGENTS\.md/)
  assert.match(claude, /Hosait\/site-kit/)
})

test('step 7 points only where the user can look, protects the admin, and walks the domain move', () => {
  const step7 = guide.slice(guide.indexOf('## 7.')).replace(/\s+/g, ' ')
  assert.doesNotMatch(step7, /\/next\/seed\/status/)
  assert.match(step7, /right after the first deploy/i)
  assert.match(step7, /\/next\/admin-claim\?code=/)
  assert.doesNotMatch(step7, /lets anyone create one/)
  assert.match(step7, /Settings → Domains/)
  assert.match(step7, /Serve the site here/)
  assert.match(step7, /Nothing to set/)
  assert.doesNotMatch(step7, /sets the variable `SITE_ORIGINS`/)
  assert.match(step7, /commit and push/i)
})

test('step 7 says how a failed seed runs again and where its reason is, and that Office files go into seed/', () => {
  const step7 = guide.slice(guide.indexOf('## 7.')).replace(/\s+/g, ' ')
  assert.match(step7, /Run seed again/)
  assert.match(step7, /log/i)
  assert.doesNotMatch(step7, /push, and it runs again/)
  const step5 = guide.slice(guide.indexOf('## 5.'), guide.indexOf('## 6.')).replace(/\s+/g, ' ')
  assert.match(step5, /Office/)
})

test('step 5 says which files come from seed/, as documents, and that SVG is not imported', () => {
  const step5 = guide.slice(guide.indexOf('## 5.'), guide.indexOf('## 6.')).replace(/\s+/g, ' ')
  assert.match(step5, /Office files.*download them into `seed\/media\/` and list them under `documents`/)
  assert.match(step5, /SVG is not imported/)
  assert.match(step5, /public\/brand\//)
  assert.doesNotMatch(step5, /and SVG cannot be imported from a URL/)
})

test('step 7 says how an import cut off after the first admin is recovered', () => {
  const step7 = guide.slice(guide.indexOf('## 7.')).replace(/\s+/g, ' ')
  assert.match(step7, /Testinnhold/)
})
