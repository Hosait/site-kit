import { expect, test, type Page } from '@playwright/test'

import { SITE_CONFIG } from '../../src/lib/sites'

/**
 * Cookie banner, consent and visit counting. Nothing optional is sent or stored before the visitor
 * chooses (statistics without consent is off by default); rejecting and withdrawing work; each page
 * counts once; the landing page counts when the visitor accepts; the admin reports are protected.
 * (Playwright's user agent says HeadlessChrome, so the server does not store these events.)
 */
const VID = `${SITE_CONFIG.cookiePrefix}-vid`
const CONSENT = `${SITE_CONFIG.cookiePrefix}-consent`
const cookieNames = async (page: Page) => (await page.context().cookies()).map((c) => c.name)

/** Events the tracker sends to /next/a (intercepted; they never reach the server). */
async function collectEvents(page: Page) {
  const events: Record<string, unknown>[] = []
  await page.route('**/next/a', async (route) => {
    try {
      events.push(JSON.parse(route.request().postDataBuffer()?.toString('utf8') ?? '{}'))
    } catch {}
    await route.fulfill({ status: 204 })
  })
  return events
}

test('before consent: no other hosts, no visitor cookie, no beacon', async ({ page, baseURL }) => {
  const own = new URL(baseURL!).host
  const foreign: string[] = []
  const events = await collectEvents(page)
  page.on('request', (r) => {
    const u = new URL(r.url())
    if (u.protocol.startsWith('http') && u.host !== own && !u.host.endsWith('s3.hosait.com')) foreign.push(r.url())
  })
  await page.goto('/no')
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('region', { name: 'Informasjonskapsler' })).toBeVisible()
  expect(foreign).toEqual([])
  expect(await cookieNames(page)).not.toContain(VID)
  expect(events).toEqual([])
})

test('accepting counts the landing page with its campaign, and later pages once each', async ({ page }) => {
  const events = await collectEvents(page)
  await page.goto('/no?utm_campaign=autumn')
  await page.getByRole('button', { name: 'Godta alle' }).click()
  expect(await cookieNames(page)).toContain(VID)
  await expect.poll(() => events.filter((e) => e.t === 'pageview').length).toBe(1)
  const landing = events.find((e) => e.t === 'pageview')!
  expect(landing).toMatchObject({ t: 'pageview', l: 'no', p: '/no' })
  expect(String(landing.q ?? '')).toContain('utm_campaign=autumn')
  await page.goto('/no/om-oss')
  await expect.poll(() => events.filter((e) => e.t === 'pageview').length).toBe(2)
  expect(events.filter((e) => e.t === 'pageview')[1]).toMatchObject({ p: '/no/om-oss', k: 'page' })
})

test('«Avvis valgfrie» remembers the choice without a visitor id and sends nothing', async ({ page }) => {
  const events = await collectEvents(page)
  await page.goto('/no')
  await page.getByRole('button', { name: 'Avvis valgfrie' }).click()
  await expect(page.getByRole('region', { name: 'Informasjonskapsler' })).toBeHidden()
  const cookies = await page.context().cookies()
  expect(cookies.find((c) => c.name === CONSENT)?.value).toMatch(/^v1\.0\./)
  expect(cookies.map((c) => c.name)).not.toContain(VID)
  await page.reload()
  await expect(page.getByRole('region', { name: 'Informasjonskapsler' })).toBeHidden()
  expect(events).toEqual([])
})

test('consent can be withdrawn from the footer', async ({ page }) => {
  await page.goto('/en')
  await page.getByRole('button', { name: 'Accept all' }).click()
  expect(await cookieNames(page)).toContain(VID)
  await page.getByRole('button', { name: 'Cookie settings' }).click()
  const banner = page.getByRole('region', { name: 'Cookies' })
  await expect(banner).toBeVisible()
  const stats = banner.getByRole('checkbox')
  await expect(stats).toBeChecked()
  await stats.uncheck()
  await banner.getByRole('button', { name: 'Save choices' }).click()
  await expect(banner).toBeHidden()
  expect(await cookieNames(page)).not.toContain(VID)
})

test('downloads are recorded with the link to the file', async ({ page }) => {
  const events = await collectEvents(page)
  await page.goto('/no/kontakt')
  await page.getByRole('button', { name: 'Godta alle' }).click()
  const link = page.locator('a[href*="/documents/"]').first()
  // Stop the download itself; recording happens before navigation.
  await link.evaluate((a) => a.addEventListener('click', (e) => e.preventDefault(), { once: true }))
  await link.click()
  await expect.poll(() => events.some((e) => e.t === 'download' && String(e.h).includes('/documents/'))).toBe(true)
})

test('the admin analytics and the CSV export need a sign-in', async ({ page, request }) => {
  await page.goto('/admin/analytics')
  await expect(page.getByText('Akkurat nå')).toHaveCount(0)
  expect((await request.get('/next/analytics/export?report=sider&days=7')).status()).toBe(403)
})

test('the beacon endpoint answers 204, also to other origins (which it ignores)', async ({ request }) => {
  const body = JSON.stringify({ t: 'pageview', s: 'main', p: '/no' })
  expect((await request.post('/next/a', { data: body, headers: { 'Content-Type': 'text/plain' } })).status()).toBe(204)
  expect((await request.post('/next/a', { data: body, headers: { 'Content-Type': 'text/plain', Origin: 'https://evil.example' } })).status()).toBe(204)
})
