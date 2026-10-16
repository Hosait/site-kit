# Phase 2a — Site Kit ready for outsiders, and @hosait/site-builder — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Anyone's Claude (path 2) — and later Hosait's own job (path 1) — can read an existing
website with `@hosait/site-builder` and ship a Site Kit site whose first Hosait deploy imports
its content from `seed/site-plan.json`.

**Architecture:**
- **Site Kit (part A).** The plan importer moves into a library. It downloads media only over
  https, and only from public addresses. The seed route uses that library when
  `seed/site-plan.json` exists, so the SQL dump and a local Postgres are no longer needed to
  ship content. The plan schema file shows the site's own languages and block types. A
  machine-readable question list and an English builder's guide go with it.
- **`packages/site-builder` (part B).** A small standalone ESM package with one dependency
  (cheerio). Its commands are `crawl`, `extract`, `theme` and `report`, and it is run in this
  repo as `pnpm site-builder …`.

**Tech Stack:**
- Site Kit: Next.js 16.3.3 (App Router), Payload 3.90.2, Postgres 17, TypeScript, `tsx --test`.
- site-builder: Node ≥ 20 ESM JavaScript with JSDoc, `node --test`, cheerio 1.2.0.

**Spec:** Hosait repo `docs/superpowers/specs/2026-10-11-hosait-sites-design.md` (two-path
version, PR Hosait/hosait#246). Approved plan: `~/.claude/plans/bj-rn-has-ported-some-velvet-sparrow.md`.

**Scope ruling, recorded here:**
- **Moved to a follow-up plan (Phase 2b):**
  - The `prismic` importer needs Abler Nordic's read-only token, and the Phase 0 step that
    delivers it has not happened.
  - `compare` needs a deployed preview.
- **Waits for Bjørn's OK:** the licence, the public template flag and the npm publish. The
  package stays `"private": true` and `UNLICENSED` until then.

## Global Constraints

- **Node and package managers:** Node ≥ 20 (Docker uses 24). pnpm 10.33.0 for Site Kit; npm
  for `packages/site-builder`, which is **not** a pnpm workspace member and has its own
  `package-lock.json`.
- **Supply chain:** pin exact versions only, and only releases older than 1 day.
  `pnpm-workspace.yaml` already enforces this for pnpm (`minimumReleaseAge: 1440`). For npm,
  install with `--before=<a date 2 days ago>`.
- **Site Kit dependencies:** no new runtime dependencies. Media download uses `node:https`
  and `node:dns`.
- **site-builder dependencies:** exactly one, `"cheerio": "1.2.0"`.
- **Crawl politeness:**
  - Read robots.txt and obey it (longest match).
  - Same site only: the exact host, or its `www.`/apex twin.
  - At most 500 pages, at most 2 MB of HTML per page, and at most 2 MB of CSS in total.
  - Concurrency 2, with a 250 ms pause per worker.
  - User agent `HosaitSiteBuilder/0.1 (+https://hosait.com)`.
- **Address safety:**
  - Hosts that resolve to private, loopback, link-local, carrier-grade NAT, multicast or
    reserved addresses are refused by default. The check happens at connect time through a
    `lookup` function, so a second DNS answer cannot redirect it.
  - The only bypass is `allowPrivate: true` (`--allow-private` on the command line), for tests
    and local sites.
- **Site plan media:** https only, port 443, public addresses only, at most 3 redirects and
  25 MB per file. A refused download stops the import with an error that names the URL.
- **Language:** new code, comments and docs are in English. Existing Norwegian comments are
  left alone. The admin UI language is unchanged.
- **No deploys from this plan.** Site Kit's CLAUDE.md says: "Never deploy without an explicit
  OK from Steinar".
- **Commits:** end every commit message with
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **A plan whose media URL points at an internal address** (the plan was written by an AI
   from a hostile site) must stop the import with that URL in the error. Nothing may be
   fetched from inside the stack. Task 1 pins `localhost` → `EPRIVATE`, and Task 2 pins the
   error reaching `progress.error`.
2. **The seed `db` step called again while a plan import is still running** (Hosait's
   `seed.run` retried, or someone clicking the panel twice) must answer "already running" and
   never import twice. Task 2 pins that the running check comes before the content check.
3. **A sitemap index that lists itself, or loops between files,** must not hang the crawler.
   Task 6 pins it with a self-referencing index.
4. **A redirect to another host** must be recorded as a 301 and not followed. **http→https on
   the same host, and the `www`/apex twin,** count as the same site. Task 6 pins both.
5. **A page with no `<main>` or `<article>`,** where nav and footer hold most of the text, must
   give the largest block of paragraph text as its main content, without the nav or footer.
   Task 7 pins it.

---

## File structure

**Site Kit (part A)**

| File | Responsibility |
|---|---|
| `src/lib/site-plan/fetch-media.ts` (new) | `isPublicAddress`, `publicOnlyLookup`, `fetchMedia` — one safe https download |
| `src/lib/site-plan/import.ts` (new) | `importPlan(payload, plan, opts)` — the importer, moved out of the CLI |
| `scripts/kit/import-plan.ts` (modify) | thin CLI around `importPlan` |
| `src/lib/site-plan/seed-plan.ts` (new) | `seedSource`, `loadSeedPlan`, `runPlanSeed` |
| `src/app/(frontend)/next/seed/[step]/route.ts` (modify) | `db` step imports `seed/site-plan.json` in the background; `status` reports it |
| `seed/` (modify) | ships `site-plan.json` + `media/` instead of `content.sql.gz`, `sources.json`, `files/` |
| `hosait.json` (modify) | drops `seed.files` |
| `src/lib/site-plan/stamp-schema.ts` (new) | `stampSchema(schema, locales, blockTypes?)` |
| `src/lib/site-plan/validate.ts`, `scripts/kit/schema.ts` (modify) | use `stampSchema`; `kit:schema` also writes the stamped plan schema |
| `site/questions.json` (new), `src/lib/questions.ts` (new) | the intake questions and their checker |
| `AGENTS.md`, `CLAUDE.md`, `README.md` (modify) | the builder's guide; staff-only rules scoped |

**site-builder (part B)** — everything under `packages/site-builder/`:

| File | Responsibility |
|---|---|
| `package.json`, `package-lock.json`, `README.md` | standalone package, private until licensed |
| `src/net.js` | `isPublicAddress`, `publicOnlyLookup`, `get(url, opts)` |
| `src/robots.js` | `parseRobots(text, agent)` |
| `src/detect.js` | `detect.trackers/embeds/cms(html)` |
| `src/crawl.js` | `crawl(start, opts)` → `inventory.json`, `urls.json`, `raw/*.html` |
| `src/extract.js` | `extractPage(html, url)`, `extract(dir)` → `extract.json` |
| `src/theme.js` | colour maths, `themeFromCss`, `theme(dir, opts)` → `theme.draft.json` |
| `src/report.js` | `report(dir)` → `report.md` |
| `bin/site-builder.js` | the command line |
| `test/*.test.js` | `node --test` suites, with a local HTTP server as the fixture site |

**Wiring:** root `package.json` scripts, `.gitignore`, `.dockerignore`, `eslint.config.mjs`
ignores, and `.github/workflows/ci.yml`.

---

### Task 1: The plan importer as a library, with safe media download

**Files:**
- Create: `src/lib/site-plan/fetch-media.ts`, `src/lib/site-plan/import.ts`
- Modify: `scripts/kit/import-plan.ts` (whole file)
- Test: `tests/unit/fetch-media.test.ts`, `tests/unit/import-plan.test.ts`

**Interfaces:**
- Produces:
  - `fetchMedia(url: string, redirects?: number): Promise<{ data: Buffer; mimetype: string; name: string }>`
  - `isPublicAddress(ip: string): boolean`
  - `importPlan(payload: Payload, plan: SitePlan, opts: ImportOptions): Promise<ImportResult>`
  - `ImportOptions = { baseDir: string; reset?: boolean; fetchMedia?; toLexical?: (html: string) => Promise<unknown>; onProgress?: (done: number, total: number) => void }`
  - `ImportResult = { media: number; pages: number; articles: number }`
  - `CONTENT_COLLECTIONS`

- [ ] **Step 1: Write the failing tests**

`tests/unit/fetch-media.test.ts`:

```ts
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { fetchMedia, isPublicAddress } from '../../src/lib/site-plan/fetch-media'

test('isPublicAddress refuses private, loopback, link-local, CGNAT, multicast and mapped addresses', () => {
  for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '224.0.0.1', '::1', '::', 'fc00::1', 'fd12::1', 'fe80::1', '::ffff:127.0.0.1', '::ffff:10.0.0.1'])
    assert.equal(isPublicAddress(ip), false, ip)
  for (const ip of ['8.8.8.8', '172.32.0.1', '151.101.1.69', '2606:4700::1111', '::ffff:8.8.8.8'])
    assert.equal(isPublicAddress(ip), true, ip)
})

test('fetchMedia refuses http and other ports before connecting', async () => {
  await assert.rejects(fetchMedia('http://example.com/a.jpg'), /only https/)
  await assert.rejects(fetchMedia('https://example.com:8443/a.jpg'), /standard https port/)
})

test('fetchMedia refuses a host that resolves to a private address', async () => {
  await assert.rejects(fetchMedia('https://localhost/a.jpg'), (e: NodeJS.ErrnoException) => e.code === 'EPRIVATE')
})
```

`tests/unit/import-plan.test.ts`:

```ts
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'

import type { Payload } from 'payload'

import { CONTENT_COLLECTIONS, importPlan } from '../../src/lib/site-plan/import'

type Call = { op: string; collection: string; data?: unknown; filePath?: string; file?: unknown; locale?: string }
function fakePayload(existing = 0) {
  const calls: Call[] = []
  let id = 0
  const payload = {
    calls,
    count: async () => ({ totalDocs: existing }),
    delete: async ({ collection }: { collection: string }) => { calls.push({ op: 'delete', collection }); return {} },
    create: async (a: { collection: string; data: unknown; filePath?: string; file?: unknown; locale?: string }) => { calls.push({ op: 'create', ...a }); return { id: ++id } },
    update: async (a: { collection: string; data: unknown; locale?: string }) => { calls.push({ op: 'update', ...a }); return { id: 1 } },
    config: {},
  }
  return payload as unknown as Payload & { calls: Call[] }
}
const plan = () => JSON.parse(readFileSync('tests/fixtures/plan-minimal.json', 'utf8'))
const toLexical = async (h: string) => ({ html: h })

test('imports media from the plan folder, pages in two passes, then site settings, and reports progress', async () => {
  const payload = fakePayload()
  const progress: number[] = []
  const r = await importPlan(payload, plan(), { baseDir: 'tests/fixtures', toLexical, onProgress: (d, t) => progress.push(d / t) })
  const media = payload.calls.filter((c) => c.op === 'create' && c.collection === 'media')
  assert.ok(media.length > 0 && media.every((c) => c.filePath?.startsWith(path.resolve('tests/fixtures') + path.sep)))
  assert.ok(payload.calls.some((c) => c.op === 'create' && c.collection === 'pages'))
  assert.ok(payload.calls.some((c) => c.op === 'update' && c.collection === 'pages'))
  assert.ok(payload.calls.some((c) => c.op === 'create' && c.collection === 'site-settings'))
  assert.equal(progress.at(-1), 1)
  assert.equal(r.pages, plan().pages.length)
})

test('a database with content is refused, unless reset deletes every content collection first', async () => {
  await assert.rejects(importPlan(fakePayload(3), plan(), { baseDir: 'tests/fixtures', toLexical }), /already has content/)
  const payload = fakePayload(3)
  await importPlan(payload, plan(), { baseDir: 'tests/fixtures', toLexical, reset: true })
  assert.deepEqual(payload.calls.filter((c) => c.op === 'delete').map((c) => c.collection), [...CONTENT_COLLECTIONS])
})

test('a media path outside the plan folder is refused', async () => {
  const p = plan()
  p.media[0].source = '../../package.json'
  await assert.rejects(importPlan(fakePayload(), p, { baseDir: 'tests/fixtures', toLexical }), /outside the plan's folder/)
})

test('https media go through fetchMedia, and a refused download stops the import naming the URL', async () => {
  const p = plan()
  p.media[0].source = 'https://evil.example/x.jpg'
  const fetchMedia = async (u: string) => { throw new Error(`${u} resolves to a private address`) }
  await assert.rejects(importPlan(fakePayload(), p, { baseDir: 'tests/fixtures', toLexical, fetchMedia }), /evil\.example/)
})

test('missing refs are refused before anything is written', async () => {
  const p = plan()
  p.pages[0].parent = 'no-such-page'
  const payload = fakePayload()
  await assert.rejects(importPlan(payload, p, { baseDir: 'tests/fixtures', toLexical }), /Missing refs/)
  assert.equal(payload.calls.length, 0)
})
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm tsx --test tests/unit/fetch-media.test.ts tests/unit/import-plan.test.ts`
Expected: FAIL with `Cannot find module '../../src/lib/site-plan/fetch-media'`.

- [ ] **Step 3: Implement**

`src/lib/site-plan/fetch-media.ts`:

```ts
/**
 * Downloads one media file named in a site plan. Plans can be written by an AI from a crawled
 * site, so every URL is untrusted: https only, port 443, public addresses only (checked when
 * connecting, so a second DNS answer cannot point elsewhere), at most 3 redirects and 25 MB.
 */
import dns from 'node:dns'
import https from 'node:https'
import net from 'node:net'

export const MAX_MEDIA_BYTES = 25 * 1024 * 1024

export function isPublicAddress(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number)
    if (a === 0 || a === 10 || a === 127 || a >= 224) return false
    if (a === 100 && b >= 64 && b <= 127) return false // carrier-grade NAT
    if (a === 169 && b === 254) return false // link-local
    if (a === 172 && b >= 16 && b <= 31) return false
    if (a === 192 && (b === 168 || b === 0)) return false
    if (a === 198 && (b === 18 || b === 19)) return false // benchmarking
    return true
  }
  if (net.isIPv6(ip)) {
    const v = ip.toLowerCase()
    if (v === '::' || v === '::1') return false
    const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(v)
    if (mapped) return isPublicAddress(mapped[1])
    if (/^f[cd]/.test(v) || /^fe[89ab]/.test(v) || /^ff/.test(v)) return false
    return true
  }
  return false
}

// Node calls this with { all: true } when it wants every address (happy eyeballs).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function publicOnlyLookup(hostname: string, options: any, callback: any): void {
  dns.lookup(hostname, { all: true }, (err, addresses) => {
    if (err) return callback(err)
    const list = addresses as dns.LookupAddress[]
    if (!list.length || list.some((a) => !isPublicAddress(a.address))) {
      return callback(Object.assign(new Error(`${hostname} resolves to a private address`), { code: 'EPRIVATE' }))
    }
    if (options && options.all) return callback(null, list)
    callback(null, list[0].address, list[0].family)
  })
}

export async function fetchMedia(url: string, redirects = 3): Promise<{ data: Buffer; mimetype: string; name: string }> {
  const u = new URL(url)
  if (u.protocol !== 'https:') throw new Error(`${url}: only https media can be imported`)
  if (u.port && u.port !== '443') throw new Error(`${url}: only the standard https port`)
  return new Promise((resolve, reject) => {
    const req = https.get(u, { lookup: publicOnlyLookup as never, headers: { 'User-Agent': 'SiteKit-seed/1.0' }, timeout: 30_000 }, (res) => {
      const status = res.statusCode ?? 0
      if (status >= 300 && status < 400 && res.headers.location) {
        res.resume()
        if (redirects <= 0) return reject(new Error(`${url}: too many redirects`))
        return resolve(fetchMedia(new URL(res.headers.location, u).toString(), redirects - 1))
      }
      if (status !== 200) {
        res.resume()
        return reject(new Error(`${url}: HTTP ${status}`))
      }
      if (Number(res.headers['content-length'] || 0) > MAX_MEDIA_BYTES) {
        res.destroy()
        return reject(new Error(`${url}: larger than 25 MB`))
      }
      const chunks: Buffer[] = []
      let size = 0
      res.on('data', (c: Buffer) => {
        size += c.length
        if (size > MAX_MEDIA_BYTES) {
          res.destroy()
          reject(new Error(`${url}: larger than 25 MB`))
        } else chunks.push(c)
      })
      res.on('end', () =>
        resolve({
          data: Buffer.concat(chunks),
          mimetype: String(res.headers['content-type'] || 'application/octet-stream').split(';')[0].trim(),
          name: decodeURIComponent(u.pathname.split('/').pop() || 'file'),
        }),
      )
      res.on('error', reject)
    })
    req.on('timeout', () => req.destroy(new Error(`${url}: timed out`)))
    req.on('error', reject)
  })
}
```

`src/lib/site-plan/import.ts`. The body is the current `scripts/kit/import-plan.ts` loop,
moved into a function. The changes are marked with comments:

```ts
/**
 * Writes a validated site plan into Payload. Used by `pnpm kit:import` (local database) and by
 * the seed route on a fresh deploy (seed/site-plan.json).
 */
import path from 'node:path'

import type { Payload } from 'payload'

import { DEFAULT_LOCALE, DEFAULT_SITE, isSiteKey, LOCALES } from '../sites'
import { fetchMedia as defaultFetchMedia } from './fetch-media'
import { findMissingRefs, localeData, orderPages, resolveValue } from './refs'
import type { SitePlan } from './types'

export const CONTENT_COLLECTIONS = ['redirects', 'articles', 'pages', 'people', 'documents', 'media', 'site-settings'] as const

export type ImportOptions = {
  /** Folder that relative media and document paths are resolved against. */
  baseDir: string
  /** Delete existing content first. Without it, a database that has content is refused. */
  reset?: boolean
  fetchMedia?: (url: string) => Promise<{ data: Buffer; mimetype: string; name: string }>
  toLexical?: (html: string) => Promise<unknown>
  onProgress?: (done: number, total: number) => void
}
export type ImportResult = { media: number; pages: number; articles: number }

async function lexicalConverter(payload: Payload) {
  const { convertHTMLToLexical, editorConfigFactory } = await import('@payloadcms/richtext-lexical')
  const { JSDOM } = await import('jsdom')
  const editorConfig = await editorConfigFactory.default({ config: payload.config })
  return async (h: string) => convertHTMLToLexical({ editorConfig, html: h, JSDOM })
}

export async function importPlan(payload: Payload, plan: SitePlan, opts: ImportOptions): Promise<ImportResult> {
  // Checked before anything is written.
  const missing = findMissingRefs(plan)
  if (missing.length) throw new Error(`Missing refs: ${missing.join(', ')}`)
  const site = plan.site && isSiteKey(plan.site) ? plan.site : DEFAULT_SITE
  const baseDir = path.resolve(opts.baseDir)
  const fetchMedia = opts.fetchMedia ?? defaultFetchMedia
  const ctx = { disableRevalidate: true }
  const others = LOCALES.filter((l) => l !== DEFAULT_LOCALE)

  // Any content counts: a run that failed half-way leaves media without pages, and must not be duplicated.
  let existing = 0
  for (const c of CONTENT_COLLECTIONS) existing += (await payload.count({ collection: c })).totalDocs
  if (existing > 0) {
    if (!opts.reset) throw new Error('The database already has content. Import with reset to replace it.')
    for (const c of CONTENT_COLLECTIONS) await payload.delete({ collection: c, where: { id: { exists: true } }, context: ctx })
  }

  let toLexical = opts.toLexical
  const html = async (h: string) => {
    toLexical ??= await lexicalConverter(payload)
    return toLexical(h)
  }
  const total = plan.media.length + (plan.people?.length ?? 0) + (plan.documents?.length ?? 0) + plan.pages.length * 2 + (plan.articles?.length ?? 0) + (plan.redirects?.length ?? 0) + 1
  let done = 0
  const tick = () => opts.onProgress?.(++done, total)
  const ids = { media: new Map<string, number>(), pages: new Map<string, number>(), people: new Map<string, number>(), documents: new Map<string, number>() }

  async function upload(collection: 'media' | 'documents', source: string, data: Record<string, unknown>) {
    // Anything that looks like a URL goes through fetchMedia, which refuses all but public https.
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(source)) {
      const file = await fetchMedia(source)
      return payload.create({ collection, data: data as never, file: { ...file, size: file.data.length }, locale: DEFAULT_LOCALE, context: ctx })
    }
    const abs = path.resolve(baseDir, source)
    if (!abs.startsWith(baseDir + path.sep)) throw new Error(`${source}: outside the plan's folder`)
    return payload.create({ collection, data: data as never, filePath: abs, locale: DEFAULT_LOCALE, context: ctx })
  }

  async function localized(collection: string, id: number, item: Record<string, unknown>, fields: string[], resolve = false) {
    for (const l of others) {
      const data = localeData(item, l, fields)
      if (!Object.values(data).some((v) => v !== undefined)) continue
      await payload.update({ collection: collection as never, id, locale: l, data: (resolve ? await resolveValue(data, ids, html) : data) as never, context: ctx })
    }
  }

  for (const m of plan.media) {
    const doc = await upload('media', m.source, { ...localeData(m, DEFAULT_LOCALE, ['alt']), credit: m.credit })
    ids.media.set(m.ref, doc.id as number)
    await localized('media', doc.id as number, m, ['alt'])
    tick()
  }
  for (const p of plan.people ?? []) {
    const data = { ...localeData(p, DEFAULT_LOCALE, ['name', 'role', 'email', 'phone', 'bio']), image: p.image ? ids.media.get(p.image) : undefined, site }
    const doc = await payload.create({ collection: 'people', data: data as never, locale: DEFAULT_LOCALE, context: ctx })
    ids.people.set(p.ref, doc.id as number)
    await localized('people', doc.id as number, p, ['role', 'bio'])
    tick()
  }
  for (const d of plan.documents ?? []) {
    const doc = await upload('documents', d.source, { ...localeData(d, DEFAULT_LOCALE, ['title', 'description']), docType: d.docType, language: d.language, sites: [site] })
    ids.documents.set(d.ref, doc.id as number)
    await localized('documents', doc.id as number, d, ['title', 'description'])
    tick()
  }
  // Pages link to each other (and may link both ways), so create them all first, then fill in layouts.
  const ordered = orderPages(plan.pages)
  for (const p of ordered) {
    const base = {
      site,
      isHome: p.isHome ?? false,
      order: p.order,
      hideFromNav: p.hideFromNav,
      parent: p.parent ? ids.pages.get(p.parent) : undefined,
      cardImage: p.cardImage ? ids.media.get(p.cardImage) : undefined,
      _status: 'published',
    }
    const doc = await payload.create({ collection: 'pages', data: { ...base, ...localeData(p, DEFAULT_LOCALE, ['title', 'slug', 'summary']) } as never, locale: DEFAULT_LOCALE, context: ctx })
    ids.pages.set(p.ref, doc.id as number)
    await localized('pages', doc.id as number, p, ['title', 'slug', 'summary'])
    tick()
  }
  for (const p of ordered) {
    const id = ids.pages.get(p.ref)!
    const data = await resolveValue(localeData(p, DEFAULT_LOCALE, ['meta', 'layout']), ids, html)
    await payload.update({ collection: 'pages', id, locale: DEFAULT_LOCALE, data: { ...(data as object), _status: 'published' } as never, context: ctx })
    await localized('pages', id, p, ['meta', 'layout'], true)
    tick()
  }
  for (const a of plan.articles ?? []) {
    const contentHtml = a.contentHtml?.[DEFAULT_LOCALE]
    const data = {
      site,
      kind: a.kind,
      publishedAt: a.publishedAt,
      heroImage: a.heroImage ? ids.media.get(a.heroImage) : undefined,
      _status: 'published',
      ...localeData(a, DEFAULT_LOCALE, ['title', 'slug', 'lead']),
      content: contentHtml ? await html(contentHtml) : undefined,
    }
    const doc = await payload.create({ collection: 'articles', data: data as never, locale: DEFAULT_LOCALE, context: ctx })
    for (const l of others) {
      const c = a.contentHtml?.[l]
      const ld = { ...localeData(a, l, ['title', 'slug', 'lead']), content: c ? await html(c) : undefined }
      if (Object.values(ld).some((v) => v !== undefined)) await payload.update({ collection: 'articles', id: doc.id, locale: l, data: ld as never, context: ctx })
    }
    tick()
  }
  const link = (page?: string, url?: string, label?: string) =>
    page ? { type: 'reference', reference: { relationTo: 'pages', value: ids.pages.get(page) }, label } : { type: 'custom', url, label }
  const settingsFor = (l: (typeof LOCALES)[number]) => ({
    nav: (plan.settings.nav[l] ?? []).map((i) => ({ link: link(i.page, undefined, i.label) })),
    contactLink: plan.settings.contact?.[l] ? link(plan.settings.contact[l]!.page, undefined, plan.settings.contact[l]!.label) : undefined,
    footerColumns: (plan.settings.footer?.[l] ?? []).map((c) => ({ heading: c.heading, links: c.links.map((x) => ({ link: link(x.page, x.url, x.label) })) })),
    copyright: plan.settings.copyright?.[l],
  })
  const settings = await payload.create({
    collection: 'site-settings',
    data: { site, ...settingsFor(DEFAULT_LOCALE), phone: plan.settings.phone, email: plan.settings.email, address: plan.settings.address } as never,
    locale: DEFAULT_LOCALE,
    context: ctx,
  })
  for (const l of others) await payload.update({ collection: 'site-settings', id: settings.id, locale: l, data: settingsFor(l) as never, context: ctx })
  tick()
  for (const r of plan.redirects ?? []) {
    await payload.create({ collection: 'redirects', data: { from: r.from, to: link(r.toPage, r.toUrl), permanent: r.permanent ?? true } as never, context: ctx })
    tick()
  }
  return { media: plan.media.length, pages: plan.pages.length, articles: plan.articles?.length ?? 0 }
}
```

`scripts/kit/import-plan.ts` (replace the whole file):

```ts
/**
 * pnpm kit:import <plan.json> [--reset]
 * Writes a site plan into the LOCAL Payload. To ship content to Hosait, commit the plan as
 * seed/site-plan.json with its media under seed/: the first deploy imports it.
 */
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { importPlan } from '../../src/lib/site-plan/import'
import { validateSitePlan } from '../../src/lib/site-plan/validate'

