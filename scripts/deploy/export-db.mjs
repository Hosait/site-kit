/**
 * Eksporterer innholdet i den lokale databasen (Docker, sitekit-postgres-1) til én SQL-fil
 * som kan legges inn i Hosait-databasen. Bare innhold: brukere, innlogginger, preferanser,
 * låser og migreringslogg tas ikke med, så administratorene på Hosait beholdes.
 *
 *   node scripts/deploy/export-db.mjs   → import-data/export/content.sql.gz
 *
 * Fila tømmer innholdstabellene og fyller dem på nytt i én transaksjon.
 * Skjemaet må være likt (samme migreringer) lokalt og på Hosait.
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

const missingPrefix = psql("select count(*) from information_schema.columns where table_name='media' and column_name='prefix'").trim()
if (missingPrefix === '0') {
  console.error('Lokal database mangler media.prefix – start dev-serveren (pnpm dev) én gang så skjemaet oppdateres.')
  process.exit(1)
}

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
    '--disable-triggers',
    '--no-owner',
    '--no-privileges',
    ...tables.flatMap((t) => ['-t', `public."${t}"`]),
  ],
  { encoding: 'utf8', maxBuffer: 1 << 30 },
)

const quoted = tables.map((t) => `public."${t}"`).join(', ')
const sql = [
  '-- Spilka-innhold eksportert ' + new Date().toISOString(),
  'BEGIN;',
  `TRUNCATE ${quoted} RESTART IDENTITY CASCADE;`,
  // Bilder og dokumenter ligger i S3 under public/ på Hosait.
  dump.replace(/^(BEGIN|COMMIT);$/gm, ''),
  "UPDATE public.media SET prefix = 'public/media';",
  "UPDATE public.documents SET prefix = 'public/documents';",
  'COMMIT;',
  '',
].join('\n')

const outDir = path.resolve('import-data/export')
fs.mkdirSync(outDir, { recursive: true })
const out = path.join(outDir, 'content.sql.gz')
fs.writeFileSync(out, zlib.gzipSync(sql, { level: 9 }))
console.log(`${tables.length} tabeller → ${out} (${(fs.statSync(out).size / 1e6).toFixed(1)} MB)`)
