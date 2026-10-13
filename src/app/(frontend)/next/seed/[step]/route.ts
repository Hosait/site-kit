import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

import configPromise from '@payload-config'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getPayload } from 'payload'

import { planReset, seedDbDecision } from '@/lib/seed-guard'
import { reindexAll } from '@/lib/search/indexer'
import { loadSeedPlan, runPlanSeed, seedSource, type PlanSeedProgress } from '@/lib/site-plan/seed-plan'
import { planOutcome, seedAnswer, settlesWithin, WAIT_MS } from '@/lib/site-plan/seed-response'
import { SITE_KEYS } from '@/lib/sites'

export const dynamic = 'force-dynamic'
export const maxDuration = 900

/**
 * Fyller en tom installasjon (test på Hosait) med innholdet fra seed/ i repoet.
 * Vanligvis via panelet «Testinnhold» på forsiden i admin (innlogget administrator).
 * Kan også kjøres med CRON_SECRET, f.eks. fra en oppgave på web-tjenesten:
 *
 *   wget -qO- --post-data= --header "Authorization: Bearer $CRON_SECRET" http://127.0.0.1:3000/next/seed/db
 *   wget -qO- --post-data= --header "Authorization: Bearer $CRON_SECRET" http://127.0.0.1:3000/next/seed/media
 *   wget -qO- --header "Authorization: Bearer $CRON_SECRET" http://127.0.0.1:3000/next/seed/status
 *   (…/next/seed/media?only=documents kjører bare dokumentene på nytt)
 *   (…/next/seed/db?wait=1 svarer først når importen er ferdig: 200, 500 ved feil, 504 om den fortsatt går.
 *    Hosaits seed.run bruker den, så en mislykket import gir feilkode i stedet for «ferdig».)
 *
 * - db:    tømmer innholdstabellene og legger inn seed/content.sql.gz (brukere berøres ikke).
 *          Bare på en tom installasjon, eller med ?replace=1 (panelet sender det).
 *          seed/site-plan.json wins when present: it is imported in the background (see status).
 * - media: henter originalbildene/-dokumentene fra kildene i seed/sources.json
 *          og laster dem opp via Payload, som lager størrelser og lagrer i S3. Går i bakgrunnen.
 * Sperret i produksjon (SITE_ORIGINS=production).
 */
const SEED_DIR = path.join(process.cwd(), 'seed')

type Progress = { running: boolean; total: number; done: number; failed: string[]; startedAt?: string; finishedAt?: string }
const g = globalThis as unknown as { __seedMedia?: Progress; __seedPlan?: PlanSeedProgress; __seedPlanRun?: Promise<void> }

// Samme navn brukes i src/components/admin/SeedPanelClient.tsx.
const SEED_HEADER = 'x-site-seed'

/** CRON_SECRET, eller innlogget administrator fra admin-panelet. */
async function authorized(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') === `Bearer ${secret}`) return true
  // Egen header krever CORS-preflight, så andre nettsteder kan ikke utløse seed med brukerens cookie.
  if (req.headers.get(SEED_HEADER) !== '1') return false
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: req.headers })
  return (user as { role?: string } | null)?.role === 'admin'
}

function flushCache() {
  for (const c of ['pages', 'articles', 'people', 'documents', 'media', 'site-settings', 'redirects']) {
    revalidateTag(c, 'max')
    for (const s of SITE_KEYS) revalidateTag(`${c}:${s}`, 'max')
  }
  for (const s of SITE_KEYS) revalidateTag(`site:${s}`, 'max')
  revalidatePath('/', 'layout')
}

