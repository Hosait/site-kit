/**
 * Lager «seed»-pakken som Hosait-appen kan legge inn selv (se src/app/(frontend)/next/seed):
 *
 *   seed/content.sql.gz   – innholdet i den lokale databasen som INSERT-setninger (ingen brukere,
 *                           innlogginger, preferanser eller migreringslogg)
 *   seed/sources.json     – for hvert bilde/dokument: offentlig original-URL på dagens Craft-nettsted
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

// Bilde/dokument-id → original-URL (fra skraperens manifest og importens id-kart).
const manifest = JSON.parse(fs.readFileSync(path.resolve('import-data/assets/manifest.json'), 'utf8'))
const idMap = JSON.parse(fs.readFileSync(path.resolve('import-data/id-map.json'), 'utf8'))
const bySha = {}
for (const v of Object.values(manifest)) if (v.sha1 && !bySha[v.sha1]) bySha[v.sha1] = v
const sources = { media: {}, documents: {} }
for (const [key, id] of Object.entries(idMap)) {
  const [type, sha] = key.split(':')
  const m = bySha[sha]
  if (!m) continue
  const url = m.resolvedUrl || m.url
  if (type === 'media') sources.media[id] = url
  if (type === 'doc') sources.documents[id] = url
}
fs.writeFileSync(path.join(outDir, 'sources.json'), JSON.stringify(sources, null, 1))

const size = (f) => (fs.statSync(path.join(outDir, f)).size / 1e6).toFixed(2) + ' MB'
console.log(`${tables.length} tabeller → seed/content.sql.gz (${size('content.sql.gz')})`)
console.log(`${Object.keys(sources.media).length} bilder, ${Object.keys(sources.documents).length} dokumenter → seed/sources.json`)
