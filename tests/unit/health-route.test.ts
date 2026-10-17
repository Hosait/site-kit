import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

// Payload starts its job timer (the nightly pruning of form submissions) only where it is
// loaded with cron: true. The health check runs every 30 s from boot, so a quiet site that
// nobody visits in the admin still prunes.
test('the health route loads Payload with its job timer, and the image checks health from boot', () => {
  const route = readFileSync('src/app/(payload)/api/health/route.ts', 'utf8')
  assert.match(route, /getPayload\(\{\s*config:\s*configPromise,\s*cron:\s*true\s*\}\)/)
  assert.match(readFileSync('Dockerfile', 'utf8'), /HEALTHCHECK[^\n]*\/api\/health/)
})
