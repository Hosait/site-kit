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

/* «Fri plassering» (Phase 9). In this file so its sign-ins never overlap the tests above:
   Payload rewrites a user's whole session list on each sign-in, so parallel sign-ins can drop one. */

const item = (kind: string, place: { x: number; y: number; w: number; h: number }, extra: Record<string, unknown> = {}) => ({ kind, ...place, ...extra })

/** The visible freeform elements in DOM order, as text (shapes have none). */
const visibleOrder = (p: Page) =>
  p.locator('.ff-grid > .ff-item').evaluateAll((els) => els.filter((el) => getComputedStyle(el).display !== 'none' && el.textContent?.trim()).map((el) => el.textContent!.trim()))

test('«Fri plassering»: place, move and resize on the grid, by pointer and keyboard, then publish', async ({ page, browser }, info) => {
  test.skip(info.project.name !== 'desktop', 'the editor is checked on desktop')
  test.setTimeout(240_000)
  await signIn(page)
  const slug = `fri-${Date.now()}`
  const created = await page.request.post(`/api/pages?locale=${DEFAULT_LOCALE}&draft=true`, {
    data: {
      title: `Fri plassering ${slug}`,
      slug,
      site: DEFAULT_SITE,
      _status: 'draft',
      layout: [
        {
          blockType: 'freeform',
          rowHeight: 'm',
          items: [
            item('text', { x: 1, y: 1, w: 6, h: 2 }, { text: 'Overskrift fri', textStyle: 'heading' }),
            item('text', { x: 1, y: 3, w: 6, h: 2 }, { text: 'Brødtekst fri' }),
            item('button', { x: 7, y: 1, w: 3, h: 1 }, { link: { type: 'custom', url: '/', label: 'Knapp fri', appearance: 'primary' } }),
            item('shape', { x: 7, y: 2, w: 6, h: 4 }, { shapeColor: 'tint', hideOnMobile: true }),
          ],
        },
      ],
    },
  })
  expect(created.ok(), await created.text()).toBeTruthy()
  const id = ((await created.json()) as { doc: { id: number } }).doc.id
  const status = page.locator('header').getByRole('status')
  const draft = async () => {
    const doc = await (await page.request.get(`/api/pages/${id}?draft=true&depth=0&locale=${DEFAULT_LOCALE}`)).json()
    return doc.layout[0].items as { kind: string; text?: string; x: number; y: number; w: number; h: number; mobileOrder?: number | null }[]
  }
  const settled = async () => {
    await expect(status).toHaveText('Utkast lagret', { timeout: 30_000 })
    await expect(page.getByText('Oppdaterer forhåndsvisningen …')).toBeHidden()
  }

  try {
    await page.goto(`/admin/visual/pages/${id}`)
    const frame = page.frameLocator('iframe[title="Forhåndsvisning av siden"]')
    await expect(frame.getByRole('heading', { name: 'Overskrift fri' })).toBeVisible({ timeout: 120_000 })
    await page.getByRole('region', { name: 'Seksjoner på siden' }).getByRole('button', { name: /^1\. Fri plassering/ }).click()
    const grip = page.getByRole('button', { name: 'Flytt Tekst 1: Overskrift fri', exact: true })
    await expect(grip).toBeVisible()

    // The grid's column step in the editor's coordinates (the frame is not scaled).
    const step = await frame.locator('.ff-grid').evaluate((g) => {
      const cs = getComputedStyle(g)
      const gap = parseFloat(cs.columnGap)
      return { col: (g.getBoundingClientRect().width - 11 * gap) / 12 + gap, row: parseFloat(cs.gridAutoRows) + parseFloat(cs.rowGap) }
    })
    const drag = async (name: string, dx: number, dy: number) => {
      const b = (await page.getByRole('button', { name, exact: true }).boundingBox())!
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
      await page.mouse.down()
      await page.mouse.move(b.x + b.width / 2 + dx / 2, b.y + b.height / 2 + dy / 2, { steps: 4 })
      await page.mouse.move(b.x + b.width / 2 + dx, b.y + b.height / 2 + dy, { steps: 4 })
      await page.mouse.up()
      await settled()
    }

    // Move by pointer: two columns right.
    await drag('Flytt Tekst 1: Overskrift fri', step.col * 2, 0)
    // Resize by pointer: one column wider and one row taller.
    await drag('Endre størrelse på Tekst 2: Brødtekst fri', step.col, step.row)
    let items = await draft()
    expect(items[0]).toMatchObject({ x: 3, y: 1, w: 6, h: 2 })
    expect(items[1]).toMatchObject({ x: 1, y: 3, w: 7, h: 3 })

    // Place a new element, then move and resize it with the keyboard.
    await page.getByRole('complementary', { name: 'Innstillinger' }).getByRole('button', { name: 'Tekst', exact: true }).click()
    await settled()
    const newGrip = page.getByRole('button', { name: 'Flytt Tekst 5: Ny tekst', exact: true })
    await newGrip.focus()
    await page.keyboard.press('ArrowRight')
    await settled()
    await expect(newGrip).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await settled()
    await page.keyboard.press('Shift+ArrowDown')
    await settled()
    items = await draft()
    expect(items[4]).toMatchObject({ kind: 'text', text: 'Ny tekst', x: 3, y: 6, w: 6, h: 3 })

    // Mobile order: the body text moves up two places, above the button.
    for (let n = 0; n < 2; n++) {
      await page.getByRole('button', { name: 'Flytt Tekst 2: Brødtekst fri opp på mobil' }).click()
      await settled()
    }

    // The editor's own UI meets WCAG 2.1 AA with the grid handles showing.
    const axeEditor = await new AxeBuilder({ page }).exclude('iframe').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    expect(axeEditor.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])

    await page.getByRole('button', { name: 'Publiser' }).click()
    await expect(status).toHaveText('Publisert', { timeout: 30_000 })

    // The public page: elements at their grid cells on a large screen …
    const visitor = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
    await expect(async () => {
      expect((await visitor.goto(`/${DEFAULT_LOCALE}/${slug}`))?.status()).toBe(200)
    }).toPass({ timeout: 20_000 })
    const area = (text: string) =>
      visitor.locator('.ff-item', { hasText: text }).evaluate((el) => {
        const cs = getComputedStyle(el)
        return `${cs.gridRowStart} / ${cs.gridColumnStart} / ${cs.gridRowEnd} / ${cs.gridColumnEnd}`
      })
    expect(await area('Overskrift fri')).toBe('1 / 3 / span 2 / span 6')
    expect(await area('Brødtekst fri')).toBe('3 / 1 / span 3 / span 7')
    expect(await area('Ny tekst')).toBe('6 / 3 / span 3 / span 6')

    // … and stacked in the mobile order on a phone, which is also the DOM (screen reader) order.
    await visitor.setViewportSize({ width: 390, height: 844 })
    expect(await visibleOrder(visitor)).toEqual(['Overskrift fri', 'Brødtekst fri', 'Knapp fri', 'Ny tekst'])
    await expect(visitor.locator('.ff-shape')).toBeHidden()

    // A demo freeform page passes axe and is usable by keyboard.
    await visitor.setViewportSize({ width: 1440, height: 900 })
    const axe = await new AxeBuilder({ page: visitor }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
    let reached = false
    for (let n = 0; n < 40 && !reached; n++) {
      await visitor.keyboard.press('Tab')
      reached = (await visitor.evaluate(() => document.activeElement?.textContent?.trim())) === 'Knapp fri'
    }
    expect(reached, 'the button is reachable with Tab').toBe(true)
    await visitor.context().close()
  } finally {
    await page.request.delete(`/api/pages/${id}`)
  }
})

