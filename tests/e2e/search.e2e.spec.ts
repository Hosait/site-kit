import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { LOCALE_CONFIG, LOCALES } from '../../src/lib/sites'

/** Search over the demo content (seeded from examples/demo; the index is built on import). */
for (const locale of LOCALES) {
  test(`search finds demo content and is accessible (${locale})`, async ({ page }) => {
    const res = await page.goto(`/${locale}/${LOCALE_CONFIG[locale].searchSegment}?q=nordlys`)
    expect(res?.status()).toBe(200)
    await expect(page.locator('ol > li').first()).toBeVisible()
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(serious.map((v) => `${v.id}: ${v.nodes.length} – ${v.help}`)).toEqual([])
  })
}

test('no hits shows the help text', async ({ page }) => {
  await page.goto(`/no/${LOCALE_CONFIG.no.searchSegment}?q=qqzzxxyy`)
  await expect(page.getByRole('status').first()).toContainText('Ingen treff')
})