const [file, ...flags] = process.argv.slice(2)
if (!file) throw new Error('Usage: pnpm kit:import <plan.json> [--reset]')
if (!/127\.0\.0\.1|localhost/.test(process.env.DATABASE_URL || '')) throw new Error('kit:import writes only to a local database')

const valid = validateSitePlan(JSON.parse(readFileSync(file, 'utf8')))
if (!valid.ok) {
  console.error(valid.errors.join('\n'))
  process.exit(1)
}
const payload = await getPayload({ config })
const r = await importPlan(payload, valid.plan, { baseDir: path.dirname(path.resolve(file)), reset: flags.includes('--reset') })
console.log(`Imported ${r.media} media, ${r.pages} pages, ${r.articles} articles.`)
await payload.destroy()
process.exit(0)
```

- [ ] **Step 4: Run the tests and the type check to see them pass**

Run: `pnpm tsx --test tests/unit/fetch-media.test.ts tests/unit/import-plan.test.ts && pnpm -s typecheck && pnpm -s lint`
Expected: PASS, 8 tests, 0 failures, and no type or lint errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/site-plan/fetch-media.ts src/lib/site-plan/import.ts scripts/kit/import-plan.ts tests/unit/fetch-media.test.ts tests/unit/import-plan.test.ts
git commit -m "Plan importer as a library; media only from public https addresses

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: The first deploy imports seed/site-plan.json

**Files:**
- Create: `src/lib/site-plan/seed-plan.ts`
- Modify: `src/app/(frontend)/next/seed/[step]/route.ts` (the `g` type, the `status` line, the `db` branch, and a new `seedPlan`)
- Modify: `seed/`. Add `site-plan.json` and `media/`; remove `content.sql.gz`, `sources.json` and `files/`.
- Modify: `hosait.json` (`seed`), and `README.md` (the "Fill a site with content" section)
- Test: `tests/unit/seed-plan.test.ts`

**Interfaces:**
- Consumes (Task 1): `importPlan`, `ImportResult`.
- Produces:
  - `seedSource(seedDir): 'plan' | 'sql' | 'none'`
  - `loadSeedPlan(seedDir): { ok: true; plan: SitePlan } | { ok: false; error: string }`
  - `PlanSeedProgress`
  - `runPlanSeed(payload, plan, seedDir, progress, opts): Promise<void>` (never throws)
  - `GET /next/seed/status` → `{ media, plan }`

- [ ] **Step 1: Write the failing tests**

`tests/unit/seed-plan.test.ts`:

```ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import type { Payload } from 'payload'

import { loadSeedPlan, runPlanSeed, seedSource, type PlanSeedProgress } from '../../src/lib/site-plan/seed-plan'

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'seed-'))
const fresh = (): PlanSeedProgress => ({ running: true, done: 0, total: 0, startedAt: 'now' })
const fixture = fs.readFileSync('tests/fixtures/plan-minimal.json', 'utf8')

test('seedSource prefers the plan, then the SQL dump, else none', () => {
  const d = tmp()
  assert.equal(seedSource(d), 'none')
  fs.writeFileSync(path.join(d, 'content.sql.gz'), '')
  assert.equal(seedSource(d), 'sql')
  fs.writeFileSync(path.join(d, 'site-plan.json'), fixture)
  assert.equal(seedSource(d), 'plan')
})

test('loadSeedPlan names the file on bad JSON, lists schema errors, and accepts a valid plan', () => {
  const d = tmp()
  fs.writeFileSync(path.join(d, 'site-plan.json'), '{ nope')
  const bad = loadSeedPlan(d)
  assert.ok(!bad.ok && /seed\/site-plan\.json/.test(bad.error))
  fs.writeFileSync(path.join(d, 'site-plan.json'), JSON.stringify({ version: 1 }))
  assert.equal(loadSeedPlan(d).ok, false)
  fs.writeFileSync(path.join(d, 'site-plan.json'), fixture)
  assert.equal(loadSeedPlan(d).ok, true)
})

test('runPlanSeed imports with the seed folder as base, keeps progress, and runs the follow-up', async () => {
  const progress = fresh()
  let seen: { baseDir?: string; reset?: boolean } = {}
  let after = false
  await runPlanSeed({} as Payload, JSON.parse(fixture), '/app/seed', progress, {
    reset: true,
    importer: async (_p, _plan, o) => { seen = o; o.onProgress?.(3, 3); return { media: 1, pages: 2, articles: 0 } },
    after: async () => { after = true },
  })
  assert.deepEqual([seen.baseDir, seen.reset], ['/app/seed', true])
  assert.deepEqual([progress.running, progress.done, progress.total, progress.result?.pages], [false, 3, 3, 2])
  assert.equal(after, true)
  assert.ok(progress.finishedAt)
})

test('runPlanSeed never throws: a refused media download lands in progress.error and the follow-up is skipped', async () => {
  const progress = fresh()
  let after = false
  await runPlanSeed({} as Payload, JSON.parse(fixture), '/app/seed', progress, {
    reset: false,
    importer: async () => { throw new Error('https://10.0.0.5/x.jpg resolves to a private address') },
    after: async () => { after = true },
  })
  assert.equal(progress.running, false)
  assert.match(progress.error ?? '', /10\.0\.0\.5/)
  assert.equal(after, false)
})

