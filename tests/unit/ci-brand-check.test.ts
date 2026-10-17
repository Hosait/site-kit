import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

// The CI step "A brand change in site/config.ts needs no migration" changes the brand with this perl line.
const step = readFileSync('.github/workflows/ci.yml', 'utf8').split('- name: A brand change')[1] ?? ''
const perl = step.split('\n').map((line) => line.trim()).find((line) => line.startsWith('perl '))

test('the CI brand check changes the brand only, not other country keys', () => {
  assert.ok(perl, 'no perl line in the CI brand step')
  const dir = mkdtempSync(path.join(tmpdir(), 'brand-check-'))
  mkdirSync(path.join(dir, 'site'))
  const file = path.join(dir, 'site', 'config.ts')
  writeFileSync(file, [
    'export const siteConfig = {',
    "  contact: { country: 'NO' },",
    "  brand: { name: 'Demo', legalName: 'Demo AS', orgNumber: '000', country: 'NO' },",
    "  sites: { main: { country: 'NO' } },",
    '}',
  ].join('\n'))
  execFileSync('bash', ['-c', perl ?? ''], { cwd: dir })
  const out = readFileSync(file, 'utf8')
  assert.match(out, /brand: \{ name: 'Demo', legalName: 'Drift Check AS', orgNumber: '000', country: 'SE' \}/)
  assert.match(out, /contact: \{ country: 'NO' \}/)
  assert.match(out, /main: \{ country: 'NO' \}/)
})

// Bjørn's review: the step passed when only one of the two values changed, so a brand default in
// the database for the other one would go unnoticed.
test('the CI brand check fails unless it changed both the legal name and the country', () => {
  const run = (brand: string) => {
    const dir = mkdtempSync(path.join(tmpdir(), 'brand-check-'))
    mkdirSync(path.join(dir, 'site'))
    writeFileSync(path.join(dir, 'site', 'config.ts'), ['export const siteConfig = {', `  ${brand}`, "  contact: { country: 'NO' },", '}'].join('\n'))
    try {
      execFileSync('bash', ['-c', perl ?? ''], { cwd: dir, stdio: 'pipe' })
      return true
    } catch {
      return false
    }
  }
  assert.equal(run("brand: { name: 'Demo', legalName: 'Demo AS', country: 'NO' },"), true)
  assert.equal(run("brand: { name: 'Demo', legalName: 'Demo AS' },"), false, 'no country in the brand')
  assert.equal(run("brand: { name: 'Demo', country: 'NO' },"), false, 'no legal name in the brand')
})