async function seedDb() {
  const file = path.join(SEED_DIR, 'content.sql.gz')
  if (!fs.existsSync(file)) return { ok: false, missing: true, error: 'seed/content.sql.gz finnes ikke i imaget' }
  const sql = zlib.gunzipSync(fs.readFileSync(file)).toString('utf8')
  const payload = await getPayload({ config: configPromise })
  // Egen tilkobling: dumpen endrer søkesti og replikeringsrolle, og tilkoblingen kastes etterpå.
  const pool = (payload.db as unknown as { pool: { connect: () => Promise<{ query: (q: string) => Promise<unknown>; release: (destroy?: boolean) => void }> } }).pool
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    client.release(true)
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
  client.release(true)
  flushCache()
  // Importen går utenom hooks, så søkeindeksen bygges på nytt (i bakgrunnen).
  await reindexAll(payload)
  const counts = {
    pages: (await payload.count({ collection: 'pages' })).totalDocs,
    articles: (await payload.count({ collection: 'articles' })).totalDocs,
    media: (await payload.count({ collection: 'media' })).totalDocs,
  }
  return { ok: true, counts }
}

async function seedMedia(only: string | null) {
  const file = path.join(SEED_DIR, 'sources.json')
  if (!fs.existsSync(file)) return { ok: false, error: 'seed/sources.json finnes ikke i imaget' }
  if (g.__seedMedia?.running) return { ok: true, alreadyRunning: true, progress: g.__seedMedia }
  const sources = JSON.parse(fs.readFileSync(file, 'utf8')) as { media: Record<string, string>; documents: Record<string, string> }
  const jobs = [
    ...Object.entries(sources.media).map(([id, url]) => ({ collection: 'media' as const, id: Number(id), url })),
    ...Object.entries(sources.documents).map(([id, url]) => ({ collection: 'documents' as const, id: Number(id), url })),
  ]
  // ?only=documents eller ?only=media kjører bare den ene samlingen på nytt.
  if (only === 'media' || only === 'documents') jobs.splice(0, jobs.length, ...jobs.filter((j) => j.collection === only))
  const progress: Progress = { running: true, total: jobs.length, done: 0, failed: [], startedAt: new Date().toISOString() }
  g.__seedMedia = progress

  // Bakgrunnsjobb: ett og ett bilde (sharp på 1 CPU og 1 GB minne).
  void (async () => {
    const payload = await getPayload({ config: configPromise })
    for (const job of jobs) {
      try {
        const doc = await payload.findByID({ collection: job.collection, id: job.id, depth: 0 }).catch(() => null)
        if (!doc?.filename) throw new Error('finnes ikke i databasen')
        const res = await fetch(job.url, { headers: { 'User-Agent': 'SiteKit-seed/1.0' } })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = Buffer.from(await res.arrayBuffer())
        // Lagres på et språk der dokumentet har tittel (noen finnes bare på engelsk).
        let lastErr: unknown
        for (const locale of ['no', 'en'] as const) {
          try {
            await payload.update({
              collection: job.collection,
              id: job.id,
              locale,
              data: {},
              file: { data, mimetype: doc.mimeType || res.headers.get('content-type') || 'application/octet-stream', name: doc.filename, size: data.length },
              overwriteExistingFiles: true,
              context: { disableRevalidate: true },
            })
            lastErr = null
            break
          } catch (err) {
            lastErr = err
          }
        }
        if (lastErr) throw lastErr
      } catch (err) {
        progress.failed.push(`${job.collection}/${job.id}: ${err instanceof Error ? err.message : String(err)}`)
      }
      progress.done++
    }
    progress.running = false
    progress.finishedAt = new Date().toISOString()
    try {
      flushCache()
    } catch {}
    // PDF-teksten kommer med når dokumentfilene finnes.
    await reindexAll(payload).catch(() => {})
  })()

  return { ok: true, started: true, total: jobs.length }
}

/**
 * Imports seed/site-plan.json in the background: media come one by one, which can take minutes.
 * `progress` is the slot the db step already claimed; `release` gives it back on failure.
 */