test('the shipped seed is a valid plan whose local media all exist under seed/', () => {
  const r = loadSeedPlan('seed')
  assert.ok(r.ok, r.ok ? '' : r.error)
  for (const m of r.plan.media) if (!/^https:\/\//.test(m.source)) assert.ok(fs.existsSync(path.join('seed', m.source)), m.source)
})

test('the db step checks for a running import before the content check, and uses the plan when present', () => {
  const src = fs.readFileSync('src/app/(frontend)/next/seed/[step]/route.ts', 'utf8')
  assert.ok(src.indexOf('g.__seedPlan?.running') > -1 && src.indexOf('g.__seedPlan?.running') < src.indexOf('seedDbDecision('))
  assert.match(src, /seedSource\(SEED_DIR\) === 'plan'/)
  assert.match(src, /plan: g\.__seedPlan \?\? null/)
})
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm tsx --test tests/unit/seed-plan.test.ts`
Expected: FAIL with `Cannot find module '../../src/lib/site-plan/seed-plan'`.

- [ ] **Step 3: Implement**

`src/lib/site-plan/seed-plan.ts`:

```ts
/**
 * The first deploy fills an empty site from seed/site-plan.json (media under seed/, or public
 * https URLs). The older SQL dump (seed/content.sql.gz) still works when there is no plan.
 */
import fs from 'node:fs'
import path from 'node:path'

import type { Payload } from 'payload'

import { importPlan, type ImportOptions, type ImportResult } from './import'
import type { SitePlan } from './types'
import { validateSitePlan } from './validate'

export type SeedSource = 'plan' | 'sql' | 'none'

export function seedSource(seedDir: string): SeedSource {
  if (fs.existsSync(path.join(seedDir, 'site-plan.json'))) return 'plan'
  if (fs.existsSync(path.join(seedDir, 'content.sql.gz'))) return 'sql'
  return 'none'
}

export function loadSeedPlan(seedDir: string): { ok: true; plan: SitePlan } | { ok: false; error: string } {
  let raw: unknown
  try {
    raw = JSON.parse(fs.readFileSync(path.join(seedDir, 'site-plan.json'), 'utf8'))
  } catch (e) {
    return { ok: false, error: `seed/site-plan.json: ${e instanceof Error ? e.message : String(e)}` }
  }
  const v = validateSitePlan(raw)
  return v.ok ? { ok: true, plan: v.plan } : { ok: false, error: `seed/site-plan.json: ${v.errors.slice(0, 10).join('; ')}` }
}

export type PlanSeedProgress = {
  running: boolean
  done: number
  total: number
  startedAt: string
  finishedAt?: string
  error?: string
  result?: ImportResult
}

/** Runs the import and keeps `progress` current. Never throws: a failure lands in progress.error. */
export async function runPlanSeed(
  payload: Payload,
  plan: SitePlan,
  seedDir: string,
  progress: PlanSeedProgress,
  opts: { reset: boolean; importer?: typeof importPlan; after?: () => Promise<void> } & Pick<ImportOptions, 'fetchMedia' | 'toLexical'>,
): Promise<void> {
  const importer = opts.importer ?? importPlan
  try {
    progress.result = await importer(payload, plan, {
      baseDir: seedDir,
      reset: opts.reset,
      fetchMedia: opts.fetchMedia,
      toLexical: opts.toLexical,
      onProgress: (done, total) => {
        progress.done = done
        progress.total = total
      },
    })
    await opts.after?.()
  } catch (e) {
    progress.error = e instanceof Error ? e.message : String(e)
  } finally {
    progress.running = false
    progress.finishedAt = new Date().toISOString()
  }
}
```

Route, `src/app/(frontend)/next/seed/[step]/route.ts`:

1. Imports: add `import { loadSeedPlan, runPlanSeed, seedSource, type PlanSeedProgress } from '@/lib/site-plan/seed-plan'`.
2. Change `const g = globalThis as unknown as { __seedMedia?: Progress }` to
   `const g = globalThis as unknown as { __seedMedia?: Progress; __seedPlan?: PlanSeedProgress }`.
3. Add after `seedMedia`:

```ts
/** Imports seed/site-plan.json in the background: media come one by one, which can take minutes. */
async function seedPlan(replace: boolean) {
  const loaded = loadSeedPlan(SEED_DIR)
  if (!loaded.ok) return { ok: false, error: loaded.error }
  const payload = await getPayload({ config: configPromise })
  const progress: PlanSeedProgress = { running: true, done: 0, total: 0, startedAt: new Date().toISOString() }
  g.__seedPlan = progress
  void runPlanSeed(payload, loaded.plan, SEED_DIR, progress, {
    reset: replace,
    after: async () => {
      flushCache()
      await reindexAll(payload)
    },
  })
  return { ok: true, started: true, mode: 'plan' }
}
```

4. In `handle`, change the status line to
   `if (step === 'status') return Response.json({ media: g.__seedMedia ?? null, plan: g.__seedPlan ?? null })`.
5. Replace the `db` branch with:

```ts
  if (step === 'db') {
    // A retry (Hosait's seed.run, or the panel clicked twice) must not start a second import.
    if (g.__seedPlan?.running) return Response.json({ ok: true, alreadyRunning: true, progress: g.__seedPlan })
    const payload = await getPayload({ config: configPromise })
    const replace = new URL(req.url).searchParams.get('replace') === '1'
    const decision = seedDbDecision({
      pages: (await payload.count({ collection: 'pages' })).totalDocs,
      replace,
      production: process.env.SITE_ORIGINS === 'production',
    })
    if (decision === 'refuse_existing') {
      return Response.json({ ok: false, error: 'Nettstedet har allerede sider. Bruk ?replace=1 for å erstatte alt innhold.' }, { status: 409 })
    }
    if (seedSource(SEED_DIR) === 'plan') return Response.json(await seedPlan(replace))
    return Response.json(await seedDb())
  }
```

6. Add one line to the route's header comment, under the `db:` bullet:
   `seed/site-plan.json wins when present: it is imported in the background (see status).`

Switch the template's own seed to the plan:

```bash
mkdir -p seed/media
cp examples/demo/media/* seed/media/
cp examples/demo/site-plan.json seed/site-plan.json
git rm -r -q seed/files seed/content.sql.gz seed/sources.json
```

`hosait.json`: delete the `"files": "seed/files",` line from `seed`. Only `run` stays.

`README.md`: replace the block under "## Fill a site with content", from its first line down to
the paragraph that ends with "never replaces", with:

```markdown
Write the content as a site plan (`schema/site-plan.schema.json`), with its images and PDFs in a
folder next to it or as public https URLs. Try it locally:

    pnpm kit:import seed/site-plan.json --reset

To ship it, commit it as `seed/site-plan.json` with local files under `seed/`. On Hosait the
first publish runs `seed.run` from `hosait.json`, which imports the plan into the empty
database in the background (`/next/seed/status` shows progress). It never replaces content
unless asked to (`?replace=1`). Older sites can still ship a SQL dump (`pnpm kit:export-seed`
→ `seed/content.sql.gz`), which is used when there is no plan.
```

Then look for leftover references:
`grep -rn "content.sql.gz\|sources.json\|seed/files" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=docs .`.
Leave `scripts/deploy/export-seed.mjs` and the SQL code paths in the route, which still serve
sites without a plan. Update any other mention so it describes the plan seed.

- [ ] **Step 4: Run the tests and checks to see them pass**

Run: `pnpm tsx --test tests/unit/seed-plan.test.ts && pnpm -s test:unit 2>&1 | grep -E "^# (pass|fail)" && pnpm -s typecheck && pnpm -s lint`
Expected: PASS. `# fail 0`, and no type or lint errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/site-plan/seed-plan.ts "src/app/(frontend)/next/seed/[step]/route.ts" seed hosait.json README.md tests/unit/seed-plan.test.ts
git commit -m "The first deploy imports seed/site-plan.json; the template ships its demo as a plan

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: The schema file shows this site's languages and block types

**Files:**
- Create: `src/lib/site-plan/stamp-schema.ts`
- Modify: `src/lib/site-plan/validate.ts` (replace `withLocales`), `scripts/kit/schema.ts` (write the stamped plan schema), `schema/site-plan.schema.json` (regenerated)
- Test: `tests/unit/stamp-schema.test.ts`

**Interfaces:**
- Produces: `stampSchema(node: unknown, locales: readonly string[], blockTypes?: readonly string[]): unknown`.

- [ ] **Step 1: Write the failing test**

`tests/unit/stamp-schema.test.ts`:

```ts
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import blocks from '../../schema/blocks.schema.json'
import { LOCALES } from '../../src/lib/sites'
import { stampSchema } from '../../src/lib/site-plan/stamp-schema'

test('stampSchema replaces every locale enum and fills blockType enums, leaving the rest alone', () => {
  const input = { a: { propertyNames: { enum: ['no', 'en'] }, x: 1 }, b: [{ $comment: 'blockType', type: 'string' }] }
  assert.deepEqual(stampSchema(input, ['sv', 'en'], ['hero', 'cta']), {
    a: { propertyNames: { enum: ['sv', 'en'] }, x: 1 },
    b: [{ $comment: 'blockType', type: 'string', enum: ['hero', 'cta'] }],
  })
  assert.deepEqual(stampSchema(input, ['sv']), { a: { propertyNames: { enum: ['sv'] }, x: 1 }, b: [{ $comment: 'blockType', type: 'string' }] })
})

function walk(n: unknown, visit: (o: Record<string, unknown>) => void) {
  if (Array.isArray(n)) return n.forEach((x) => walk(x, visit))
  if (!n || typeof n !== 'object') return
  visit(n as Record<string, unknown>)
  Object.values(n).forEach((x) => walk(x, visit))
}

test('the shipped schema/site-plan.schema.json lists this site\'s locales and the kit\'s block types', () => {
  const schema = JSON.parse(readFileSync('schema/site-plan.schema.json', 'utf8'))
  let localeMaps = 0
  let blockTypeNodes = 0
  walk(schema, (o) => {
    const pn = o.propertyNames as { enum?: string[] } | undefined
    if (pn?.enum) { localeMaps++; assert.deepEqual(pn.enum, LOCALES) }
    if (o.$comment === 'blockType') { blockTypeNodes++; assert.deepEqual(o.enum, blocks.blockTypes) }
  })
  assert.ok(localeMaps > 0 && blockTypeNodes > 0)
})
```

- [ ] **Step 2: Run it to see it fail**

Run: `pnpm tsx --test tests/unit/stamp-schema.test.ts`
Expected: FAIL with `Cannot find module '../../src/lib/site-plan/stamp-schema'`. Once the module
exists, the second test still fails until `kit:schema` has run, because the `blockType` nodes
have no `enum` yet.

- [ ] **Step 3: Implement**

`src/lib/site-plan/stamp-schema.ts`:

```ts
/**
 * The plan schema marks every per-language map with propertyNames.enum and every blockType
 * with $comment: 'blockType'. This puts the site's own locales (and the kit's block types) in,
 * so an agent reading schema/site-plan.schema.json sees exactly what this site accepts.
 */
export function stampSchema(node: unknown, locales: readonly string[], blockTypes?: readonly string[]): unknown {
  if (Array.isArray(node)) return node.map((n) => stampSchema(n, locales, blockTypes))
  if (!node || typeof node !== 'object') return node
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(node)) out[k] = stampSchema(v, locales, blockTypes)
  if ((out.propertyNames as { enum?: unknown } | undefined)?.enum) out.propertyNames = { enum: [...locales] }
  if (blockTypes && out.$comment === 'blockType') out.enum = [...blockTypes]
  return out
}
```

`src/lib/site-plan/validate.ts`: delete the `withLocales` function, import
`{ stampSchema } from './stamp-schema'`, and compile
`ajv.compile(stampSchema(planSchema, LOCALES, BLOCK_TYPES) as object)`.

`scripts/kit/schema.ts`: change the `node:fs` import to `import { readFileSync, writeFileSync } from 'node:fs'`,
and add `import { LOCALES } from '../../src/lib/sites'` and
`import { stampSchema } from '../../src/lib/site-plan/stamp-schema'`. Then, before `process.exit(0)`:

```ts
// The plan schema shows this site's locales and this kit's block types, so an agent writing a
// plan from the file alone gets them right. Regenerated whenever blocks or locales change.
const planFile = 'schema/site-plan.schema.json'
const plan = stampSchema(JSON.parse(readFileSync(planFile, 'utf8')), LOCALES, schema.blockTypes)
writeFileSync(planFile, JSON.stringify(plan, null, 2) + '\n')
console.log(`${planFile}: locales ${LOCALES.join(', ')}`)
```

Then regenerate. This needs the local Postgres from `docker compose up -d`, as `kit:schema`
loads the Payload config:

```bash
pnpm kit:schema
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `pnpm tsx --test tests/unit/stamp-schema.test.ts tests/unit/site-plan.test.ts && pnpm -s typecheck`
Expected: PASS. The existing `site-plan.test.ts` (unknown block type, wrong locale) still
passes. The CI step "Block schema up to date" (`pnpm kit:schema && git diff --exit-code
schema/`) now also guards the plan schema.

- [ ] **Step 5: Commit**

```bash
git add src/lib/site-plan/stamp-schema.ts src/lib/site-plan/validate.ts scripts/kit/schema.ts schema/site-plan.schema.json tests/unit/stamp-schema.test.ts
git commit -m "kit:schema stamps the site's locales and block types into the plan schema

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: The intake questions as data

**Files:**
- Create: `site/questions.json`, `src/lib/questions.ts`
- Test: `tests/unit/questions.test.ts`

**Interfaces:**
- Produces:
  - `type Question`
  - `checkQuestions(input: unknown, config: Record<string, unknown>): string[]`, which returns
    a list of problems (empty means valid)
- `sets` paths are dot paths into `site/config.ts`, where `*` matches any key. They may also
  be `report.<name>` (shown in the report and the quote) or `cms.<name>` (entered in the CMS
  after the build).

- [ ] **Step 1: Write the failing test**

`tests/unit/questions.test.ts`:

```ts
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { checkQuestions } from '../../src/lib/questions'
import { siteConfig } from '../../site/config'

const shipped = () => JSON.parse(readFileSync('site/questions.json', 'utf8'))
const cfg = siteConfig as unknown as Record<string, unknown>

test('the shipped questions are valid against this site\'s config', () => {
  assert.deepEqual(checkQuestions(shipped(), cfg), [])
})

test('the checker catches duplicate ids, unknown types, choices without options and paths that do not exist', () => {
  const q = shipped()
  q.questions.push({ ...q.questions[0] })
  q.questions.push({ id: 'colour', text: 'x', type: 'colourpicker', sets: ['report.colour'] })
  q.questions.push({ id: 'pick', text: 'x', type: 'choice', options: [{ value: 'a', label: 'A' }], sets: ['report.pick'] })
  q.questions.push({ id: 'wrong', text: 'x', type: 'text', sets: ['features.nope'] })
  const problems = checkQuestions(q, cfg).join('\n')
  assert.match(problems, /duplicate id/)
  assert.match(problems, /colour: unknown type/)
  assert.match(problems, /pick: needs at least two options/)
  assert.match(problems, /wrong: features\.nope is not in site\/config\.ts/)
})

test('* in a path matches any key, and report./cms. paths are always allowed', () => {
  const q = { version: 1, questions: [{ id: 'domain', text: 'x', type: 'text', sets: ['sites.*.origin', 'report.goLive', 'cms.privacyPage'] }] }
  assert.deepEqual(checkQuestions(q, cfg), [])
})
```

- [ ] **Step 2: Run it to see it fail**

Run: `pnpm tsx --test tests/unit/questions.test.ts`
Expected: FAIL with `Cannot find module '../../src/lib/questions'`.

- [ ] **Step 3: Implement**

`src/lib/questions.ts`:

```ts
/**
 * site/questions.json: the intake questions both Hosait Sites paths ask (the Hosait wizard,
 * and the hosait-sites skill in the user's own Claude), and what each answer sets.
 */
export type Question = {
  id: string
  text: string
  help?: string
  type: 'text' | 'url' | 'choice' | 'multi' | 'boolean' | 'people'
  options?: { value: string; label: string }[]
  /** Dot paths into site/config.ts (* matches any key), or report.<name> / cms.<name>. */
  sets: string[]
  required?: boolean
}

const TYPES = new Set(['text', 'url', 'choice', 'multi', 'boolean', 'people'])

function hasPath(obj: unknown, parts: string[]): boolean {
  if (!parts.length) return true
  if (!obj || typeof obj !== 'object') return false
  const [head, ...rest] = parts
  const o = obj as Record<string, unknown>
  if (head === '*') return Object.values(o).some((v) => hasPath(v, rest))
  return head in o && hasPath(o[head], rest)
}