test('saved sections («Lagrede seksjoner») show in the library and are inserted as a copy', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'the editor is checked on desktop')
  test.setTimeout(180_000)
  await signIn(page)
  const id = await draftPage(page, `lagret-${Date.now()}`)
  const name = `Lagret ${Date.now()}`
  const res = await page.request.post(`/api/sectionPresets?locale=${DEFAULT_LOCALE}`, {
    data: { name, site: DEFAULT_SITE, block: [{ blockType: 'cta', heading: 'Fra en lagret seksjon', text: 'Gjenbrukt tekst.' }] },
  })
  expect(res.ok(), await res.text()).toBeTruthy()
  const presetId = ((await res.json()) as { doc: { id: number } }).doc.id
  try {
    await page.goto(`/admin/visual/pages/${id}`)
    const outline = page.getByRole('region', { name: 'Seksjoner på siden' }).getByRole('listitem')
    await expect(outline).toHaveCount(1, { timeout: 120_000 })
    await page.getByRole('button', { name }).click()
    await expect(outline).toHaveCount(2)
    await expect(outline.nth(1)).toContainText('Fra en lagret seksjon')
    await expect(page.locator('header').getByRole('status')).toHaveText('Utkast lagret', { timeout: 30_000 })
    await expect(page.frameLocator('iframe[title="Forhåndsvisning av siden"]').getByRole('heading', { name: 'Fra en lagret seksjon' })).toBeVisible({ timeout: 30_000 })
    const draft = await (await page.request.get(`/api/pages/${id}?draft=true&depth=0&locale=${DEFAULT_LOCALE}`)).json()
    expect(draft.layout[1]).toMatchObject({ blockType: 'cta', heading: 'Fra en lagret seksjon' })
  } finally {
    await page.request.delete(`/api/sectionPresets/${presetId}`)
    await page.request.delete(`/api/pages/${id}`)
  }
})

