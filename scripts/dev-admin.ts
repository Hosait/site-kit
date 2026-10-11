/**
 * Lager en lokal administrator for utvikling (bare mot lokal database).
 * Passordet genereres og lagres i .env (DEV_ADMIN_EMAIL / DEV_ADMIN_PASSWORD), som ikke sjekkes inn.
 *   pnpm tsx scripts/dev-admin.ts
 */
import 'dotenv/config'
import { randomBytes } from 'crypto'
import { appendFileSync } from 'fs'
import { getPayload } from 'payload'

import config from '../src/payload.config'

if (!/127\.0\.0\.1|localhost/.test(process.env.DATABASE_URL || '')) {
  throw new Error('dev-admin kjøres bare mot lokal database')
}

const email = process.env.DEV_ADMIN_EMAIL || 'dev@site.localhost'
const payload = await getPayload({ config })
const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
if (existing.totalDocs) {
  console.log(`Finnes allerede: ${email} (passord i .env)`)
} else {
  const password = process.env.DEV_ADMIN_PASSWORD || randomBytes(12).toString('base64url')
  await payload.create({ collection: 'users', data: { email, password, name: 'Lokal admin', role: 'admin' } })
  if (!process.env.DEV_ADMIN_PASSWORD) appendFileSync('.env', `\nDEV_ADMIN_EMAIL=${email}\nDEV_ADMIN_PASSWORD=${password}\n`)
  console.log(`Opprettet ${email} – passord lagret i .env`)
}
await payload.destroy()
process.exit(0)
