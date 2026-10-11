import assert from 'node:assert/strict'
import { test } from 'node:test'

import { billableMinutes, summarise } from '../../scripts/kit/ci-minutes'

const job = (start: string | null, end: string | null, labels = ['ubuntu-latest']) => ({ started_at: start, completed_at: end, labels })

test('GitHub rounds each job up to a whole minute', () => {
  assert.deepEqual(billableMinutes(job('2026-10-11T10:00:00Z', '2026-10-11T10:00:01Z')), { os: 'linux', minutes: 1 })
  assert.deepEqual(billableMinutes(job('2026-10-11T10:00:00Z', '2026-10-11T10:02:01Z')), { os: 'linux', minutes: 3 })
})

test('a job that never started costs nothing (the billing block of 11 Oct)', () => {
  assert.equal(billableMinutes(job(null, '2026-10-11T10:00:03Z')).minutes, 0)
  assert.equal(billableMinutes(job('2026-10-11T10:00:03Z', '2026-10-11T10:00:03Z')).minutes, 0)
})

test('minutes are kept per OS, never converted with old multipliers', () => {
  const s = summarise([
    job('2026-10-11T10:00:00Z', '2026-10-11T10:04:30Z'),
    job('2026-10-11T10:00:00Z', '2026-10-11T10:01:00Z', ['macos-14']),
  ])
  assert.deepEqual(s, { linux: 5, windows: 0, macos: 1 })
})
