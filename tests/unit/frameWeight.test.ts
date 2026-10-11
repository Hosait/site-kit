import assert from 'node:assert/strict'
import { test } from 'node:test'

import { calculateFrameWeight } from '../../src/lib/frameWeight'

// Fasit regnet ut med formlene fra kalkulatoren på spilka-dws.com (Craft).
test('Classic 1200×1200 mm, 12 mm glass → 39,9 kg, S5', () => {
  const r = calculateFrameWeight('Classic', 1200, 1200, 12)
  assert.equal(r.status, 'ok')
  assert.equal(r.module, 'S5')
  assert.ok(Math.abs(r.totalKg - 39.856) < 0.01)
  assert.ok(Math.abs(r.frameKg - 6.48) < 0.001)
  assert.ok(Math.abs(r.glassAreaM2 - 1.048576) < 1e-6)
})

test('Classic over 1788 mm høyde er for høyt', () => {
  assert.equal(calculateFrameWeight('Classic', 1000, 1800, 4).status, 'too-high')
})

test('Opus A5 som blir for tung, går over til A5HD under 80 kg', () => {
  // 1500×1300, 16 mm: totalt ca. 70,3 kg > A5 (55 kg) men < 80 kg → A5HD
  const r = calculateFrameWeight('Opus', 1500, 1300, 16)
  assert.equal(r.module, 'A5HD')
})

test('Opus A4 som blir for tung (ingen HD-variant) gir «for tungt»', () => {
  const r = calculateFrameWeight('Opus', 2400, 1000, 12)
  assert.equal(r.status, 'too-heavy')
})

test('advarsel over 60 kg', () => {
  const r = calculateFrameWeight('Classic', 1500, 1500, 16)
  assert.equal(r.heavy, r.status === 'ok' && Math.round(r.totalKg) > 60)
})