test('an editor sends the page for approval from the visual editor; only publishers see «Publiser»', async ({ page, browser }, info) => {
  test.skip(info.project.name !== 'desktop', 'the editor is checked on desktop')
  test.setTimeout(180_000)
  await signIn(page)
  const id = await draftPage(page, `godkjenning-${Date.now()}`)
  const email = `redaktor-${Date.now()}@site.localhost`
  const password = `Redaktor-${Date.now()}-utkast`
  const res = await page.request.post('/api/users', { data: { email, password, name: 'Redaktør', role: 'editor' } })
  expect(res.ok(), await res.text()).toBeTruthy()
  const userId = ((await res.json()) as { doc: { id: number } }).doc.id
  const editor = await (await browser.newContext()).newPage()
  try {
    await signIn(editor, email, password)
    await editor.goto(`/admin/visual/pages/${id}`)
    const frame = editor.frameLocator('iframe[title="Forhåndsvisning av siden"]')
    await expect(frame.getByRole('heading', { name: 'Første overskrift' })).toBeVisible({ timeout: 120_000 })
    await expect(editor.getByRole('region', { name: 'Seksjoner på siden' }).getByRole('listitem')).toHaveCount(1)
    await expect(editor.getByRole('button', { name: 'Publiser' })).toHaveCount(0)
    await expect(frame.locator('[data-vb-text]').first()).toBeAttached()

    await frame.getByRole('heading', { name: 'Første overskrift' }).click()
    await editor.keyboard.press('ControlOrMeta+A')
    await editor.keyboard.type('Til godkjenning')
    await editor.keyboard.press('Enter')
    await editor.getByRole('button', { name: 'Send til godkjenning' }).click()
    const status = editor.locator('header').getByRole('status')
    await expect(status).toContainText('Sendt til godkjenning', { timeout: 30_000 })

    const doc = await (await page.request.get(`/api/pages/${id}?draft=true&depth=0&locale=${DEFAULT_LOCALE}`)).json()
    expect(doc.workflow).toBe('in-review')
    expect(doc.layout[0].heading, 'the pending edit was saved before sending').toBe('Til godkjenning')
    expect(doc._status).toBe('draft')
  } finally {
    await editor.context().close()
    await page.request.delete(`/api/users/${userId}`)
    await page.request.delete(`/api/pages/${id}`)
  }
})
