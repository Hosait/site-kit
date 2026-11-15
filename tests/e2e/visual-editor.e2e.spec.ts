import path from 'node:path'

import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { DEFAULT_LOCALE, DEFAULT_SITE } from '../../src/lib/sites'

const IMAGE = path.resolve('tests/fixtures/media/hero.jpg')

async function signIn(page: Page, email = process.env.DEV_ADMIN_EMAIL!, password = process.env.DEV_ADMIN_PASSWORD!) {
  test.skip(!email || !password, 'run pnpm tsx scripts/dev-admin.ts first')
  await page.goto('/admin/login')
  await page.getByLabel(/e-post|email/i).fill(email)
  await page.getByLabel(/passord|password/i).fill(password)
  await page.getByRole('button', { name: /logg inn|login/i }).click()
  await page.getByRole('link', { name: /sider|pages/i }).first().waitFor({ timeout: 90_000 })
}

async function draftPage(page: Page, slug: string) {
  const res = await page.request.post(`/api/pages?locale=${DEFAULT_LOCALE}&draft=true`, {
    data: {
      title: `Visuell test ${slug}`,
      slug,
      site: DEFAULT_SITE,
      _status: 'draft',
      layout: [{ blockType: 'hero', variant: 'text', heading: 'Første overskrift', text: 'En ingress.' }],
    },
  })
  expect(res.ok()).toBeTruthy()
  return ((await res.json()) as { doc: { id: number } }).doc.id
}

test('the visual editor adds, moves and edits sections, replaces an image, saves a draft and publishes', async ({ page, browser }, info) => {
  test.skip(info.project.name !== 'desktop', 'the editor is checked on desktop')
  // The dev server compiles the admin and the page on first visit, which can take over a minute.
  test.setTimeout(240_000)
  await signIn(page)
  const slug = `visuell-${Date.now()}`
  const id = await draftPage(page, slug)
  const status = page.locator('header').getByRole('status')
  let mediaId: number | undefined

  try {
    await page.goto(`/admin/visual/pages/${id}`)
    const frame = page.frameLocator('iframe[title="Forhåndsvisning av siden"]')
    await expect(frame.getByRole('heading', { name: 'Første overskrift' })).toBeVisible({ timeout: 120_000 })

    // The editor has the page's sections before anything is added.
    await expect(page.getByRole('region', { name: 'Seksjoner på siden' }).getByRole('listitem')).toHaveCount(1)

    // Add: drag «Sitat» from the library onto the page, below the hero.
    const iframe = page.locator('iframe[title="Forhåndsvisning av siden"]')
    const box = (await iframe.boundingBox())!
    await page.locator('[data-block="quote"]').scrollIntoViewIfNeeded()
    const card = (await page.locator('[data-block="quote"]').boundingBox())!
    await page.mouse.move(card.x + card.width / 2, card.y + card.height / 2)
    await page.mouse.down()
    await page.mouse.move(card.x + card.width / 2 + 30, card.y + card.height / 2, { steps: 5 })
    await expect(page.getByTestId('vb-drop-layer')).toBeVisible()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height - 20, { steps: 10 })
    await page.mouse.up()
    await expect(frame.getByText('Et godt sitat fra en fornøyd kunde.')).toBeVisible({ timeout: 30_000 })
    const outline = page.getByRole('region', { name: 'Seksjoner på siden' }).getByRole('listitem')
    await expect(outline).toHaveCount(2)
    await expect(outline.nth(1)).toContainText('Sitat')

    // Reorder: the new section is selected; move it above the hero.
    await page.getByRole('toolbar', { name: 'Valgt seksjon' }).getByRole('button', { name: 'Flytt opp' }).click()
    await expect(outline.nth(0)).toContainText('Sitat')
    await expect(status).toHaveText('Utkast lagret', { timeout: 30_000 })

    // Edit text on the page: click the heading, replace it, press Enter.
    await expect(page.getByText('Oppdaterer forhåndsvisningen …')).toBeHidden()
    await frame.getByRole('heading', { name: 'Første overskrift' }).click()
    await page.keyboard.press('ControlOrMeta+A')
    await page.keyboard.type('Ny overskrift fra testen')
    await page.keyboard.press('Enter')
    await expect(status).toHaveText('Utkast lagret', { timeout: 30_000 })
    await expect(outline.nth(1)).toContainText('Ny overskrift fra testen')

    // Replace an image: the quote's portrait, from the settings panel.
    await outline.nth(0).getByRole('button', { name: /Sitat/ }).click()
    await page.getByLabel('Last opp nytt bilde: Portrett').setInputFiles(IMAGE)
    await expect(status).toHaveText('Utkast lagret', { timeout: 30_000 })
    await expect(frame.locator('[data-vb-block="0"] img')).toBeVisible({ timeout: 30_000 })
    const draft = await (await page.request.get(`/api/pages/${id}?draft=true&depth=0&locale=${DEFAULT_LOCALE}`)).json()
    mediaId = draft.layout[0].image
    expect(draft.layout.map((b: { blockType: string }) => b.blockType)).toEqual(['quote', 'hero'])
    expect(draft.layout[1].heading).toBe('Ny overskrift fra testen')
    expect(typeof mediaId).toBe('number')

    // Undo and redo the image.
    await page.getByRole('button', { name: 'Angre' }).click()
    await expect(status).toHaveText('Utkast lagret', { timeout: 30_000 })
    await page.getByRole('button', { name: 'Gjør om' }).click()
    await expect(status).toHaveText('Utkast lagret', { timeout: 30_000 })

    // The mobile preview is narrow.
    await page.getByRole('button', { name: 'Mobil' }).click()
    await expect.poll(async () => (await iframe.boundingBox())?.width).toBeLessThan(400)
    await page.getByRole('button', { name: 'Stor skjerm' }).click()

    // A draft is not public.
    const visitor = await (await browser.newContext()).newPage()
    expect((await visitor.goto(`/${DEFAULT_LOCALE}/${slug}`))?.status()).toBe(404)

    // The editor's own UI meets WCAG 2.1 AA (the page in the frame is checked by pnpm qa:axe).
    const axe = await new AxeBuilder({ page }).exclude('iframe').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])

    // Publish; the public page shows the same sections, text and image.
    await page.getByRole('button', { name: 'Publiser' }).click()
    await expect(status).toHaveText('Publisert', { timeout: 30_000 })
    await expect(async () => {
      expect((await visitor.goto(`/${DEFAULT_LOCALE}/${slug}`))?.status()).toBe(200)
    }).toPass({ timeout: 20_000 })
    await expect(visitor.getByRole('heading', { name: 'Ny overskrift fra testen' })).toBeVisible()
    const html = await visitor.content()
    expect(html.indexOf('Et godt sitat fra en fornøyd kunde.')).toBeGreaterThan(-1)
    expect(html.indexOf('Et godt sitat fra en fornøyd kunde.')).toBeLessThan(html.indexOf('Ny overskrift fra testen'))
    await expect(visitor.locator('main img[src*="/api/media/file/hero"]').first()).toBeVisible()
    await visitor.context().close()
  } finally {
    await page.request.delete(`/api/pages/${id}`)
    if (mediaId) await page.request.delete(`/api/media/${mediaId}`)
  }
})

