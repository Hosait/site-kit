import { expect, test, type Page } from '@playwright/test'

/**
 * Cookie-banner, samtykke og besøksregistrering. Sjekker at ingen samtykkepliktig
 * informasjonskapsel settes før valg, at avvisning og tilbaketrekking virker, at hver side
 * telles én gang, og at analysen i admin er tilgangsbeskyttet.
 * (Playwright har «HeadlessChrome» i User-Agent, så serveren lagrer ikke disse hendelsene.)
 */

const cookieNames = async (page: Page) => (await page.context().cookies()).map((c) => c.name)

/** Hendelsene sporingsskriptet sender til /next/a (avskjæres; når ikke serveren). */
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

test('banneret vises før valg, og ingen statistikk-informasjonskapsel settes', async ({ page }) => {
  await page.goto('/no?site=dws')
  const banner = page.getByRole('region', { name: 'Informasjonskapsler' })
  await expect(banner).toBeVisible()
  await expect(banner.getByRole('button', { name: 'Godta alle' })).toBeVisible()
  await expect(banner.getByRole('button', { name: 'Avvis valgfrie' })).toBeVisible()
  expect(await cookieNames(page)).not.toContain('spilka-vid')
})

test('«Avvis valgfrie» husker valget uten besøks-ID', async ({ page }) => {
  await page.goto('/no?site=dws')
  await page.getByRole('button', { name: 'Avvis valgfrie' }).click()
  await expect(page.getByRole('region', { name: 'Informasjonskapsler' })).toBeHidden()
  const cookies = await page.context().cookies()
  expect(cookies.find((c) => c.name === 'spilka-consent')?.value).toMatch(/^v1\.0\./)
  expect(cookies.map((c) => c.name)).not.toContain('spilka-vid')
  await page.reload()
  await expect(page.getByRole('region', { name: 'Informasjonskapsler' })).toBeHidden()
})

test('«Godta alle» setter besøks-ID, og samtykket kan trekkes tilbake fra bunnteksten', async ({ page }) => {
  await page.goto('/en?site=sbs')
  await page.getByRole('button', { name: 'Accept all' }).click()
  expect(await cookieNames(page)).toContain('spilka-vid')

  await page.getByRole('button', { name: 'Cookie settings' }).click()
  const banner = page.getByRole('region', { name: 'Cookies' })
  await expect(banner).toBeVisible()
  const stats = banner.getByRole('checkbox')
  await expect(stats).toBeChecked()
  await stats.uncheck()
  await banner.getByRole('button', { name: 'Save choices' }).click()
  await expect(banner).toBeHidden()
  expect(await cookieNames(page)).not.toContain('spilka-vid')
  expect((await page.context().cookies()).find((c) => c.name === 'spilka-consent')?.value).toMatch(/^v1\.0\./)
})

test('hver side telles én gang, med side-ID og produktgruppe', async ({ page }) => {
  const events = await collectEvents(page)
  await page.goto('/no?site=dws')
  await expect.poll(() => events.filter((e) => e.t === 'pageview').length).toBe(1)
  expect(events[0]).toMatchObject({ t: 'pageview', s: 'dws', l: 'no', p: '/no', k: 'page' })

  await page.getByRole('button', { name: 'Avvis valgfrie' }).click()
  await page.goto('/no/katalog/opus?site=dws')
  await expect.poll(() => events.filter((e) => e.t === 'pageview').length).toBe(2)
  const opus = events.filter((e) => e.t === 'pageview')[1]
  expect(opus).toMatchObject({ p: '/no/katalog/opus', k: 'page', g: 'Opus' })
  // Ingen søkeord eller andre parametre fra adressen sendes, bare kampanjeparametre.
  expect(String(opus.q ?? '')).not.toContain('site=')
})

test('nedlastinger registreres med lenken til fila', async ({ page }) => {
  const events = await collectEvents(page)
  await page.goto('/no/baerekraft?site=sbs')
  await page.getByRole('button', { name: 'Avvis valgfrie' }).click()
  const link = page.locator('a[href*="/api/documents/file/"]').first()
  // Hindrer selve nedlastingen; registreringen skjer før navigasjon.
  await link.evaluate((a) => a.addEventListener('click', (e) => e.preventDefault(), { once: true }))
  await link.click()
  await expect.poll(() => events.some((e) => e.t === 'download' && String(e.h).includes('/api/documents/file/'))).toBe(true)
})

test('besøksanalysen i admin og CSV-eksporten krever innlogging', async ({ page, request }) => {
  await page.goto('/admin/analytics')
  await expect(page.getByText('Akkurat nå')).toHaveCount(0)
  expect((await request.get('/next/analytics/export?report=sider&days=7')).status()).toBe(403)
})

test('mottaket svarer 204 og godtar ikke hendelser fra andre nettsteder', async ({ request }) => {
  const body = JSON.stringify({ t: 'pageview', s: 'dws', p: '/no' })
  expect((await request.post('/next/a', { data: body, headers: { 'Content-Type': 'text/plain' } })).status()).toBe(204)
  expect((await request.post('/next/a', { data: body, headers: { 'Content-Type': 'text/plain', Origin: 'https://evil.example' } })).status()).toBe(204)
})
