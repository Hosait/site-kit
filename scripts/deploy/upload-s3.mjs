/**
 * Laster opp lokale bilder/dokumenter (uploads/) og databaseeksporten til Hosaits S3.
 *
 *   S3_ENDPOINT=https://s3.hosait.com S3_BUCKET=… S3_ACCESS_KEY_ID=… S3_SECRET_ACCESS_KEY=… \
 *     node scripts/deploy/upload-s3.mjs
 *
 * - uploads/media/*      → public/media/<fil>      (offentlig mappe, med riktig Content-Type)
 * - uploads/documents/*  → public/documents/<fil>
 * - import-data/export/content.sql.gz → private/db/content-<tid>.sql.gz (IKKE offentlig);
 *   skriver ut en tidsbegrenset (1 time) lenke som Hosait-databasen kan hente den med.
 * Filer som allerede finnes med samme størrelse hoppes over, så skriptet kan kjøres på nytt.
 */
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import fs from 'node:fs'
import path from 'node:path'

const { S3_ENDPOINT = 'https://s3.hosait.com', S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_REGION = 'oslo' } = process.env
if (!S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
  console.error('Mangler S3_BUCKET, S3_ACCESS_KEY_ID eller S3_SECRET_ACCESS_KEY.')
  process.exit(1)
}

const s3 = new S3Client({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  forcePathStyle: true,
  credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
})

const TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.dwg': 'image/vnd.dwg',
  '.gz': 'application/gzip',
}
const typeOf = (f) => TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream'

async function exists(key, size) {
  try {
    const h = await s3.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: key }))
    return h.ContentLength === size
  } catch {
    return false
  }
}

async function put(file, key, cacheControl) {
  const size = fs.statSync(file).size
  if (await exists(key, size)) return 'skip'
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: fs.readFileSync(file),
      ContentType: typeOf(file),
      CacheControl: cacheControl,
    }),
  )
  return 'put'
}

async function uploadDir(dir, prefix) {
  if (!fs.existsSync(dir)) return
  const files = fs.readdirSync(dir).filter((f) => fs.statSync(path.join(dir, f)).isFile())
  let done = 0
  let skipped = 0
  const queue = [...files]
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      while (queue.length) {
        const f = queue.shift()
        // Filnavn endres aldri for samme innhold i Payload → kan caches lenge.
        const r = await put(path.join(dir, f), `${prefix}/${f}`, 'public, max-age=31536000, immutable')
        r === 'skip' ? skipped++ : done++
        if ((done + skipped) % 100 === 0) console.log(`  ${prefix}: ${done + skipped}/${files.length}`)
      }
    }),
  )
  console.log(`✓ ${prefix}: ${done} lastet opp, ${skipped} fantes fra før (${files.length} totalt)`)
}

await uploadDir(path.resolve('uploads/media'), 'public/media')
await uploadDir(path.resolve('uploads/documents'), 'public/documents')

const dump = path.resolve('import-data/export/content.sql.gz')
if (fs.existsSync(dump)) {
  const key = `private/db/content-${Date.now()}.sql.gz`
  await put(dump, key, 'no-store')
  const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }), { expiresIn: 3600 })
  fs.writeFileSync(path.resolve('import-data/export/restore-url.txt'), url + '\n')
  console.log(`✓ databaseeksport lastet opp til ${key}; tidsbegrenset lenke i import-data/export/restore-url.txt`)
}
