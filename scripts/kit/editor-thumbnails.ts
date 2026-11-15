/**
 * Pictures for the visual editor: one per block in the section library and one per layout option
 * (public/kit/editor/*.webp). Every block, with its starting content, is put on one temporary draft
 * page of the running dev server; each section is photographed and saved as a small WebP.
 *
 *   pnpm kit:editor-thumbnails            (every block)
 *   pnpm kit:editor-thumbnails freeform   (only the blocks named)
 *
 * Needs the dev server (BASE_URL, or http://localhost:$PORT), a local admin (DEV_ADMIN_EMAIL and
 * DEV_ADMIN_PASSWORD, from scripts/dev-admin.ts), PREVIEW_SECRET, and some images in the media library.
 * Run it again after adding or changing a block. The temporary page is deleted afterwards.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import dotenv from 'dotenv'
import { chromium } from '@playwright/test'
import sharp from 'sharp'

import { pageBlocks } from '../../src/blocks/configs'
import { CONSENT_COOKIE, CONSENT_VERSION, serializeConsent } from '../../src/lib/analytics/consent'
import { DEFAULT_LOCALE, DEFAULT_SITE, localePath } from '../../src/lib/sites'
import { imageLeaves } from '../../src/lib/visual-editor/leaves'
import { newBlock, withNewIds } from '../../src/lib/visual-editor/presets'
import { buildEditorConfig, newId, setAt, type EdField } from '../../src/lib/visual-editor/schema'

dotenv.config({ path: '.env.local' })
dotenv.config()

const BASE = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3100}`
const OUT = path.resolve('public/kit/editor')
const WIDTH = 320
const HEIGHT = 200

type Doc = Record<string, unknown>

async function api<T>(url: string, token: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${url}`, { ...init, headers: { 'content-type': 'application/json', Authorization: `JWT ${token}`, ...init.headers } })
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${url}: ${res.status} ${await res.text()}`)
  return (await res.json()) as T
}

const firstIds = async (collection: string, token: string, n: number, where = '') =>
  (await api<{ docs: { id: number }[] }>(`/api/${collection}?limit=${n}&depth=0${where}`, token).catch(() => ({ docs: [] }))).docs.map((d) => d.id)

/** Fills what a block needs to look like itself: images, relations, rows with images. */
async function fill(block: Doc, fields: EdField[], token: string, media: number[]): Promise<Doc> {
  let out = block
  for (const f of fields) {
    if (f.kind === 'relationship' && !Array.isArray(f.relationTo) && out[f.name] == null) {
      // A page with sub-pages, so «Undersider» has something to show.
      const ids =
        f.relationTo === 'pages'
          ? (await api<{ docs: { parent?: number | null }[] }>('/api/pages?limit=1&depth=0&where[parent][exists]=true', token)).docs.map((d) => d.parent!).filter(Boolean)
          : await firstIds(f.relationTo, token, 4)
      if (ids.length) out = { ...out, [f.name]: f.many ? ids : ids[0] }
    }
    if (f.kind === 'array' && Array.isArray(out[f.name]) && !(out[f.name] as Doc[]).length && f.fields.some((x) => x.kind === 'upload')) {
      out = { ...out, [f.name]: media.slice(0, 3).map((id) => ({ id: newId(), [f.fields.find((x) => x.kind === 'upload')!.name]: id })) }
    }
  }
  const cfg = buildEditorConfig(pageBlocks)
  imageLeaves(out, fields, cfg)
    .filter((l) => !l.media && l.path[0] !== 'section')
    .forEach((l, i) => (out = setAt(out, l.path, media[i % media.length])))
  return out
}

