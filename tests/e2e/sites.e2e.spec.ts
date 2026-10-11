import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { t } from '../../src/lib/i18n'
import { HREFLANG, LOCALES, SINGLE_SITE, SITE_KEYS } from '../../src/lib/sites'

/**
 * Basic quality for every site and locale: the home page answers, has one h1, a working menu,
 * canonical and lang, and no serious WCAG 2.1 AA violations (axe).
 */
const q = (site: string) => (SINGLE_SITE ? '' : `?site=${site}`)

for (const site of SITE_KEYS) {
  for (const locale of LOCALES) {
    test.describe(`${site} /${locale}`, () => {
      test('home page works and is accessible', async ({ page }) => {
        const res = await page.goto(`/${locale}${q(site)}`)
        expect(res?.status()).toBe(200)
        await expect(page.locator('h1')).toHaveCount(1)
        await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
        await expect(page.locator('html')).toHaveAttribute('lang', HREFLANG[locale])
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
        const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
        expect(serious.map((v) => `${v.id}: ${v.nodes.length} – ${v.help}`)).toEqual([])
      })

      test('menu opens and closes', async ({ page, isMobile }) => {
        await page.goto(`/${locale}${q(site)}`)
        const s = t(locale)
        if (isMobile) {
          const open = page.getByRole('button', { name: s.menu })
          // A click before React has hydrated does nothing on a slow dev server; try again.
          await expect(async () => {
            await open.click()
            await expect(page.locator('#mobile-menu')).toBeVisible({ timeout: 1000 })
          }).toPass({ timeout: 10_000 })
          await page.keyboard.press('Escape')
          await expect(page.locator('#mobile-menu')).toBeHidden()
        } else {
          await expect(page.getByRole('navigation', { name: s.mainNav }).first()).toBeVisible()
        }
      })
    })
  }
}

test('sitemap and robots per site', async ({ request }) => {
  for (const site of SITE_KEYS) {
    const sitemap = await request.get(`/sitemap.xml${q(site)}`)
    expect(sitemap.status()).toBe(200)
    expect(await sitemap.text()).toContain('<urlset')
    expect((await request.get(`/robots.txt${q(site)}`)).status()).toBe(200)
  }
})

test('an old address redirects to its new page', async ({ request }) => {
  const res = await request.get('/gammel-side', { maxRedirects: 0 })
  expect([301, 308]).toContain(res.status())
  expect(res.headers().location).toMatch(/\/no\/om-oss$/)
})
