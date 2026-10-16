import assert from 'node:assert/strict'
import fs from 'node:fs'
import { test } from 'node:test'

const read = (rel) => JSON.parse(fs.readFileSync(new URL(rel, import.meta.url), 'utf8'))
const pkg = read('../package.json')
const lock = read('../package-lock.json')

test('the package has the repository\'s licence', () => {
  assert.match(fs.readFileSync(new URL('../../../LICENSE', import.meta.url), 'utf8'), /^MIT License/)
  assert.equal(pkg.license, 'MIT')
})

// html.js extends htmlparser2's Parser and uses its internal fields (stack, foreignContext,
// attribs, tagname), so a new version is taken on purpose, never through a range.
test('htmlparser2 is pinned to the exact version installed', () => {
  assert.match(pkg.dependencies.htmlparser2, /^\d+\.\d+\.\d+$/)
  assert.equal(lock.packages[''].dependencies.htmlparser2, pkg.dependencies.htmlparser2)
  assert.equal(lock.packages['node_modules/htmlparser2'].version, pkg.dependencies.htmlparser2)
})
