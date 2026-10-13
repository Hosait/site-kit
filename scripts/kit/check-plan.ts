// pnpm kit:check-plan <plan.json>: checks a site plan without a database. Exit 0 = valid.
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { checkPlan } from '../../src/lib/site-plan/check'

const file = process.argv[2]
if (!file) {
  console.error('Usage: pnpm kit:check-plan <plan.json>')
  process.exit(2)
}
let raw: unknown
try {
  raw = JSON.parse(readFileSync(file, 'utf8'))
} catch (e) {
  console.error(`${file}: ${e instanceof Error ? e.message : String(e)}`)
  process.exit(1)
}
const r = await checkPlan(raw, path.dirname(path.resolve(file)))
const s = r.summary
console.log(`${s.pages} pages, ${s.articles} articles, ${s.media} media, ${s.documents} documents, ${s.redirects} redirects, ${s.gaps} gaps`)
for (const e of r.errors) console.error(e)
process.exit(r.ok ? 0 : 1)
