import { expect, test } from '@playwright/test'

import { SITE_CONFIG } from '../../src/lib/sites'

test('before consent: no other hosts, no visitor cookie; with stats-without-consent off, no beacon', async ({ page, context, baseURL }) => {
  const own = new URL(baseURL!).host
  const foreign: string[] = []
  const beacons: string[] = []
  page.on('request', (r) => {
    const u = new URL(r.url())
    if (!u.protocol.startsWith('http')) return
    if (u.host !== own && !u.host.endsWith('s3.hosait.com')) foreign.push(r.url())
    if (u.pathname === '/next/a') beacons.push(r.url())
  })
  await page.goto('/no')
  await page.waitForLoadState('networkidle')
  expect(foreign).toEqual([])
  const cookies = await context.cookies()
  expect(cookies.find((c) => c.name === `${SITE_CONFIG.cookiePrefix}-vid`)).toBeUndefined()
  expect(beacons).toEqual([])
})

test('accepting statistics sets the visitor cookie', async ({ page, context }) => {
  await page.goto('/no')
  await page.getByRole('button', { name: /godta alle|accept all/i }).click()
  await page.reload()
  await page.waitForLoadState('networkidle')
  const cookies = await context.cookies()
  expect(cookies.find((c) => c.name === `${SITE_CONFIG.cookiePrefix}-vid`)).toBeDefined()
})
