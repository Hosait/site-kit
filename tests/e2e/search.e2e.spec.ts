import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * Søket på tvers av nettstedene: søkesiden, filtre, PDF-innhold, forslag i headeren og WCAG.
 * Forutsetter innholdet fra seed/ og en bygd søkeindeks.
 */

test('søkesiden finner innhold fra alle nettsteder og er tilgjengelig', async ({ page }) => {
  const res = await page.goto('/no/sok?q=fixade&site=industri')
  expect(res?.status()).toBe(200)
  await expect(page.locator('h1')).toHaveText('Søk')
  await expect(page.getByRole('status').first()).toContainText('treff for «fixade»')
  // Søker fra industri, men Fixade hører til SBS: filteret viser SBS-treff.
  const sbsFilter = page.getByRole('navigation', { name: 'Nettsted' }).getByRole('link', { name: /Spilka Building Solutions/ })
  await expect(sbsFilter).toBeVisible()
  await expect(page.locator('ol > li').first()).toBeVisible()

  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(serious.map((v) => `${v.id}: ${v.nodes.length} – ${v.help}`)).toEqual([])
})

test('tekst inne i PDF-er er søkbar', async ({ page }) => {
  await page.goto('/no/sok?q=monteringsanvisning&kind=document')
  const first = page.locator('ol > li').first()
  await expect(first).toContainText('PDF')
  await expect(first.locator('a').first()).toHaveAttribute('href', /\.pdf$/)
})

test('engelsk søkeside og omdirigering fra feil språk', async ({ page }) => {
  await page.goto('/en/sok?q=window')
  await expect(page).toHaveURL(/\/en\/search\?q=window/)
  await expect(page.locator('h1')).toHaveText('Search')
})

test('ingen treff gir hjelpetekst', async ({ page }) => {
  await page.goto('/no/sok?q=qqzzxxyy')
  await expect(page.getByRole('status').first()).toContainText('Ingen treff')
})

test('forslag i headeren og Enter til søkesiden', async ({ page }) => {
  await page.goto('/no?site=dws')
  await page.getByRole('button', { name: 'Åpne søk' }).click()
  const input = page.getByRole('searchbox', { name: 'Søk på alle Spilka-nettstedene' })
  await expect(input).toBeFocused()
  await input.fill('fixade')
  await expect(page.locator('#site-search [data-suggestion]').first()).toBeVisible()
  await input.press('Enter')
  await expect(page).toHaveURL(/\/no\/sok\?q=fixade/)
})

test('søke-API-et avviser manglende parametre', async ({ request }) => {
  expect((await request.get('/next/search?q=test')).status()).toBe(400)
  const ok = await request.get('/next/search?q=fixade&locale=no&current=sbs')
  expect(ok.status()).toBe(200)
  expect((await ok.json()).total).toBeGreaterThan(0)
})
