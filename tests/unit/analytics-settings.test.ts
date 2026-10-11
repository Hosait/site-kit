import assert from 'node:assert/strict'
import { test } from 'node:test'

import { AnalyticsSettings, revalidateStatsSettings } from '../../src/collections/Analytics'

test('changing the analytics settings clears cached pages (the tracker reads the setting at render)', async () => {
  const calls: unknown[][] = []
  await revalidateStatsSettings((...args: unknown[]) => void calls.push(args))
  assert.deepEqual(calls, [['/', 'layout']])
  assert.ok((AnalyticsSettings.hooks?.afterChange ?? []).length > 0)
})