export function checkQuestions(input: unknown, config: Record<string, unknown>): string[] {
  const problems: string[] = []
  const doc = input as { version?: unknown; questions?: unknown }
  if (doc?.version !== 1) problems.push('version must be 1')
  if (!Array.isArray(doc?.questions)) return [...problems, 'questions must be a list']
  const seen = new Set<string>()
  for (const q of doc.questions as Question[]) {
    const id = String(q?.id ?? '')
    if (!/^[a-z][a-zA-Z0-9]*$/.test(id)) problems.push(`"${id}": id must be camelCase letters and digits`)
    if (seen.has(id)) problems.push(`${id}: duplicate id`)
    seen.add(id)
    if (!q.text) problems.push(`${id}: text is missing`)
    if (!TYPES.has(q.type)) problems.push(`${id}: unknown type ${String(q.type)}`)
    if ((q.type === 'choice' || q.type === 'multi') && (!Array.isArray(q.options) || q.options.length < 2)) problems.push(`${id}: needs at least two options`)
    if (!Array.isArray(q.sets) || !q.sets.length) problems.push(`${id}: sets is missing`)
    for (const p of q.sets ?? []) {
      if (/^(report|cms)\.[a-zA-Z0-9]+$/.test(p)) continue
      if (!hasPath(config, p.split('.'))) problems.push(`${id}: ${p} is not in site/config.ts`)
    }
  }
  return problems
}
```

`site/questions.json`:

```json
{
  "version": 1,
  "questions": [
    { "id": "siteAddress", "text": "What is the address of your current website?", "type": "url", "required": true, "sets": ["report.sourceUrl"] },
    { "id": "contentAccess", "text": "How can we read your content? An API token is best; an editor invite works; a username and password is the last resort. You can also skip this: we then read the public pages.", "type": "text", "sets": ["report.contentAccess"] },
    { "id": "brand", "text": "What is the organisation's name, legal name and organisation number?", "type": "text", "required": true, "sets": ["brand.name", "brand.legalName", "brand.orgNumber"] },
    { "id": "languages", "text": "Which languages should the site have, and which one is the default?", "type": "multi", "required": true, "options": [ { "value": "no", "label": "Norwegian" }, { "value": "en", "label": "English" }, { "value": "sv", "label": "Swedish" }, { "value": "da", "label": "Danish" }, { "value": "de", "label": "German" } ], "sets": ["locales", "defaultLocale"] },
    { "id": "analytics", "text": "How do you want to count visitors?", "help": "Built-in analytics needs no outside service and stores no IP addresses. Other tools are custom work, and always wait for consent.", "type": "choice", "options": [ { "value": "builtin", "label": "Built-in, privacy-friendly" }, { "value": "none", "label": "No analytics" }, { "value": "other", "label": "Another tool (GA4, Matomo, …)" } ], "sets": ["features.analytics", "report.analyticsTool"] },
    { "id": "embeds", "text": "We found these third-party services on your site. Which should the new site keep?", "help": "Every kept service gets a consent category; YouTube loads from youtube-nocookie.", "type": "multi", "options": [ { "value": "keep", "label": "Keep" }, { "value": "drop", "label": "Drop" } ], "sets": ["report.embeds"] },
    { "id": "dataController", "text": "Who is the data controller, and where is your privacy page?", "type": "text", "required": true, "sets": ["brand.legalName", "cms.privacyPage"] },
    { "id": "search", "text": "Should the site have its own search?", "type": "boolean", "sets": ["features.search"] },
    { "id": "forms", "text": "Which forms do you need, who should get the submissions, and for how many days should they be kept?", "type": "text", "sets": ["email.fromAddress", "cms.forms"] },
    { "id": "accessibility", "text": "Which accessibility level should the site meet, and do you want an accessibility statement?", "type": "choice", "options": [ { "value": "wcag21aa", "label": "WCAG 2.1 AA (recommended)" }, { "value": "wcag22aa", "label": "WCAG 2.2 AA" } ], "sets": ["report.accessibilityTarget"] },
    { "id": "contentScope", "text": "Which content should we bring over?", "type": "choice", "options": [ { "value": "all", "label": "Everything" }, { "value": "published", "label": "Only what is published" }, { "value": "recentNews", "label": "Pages, and news from the last few years" } ], "sets": ["report.contentScope"] },
    { "id": "editors", "text": "Who will edit the site? Names, e-mail addresses and roles. Do you want Microsoft sign-in?", "type": "people", "sets": ["cms.editors"] },
    { "id": "domain", "text": "Which domain will the site use, who controls its DNS, and when should it go live?", "type": "text", "required": true, "sets": ["sites.*.origin", "sites.*.hosts", "report.goLive"] },
    { "id": "terms", "text": "Do you accept the data processing agreement and hosting in the EU/EEA?", "type": "boolean", "required": true, "sets": ["report.terms"] },
    { "id": "integrations", "text": "Should the site connect to anything else, such as a newsletter, a CRM or a job feed?", "type": "text", "sets": ["report.integrations"] }
  ]
}
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `pnpm tsx --test tests/unit/questions.test.ts && pnpm -s typecheck`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add site/questions.json src/lib/questions.ts tests/unit/questions.test.ts
git commit -m "site/questions.json: the intake questions both paths ask, checked against site/config.ts

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: site-builder package, safe fetching and robots.txt

**Files:**
- Create: `packages/site-builder/package.json`, `packages/site-builder/src/net.js`, `packages/site-builder/src/robots.js`
- Create: `packages/site-builder/test/net.test.js`, `packages/site-builder/test/robots.test.js`, `packages/site-builder/test/server.js` (a test helper)
- Modify: `.gitignore` (add `.site-builder/`), `.dockerignore` (add `packages` and `.site-builder`), `eslint.config.mjs` (add `'packages/'` to `ignores`)

**Interfaces:**
- Produces:
  - `get(url, { maxBytes?, timeoutMs?, allowPrivate?, accept? })` →
    `Promise<{ status, headers, body: Buffer, truncated: boolean }>`. It never follows
    redirects.
  - `isPublicAddress(ip)`, `publicOnlyLookup`, `USER_AGENT`.
  - `parseRobots(text, agent?)` → `{ sitemaps: string[], allowed(pathname): boolean }`.
  - The test helper `serve(routes)` → `Promise<{ url, requests: string[], close() }>`, where
    `routes` is a `Record<path, { status?, headers?, body } | ((req) => …)>`.

- [ ] **Step 1: Create the package and write the failing tests**

`packages/site-builder/package.json`:

```json
{
  "name": "@hosait/site-builder",
  "version": "0.1.0",
  "description": "Reads an existing website (crawl, extract, theme, report) so it can be rebuilt on Hosait Site Kit.",
  "private": true,
  "license": "UNLICENSED",
  "type": "module",
  "bin": { "site-builder": "bin/site-builder.js" },
  "files": ["bin", "src", "README.md"],
  "engines": { "node": ">=20" },
  "scripts": { "test": "node --test test/" },
  "dependencies": { "cheerio": "1.2.0" }
}
```

Install, honouring the one-day rule, then create the lock file:

```bash
npm install --prefix packages/site-builder --before="$(date -v-2d +%Y-%m-%d 2>/dev/null || date -d '2 days ago' +%Y-%m-%d)"
```

`packages/site-builder/test/server.js`:

```js
// A tiny local website for tests. Each route is { status, headers, body } or a function of the request.
import http from 'node:http'

export function serve(routes) {
  const requests = []
  const server = http.createServer((req, res) => {
    requests.push(req.url)
    const r = routes[req.url.split('?')[0]] ?? routes[req.url]
    const route = typeof r === 'function' ? r(req) : r
    if (!route) { res.writeHead(404, { 'content-type': 'text/html' }); return res.end('<h1>Not found</h1>') }
    res.writeHead(route.status ?? 200, { 'content-type': 'text/html; charset=utf-8', ...(route.headers ?? {}) })
    res.end(route.body ?? '')
  })
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => {
    const { port } = server.address()
    resolve({ url: `http://127.0.0.1:${port}`, requests, close: () => new Promise((r) => server.close(r)) })
  }))
}
```

`packages/site-builder/test/net.test.js`:

```js
import assert from 'node:assert/strict'
import { test } from 'node:test'
import zlib from 'node:zlib'

import { get, isPublicAddress } from '../src/net.js'
import { serve } from './server.js'

test('isPublicAddress refuses private, loopback, link-local and mapped addresses', () => {
  for (const ip of ['127.0.0.1', '10.0.0.1', '192.168.0.1', '172.20.1.1', '169.254.169.254', '100.100.0.1', '::1', 'fd00::1', 'fe80::1', '::ffff:192.168.1.1'])
    assert.equal(isPublicAddress(ip), false, ip)
  for (const ip of ['1.1.1.1', '2606:4700::1111']) assert.equal(isPublicAddress(ip), true, ip)
})

test('a local host is refused unless allowPrivate is set', async () => {
  await assert.rejects(get('http://localhost/'), (e) => e.code === 'EPRIVATE')
  const site = await serve({ '/': { body: '<p>hi</p>' } })
  try {
    const r = await get(site.url + '/', { allowPrivate: true })
    assert.equal(r.status, 200)
    assert.equal(r.body.toString(), '<p>hi</p>')
  } finally { await site.close() }
})

test('redirects are returned, not followed; gzip is decoded; bodies are capped', async () => {
  const site = await serve({
    '/old': { status: 301, headers: { location: '/new' } },
    '/zip': { headers: { 'content-encoding': 'gzip' }, body: zlib.gzipSync('<p>packed</p>') },
    '/big': { body: 'x'.repeat(3 * 1024 * 1024) },
  })
  try {
    const r = await get(site.url + '/old', { allowPrivate: true })
    assert.deepEqual([r.status, r.headers.location], [301, '/new'])
    assert.equal((await get(site.url + '/zip', { allowPrivate: true })).body.toString(), '<p>packed</p>')
    const big = await get(site.url + '/big', { allowPrivate: true, maxBytes: 1024 * 1024 })
    assert.equal(big.truncated, true)
    assert.equal(big.body.length, 1024 * 1024)
  } finally { await site.close() }
})

test('only http and https', async () => {
  await assert.rejects(get('ftp://example.com/x'), /only http and https/)
})
```

`packages/site-builder/test/robots.test.js`:

```js
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { parseRobots } from '../src/robots.js'

test('Disallow and Allow use the longest match, and Sitemap lines are collected', () => {
  const r = parseRobots('User-agent: *\nDisallow: /private\nAllow: /private/public\nSitemap: https://x.no/sitemap.xml\n')
  assert.equal(r.allowed('/private/secret'), false)
  assert.equal(r.allowed('/private/public/page'), true)
  assert.equal(r.allowed('/about'), true)
  assert.deepEqual(r.sitemaps, ['https://x.no/sitemap.xml'])
})

test('a group for our agent replaces the * group; * and $ in paths work', () => {
  const text = 'User-agent: *\nDisallow: /\n\nUser-agent: HosaitSiteBuilder\nDisallow: /*.pdf$\n'
  const r = parseRobots(text)
  assert.equal(r.allowed('/about'), true)
  assert.equal(r.allowed('/files/a.pdf'), false)
  assert.equal(r.allowed('/files/a.pdf?x=1'), true)
})

test('an empty or missing robots.txt allows everything; comments are ignored', () => {
  assert.equal(parseRobots('').allowed('/anything'), true)
  assert.equal(parseRobots('# nothing\nUser-agent: *\nDisallow:\n').allowed('/x'), true)
})
```

- [ ] **Step 2: Run them to see them fail**

Run: `npm test --prefix packages/site-builder`
Expected: FAIL with `Cannot find module '…/src/net.js'`.

- [ ] **Step 3: Implement**

`packages/site-builder/src/net.js`:

```js
// One GET at a time, safely: never follows redirects (the caller decides), never reads more than
// maxBytes, and by default refuses hosts that resolve to private addresses. The address is
// checked in the lookup used to connect, so a second DNS answer cannot point elsewhere.
import dns from 'node:dns'
import http from 'node:http'
import https from 'node:https'
import net from 'node:net'
import zlib from 'node:zlib'

export const USER_AGENT = 'HosaitSiteBuilder/0.1 (+https://hosait.com)'

/** @param {string} ip */
export function isPublicAddress(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number)
    if (a === 0 || a === 10 || a === 127 || a >= 224) return false
    if (a === 100 && b >= 64 && b <= 127) return false
    if (a === 169 && b === 254) return false
    if (a === 172 && b >= 16 && b <= 31) return false
    if (a === 192 && (b === 168 || b === 0)) return false
    if (a === 198 && (b === 18 || b === 19)) return false
    return true
  }
  if (net.isIPv6(ip)) {
    const v = ip.toLowerCase()
    if (v === '::' || v === '::1') return false
    const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(v)
    if (mapped) return isPublicAddress(mapped[1])
    if (/^f[cd]/.test(v) || /^fe[89ab]/.test(v) || /^ff/.test(v)) return false
    return true
  }
  return false
}

export function publicOnlyLookup(hostname, options, callback) {
  dns.lookup(hostname, { all: true }, (err, addresses) => {
    if (err) return callback(err)
    if (!addresses.length || addresses.some((a) => !isPublicAddress(a.address))) {
      return callback(Object.assign(new Error(`${hostname} resolves to a private address`), { code: 'EPRIVATE' }))
    }
    if (options && options.all) return callback(null, addresses)
    callback(null, addresses[0].address, addresses[0].family)
  })
}

/**
 * @param {string} url
 * @param {{ maxBytes?: number, timeoutMs?: number, allowPrivate?: boolean, accept?: string }} [opts]
 * @returns {Promise<{ status: number, headers: import('node:http').IncomingHttpHeaders, body: Buffer, truncated: boolean }>}
 */
export function get(url, { maxBytes = 2 * 1024 * 1024, timeoutMs = 15000, allowPrivate = false, accept = '*/*' } = {}) {
  let u
  try { u = new URL(url) } catch { return Promise.reject(new Error(`${url}: not a URL`)) }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return Promise.reject(new Error(`${url}: only http and https`))
  if (!allowPrivate && u.port && u.port !== (u.protocol === 'https:' ? '443' : '80')) return Promise.reject(new Error(`${url}: only standard ports`))
  const mod = u.protocol === 'https:' ? https : http
  return new Promise((resolve, reject) => {
    const options = { headers: { 'User-Agent': USER_AGENT, Accept: accept, 'Accept-Encoding': 'gzip, br' }, timeout: timeoutMs }
    if (!allowPrivate) options.lookup = publicOnlyLookup
    const req = mod.get(u, options, (res) => {
      const enc = String(res.headers['content-encoding'] || '')
      const stream = enc.includes('br') ? res.pipe(zlib.createBrotliDecompress()) : enc.includes('gzip') ? res.pipe(zlib.createGunzip()) : res
      const chunks = []
      let size = 0
      let truncated = false
      const finish = () => resolve({ status: res.statusCode || 0, headers: res.headers, body: Buffer.concat(chunks), truncated })
      stream.on('data', (c) => {
        if (truncated) return
        size += c.length
        if (size > maxBytes) {
          truncated = true
          chunks.push(c.subarray(0, c.length - (size - maxBytes)))
          res.destroy()
          finish()
        } else chunks.push(c)
      })
      stream.on('end', finish)
      stream.on('error', (e) => (truncated ? finish() : reject(e)))
    })
    req.on('timeout', () => req.destroy(new Error(`${url}: timed out`)))
    req.on('error', reject)
  })
}
```

`packages/site-builder/src/robots.js`:

```js
// A small robots.txt reader: the group for our user agent (or *), Allow/Disallow by longest
// match (Allow wins a tie), * and $ in paths, and Sitemap lines.

