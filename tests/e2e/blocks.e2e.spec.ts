import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { t } from '../../src/lib/i18n'
import { DEFAULT_LOCALE } from '../../src/lib/sites'

/**
 * The demo page (seed/site-plan.json, page «blocks») by keyboard: tabs, carousel and accordion
 * work without a mouse, and the page is accessible and does not scroll sideways.
 */
const path = DEFAULT_LOCALE === 'no' ? '/no/blokker' : '/en/blocks'
const s = t(DEFAULT_LOCALE)

test.beforeEach(async ({ page }) => {
  await page.goto(path)
  // Hydration comes first; keys sent before it do nothing on a slow dev server.
  await page.waitForLoadState('networkidle')
})

test('tabs: arrows, Home and End move and select; one tab is in the tab order', async ({ page }) => {
  const tabs = page.getByRole('tab')
  await expect(tabs).toHaveCount(3)
  await tabs.first().focus()
  await page.keyboard.press('ArrowRight')
  await expect(tabs.nth(1)).toBeFocused()
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel')).toHaveCount(1) // the others are hidden
  await page.keyboard.press('End')
  await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('ArrowRight') // wraps
  await expect(tabs.first()).toBeFocused()
  await page.keyboard.press('Home')
  await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('[role=tab][tabindex="0"]')).toHaveCount(1)
})

test('carousel: buttons and keys change slide, and it does not move by itself', async ({ page }) => {
  const carousel = page.locator('[aria-roledescription=carousel]')
  const shown = () => carousel.locator('[aria-roledescription=slide]:not([hidden])')
  await expect(carousel.locator('[aria-roledescription=slide]')).toHaveCount(3)
  await expect(shown()).toHaveAttribute('aria-label', `${s.carouselSlide} 1 ${s.of} 3`)
  await page.waitForTimeout(3500)
  await expect(shown()).toHaveAttribute('aria-label', `${s.carouselSlide} 1 ${s.of} 3`) // no autoplay by default
  const next = carousel.getByRole('button', { name: s.carouselNext })
  await next.focus()
  await page.keyboard.press('Enter')
  await expect(shown()).toHaveAttribute('aria-label', `${s.carouselSlide} 2 ${s.of} 3`)
  await page.keyboard.press('ArrowRight')
  await expect(shown()).toHaveAttribute('aria-label', `${s.carouselSlide} 3 ${s.of} 3`)
  await page.keyboard.press('ArrowRight') // wraps
  await expect(shown()).toHaveAttribute('aria-label', `${s.carouselSlide} 1 ${s.of} 3`)
  await page.keyboard.press('ArrowLeft')
  await expect(shown()).toHaveAttribute('aria-label', `${s.carouselSlide} 3 ${s.of} 3`)
  await page.keyboard.press('Home')
  await expect(shown()).toHaveAttribute('aria-label', `${s.carouselSlide} 1 ${s.of} 3`)
})

test('accordion: Enter and Space open and close an item', async ({ page }) => {
  const first = page.locator('details').first()
  await first.locator('summary').focus()
  await page.keyboard.press('Enter')
  await expect(first).toHaveJSProperty('open', true)
  await page.keyboard.press('Space')
  await expect(first).toHaveJSProperty('open', false)
})

test('the demo page has no serious accessibility violations and does not scroll sideways', async ({ page }) => {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(serious.map((v) => `${v.id}: ${v.nodes.length} – ${v.help}`)).toEqual([])
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})
