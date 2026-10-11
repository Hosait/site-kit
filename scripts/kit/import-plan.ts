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