async function main() {
  const email = process.env.DEV_ADMIN_EMAIL
  const password = process.env.DEV_ADMIN_PASSWORD
  if (!email || !password || !process.env.PREVIEW_SECRET) throw new Error('Set DEV_ADMIN_EMAIL, DEV_ADMIN_PASSWORD and PREVIEW_SECRET (pnpm tsx scripts/dev-admin.ts).')
  const login = await fetch(`${BASE}/api/users/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password }) })
  const { token } = (await login.json()) as { token: string }
  if (!token) throw new Error(`Login failed at ${BASE}`)

  const media = await firstIds('media', token, 3, '&where[mimeType][like]=image&sort=-width')
  if (!media.length) throw new Error('The media library has no images; import a site plan first.')

  const cfg = buildEditorConfig(pageBlocks)
  const only = process.argv.slice(2)
  const shots: { file: string; block: Doc }[] = []
  for (const slug of cfg.library.filter((s) => !only.length || only.includes(s))) {
    const def = cfg.blocks[slug]
    const base = await fill(newBlock(slug, cfg), def.fields, token, media)
    shots.push({ file: `${slug}.webp`, block: base })
    for (const name of def.variants) {
      const field = def.fields.find((f) => f.name === name)
      if (field?.kind !== 'select') continue
      for (const o of field.options) shots.push({ file: `${slug}--${name}-${o.value}.webp`, block: { ...withNewIds(base), [name]: o.value } })
    }
  }

  const slug = `vb-thumbnails-${Date.now()}`
  const locale = DEFAULT_LOCALE
  const created = await api<{ doc: { id: number } }>(`/api/pages?locale=${locale}&draft=true`, token, {
    method: 'POST',
    body: JSON.stringify({ title: 'Bilder til visuell redigering (midlertidig)', slug, site: DEFAULT_SITE, layout: shots.map((s) => s.block), _status: 'draft' }),
  })
  const browser = await chromium.launch()
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })
    const host = new URL(BASE).hostname
    await context.addCookies([
      { name: 'payload-token', value: token, domain: host, path: '/' },
      { name: CONSENT_COOKIE, value: serializeConsent({ version: CONSENT_VERSION, statistics: false, id: 'editorthumbnails01', at: Date.now() }), domain: host, path: '/' },
    ])
    const page = await context.newPage()
    const params = new URLSearchParams({ path: localePath(locale, slug), site: DEFAULT_SITE, previewSecret: process.env.PREVIEW_SECRET })
    await page.goto(`${BASE}/next/preview?${params}`, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.querySelectorAll('img').forEach((img) => (img.loading = 'eager')))
    mkdirSync(OUT, { recursive: true })
    for (let i = 0; i < shots.length; i++) {
      const box = await page.evaluate(async (index) => {
        const marker = document.querySelector(`[data-vb-block="${index}"]`)
        const first = marker?.firstElementChild as HTMLElement | null
        if (!marker || !first) return null
        first.scrollIntoView({ block: 'start' })
        await Promise.all(Array.from(marker.querySelectorAll('img')).map((img) => (img.complete ? null : new Promise((r) => img.addEventListener('load', r, { once: true })))))
        const rects = Array.from(marker.children).map((c) => c.getBoundingClientRect()).filter((r) => r.height > 0)
        if (!rects.length) return null
        const top = Math.min(...rects.map((r) => r.top))
        const bottom = Math.max(...rects.map((r) => r.bottom))
        return { x: 0, y: top + window.scrollY, width: document.documentElement.clientWidth, height: Math.max(1, Math.min(bottom - top, 800)) }
      }, i)
      if (!box) {
        console.warn(`  (nothing rendered for ${shots[i].file})`)
        continue
      }
      const png = await page.screenshot({ clip: box, fullPage: true })
      const webp = await sharp(png).resize(WIDTH, HEIGHT, { fit: 'cover', position: 'top' }).webp({ quality: 60 }).toBuffer()
      writeFileSync(path.join(OUT, shots[i].file), webp)
      console.log(`  ${shots[i].file} (${Math.round(webp.length / 1024)} kB)`)
    }
  } finally {
    await browser.close()
    await api(`/api/pages/${created.doc.id}`, token, { method: 'DELETE' }).catch((e) => console.warn(String(e)))
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
