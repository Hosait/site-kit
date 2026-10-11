import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * Grunnleggende kvalitetskrav for alle tre nettsteder: forsiden svarer, har én h1,
 * meny som virker på mobil, hreflang/canonical, og ingen WCAG 2.1 AA-feil (axe).
 */
const SITES = ['industri', 'sbs', 'dws'] as const
const LOCALES = ['no', 'en'] as const

for (const site of SITES) {
  for (const locale of LOCALES) {
    test.describe(`${site} /${locale}`, () => {
      test('forsiden virker og er tilgjengelig', async ({ page }) => {
        const res = await page.goto(`/${locale}?site=${site}`)
        expect(res?.status()).toBe(200)
        await expect(page.locator('h1')).toHaveCount(1)
        await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
        await expect(page.locator('html')).toHaveAttribute('lang', locale === 'no' ? 'nb' : 'en')

        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
        const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
        expect(serious.map((v) => `${v.id}: ${v.nodes.length} – ${v.help}`)).toEqual([])
      })

      test('menyen åpner og lukker', async ({ page, isMobile }) => {
        await page.goto(`/${locale}?site=${site}`)
        if (isMobile) {
          const open = page.getByRole('button', { name: locale === 'no' ? 'Meny' : 'Menu' })
          // Klikk før React har koblet på knappen (treg dev-server under last) gjør ingenting; prøv igjen.
          await expect(async () => {
            await open.click()
            await expect(page.locator('#mobile-menu')).toBeVisible({ timeout: 1000 })
          }).toPass({ timeout: 10_000 })
          await page.keyboard.press('Escape')
          await expect(page.locator('#mobile-menu')).toBeHidden()
        } else {
          await expect(page.getByRole('navigation', { name: locale === 'no' ? 'Hovedmeny' : 'Main menu' }).first()).toBeVisible()
        }
      })
    })
  }
}

test('sitemap og robots per domene', async ({ request }) => {
  for (const site of SITES) {
    const sitemap = await request.get(`/sitemap.xml?site=${site}`)
    expect(sitemap.status()).toBe(200)
    expect(await sitemap.text()).toContain('<urlset')
    const robots = await request.get(`/robots.txt?site=${site}`)
    expect(robots.status()).toBe(200)
  }
})