async function seedPlan(progress: PlanSeedProgress, release: () => void, reset: boolean) {
  const loaded = loadSeedPlan(SEED_DIR)
  if (!loaded.ok) {
    release()
    return { status: 422, body: { ok: false, error: loaded.error } }
  }
  const payload = await getPayload({ config: configPromise })
  const run = runPlanSeed(payload, loaded.plan, SEED_DIR, progress, {
    // planReset: on replace, or while nobody has signed up (a first deploy), so it also clears what
    // a run stopped before it could clean up (a restart, a killed container) left behind.
    reset,
    after: async () => {
      flushCache()
      await reindexAll(payload)
    },
  })
  g.__seedPlanRun = run
  return { status: 200, body: { ok: true, started: true, mode: 'plan' }, run }
}

/** ?wait=1: answer when the import has finished (or at the deadline), never 200 for a failure. */
async function waitForPlan(progress: PlanSeedProgress, run: Promise<void>) {
  const { status, body } = planOutcome(progress, await settlesWithin(run, WAIT_MS))
  return seedAnswer(status, body)
}

async function handle(req: Request, step: string) {
  if (!(await authorized(req))) return new Response('Forbidden', { status: 403 })
  if (process.env.SITE_ORIGINS === 'production') {
    return seedAnswer(409, { ok: false, error: 'Seed er sperret i produksjon' })
  }
  if (step === 'status') {
    return Response.json({ media: g.__seedMedia ?? null, plan: g.__seedPlan ?? null, sources: fs.existsSync(path.join(SEED_DIR, 'sources.json')) })
  }
  if (req.method !== 'POST') return Response.json({ ok: false, error: 'Bruk POST' }, { status: 405 })
  if (step === 'db') {
    const wait = new URL(req.url).searchParams.get('wait') === '1'
    // A retry (Hosait's seed.run, or the panel clicked twice) must not start a second import.
    if (g.__seedPlan?.running) {
      if (wait && g.__seedPlanRun) return waitForPlan(g.__seedPlan, g.__seedPlanRun)
      return Response.json({ ok: true, alreadyRunning: true, progress: g.__seedPlan })
    }
    // The slot is claimed before the first await, so two requests at once cannot both start one.
    const previous = g.__seedPlan
    const claim: PlanSeedProgress = { running: true, done: 0, total: 0, startedAt: new Date().toISOString() }
    g.__seedPlan = claim
    const release = () => {
      if (g.__seedPlan === claim) g.__seedPlan = previous
    }
    try {
      const payload = await getPayload({ config: configPromise })
      const replace = new URL(req.url).searchParams.get('replace') === '1'
      const users = (await payload.count({ collection: 'users' })).totalDocs
      const source = seedSource(SEED_DIR) === 'plan' ? 'plan' : 'sql'
      const decision = seedDbDecision({
        source,
        pages: (await payload.count({ collection: 'pages' })).totalDocs,
        users,
        replace,
        production: process.env.SITE_ORIGINS === 'production',
      })
      if (decision === 'refuse_existing') {
        release()
        return seedAnswer(409, { ok: false, error: 'Nettstedet har allerede sider. Bruk ?replace=1 for å erstatte alt innhold.' })
      }
      if (source === 'plan') {
        const started = await seedPlan(claim, release, planReset({ replace, users }))
        if (wait && started.run) return waitForPlan(claim, started.run)
        return seedAnswer(started.status, started.body)
      }
      release()
      const sql = await seedDb()
      return seedAnswer(sql.ok ? 200 : 'missing' in sql ? 404 : 500, sql)
    } catch (e) {
      release()
      throw e
    }
  }
  if (step === 'media') {
    const media = await seedMedia(new URL(req.url).searchParams.get('only'))
    return seedAnswer(media.ok ? 200 : 404, media)
  }
  return seedAnswer(404, { ok: false, error: 'Ukjent steg (db, media, status)' })
}

export async function GET(req: Request, { params }: { params: Promise<{ step: string }> }) {
  return handle(req, (await params).step)
}

export async function POST(req: Request, { params }: { params: Promise<{ step: string }> }) {
  return handle(req, (await params).step)
}
