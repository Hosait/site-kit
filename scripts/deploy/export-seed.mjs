/**
 * Lager «seed»-pakken som Hosait-appen kan legge inn selv (se src/app/(frontend)/next/seed):
 *
 *   seed/content.sql.gz   – innholdet i den lokale databasen som INSERT-setninger (ingen brukere,
 *                           innlogginger, preferanser eller migreringslogg)
 *   seed/sources.json     – kilde-URL per bilde/dokument når de hentes fra et gammelt nettsted (ellers tom)
 *   seed/files/           – lokale opplastinger, kopieres av Hosait (hosait.json seed.files)
 *
 *   node scripts/deploy/export-seed.mjs
 *
 * Bare offentlig nettstedsinnhold havner i repoet. Ingen hemmeligheter.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const CONTAINER = process.env.PG_CONTAINER || 'site-kit-postgres-1'
const EXCLUDE = new Set([
  'users',
  'users_sessions',
  'users_sites',
  'payload_preferences',
  'payload_preferences_rels',
  'payload_locked_documents',
  'payload_locked_documents_rels',
  'payload_migrations',
  'payload_kv',
  'payload_jobs',
  'payload_jobs_log',
  'form_submissions',
  'form_submissions_submission_data',
])

const psql = (sql) =>
  execFileSync('docker', ['exec', CONTAINER, 'psql', '-U', 'sitekit', '-d', 'sitekit', '-At', '-c', sql], { encoding: 'utf8' })

const tables = psql("select tablename from pg_tables where schemaname='public' order by 1")
  .split(/\r?\n/)
  .map((t) => t.trim())
  .filter((t) => t && !EXCLUDE.has(t))

// INSERT med kolonnenavn (ikke COPY): kjøres via pg uten psql, og tåler ulik kolonnerekkefølge
// (lokal database er laget med push, Hosait med migreringer).
const dump = execFileSync(
  'docker',
  [
    'exec',
    CONTAINER,
    'pg_dump',
    '-U',
    'sitekit',
    '-d',
    'sitekit',
    '--data-only',
    '--column-inserts',
    '--rows-per-insert=200',
    '--no-owner',
    '--no-privileges',
    ...tables.flatMap((t) => ['-t', `public."${t}"`]),
  ],
  { encoding: 'utf8', maxBuffer: 1 << 30 },
)

// psql-kommandoer (\restrict o.l.), kommentarer og tomme linjer fjernes.
const statements = dump
  .split(/\r?\n/)
  .filter((l) => l && !l.startsWith('\\') && !l.startsWith('--'))
  .join('\n')

const quoted = tables.map((t) => `public."${t}"`).join(', ')
const sql = [
  `TRUNCATE ${quoted} RESTART IDENTITY CASCADE;`,
  // Fremmednøkler sjekkes ved COMMIT, så rekkefølgen på tabellene spiller ingen rolle.
  'SET CONSTRAINTS ALL DEFERRED;',
  "SET session_replication_role = 'replica';",
  statements,
  "SET session_replication_role = 'origin';",
  "UPDATE public.media SET prefix = 'public/media';",
  "UPDATE public.documents SET prefix = 'public/documents';",
  '',
].join('\n')

const outDir = path.resolve('seed')
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'content.sql.gz'), zlib.gzipSync(sql, { level: 9 }))

// Kilde-URL per bilde/dokument for seed-stegets «media» (fra en import som henter fra et gammelt nettsted).
// Uten import-data/sources.json er lista tom: filene ligger da i seed/files og kopieres av Hosait.
const sourcesFile = path.resolve('import-data/sources.json')
const sources = fs.existsSync(sourcesFile) ? JSON.parse(fs.readFileSync(sourcesFile, 'utf8')) : { media: {}, documents: {} }
fs.writeFileSync(path.join(outDir, 'sources.json'), JSON.stringify(sources, null, 1))

// Lokale opplastinger (originaler og WebP-størrelser) → seed/files, som hosait.json «seed.files»
// kopierer inn i prosjektets bøtte under public/ ved første publisering.
for (const sub of ['media', 'documents']) {
  const from = path.resolve('uploads', sub)
  const to = path.resolve('seed/files', sub)
  fs.rmSync(to, { recursive: true, force: true })
  if (fs.existsSync(from)) fs.cpSync(from, to, { recursive: true })
}

const size = (f) => (fs.statSync(path.join(outDir, f)).size / 1e6).toFixed(2) + ' MB'
console.log(`${tables.length} tabeller → seed/content.sql.gz (${size('content.sql.gz')})`)
console.log(`${Object.keys(sources.media).length} bilde- og ${Object.keys(sources.documents).length} dokumentkilder → seed/sources.json; filer → seed/files`)