test('«Enkel modus» opens pages in the visual editor, and the form is one click away', async ({ page, browser }, info) => {
  test.skip(info.project.name !== 'desktop', 'the editor is checked on desktop')
  test.setTimeout(180_000)
  await signIn(page)
  const id = await draftPage(page, `enkel-${Date.now()}`)
  // A user of its own: changing the admin other tests sign in as would end their sessions.
  const email = `enkel-${Date.now()}@site.localhost`
  const password = `Enkel-${Date.now()}-modus`
  const res = await page.request.post('/api/users', { data: { email, password, name: 'Enkel modus', role: 'editor', simpleMode: true } })
  expect(res.ok(), await res.text()).toBeTruthy()
  const userId = ((await res.json()) as { doc: { id: number } }).doc.id
  const simple = await (await browser.newContext()).newPage()
  try {
    await signIn(simple, email, password)
    await simple.goto(`/admin/collections/pages/${id}`)
    await simple.waitForURL(new RegExp(`/admin/visual/pages/${id}$`), { timeout: 90_000 })
    await simple.getByRole('link', { name: 'Avansert redigering' }).click()
    await simple.waitForURL(new RegExp(`/admin/collections/pages/${id}\\?form=1$`))
    await expect(simple.getByRole('link', { name: 'Visuell redigering' })).toBeVisible({ timeout: 60_000 })
    await simple.waitForTimeout(1500)
    expect(simple.url()).toContain('form=1')
  } finally {
    await simple.context().close()
    await page.request.delete(`/api/users/${userId}`)
    await page.request.delete(`/api/pages/${id}`)
  }
})