/** @param {string} text @param {string} [agent] */
export function parseRobots(text, agent = 'HosaitSiteBuilder') {
  const groups = []
  const sitemaps = []
  let current = null
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim()
    if (!line) continue
    const m = /^([A-Za-z-]+)[ \t]*:[ \t]*(.*)$/.exec(line)
    if (!m) continue
    const key = m[1].toLowerCase()
    const value = m[2].trim()
    if (key === 'sitemap') { if (value) sitemaps.push(value); continue }
    if (key === 'user-agent') {
      if (!current || current.rules.length) { current = { agents: [], rules: [] }; groups.push(current) }
      current.agents.push(value.toLowerCase())
      continue
    }
    if ((key === 'allow' || key === 'disallow') && current) current.rules.push({ allow: key === 'allow', path: value })
  }
  const me = agent.toLowerCase()
  const mine = groups.filter((g) => g.agents.some((a) => a !== '*' && me.includes(a)))
  const rules = (mine.length ? mine : groups.filter((g) => g.agents.includes('*'))).flatMap((g) => g.rules).filter((r) => r.path)
  return {
    sitemaps,
    /** @param {string} pathname */
    allowed(pathname) {
      let best = null
      for (const r of rules) {
        if (!matches(r.path, pathname)) continue
        if (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow)) best = r
      }
      return !best || best.allow
    },
  }
}

function matches(pattern, pathname) {
  const anchored = pattern.endsWith('$')
  const body = (anchored ? pattern.slice(0, -1) : pattern).split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*')
  return new RegExp('^' + body + (anchored ? '$' : '')).test(pathname)
}
```

Wiring: add `.site-builder/` to `.gitignore`, add `packages` and `.site-builder` to
`.dockerignore`, and add `'packages/'` to the `ignores` array in `eslint.config.mjs`. The
package is plain JavaScript and has its own tests.

- [ ] **Step 4: Run the tests to see them pass**

Run: `npm test --prefix packages/site-builder && pnpm -s lint`
Expected: PASS, 7 tests, and a clean lint.

- [ ] **Step 5: Commit**

```bash
git add packages/site-builder .gitignore .dockerignore eslint.config.mjs
git commit -m "site-builder: package, safe GET (public addresses only, capped) and robots.txt

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: crawl — a polite crawl into a cached inventory

**Files:**
- Create: `packages/site-builder/src/detect.js`, `packages/site-builder/src/crawl.js`
- Test: `packages/site-builder/test/crawl.test.js`

**Interfaces:**
- Consumes (Task 5): `get`, `parseRobots`.
- Produces:
  - `crawl(start, { out, maxPages?, concurrency?, delayMs?, allowPrivate?, get?, log? })`
    returns `Promise<Inventory>` and writes `out/inventory.json`, `out/urls.json` and
    `out/raw/<sha1>.html`.
  - `Inventory = { version: 1, source, crawledAt, robots: { sitemaps, blocked }, pages: Page[], media: { url, foundOn[] }[], documents: { url, foundOn[] }[], trackers: { name, pages }[], embeds: { name, pages }[], cms: { name, pages }[], languages: string[] }`
  - `Page = { url, status, location?, contentType?, file?, title?, lang?, alternates?: { lang, href }[] }`
  - `urls.json` is `{ main: { <lang or "default">: [{ url, path, status }] } }`, the shape
    `scripts/qa/url-parity.ts` reads.
  - `detect.trackers(html)`, `detect.embeds(html)`, `detect.cms(html)` each return
    `string[]`. `sameSite(hostA, hostB)` and `normalize(href, base)` are exported.

- [ ] **Step 1: Write the failing tests**

`packages/site-builder/test/crawl.test.js`:

```js
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { crawl, normalize, sameSite } from '../src/crawl.js'
import { serve } from './server.js'

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'crawl-'))
const page = (title, body, lang = 'en', head = '') => ({ body: `<!doctype html><html lang="${lang}"><head><title>${title}</title>${head}</head><body>${body}</body></html>` })

function site(extra = {}) {
  return serve({
    '/robots.txt': (req) => ({ headers: { 'content-type': 'text/plain' }, body: `User-agent: *\nDisallow: /private\nSitemap: http://${req.headers.host}/sitemap.xml\n` }),
    '/sitemap.xml': (req) => ({ headers: { 'content-type': 'application/xml' }, body: `<urlset><url><loc>http://${req.headers.host}/</loc></url><url><loc>http://${req.headers.host}/news/a</loc></url></urlset>` }),
    '/': page('Home',
      `<nav><a href="/about">About</a> <a href="/contact?utm_source=x">Contact</a></nav>
       <main><img src="/wp-content/uploads/hero.jpg" alt="Hero"><p>Welcome</p>
       <a href="https://external.example/">Partner</a> <a href="/private/secret">Secret</a>
       <a href="/files/report.pdf">Report</a> <a href="/old">Old</a> <a href="/out">Out</a>
       <iframe src="https://www.youtube.com/embed/abc"></iframe></main>
       <script src="https://www.googletagmanager.com/gtm.js?id=GTM-X"></script>`,
      'en', '<link rel="alternate" hreflang="no" href="/no/">'),
    '/about': page('About', '<p>About us</p>'),
    '/contact': page('Contact', '<p>Call us</p>'),
    '/news/a': page('News A', '<p>Story</p>'),
    '/no/': page('Hjem', '<p>Velkommen</p>', 'no'),
    '/old': { status: 301, headers: { location: '/about' } },
    '/out': { status: 301, headers: { location: 'https://elsewhere.example/' } },
    ...extra,
  })
}

test('normalize drops hashes and tracking parameters; sameSite treats www and apex as one site', () => {
  assert.equal(normalize('/a?utm_source=x&id=2#top', 'https://x.no/'), 'https://x.no/a?id=2')
  assert.equal(normalize('mailto:a@x.no', 'https://x.no/'), null)
  assert.equal(sameSite('www.x.no', 'x.no'), true)
  assert.equal(sameSite('shop.x.no', 'x.no'), false)
})

test('crawls the site from the start page and sitemap, obeys robots.txt and records what it finds', async () => {
  const s = await site()
  const out = tmp()
  try {
    const inv = await crawl(s.url + '/', { out, allowPrivate: true, delayMs: 0 })
    const paths = inv.pages.map((p) => new URL(p.url).pathname + new URL(p.url).search)
    for (const p of ['/', '/about', '/contact', '/news/a', '/no/', '/old', '/out']) assert.ok(paths.includes(p), p)
    assert.ok(!s.requests.some((r) => r.startsWith('/private')), 'robots.txt obeyed')
    assert.ok(inv.robots.blocked.some((u) => u.includes('/private/secret')))
    assert.ok(!paths.some((p) => p.includes('external')))
    const old = inv.pages.find((p) => p.url.endsWith('/old'))
    assert.equal(old.status, 301)
    const outPage = inv.pages.find((p) => p.url.endsWith('/out'))
    assert.deepEqual([outPage.status, outPage.location], [301, 'https://elsewhere.example/'])
    assert.ok(!s.requests.includes('/elsewhere'), 'another host is never followed')
    assert.ok(inv.media.some((m) => m.url.endsWith('/wp-content/uploads/hero.jpg')))
    assert.ok(inv.documents.some((d) => d.url.endsWith('/files/report.pdf')))
    assert.deepEqual(inv.trackers.map((t) => t.name), ['Google Tag Manager'])
    assert.deepEqual(inv.embeds.map((t) => t.name), ['YouTube'])
    assert.deepEqual(inv.cms.map((t) => t.name), ['WordPress'])
    assert.deepEqual(inv.languages.sort(), ['en', 'no'])
    const home = inv.pages.find((p) => new URL(p.url).pathname === '/')
    assert.ok(fs.existsSync(path.join(out, home.file)))
    const urls = JSON.parse(fs.readFileSync(path.join(out, 'urls.json'), 'utf8'))
    assert.ok(urls.main.en.some((e) => e.path === '/about' && e.status === 200))
  } finally { await s.close() }
})

test('the page cap is respected', async () => {
  const s = await site()
  try {
    const inv = await crawl(s.url + '/', { out: tmp(), allowPrivate: true, delayMs: 0, maxPages: 2 })
    assert.equal(inv.pages.length, 2)
  } finally { await s.close() }
})

test('a sitemap index that lists itself does not hang the crawl', async () => {
  const s = await site({ '/sitemap.xml': (req) => ({ headers: { 'content-type': 'application/xml' }, body: `<sitemapindex><sitemap><loc>http://${req.headers.host}/sitemap.xml</loc></sitemap></sitemapindex>` }) })
  try {
    const inv = await crawl(s.url + '/', { out: tmp(), allowPrivate: true, delayMs: 0 })
    assert.ok(inv.pages.length > 0)
  } finally { await s.close() }
})

