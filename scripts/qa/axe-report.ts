/**
 * Alvorlige WCAG-brudd (axe, serious og critical) på nettstedets egne sider:
 *   pnpm qa:axe [BASE_URL] [path ...]
 * Uten stier sjekkes de første 50 sidene i nettstedets sitemap.xml. Avslutter med kode 1 ved brudd.
 */
import AxeBuilder from '@axe-core/playwright'
import { chromium } from '@playwright/test'

import { axeErrors, sitemapPaths, type Finding } from '../../src/lib/launch-check'

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

const errors: Finding[] = []
const browser = await chromium.launch()
const page = await (await browser.newContext()).newPage()
for (const p of paths) {
  await page.goto(base + p, { waitUntil: 'networkidle' })
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const found = axeErrors(base + p, r.violations)
  errors.push(...found)
  console.log(`\n== ${p}${found.length ? '' : ' (no serious violations)'}`)
  for (const v of r.violations.filter((x) => x.impact === 'serious' || x.impact === 'critical')) {
    console.log(`  ${v.id} (${v.nodes.length})`)
    for (const n of v.nodes.slice(0, 6)) console.log(`    ${n.target.join(' ')} :: ${n.failureSummary?.split('\n')[1]?.trim() ?? ''}`)
  }
}
await browser.close()
console.log(`\n${paths.length} pages checked: ${errors.length} serious or critical violations.`)
process.exit(errors.length ? 1 : 0)
