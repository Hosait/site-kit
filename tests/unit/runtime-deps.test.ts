import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

// The seed route imports a plan in production: it validates it (ajv) and turns HTML into rich
// text (jsdom). They must be dependencies, not something the build happens to trace along.
test('what the seed route needs at runtime is a dependency', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { dependencies: Record<string, string>; devDependencies: Record<string, string> }
  for (const name of ['ajv', 'jsdom']) {
    assert.ok(pkg.dependencies[name], `${name} in dependencies`)
    assert.ok(!pkg.devDependencies[name], `${name} not in devDependencies`)
  }
})