test('without allowPrivate a local site is refused', async () => {
  await assert.rejects(crawl('http://localhost/', { out: tmp(), delayMs: 0 }), (e) => e.code === 'EPRIVATE')
})
```

- [ ] **Step 2: Run them to see them fail**

Run: `npm test --prefix packages/site-builder`
Expected: FAIL with `Cannot find module '…/src/crawl.js'`.

- [ ] **Step 3: Implement**

`packages/site-builder/src/detect.js`:

```js
// What a page loads, by pattern. Used for the consent questions and the report.
const TRACKERS = [
  ['Google Tag Manager', /googletagmanager\.com\/(gtm\.js|ns\.html)/i],
  ['Google Analytics', /google-analytics\.com\/|googletagmanager\.com\/gtag\/js/i],
  ['Meta Pixel', /connect\.facebook\.net\/[^"']*fbevents\.js/i],
  ['LinkedIn Insight', /snap\.licdn\.com\/li\.lms-analytics/i],
  ['Hotjar', /static\.hotjar\.com/i],
  ['HubSpot', /js\.hs-scripts\.com|js\.hs-analytics\.net/i],
  ['Matomo', /\/matomo\.js|\/piwik\.js/i],
  ['Plausible', /plausible\.io\/js/i],
  ['Fathom', /cdn\.usefathom\.com/i],
  ['Microsoft Clarity', /clarity\.ms\/tag/i],
]
const EMBEDS = [
  ['YouTube', /<iframe[^>]+(youtube\.com|youtube-nocookie\.com|youtu\.be)\//i],
  ['Vimeo', /<iframe[^>]+player\.vimeo\.com/i],
  ['Google Maps', /<iframe[^>]+google\.[a-z.]+\/maps/i],
  ['Intercom', /widget\.intercom\.io/i],
  ['HubSpot forms', /js\.hsforms\.net|hbspt\.forms/i],
  ['Typeform', /embed\.typeform\.com/i],
  ['Calendly', /assets\.calendly\.com/i],
]
const CMS = [
  ['WordPress', /\/wp-content\/|<meta[^>]+generator[^>]+WordPress/i],
  ['Prismic', /images\.prismic\.io|cdn\.prismic\.io|\.prismic\.io\/api/i],
  ['Gatsby', /id="___gatsby"/i],
  ['Next.js', /id="__NEXT_DATA__"|\/_next\/static\//i],
  ['Craft CMS', /<meta[^>]+generator[^>]+Craft CMS|\/cpresources\//i],
  ['Drupal', /<meta[^>]+generator[^>]+Drupal|\/sites\/default\/files\//i],
  ['Umbraco', /<meta[^>]+generator[^>]+Umbraco|\/umbraco\//i],
  ['Optimizely (Episerver)', /\/episerver\/|EPiServer/i],
  ['Squarespace', /static1\.squarespace\.com/i],
  ['Wix', /static\.wixstatic\.com/i],
  ['Webflow', /assets\.website-files\.com|data-wf-site/i],
  ['Shopify', /cdn\.shopify\.com/i],
]
const names = (table, html) => table.filter(([, re]) => re.test(html)).map(([n]) => n)

export const detect = {
  /** @param {string} html */ trackers: (html) => names(TRACKERS, html),
  /** @param {string} html */ embeds: (html) => names(EMBEDS, html),
  /** @param {string} html */ cms: (html) => names(CMS, html),
}
```

`packages/site-builder/src/crawl.js`:

```js
// Crawl one website politely and cache its HTML: robots.txt, same site (www/apex count as
// one), sitemap first, then links; a page cap, two workers and a pause between requests.
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'

import { detect } from './detect.js'
import { get as defaultGet } from './net.js'
import { parseRobots } from './robots.js'

const IMAGE = /\.(jpe?g|png|gif|webp|svg|avif|ico|bmp|tiff?)$/i
const DOCUMENT = /\.(pdf|docx?|xlsx?|pptx?|zip|csv|txt|mp4|mov|webm)$/i
const SKIP = /\.(css|js|mjs|json|xml|rss|atom|woff2?|ttf|otf|eot|map)$/i
const MAX_SITEMAPS = 50
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex')

/** @param {string} a @param {string} b */
export function sameSite(a, b) {
  const bare = (h) => h.toLowerCase().replace(/^www\./, '')
  return bare(a) === bare(b)
}

/** @param {string} href @param {string} base @returns {string|null} */
export function normalize(href, base) {
  let u
  try { u = new URL(href, base) } catch { return null }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
  u.hash = ''
  for (const k of [...u.searchParams.keys()]) if (/^(utm_|fbclid$|gclid$|mc_)/i.test(k)) u.searchParams.delete(k)
  return u.toString()
}

function tally(map) {
  return [...map].map(([name, pages]) => ({ name, pages })).sort((a, b) => b.pages - a.pages)
}

/**
 * @param {string} start
 * @param {{ out: string, maxPages?: number, concurrency?: number, delayMs?: number, allowPrivate?: boolean, get?: typeof defaultGet, log?: (s: string) => void }} opts
 */
export async function crawl(start, opts) {
  const { out, maxPages = 500, concurrency = 2, delayMs = 250, allowPrivate = false, log = () => {} } = opts
  const get = opts.get ?? defaultGet
  const first = normalize(start, start)
  if (!first) throw new Error(`${start}: not an http(s) address`)
  const root = new URL(first)
  const rawDir = path.join(out, 'raw')
  fs.mkdirSync(rawDir, { recursive: true })

  // robots.txt decides what we may read. A refused (private) host stops everything here.
  let robotsText = ''
  try {
    const r = await get(new URL('/robots.txt', root).toString(), { allowPrivate, maxBytes: 512 * 1024 })
    if (r.status === 200) robotsText = r.body.toString('utf8')
  } catch (e) {
    if (e.code === 'EPRIVATE') throw e
  }
  const robots = parseRobots(robotsText)

  const pages = []
  const queue = []
  const seen = new Set()
  const blocked = new Set()
  const media = new Map()
  const documents = new Map()
  const trackers = new Map()
  const embeds = new Map()
  const cms = new Map()
  const languages = new Set()
  const note = (map, key, from) => map.set(key, (map.get(key) || new Set()).add(from))
  const count = (map, names) => names.forEach((n) => map.set(n, (map.get(n) || 0) + 1))

  function enqueue(href, from) {
    const n = normalize(href, from)
    if (!n) return
    const u = new URL(n)
    if (!sameSite(u.hostname, root.hostname)) return
    if (SKIP.test(u.pathname)) return
    if (IMAGE.test(u.pathname)) return note(media, n, from)
    if (DOCUMENT.test(u.pathname)) return note(documents, n, from)
    if (seen.has(n)) return
    seen.add(n)
    if (!robots.allowed(u.pathname)) return blocked.add(n)
    queue.push(n)
  }

  // Sitemaps first: robots.txt's Sitemap lines, then the usual names. Each file is read once.
  const sitemapSeen = new Set()
  async function readSitemap(url) {
    if (sitemapSeen.has(url) || sitemapSeen.size >= MAX_SITEMAPS) return
    sitemapSeen.add(url)
    let r
    try { r = await get(url, { allowPrivate, maxBytes: 10 * 1024 * 1024 }) } catch { return }
    if (r.status !== 200) return
    const $ = cheerio.load(r.body.toString('utf8'), { xmlMode: true })
    const subs = $('sitemap > loc').map((_, e) => $(e).text().trim()).get()
    for (const s of subs) await readSitemap(s)
    $('url > loc').each((_, e) => enqueue($(e).text().trim(), url))
  }
  enqueue(root.toString(), root.toString())
  for (const s of [...robots.sitemaps, new URL('/sitemap.xml', root).toString(), new URL('/sitemap_index.xml', root).toString()]) await readSitemap(s)

  // A slot is reserved before the request, so two workers can never pass the cap together.
  let reserved = 0
  async function visit(url) {
    if (reserved >= maxPages) return
    reserved++
    let r
    try { r = await get(url, { allowPrivate, accept: 'text/html,application/xhtml+xml' }) } catch (e) {
      pages.push({ url, status: 0, error: e.message })
      return
    }
    const record = { url, status: r.status, contentType: String(r.headers['content-type'] || '').split(';')[0] }
    pages.push(record)
    log(`${r.status} ${url}`)
    if (r.status >= 300 && r.status < 400 && r.headers.location) {
      record.location = new URL(r.headers.location, url).toString()
      enqueue(record.location, url)
      return
    }
    if (r.status !== 200 || !/html/i.test(record.contentType)) return
    const html = r.body.toString('utf8')
    record.file = path.join('raw', `${sha1(url)}.html`)
    fs.writeFileSync(path.join(out, record.file), html)
    const $ = cheerio.load(html)
    record.title = $('title').first().text().trim()
    record.lang = ($('html').attr('lang') || '').trim().toLowerCase() || undefined
    if (record.lang) languages.add(record.lang.split('-')[0])
    record.alternates = $('link[rel="alternate"][hreflang]').map((_, e) => ({ lang: String($(e).attr('hreflang')).toLowerCase(), href: normalize(String($(e).attr('href')), url) })).get().filter((a) => a.href)
    for (const a of record.alternates) { if (a.lang !== 'x-default') languages.add(a.lang.split('-')[0]); enqueue(a.href, url) }
    count(trackers, detect.trackers(html))
    count(embeds, detect.embeds(html))
    count(cms, detect.cms(html))
    $('a[href]').each((_, e) => enqueue(String($(e).attr('href')), url))
    $('img[src]').each((_, e) => { const n = normalize(String($(e).attr('src')), url); if (n) note(media, n, url) })
  }

  let active = 0
  async function worker() {
    while (reserved < maxPages) {
      const url = queue.shift()
      if (!url) {
        if (active === 0) return
        await sleep(20)
        continue
      }
      active++
      try { await visit(url) } finally { active-- }
      if (delayMs) await sleep(delayMs)
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))

  const inventory = {
    version: 1,
    source: root.toString(),
    crawledAt: new Date().toISOString(),
    robots: { sitemaps: robots.sitemaps, blocked: [...blocked] },
    pages,
    media: [...media].map(([url, on]) => ({ url, foundOn: [...on].slice(0, 5) })),
    documents: [...documents].map(([url, on]) => ({ url, foundOn: [...on].slice(0, 5) })),
    trackers: tally(trackers),
    embeds: tally(embeds),
    cms: tally(cms),
    languages: [...languages],
  }
  fs.writeFileSync(path.join(out, 'inventory.json'), JSON.stringify(inventory, null, 2))
  // The shape scripts/qa/url-parity.ts reads (site "main", per language).
  const urls = { main: {} }
  for (const p of pages) {
    const key = p.lang ? p.lang.split('-')[0] : 'default'
    ;(urls.main[key] ??= []).push({ url: p.url, path: new URL(p.url).pathname, status: p.status })
  }
  fs.writeFileSync(path.join(out, 'urls.json'), JSON.stringify(urls, null, 2))
  return inventory
}
```

Note that `'/no/'` is reached through the `hreflang` alternate, and `'/contact'` through
the nav link with its `utm_source` stripped.

- [ ] **Step 4: Run the tests to see them pass**

Run: `npm test --prefix packages/site-builder`
Expected: PASS, 12 tests in total.

- [ ] **Step 5: Commit**

```bash
git add packages/site-builder/src/detect.js packages/site-builder/src/crawl.js packages/site-builder/test/crawl.test.js
git commit -m "site-builder crawl: robots.txt, sitemaps, same site, caps; inventory, urls.json and cached pages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: extract — pages, navigation, footer, images and templates

**Files:**
- Create: `packages/site-builder/src/extract.js`
- Test: `packages/site-builder/test/extract.test.js`

**Interfaces:**
- Consumes (Task 6): `inventory.json` and `raw/*.html` in a folder.
- Produces:
  - `extractPage(html, url)` → `{ url, path, lang, title, description, ogImage, canonical, h1, headings: { level, text }[], mainHtml, textLength, images: { src, alt }[], links: string[], template, nav: { label, href }[], footer: { text, links: { label, href }[] } }`
  - `extract(dir)` → `{ version: 1, source, pages, templates: { id, count, examples }[], nav, footer }`, also written to `dir/extract.json`.

- [ ] **Step 1: Write the failing tests**

`packages/site-builder/test/extract.test.js`:

```js
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { extract, extractPage } from '../src/extract.js'

const shell = (main, title = 'Page') => `<!doctype html><html lang="en"><head><title>${title}</title>
  <meta name="description" content="About ${title}"><meta property="og:image" content="/og.jpg"></head>
  <body><header class="site-header"><nav><a href="/">Home</a><a href="/about">About</a></nav></header>
  ${main}
  <footer class="site-footer"><p>© Acme AS · Org 123</p><a href="/privacy">Privacy</a></footer></body></html>`

test('main content comes from <main>, without scripts, nav or event handlers', () => {
  const p = extractPage(shell('<main><h1>About</h1><p onclick="x()">We make things that last for many years in Norway and beyond.</p><script>evil()</script><nav>skip</nav></main>', 'About'), 'https://acme.no/about')
  assert.equal(p.h1, 'About')
  assert.match(p.mainHtml, /We make things/)
  assert.doesNotMatch(p.mainHtml, /evil|onclick|skip/)
  assert.equal(p.description, 'About About')
  assert.equal(p.ogImage, 'https://acme.no/og.jpg')
  assert.deepEqual(p.nav.map((n) => n.label), ['Home', 'About'])
  assert.match(p.footer.text, /Acme AS/)
})

test('without main or article, the largest block of paragraph text is the content, never the footer', () => {
  const body = `<div class="wrap"><div class="side"><p>Short.</p></div>
    <div class="content"><p>${'Long story. '.repeat(40)}</p><p>${'More text. '.repeat(30)}</p></div></div>`
  const p = extractPage(shell(body), 'https://acme.no/x')
  assert.match(p.mainHtml, /Long story/)
  assert.doesNotMatch(p.mainHtml, /Acme AS/)
  assert.doesNotMatch(p.mainHtml, /Short\./)
})

test('images use the largest srcset candidate, as absolute URLs, with alt text', () => {
  const p = extractPage(shell('<main><p>x</p><img src="/a-400.jpg" srcset="/a-400.jpg 400w, /a-1600.jpg 1600w, /a-800.jpg 800w" alt="A"></main>'), 'https://acme.no/')
  assert.deepEqual(p.images, [{ src: 'https://acme.no/a-1600.jpg', alt: 'A' }])
})

test('pages with the same structure share a template; a different layout gets another', () => {
  const article = (t) => shell(`<main class="article"><h1>${t}</h1><div class="lead"><p>Lead</p></div><div class="body"><p>Text</p></div></main>`, t)
  const a = extractPage(article('One'), 'https://acme.no/news/1')
  const b = extractPage(article('Two'), 'https://acme.no/news/2')
  const home = extractPage(shell('<main class="home"><section class="hero"><h1>Hi</h1></section><section class="cards"></section></main>'), 'https://acme.no/')
  assert.equal(a.template, b.template)
  assert.notEqual(a.template, home.template)
})

test('extract(dir) reads the crawl, groups templates and picks the most common nav and footer', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'extract-'))
  fs.mkdirSync(path.join(dir, 'raw'))
  const pages = []
  for (const [i, url] of ['https://acme.no/news/1', 'https://acme.no/news/2', 'https://acme.no/'].entries()) {
    const html = i < 2 ? shell(`<main class="article"><h1>N${i}</h1><p>Text ${i}</p></main>`) : shell('<main class="home"><section class="hero"><h1>Hi</h1></section></main>')
    fs.writeFileSync(path.join(dir, 'raw', `${i}.html`), html)
    pages.push({ url, status: 200, file: `raw/${i}.html` })
  }
  pages.push({ url: 'https://acme.no/old', status: 301, location: 'https://acme.no/' })
  fs.writeFileSync(path.join(dir, 'inventory.json'), JSON.stringify({ version: 1, source: 'https://acme.no/', pages }))
  const model = extract(dir)
  assert.equal(model.pages.length, 3)
  assert.deepEqual(model.templates.map((t) => t.count), [2, 1])
  assert.deepEqual(model.nav.map((n) => n.href), ['https://acme.no/', 'https://acme.no/about'])
  assert.ok(fs.existsSync(path.join(dir, 'extract.json')))
})
```

- [ ] **Step 2: Run them to see them fail**

Run: `npm test --prefix packages/site-builder`
Expected: FAIL with `Cannot find module '…/src/extract.js'`.

- [ ] **Step 3: Implement**

`packages/site-builder/src/extract.js`:

```js
// Turns cached pages into a neutral model the mapping step (an AI) can read: per page its
// title, meta, headings, main content, images and links, plus a template fingerprint, and the
// site's navigation and footer.
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'

const CHROME = 'script, style, noscript, template, svg, iframe, form, nav, header, footer, aside, [role=navigation], [role=banner], [role=contentinfo], [aria-hidden=true]'
const MAX_MAIN = 50_000

const abs = (href, base) => { try { return new URL(href, base).toString() } catch { return null } }

/** The largest candidate in srcset, else src (or data-src). */
function imageSrc($img, base) {
  const set = String($img.attr('srcset') || '')
  let best = null
  let bestW = -1
  for (const part of set.split(',')) {
    const [u, d] = part.trim().split(/\s+/)
    if (!u) continue
    const w = /^(\d+)w$/.exec(d || '') ? Number(d.slice(0, -1)) : /^(\d+(\.\d+)?)x$/.exec(d || '') ? Number(d.slice(0, -1)) * 1000 : 0
    if (w > bestW) { best = u; bestW = w }
  }
  return abs(best || $img.attr('src') || $img.attr('data-src') || '', base)
}

function mainElement($) {
  for (const sel of ['main', '[role=main]', 'article']) {
    const m = $(sel).first()
    if (m.length) return m
  }
  // No landmark: the element with the most direct paragraph text that is not page chrome.
  let best = null
  let bestLen = 0
  $('body *').each((_, el) => {
    const $el = $(el)
    if ($el.is(CHROME) || $el.closest(CHROME).length) return
    const len = $el.children('p').text().trim().length
    if (len > bestLen) { best = $el; bestLen = len }
  })
  return best ?? $('body')
}

function signature($, el) {
  const cls = String($(el).attr('class') || '').split(/\s+/).filter((c) => c && !/\d/.test(c))[0]
  return el.tagName + (cls ? '.' + cls : '')
}

/** Structural fingerprint: the tags (and first class) two levels under body and under main. */
function template($, $main) {
  const parts = []
  $('body').children().each((_, a) => { parts.push(signature($, a)); $(a).children().each((__, b) => parts.push(' ' + signature($, b))) })
  $main.children().each((_, c) => parts.push('m ' + signature($, c)))
  return crypto.createHash('sha1').update(parts.join('|')).digest('hex').slice(0, 10)
}

function links($, $scope, base) {
  return $scope.find('a[href]').map((_, a) => ({ label: $(a).text().replace(/\s+/g, ' ').trim(), href: abs(String($(a).attr('href')), base) })).get().filter((l) => l.href && l.label)
}

/** @param {string} html @param {string} url */
export function extractPage(html, url) {
  const $ = cheerio.load(html)
  const navEl = $('header nav').first().length ? $('header nav').first() : $('nav, [role=navigation]').first()
  const footerEl = $('footer, [role=contentinfo]').first()
  const $main = mainElement($)
  const tpl = template($, $main)
  const main = $main.clone()
  main.find(CHROME).remove()
  main.find('*').each((_, el) => { for (const name of Object.keys(el.attribs || {})) if (/^on/i.test(name)) $(el).removeAttr(name) })
  const mainHtml = ($.html(main) || '').slice(0, MAX_MAIN)
  return {
    url,
    path: new URL(url).pathname,
    lang: String($('html').attr('lang') || '').toLowerCase() || undefined,
    title: $('title').first().text().trim(),
    description: $('meta[name="description"]').attr('content')?.trim() || undefined,
    ogImage: abs($('meta[property="og:image"]').attr('content') || '', url) || undefined,
    canonical: abs($('link[rel="canonical"]').attr('href') || '', url) || undefined,
    h1: $main.find('h1').first().text().trim() || $('h1').first().text().trim() || undefined,
    headings: $main.find('h1, h2, h3').map((_, h) => ({ level: Number(h.tagName[1]), text: $(h).text().trim() })).get(),
    mainHtml,
    textLength: main.text().replace(/\s+/g, ' ').trim().length,
    images: $main.find('img').map((_, img) => ({ src: imageSrc($(img), url), alt: String($(img).attr('alt') ?? '').trim() })).get().filter((i) => i.src),
    links: [...new Set(links($, $main, url).map((l) => l.href))],
    template: tpl,
    nav: navEl.length ? links($, navEl, url) : [],
    footer: { text: footerEl.text().replace(/\s+/g, ' ').trim().slice(0, 1000), links: footerEl.length ? links($, footerEl, url) : [] },
  }
}

function mostCommon(items, key) {
  const counts = new Map()
  for (const it of items) { const k = key(it); counts.set(k, (counts.get(k) || { n: 0, it })); counts.get(k).n++ }
  return [...counts.values()].sort((a, b) => b.n - a.n)[0]?.it
}

/** @param {string} dir a crawl folder (inventory.json + raw/) */
export function extract(dir) {
  const inventory = JSON.parse(fs.readFileSync(path.join(dir, 'inventory.json'), 'utf8'))
  const pages = inventory.pages
    .filter((p) => p.status === 200 && p.file)
    .map((p) => extractPage(fs.readFileSync(path.join(dir, p.file), 'utf8'), p.url))
  const byTemplate = new Map()
  for (const p of pages) { const t = byTemplate.get(p.template) || { id: p.template, count: 0, examples: [] }; t.count++; if (t.examples.length < 3) t.examples.push(p.url); byTemplate.set(p.template, t) }
  const model = {
    version: 1,
    source: inventory.source,
    pages,
    templates: [...byTemplate.values()].sort((a, b) => b.count - a.count),
    nav: mostCommon(pages.filter((p) => p.nav.length), (p) => JSON.stringify(p.nav))?.nav ?? [],
    footer: mostCommon(pages, (p) => p.footer.text)?.footer ?? { text: '', links: [] },
  }
  fs.writeFileSync(path.join(dir, 'extract.json'), JSON.stringify(model, null, 2))
  return model
}
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `npm test --prefix packages/site-builder`
Expected: PASS, 17 tests in total.

- [ ] **Step 5: Commit**

```bash
git add packages/site-builder/src/extract.js packages/site-builder/test/extract.test.js
git commit -m "site-builder extract: main content, meta, images, links, templates, nav and footer

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: theme — a theme.json draft that already passes Site Kit's contrast check

**Files:**
- Create: `packages/site-builder/src/theme.js`
- Test: `packages/site-builder/test/theme.test.js`

**Interfaces:**
- Consumes (Tasks 5 and 6): `get`, and `inventory.json` with the home page's cached HTML.
- Produces:
  - `parseColor(value)` → `{ r, g, b } | null`, `toHex(c)`, `contrast(hexA, hexB)`.
  - `themeFromCss(css, html, baseUrl)` → `{ theme: { colors, radius, logo }, fonts: { body, heading, googleFonts }, notes: string[] }`.
  - `theme(dir, { get?, allowPrivate? })` writes `dir/theme.draft.json`.
- `theme.colors` has exactly Site Kit's keys: `ink`, `brand`, `brandText`, `brandDark`,
  `tint`, `muted`, `highlight`, `background`. `PAIRS` mirrors `src/lib/theme.ts` in Site Kit,
  where every pair needs 4.5:1.

- [ ] **Step 1: Write the failing tests**

`packages/site-builder/test/theme.test.js`:

```js
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { contrast, PAIRS, parseColor, theme, themeFromCss, toHex } from '../src/theme.js'
import { serve } from './server.js'

const problems = (c) => PAIRS.filter(([f, b]) => contrast(f === 'white' ? '#ffffff' : c[f], b === 'white' ? '#ffffff' : c[b]) < 4.5)

test('colours parse from hex, short hex and rgb()', () => {
  assert.equal(toHex(parseColor('#abc')), '#aabbcc')
  assert.equal(toHex(parseColor('rgb(228, 0, 43)')), '#e4002b')
  assert.equal(parseColor('var(--x)'), null)
  assert.ok(Math.abs(contrast('#000000', '#ffffff') - 21) < 0.01)
})

test('brand comes from a --primary custom property; ink and background from body; every pair passes 4.5:1', () => {
  const css = ':root{--color-primary:#e4002b;--radius:6px}body{color:#222;background:#fff;font-family:Inter,sans-serif}h1,h2{font-family:"Merriweather",serif}a{color:#e4002b}.btn{background-color:#e4002b;border-radius:4px}.box{background:#f2f2f2}'
  const html = '<html><head><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Merriweather" rel="stylesheet"></head><body><header><a class="logo" href="/"><img src="/img/logo.svg" width="120" height="40" alt="Acme logo"></a></header></body></html>'
  const r = themeFromCss(css, html, 'https://acme.no/')
  assert.equal(r.theme.colors.ink, '#222222')
  assert.equal(r.theme.colors.background, '#ffffff')
  assert.deepEqual(problems(r.theme.colors), [])
  assert.deepEqual([r.fonts.body, r.fonts.heading], ['Inter', 'Merriweather'])
  assert.deepEqual(r.fonts.googleFonts, ['Inter', 'Merriweather'])
  assert.deepEqual(r.theme.logo, { src: 'https://acme.no/img/logo.svg', width: 120, height: 40 })
  assert.equal(r.theme.radius.button, '4px')
})

test('a light brand colour is darkened until white text reads on it, and the change is noted', () => {
  const r = themeFromCss(':root{--brand:#ffd400}body{color:#111;background:#fff}', '<html><body></body></html>', 'https://x.no/')
  assert.deepEqual(problems(r.theme.colors), [])
  assert.ok(r.notes.some((n) => /brand/.test(n) && /#ffd400/.test(n)))
})

test('no CSS at all still gives a theme that passes, using the kit defaults', () => {
  const r = themeFromCss('', '<html><body></body></html>', 'https://x.no/')
  assert.deepEqual(problems(r.theme.colors), [])
  assert.equal(r.theme.colors.background, '#ffffff')
})

test('theme(dir) reads the cached home page, fetches its stylesheets and writes theme.draft.json', async () => {
  const s = await serve({ '/site.css': { headers: { 'content-type': 'text/css' }, body: ':root{--primary:#0b5394}body{color:#1a1a1a;background:#ffffff}' } })
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'theme-'))
  try {
    fs.mkdirSync(path.join(dir, 'raw'))
    fs.writeFileSync(path.join(dir, 'raw', 'home.html'), `<html><head><link rel="stylesheet" href="${s.url}/site.css"></head><body></body></html>`)
    fs.writeFileSync(path.join(dir, 'inventory.json'), JSON.stringify({ version: 1, source: s.url + '/', pages: [{ url: s.url + '/', status: 200, file: 'raw/home.html' }] }))
    const r = await theme(dir, { allowPrivate: true })
    assert.equal(r.theme.colors.brand, '#0b5394')
    assert.ok(fs.existsSync(path.join(dir, 'theme.draft.json')))
  } finally { await s.close() }
})
```

- [ ] **Step 2: Run them to see them fail**

Run: `npm test --prefix packages/site-builder`
Expected: FAIL with `Cannot find module '…/src/theme.js'`.

- [ ] **Step 3: Implement**

`packages/site-builder/src/theme.js`:

```js
// Drafts Site Kit's site/theme.json from the old site's CSS: brand, text and background colours,
// fonts, radius and logo. Colours are then adjusted (only ever darkened) until every pair Site
// Kit checks reaches 4.5:1, and each change is noted, so `pnpm kit:theme-check` passes as is.
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'

import { get as defaultGet } from './net.js'

/** Mirrors PAIRS in site-kit src/lib/theme.ts. */
export const PAIRS = [
  ['ink', 'background'], ['ink', 'muted'], ['ink', 'tint'],
  ['brandText', 'background'], ['brandText', 'muted'],
  ['brandDark', 'tint'],
  ['white', 'ink'], ['white', 'brandDark'], ['white', 'brandText'], ['white', 'brand'],
  ['highlight', 'background'],
  ['tint', 'ink'], ['tint', 'brandDark'],
]
const DEFAULTS = { ink: '#14213d', brand: '#2a6fdb', muted: '#f4f5f7', background: '#ffffff', highlight: '#b0144f' }
const MAX_CSS = 2 * 1024 * 1024

export function parseColor(v) {
  const s = String(v).trim().toLowerCase()
  let m = /^#([0-9a-f]{3,8})$/.exec(s)
  if (m) {
    let h = m[1]
    if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split('').map((c) => c + c).join('')
    if (h.length !== 6 && h.length !== 8) return null
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) }
  }
  m = /^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/.exec(s)
  if (m) return { r: +m[1], g: +m[2], b: +m[3] }
  if (s === 'white') return { r: 255, g: 255, b: 255 }
  if (s === 'black') return { r: 0, g: 0, b: 0 }
  return null
}
export const toHex = (c) => '#' + [c.r, c.g, c.b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('')
function luminance(hex) {
  const { r, g, b } = parseColor(hex)
  const f = (x) => { const v = x / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
const saturation = (c) => { const max = Math.max(c.r, c.g, c.b); const min = Math.min(c.r, c.g, c.b); return max === 0 ? 0 : (max - min) / max }
const darken = (hex, t) => { const c = parseColor(hex); return toHex({ r: c.r * (1 - t), g: c.g * (1 - t), b: c.b * (1 - t) }) }
const mix = (a, b, t) => { const x = parseColor(a); const y = parseColor(b); return toHex({ r: x.r + (y.r - x.r) * t, g: x.g + (y.g - x.g) * t, b: x.b + (y.b - x.b) * t }) }
/** Darken in 5% steps until `hex` reaches 4.5:1 against every colour in `against`. */
function darkenUntil(hex, against) {
  let c = hex
  for (let i = 0; i < 40 && against.some((b) => contrast(c, b) < 4.5); i++) c = darken(c, 0.05)
  return c
}

/** @param {string} css @param {string} html @param {string} baseUrl */
export function themeFromCss(css, html, baseUrl) {
  const notes = []
  const counts = { text: new Map(), bg: new Map(), any: new Map() }
  const add = (map, hex) => map.set(hex, (map.get(hex) || 0) + 1)
  let brand = null
  let radius = null
  for (const m of css.matchAll(/--([\w-]+)\s*:\s*([^;}]+)/g)) {
    const c = parseColor(m[2])
    if (!brand && c && /primary|brand|accent|main/i.test(m[1]) && saturation(c) > 0.35) brand = toHex(c)
  }
  for (const m of css.matchAll(/(?:^|[;{\s])(color|background-color|background|border-color|fill)\s*:\s*([^;}]+)/g)) {
    const c = parseColor(m[2].split(/\s+/)[0])
    if (!c) continue
    const hex = toHex(c)
    add(counts.any, hex)
    add(m[1] === 'color' ? counts.text : counts.bg, hex)
  }
  for (const m of css.matchAll(/border-radius\s*:\s*([\d.]+(px|rem|em))/g)) { radius ??= m[1] }
  const top = (map, pred) => [...map].filter(([h]) => pred(h)).sort((a, b) => b[1] - a[1])[0]?.[0]
  const sat = (h) => saturation(parseColor(h)) > 0.35 && luminance(h) > 0.02 && luminance(h) < 0.9
  const background = top(counts.bg, (h) => luminance(h) > 0.85) ?? DEFAULTS.background
  // Text colour: dark and not saturated, so a dark brand-coloured link is never taken for it.
  let ink = top(counts.text, (h) => luminance(h) < 0.25 && saturation(parseColor(h)) < 0.35) ?? DEFAULTS.ink
  brand ??= top(counts.any, sat) ?? DEFAULTS.brand
  const muted = top(counts.bg, (h) => h !== background && luminance(h) > 0.8 && saturation(parseColor(h)) < 0.1) ?? DEFAULTS.muted
  let highlight = top(counts.any, (h) => sat(h) && h !== brand) ?? DEFAULTS.highlight

  const original = { brand, ink, highlight }
  const tint = mix(brand, '#ffffff', 0.85)
  ink = darkenUntil(ink, [background, muted, tint, '#ffffff'])
  brand = darkenUntil(brand, ['#ffffff'])
  const brandText = darkenUntil(brand, [background, muted, '#ffffff'])
  const brandDark = darkenUntil(darken(brand, 0.3), [tint, '#ffffff'])
  highlight = darkenUntil(highlight, [background])
  for (const [k, v] of Object.entries({ brand, ink, highlight })) if (v !== original[k]) notes.push(`${k} darkened from ${original[k]} to ${v} for 4.5:1 contrast`)

  const $ = cheerio.load(html)
  const families = (sel) => {
    const re = new RegExp(`(?:^|})\\s*([^{}]*\\b(?:${sel})\\b[^{}]*)\\{[^}]*font-family\\s*:\\s*([^;}]+)`, 'g')
    for (const m of css.matchAll(re)) return m[2].split(',')[0].replace(/["']/g, '').trim()
    return null
  }
  const googleFonts = [...new Set($('link[href*="fonts.googleapis.com"]').map((_, l) => [...String($(l).attr('href')).matchAll(/family=([^:&]+)/g)].map((m) => decodeURIComponent(m[1]).replace(/\+/g, ' '))).get().flat())]
  const logoEl = $('header img, a[class*=logo] img, img[class*=logo], img[alt*=logo i], img[src*=logo i]').first()
  const logo = logoEl.length
    ? { src: new URL(String(logoEl.attr('src')), baseUrl).toString(), width: Number(logoEl.attr('width')) || null, height: Number(logoEl.attr('height')) || null }
    : null
  if (!logo) notes.push('no logo found: add public/brand/logo.svg by hand')

  return {
    theme: {
      colors: { ink, brand, brandText, brandDark, tint, muted, highlight, background },
      radius: { button: radius ?? '9999px', card: '1rem' },
      logo,
    },
    fonts: { body: families('body|html'), heading: families('h1|h2') ?? families('body|html'), googleFonts },
    notes,
  }
}

/** @param {string} dir @param {{ get?: typeof defaultGet, allowPrivate?: boolean }} [opts] */
export async function theme(dir, opts = {}) {
  const get = opts.get ?? defaultGet
  const inventory = JSON.parse(fs.readFileSync(path.join(dir, 'inventory.json'), 'utf8'))
  const home = inventory.pages.find((p) => p.status === 200 && p.file && new URL(p.url).pathname === new URL(inventory.source).pathname) ?? inventory.pages.find((p) => p.status === 200 && p.file)
  const html = home ? fs.readFileSync(path.join(dir, home.file), 'utf8') : ''
  const $ = cheerio.load(html)
  let css = $('style').map((_, s) => $(s).text()).get().join('\n')
  for (const href of $('link[rel="stylesheet"][href]').map((_, l) => String($(l).attr('href'))).get().slice(0, 10)) {
    if (css.length > MAX_CSS) break
    try {
      const r = await get(new URL(href, home?.url ?? inventory.source).toString(), { allowPrivate: opts.allowPrivate, maxBytes: MAX_CSS - css.length, accept: 'text/css' })
      if (r.status === 200) css += '\n' + r.body.toString('utf8')
    } catch { /* a stylesheet that cannot be read only makes the draft less exact */ }
  }
  const result = themeFromCss(css, html, home?.url ?? inventory.source)
  fs.writeFileSync(path.join(dir, 'theme.draft.json'), JSON.stringify(result, null, 2))
  return result
}
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `npm test --prefix packages/site-builder`
Expected: PASS, 22 tests in total.

- [ ] **Step 5: Commit**

```bash
git add packages/site-builder/src/theme.js packages/site-builder/test/theme.test.js
git commit -m "site-builder theme: theme.json draft from the old site's CSS that passes the kit's contrast check

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: report, the command line, and wiring it into the repo

**Files:**
- Create: `packages/site-builder/src/report.js`, `packages/site-builder/bin/site-builder.js`, `packages/site-builder/README.md`
- Test: `packages/site-builder/test/report.test.js`, `packages/site-builder/test/cli.test.js`
- Modify: root `package.json` (scripts), `.github/workflows/ci.yml` (two steps)

**Interfaces:**
- Consumes (Tasks 6–8): `crawl`, `extract`, `theme`, and the files they write.
- Produces:
  - `report(dir)` → `string` (markdown), also written to `dir/report.md`.
  - CLI: `site-builder <crawl|extract|theme|report> [url] [--out dir] [--max n] [--allow-private]`.
    It exits 0 on success, and 2 on usage errors.
  - Root scripts: `pnpm site-builder …` and `pnpm site-builder:install`.

- [ ] **Step 1: Write the failing tests**

`packages/site-builder/test/report.test.js`:

```js
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { report } from '../src/report.js'

test('the report covers technology, tracking, templates, quick checks and enhancements', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'report-'))
  fs.writeFileSync(path.join(dir, 'inventory.json'), JSON.stringify({
    version: 1, source: 'https://acme.no/', crawledAt: '2026-10-11T10:00:00Z',
    pages: [{ url: 'https://acme.no/', status: 200 }, { url: 'https://acme.no/a', status: 200 }, { url: 'https://acme.no/old', status: 301, location: 'https://acme.no/a' }, { url: 'https://acme.no/gone', status: 404 }],
    media: [{ url: 'https://acme.no/x.jpg' }], documents: [{ url: 'https://acme.no/r.pdf' }],
    trackers: [{ name: 'Google Tag Manager', pages: 2 }], embeds: [{ name: 'YouTube', pages: 1 }], cms: [{ name: 'Prismic', pages: 2 }], languages: ['en', 'no'],
  }))
  fs.writeFileSync(path.join(dir, 'extract.json'), JSON.stringify({
    version: 1, source: 'https://acme.no/',
    pages: [
      { url: 'https://acme.no/', title: 'Home', description: 'd', h1: 'Hi', lang: 'en', images: [{ src: 'a', alt: '' }, { src: 'b', alt: 'B' }] },
      { url: 'https://acme.no/a', title: 'A', h1: '', lang: '', images: [] },
    ],
    templates: [{ id: 't1', count: 2, examples: ['https://acme.no/'] }],
  }))
  const md = report(dir)
  for (const s of ['# Website report: acme.no', '2 pages', '1 template', 'Prismic', 'en, no', 'Google Tag Manager', 'YouTube', 'Images without alt text: 1 of 2', 'Pages without a meta description: 1 of 2', 'Pages without an h1: 1 of 2', 'Pages without a language: 1 of 2', '301', '404', 'On-site search'])
    assert.ok(md.includes(s), s)
  assert.ok(fs.existsSync(path.join(dir, 'report.md')))
})
```

`packages/site-builder/test/cli.test.js`:

```js
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

import { serve } from './server.js'

const run = promisify(execFile)
const BIN = fileURLToPath(new URL('../bin/site-builder.js', import.meta.url))

test('crawl, extract, theme and report run end to end from the command line', async () => {
  const s = await serve({ '/': { body: '<html lang="en"><head><title>Home</title><style>body{color:#222;background:#fff}</style></head><body><main><h1>Hi</h1><p>Text</p></main></body></html>' } })
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-'))
  try {
    await run('node', [BIN, 'crawl', s.url + '/', '--out', out, '--allow-private'])
    for (const cmd of ['extract', 'theme', 'report']) await run('node', [BIN, cmd, '--out', out, ...(cmd === 'theme' ? ['--allow-private'] : [])])
    for (const f of ['inventory.json', 'urls.json', 'extract.json', 'theme.draft.json', 'report.md']) assert.ok(fs.existsSync(path.join(out, f)), f)
  } finally { await s.close() }
})

test('an unknown command prints the help and exits 2', async () => {
  await assert.rejects(run('node', [BIN, 'fly']), (e) => e.code === 2 && /site-builder <command>/.test(e.stdout + e.stderr))
})
```

- [ ] **Step 2: Run them to see them fail**

Run: `npm test --prefix packages/site-builder`
Expected: FAIL with `Cannot find module '…/src/report.js'` and `…/bin/site-builder.js`.

- [ ] **Step 3: Implement**

`packages/site-builder/src/report.js`:

```js
// The one-page website report: what the site runs on, what it tracks, its templates, quick
// accessibility and SEO checks, and what the new site could add. Free for the customer; the
// gaps are filled in after mapping.
import fs from 'node:fs'
import path from 'node:path'

const MEANING = {
  'Google Tag Manager': 'Loads other trackers. On Site Kit: only after consent, or replaced by the built-in analytics.',
  'Google Analytics': 'Only after consent. The built-in analytics needs no consent banner category of its own.',
  'Meta Pixel': 'Marketing; only after consent.',
  'LinkedIn Insight': 'Marketing; only after consent.',
  'Hotjar': 'Session recording; only after consent.',
}
const ENHANCEMENTS = [
  'On-site search (pages, articles, documents)',
  'An extra language, with AI-assisted translation',
  'An accessibility statement',
  'Faster images (WebP sizes generated at upload)',
  'Structured data for search engines',
  'Newsletter sign-up',
  'Forms sent to your CRM',
]
const pct = (n, of) => `${n} of ${of}`

/** @param {string} dir */
export function report(dir) {
  const inv = JSON.parse(fs.readFileSync(path.join(dir, 'inventory.json'), 'utf8'))
  const ex = fs.existsSync(path.join(dir, 'extract.json')) ? JSON.parse(fs.readFileSync(path.join(dir, 'extract.json'), 'utf8')) : { pages: [], templates: [] }
  const host = new URL(inv.source).hostname
  const ok = inv.pages.filter((p) => p.status === 200)
  const redirects = inv.pages.filter((p) => p.status >= 300 && p.status < 400)
  const broken = inv.pages.filter((p) => p.status >= 400 || p.status === 0)
  const images = ex.pages.flatMap((p) => p.images || [])
  const lines = [
    `# Website report: ${host}`,
    '',
    `Read on ${String(inv.crawledAt).slice(0, 10)}: ${ok.length} pages (${ex.templates.length} template${ex.templates.length === 1 ? '' : 's'}), ${inv.media.length} images, ${inv.documents.length} documents.`,
    '',
    '## Technology',
    '',
    `- Built with: ${inv.cms.length ? inv.cms.map((c) => c.name).join(', ') : 'not recognised'}`,
    `- Languages: ${inv.languages.length ? [...inv.languages].sort().join(', ') : 'not marked'}`,
    '',
    '## Cookies and tracking',
    '',
  ]
  if (!inv.trackers.length && !inv.embeds.length) lines.push('Nothing found that needs consent.')
  else {
    lines.push('| Service | Pages | On Site Kit |', '|---|---|---|')
    for (const t of inv.trackers) lines.push(`| ${t.name} | ${t.pages} | ${MEANING[t.name] ?? 'Only after consent.'} |`)
    for (const e of inv.embeds) lines.push(`| ${e.name} (embed) | ${e.pages} | Loads after consent${e.name === 'YouTube' ? ', from youtube-nocookie' : ''}. |`)
  }
  lines.push('', '## Templates', '', '| Template | Pages | Example |', '|---|---|---|')
  for (const t of ex.templates) lines.push(`| ${t.id} | ${t.count} | ${t.examples[0] ?? ''} |`)
  const n = ex.pages.length
  lines.push(
    '',
    '## Quick accessibility and SEO checks',
    '',
    `- Images without alt text: ${pct(images.filter((i) => !i.alt).length, images.length)}`,
    `- Pages without a meta description: ${pct(ex.pages.filter((p) => !p.description).length, n)}`,
    `- Pages without an h1: ${pct(ex.pages.filter((p) => !p.h1).length, n)}`,
    `- Pages without a language: ${pct(ex.pages.filter((p) => !p.lang).length, n)}`,
    '',
    '## Redirects and errors found',
    '',
    `- ${redirects.length} redirects (301/302/308) and ${broken.length} broken addresses (404 or unreachable).`,
    ...[...redirects, ...broken].slice(0, 10).map((p) => `  - ${p.status} ${p.url}${p.location ? ` → ${p.location}` : ''}`),
    '',
    '## What the new site could add',
    '',
    ...ENHANCEMENTS.map((e) => `- ${e}`),
    '',
    '## Gaps',
    '',
    'Filled in after mapping: sections of the old site that no Site Kit block matches yet.',
    '',
  )
  const md = lines.join('\n')
  fs.writeFileSync(path.join(dir, 'report.md'), md)
  return md
}
```

`packages/site-builder/bin/site-builder.js`:

```js
#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

import { crawl } from '../src/crawl.js'
import { extract } from '../src/extract.js'
import { report } from '../src/report.js'
import { theme } from '../src/theme.js'

const HELP = `site-builder <command> [options]

  crawl <url>   Read the site politely and cache its pages (robots.txt, same site, max 500 pages)
  extract       Pull pages, navigation, footer, images and templates out of the cached pages
  theme         Draft site/theme.json colours, fonts and logo from the site's CSS
  report        Write report.md: technology, tracking, templates, quick checks, enhancements

Options:
  --out <dir>        Working folder (default .site-builder/<host> for crawl, required otherwise)
  --max <n>          Page cap for crawl (default 500)
  --allow-private    Allow private and local addresses (for testing and intranet sites)
`

const args = process.argv.slice(2)
const flag = (name) => { const i = args.indexOf(name); return i === -1 ? undefined : args[i + 1] }
const has = (name) => args.includes(name)
const [cmd, target] = args
const usage = (msg) => { if (msg) console.error(msg); console.log(HELP); process.exit(2) }

try {
  if (cmd === 'crawl') {
    if (!target || target.startsWith('--')) usage('crawl needs a URL')
    const out = flag('--out') ?? path.join('.site-builder', new URL(target).hostname)
    const inv = await crawl(target, { out, maxPages: Number(flag('--max') ?? 500), allowPrivate: has('--allow-private'), log: (s) => console.log(s) })
    console.log(`\n${inv.pages.length} pages, ${inv.media.length} images, ${inv.documents.length} documents → ${out}`)
  } else if (cmd === 'extract' || cmd === 'theme' || cmd === 'report') {
    const out = flag('--out')
    if (!out || !fs.existsSync(path.join(out, 'inventory.json'))) usage(`${cmd} needs --out <dir> pointing at a crawl folder`)
    if (cmd === 'extract') { const m = extract(out); console.log(`${m.pages.length} pages, ${m.templates.length} templates → ${path.join(out, 'extract.json')}`) }
    if (cmd === 'theme') { const t = await theme(out, { allowPrivate: has('--allow-private') }); console.log(JSON.stringify(t.theme.colors)); for (const n of t.notes) console.log('note: ' + n) }
    if (cmd === 'report') { report(out); console.log(`→ ${path.join(out, 'report.md')}`) }
  } else usage(cmd && cmd !== '--help' ? `unknown command: ${cmd}` : undefined)
} catch (e) {
  console.error(e.code === 'EPRIVATE' ? `${e.message}. Use --allow-private only for your own local or intranet sites.` : e.message)
  process.exit(1)
}
```

Make it executable: `chmod +x packages/site-builder/bin/site-builder.js`.

`packages/site-builder/README.md`:

```markdown
# @hosait/site-builder

Reads an existing website so it can be rebuilt on Hosait Site Kit. The steps that need no AI:

    site-builder crawl https://www.example.com     # → .site-builder/www.example.com/
    site-builder extract --out .site-builder/www.example.com
    site-builder theme   --out .site-builder/www.example.com
    site-builder report  --out .site-builder/www.example.com

In a Site Kit repository: `pnpm site-builder:install` once, then `pnpm site-builder crawl <url>`.

- **crawl** reads robots.txt and obeys it, reads the sitemap, follows links on the same site
  (www and apex count as one), and stops at 500 pages. Two requests at a time, with a pause.
  It caches each page's HTML in `raw/`, lists media, documents, trackers, embeds and the CMS
  in `inventory.json`, and writes `urls.json` for Site Kit's `pnpm qa:urls`.
- **extract** writes `extract.json`: per page the title, meta, headings, main content, images
  and links, plus a template fingerprint, the navigation and the footer. This is what you (or
  your AI) map to Site Kit blocks in `seed/site-plan.json`.
- **theme** writes `theme.draft.json`. Copy `theme` into `site/theme.json`, use `fonts` in
  `site/fonts.ts`, and save the logo under `public/brand/`. Colours are already darkened where
  Site Kit's 4.5:1 contrast check needs it; `notes` lists each change.
- **report** writes `report.md` for the customer.

Private, loopback and link-local addresses are refused, and this is checked when connecting.
`--allow-private` is for your own local or intranet sites.
```

Root `package.json`, add to `scripts`:

```json
    "site-builder": "node packages/site-builder/bin/site-builder.js",
    "site-builder:install": "npm ci --prefix packages/site-builder",
```

`.github/workflows/ci.yml`, after `- run: pnpm test:unit`:

```yaml
      - run: npm ci --prefix packages/site-builder
      - run: npm test --prefix packages/site-builder
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `npm test --prefix packages/site-builder && pnpm -s lint`
Expected: PASS, 25 tests in total, and a clean lint.

- [ ] **Step 5: Commit**

```bash
git add packages/site-builder package.json .github/workflows/ci.yml
git commit -m "site-builder report and command line; pnpm site-builder in the kit; CI runs its tests

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: The builder's guide, and staff-only rules scoped

**Files:**
- Modify: `AGENTS.md` (replace with the guide), `CLAUDE.md` (add a scope section at the top)
- Test: `tests/unit/agent-guide.test.ts`

**Interfaces:**
- Consumes: the script names from Tasks 1–3 and 9, and the commands `crawl`, `extract`,
  `theme` and `report` from Task 9.

- [ ] **Step 1: Write the failing test**

`tests/unit/agent-guide.test.ts`:

```ts
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const guide = readFileSync('AGENTS.md', 'utf8')
const scripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts as Record<string, string>

test('every pnpm command in the builder\'s guide is a real script', () => {
  const used = [...guide.matchAll(/pnpm ([a-z][\w:-]*)/g)].map((m) => m[1]).filter((s) => !['install', 'exec'].includes(s))
  assert.ok(used.length > 5)
  for (const s of used) assert.ok(s in scripts, `pnpm ${s} is not in package.json`)
})

test('the guide uses only real site-builder commands and points at the shipped files', () => {
  for (const m of guide.matchAll(/site-builder (\w+)/g)) if (m[1] !== 'install') assert.ok(['crawl', 'extract', 'theme', 'report'].includes(m[1]), m[1])
  for (const f of ['seed/site-plan.json', 'schema/site-plan.schema.json', 'schema/blocks.schema.json', 'site/questions.json', 'site/config.ts', 'site/theme.json'])
    assert.ok(guide.includes(f), f)
})

test('CLAUDE.md scopes the staff-only rules to the Hosait/site-kit repository itself', () => {
  const claude = readFileSync('CLAUDE.md', 'utf8')
  assert.match(claude.split('\n').slice(0, 12).join('\n'), /AGENTS\.md/)
  assert.match(claude, /Hosait\/site-kit/)
})
```

- [ ] **Step 2: Run it to see it fail**

Run: `pnpm tsx --test tests/unit/agent-guide.test.ts`
Expected: FAIL. `AGENTS.md` today holds only the Next.js note, so `used.length > 5` fails.

- [ ] **Step 3: Write the guide**

`AGENTS.md` (replace the file; the last line keeps the current Next.js note):

```markdown
# Building a site on Site Kit

For an AI agent (or a person) rebuilding an existing website on this template and publishing it
on Hosait. You fill in content, theme and configuration; you do not write front-end code. Where
no block fits a part of the old site, list it as a gap in the plan.

## 1. Set up

    pnpm install
    pnpm site-builder:install
    docker compose up -d          # local Postgres
    cp .env.example .env

## 2. Read the old site

    pnpm site-builder crawl https://www.example.com
    pnpm site-builder extract --out .site-builder/www.example.com
    pnpm site-builder theme   --out .site-builder/www.example.com
    pnpm site-builder report  --out .site-builder/www.example.com

Read `report.md` with the customer. `extract.json` holds every page's content and its template.

## 3. Ask the intake questions

Ask the questions in `site/questions.json`. Each answer says what it sets: a path in
`site/config.ts`, `report.*` (for the report and quote) or `cms.*` (entered in the admin after
the first deploy). If you change sites, locales, document types or article kinds in
`site/config.ts`, run `pnpm payload migrate:create <name>` and `pnpm generate:types`, then
`pnpm kit:schema`.

## 4. Theme

Copy `theme` from `theme.draft.json` into `site/theme.json`, put the logo in `public/brand/`, set
the fonts in `site/fonts.ts`, and run `pnpm kit:theme-check` (every pair needs 4.5:1).

## 5. Write the site plan

Write `seed/site-plan.json` against `schema/site-plan.schema.json`; the blocks and their fields
are in `schema/blocks.schema.json`. Map each template once, then fill every page of it. Put
images and PDFs in `seed/media/` (or use public https URLs). Link with `$media`, `$page`,
`$pageLink`, `$person`, `$document`; rich text is `$html`. Add `redirects` for every old URL that
moves, and `gaps` for anything no block matches. Check it locally:

    pnpm kit:import seed/site-plan.json --reset
    pnpm dev

## 6. Check

    pnpm typecheck
    pnpm lint
    pnpm test:unit

After the preview is up: copy `.site-builder/<host>/urls.json` to `import-data/urls.json` and run
`pnpm qa:urls <preview address>`; run `pnpm qa:axe`.

## 7. Publish on Hosait

Push the repository and connect it to a blank Hosait project (the Hosait wizard, or the MCP tool
`connect_repository`). The first deploy generates the secrets and imports `seed/site-plan.json`
into the empty database; `/next/seed/status` shows progress. Then create the first admin user.
Never commit `.env` or any secret.

---

This is NOT the Next.js you know: read the docs in `node_modules/next/dist/docs/` before
changing framework code.
```

At execution time, check the current Next.js note in `AGENTS.md` and keep it word for word
as the last paragraph. Then check that `.env.example` exists and `docker compose up -d`
starts Postgres. If either differs, fix the guide's setup lines to match the repo.

`CLAUDE.md`: insert at the very top, above the existing content:

```markdown
# Who this file is for

Building a customer site from this template? Follow `AGENTS.md`; the rest of this file is for
Hosait staff working on the kit itself in the `Hosait/site-kit` repository, and does not apply
to sites made from it.

```

- [ ] **Step 4: Run the tests to see them pass**

Run: `pnpm tsx --test tests/unit/agent-guide.test.ts && pnpm -s test:unit 2>&1 | grep -E "^# (pass|fail)"`
Expected: PASS, and `# fail 0` for the whole unit suite.

- [ ] **Step 5: Commit**

```bash
git add AGENTS.md CLAUDE.md tests/unit/agent-guide.test.ts
git commit -m "AGENTS.md: the builder's guide; CLAUDE.md's staff rules apply to the kit repo only

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## After the last task

- Run all checks:
  `pnpm -s typecheck && pnpm -s lint && pnpm -s test:unit && pnpm kit:theme-check && pnpm kit:schema && git diff --exit-code schema/ && npm test --prefix packages/site-builder`.
- Run one manual end-to-end check: `pnpm site-builder crawl https://www.ablernordic.com --max 30`,
  then `extract`, `theme` and `report`, and read `report.md` against what we already know: a
  Gatsby site with Prismic and Google Tag Manager. The crawl reads a public site, and robots.txt
  and the caps apply.
- Open a PR for `feat/phase2a-site-builder` against `main` in Hosait/site-kit.
- **Follow-ups, outside this plan:**
  - **Phase 2b:** the `prismic` importer, once Abler Nordic's token arrives, and `compare`,
    once a preview is deployed.
  - **After Bjørn's OK:** a LICENSE file, `"private"` removed, the template flag, a public
    repo, and the npm publish of `@hosait/site-builder`.
  - **Separately:** the `hosait-sites` skill and the two Hosait PRs.
