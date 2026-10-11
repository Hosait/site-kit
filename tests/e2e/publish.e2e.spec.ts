import { expect, test } from '@playwright/test'

test('an editor drafts and publishes an article; drafts stay private', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the admin is checked on desktop')
  // The dev server compiles the admin editor on first visit, which can take over a minute.
  test.setTimeout(180_000)
  const email = process.env.DEV_ADMIN_EMAIL!
  const password = process.env.DEV_ADMIN_PASSWORD!
  test.skip(!email || !password, 'run pnpm tsx scripts/dev-admin.ts first')
  await page.goto('/admin/login')
  await page.getByLabel(/e-post|email/i).fill(email)
  await page.getByLabel(/passord|password/i).fill(password)
  await page.getByRole('button', { name: /logg inn|login/i }).click()
  // Let the sign-in finish its own redirect to the dashboard before navigating on.
  await page.getByRole('link', { name: /artikler|articles/i }).first().waitFor({ timeout: 90_000 })
  await page.goto('/admin/collections/articles/create')
  await page.waitForURL(/\/admin\/collections\/articles\/(create|\d+)/)
  const title = `E2E ${Date.now()}`
  const titleField = page.getByLabel(/tittel|title/i).first()
  await titleField.waitFor({ timeout: 90_000 })
  await titleField.fill(title)
  // Drafts autosave (no save button); wait until the editor says it saved.
  await expect(page.getByText(/lagret|saved/i).first()).toBeVisible({ timeout: 30_000 })

  // A draft is visible in preview, never on the public site.
  // Preview: the editor links to the draft through the preview route. (Watching the draft render
  // in Payload's preview panel is checked by hand on the live demo; the panel state is per user.)
  await expect(page.getByRole('link', { name: /^(forhåndsvisning|preview)$/i }).first()).toHaveAttribute('href', /\/next\/preview\?path=/, { timeout: 30_000 })
  const visitor = await page.context().browser()!.newPage()
  await visitor.goto(new URL('/no', page.url()).toString())
  await expect(visitor.getByText(title)).toHaveCount(0)
  await visitor.close()

  await page.getByRole('button', { name: /publiser|publish/i }).first().click()
  await expect(page.getByText(/publisert|published/i).first()).toBeVisible()
  await expect(async () => {
    await page.goto('/no')
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 2000 })
  }).toPass({ timeout: 20_000 })
})
