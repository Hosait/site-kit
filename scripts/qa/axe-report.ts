/**
 * Alvorlige WCAG-brudd (axe, serious og critical) på nettstedets egne sider:
 *   pnpm qa:axe [BASE_URL] [path ...]
 * Uten stier sjekkes de første 50 sidene i nettstedets sitemap.xml. Avslutter med kode 1 ved brudd.
 */
import AxeBuilder from '@axe-core/playwright'
import { chromium } from '@playwright/test'

import { axePages, sitemapPaths, type Finding } from '../../src/lib/launch-check'

const MAX_PAGES = 50
const base = (process.argv[2] || 'http://localhost:3100').replace(/\/$/, '')
let paths = process.argv.slice(3)
if (!paths.length) {
  const res = await fetch(`${base}/sitemap.xml`)
  if (res.status !== 200) {
    console.error(`${base}/sitemap.xml answers ${res.status}: give the pages to check as paths after the address.`)
    process.exit(1)
  }
  paths = sitemapPaths(await res.text()).slice(0, MAX_PAGES)
}

const browser = await chromium.launch()
const page = await (await browser.newContext()).newPage()
// En side som ikke åpner seg (tidsavbrudd, feilsvar), blir en feil, og resten sjekkes likevel.
const errors: Finding[] = await axePages(paths.map((p) => base + p), async (url) => {
  console.log(`\n== ${url.slice(base.length) || '/'}`)
  const res = await page.goto(url, { waitUntil: 'networkidle' })
  if (res && !res.ok()) throw new Error(`the page answers ${res.status()}`)
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const serious = r.violations.filter((x) => x.impact === 'serious' || x.impact === 'critical')
  if (!serious.length) console.log('  (no serious violations)')
  for (const v of serious) {
    console.log(`  ${v.id} (${v.nodes.length})`)
    for (const n of v.nodes.slice(0, 6)) console.log(`    ${n.target.join(' ')} :: ${n.failureSummary?.split('\n')[1]?.trim() ?? ''}`)
  }
  return r.violations
})
await browser.close()
const failed = errors.filter((e) => !e.text.startsWith('accessibility:'))
for (const e of failed) console.log(`\n${e.page}: ${e.text}`)
console.log(`\n${paths.length} pages checked: ${errors.length - failed.length} serious or critical violations, ${failed.length} page${failed.length === 1 ? '' : 's'} not checked.`)
process.exit(errors.length ? 1 : 0)
