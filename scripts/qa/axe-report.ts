/**
 * Skriver ut alvorlige WCAG-brudd (axe) for en liste sider.
 *   pnpm tsx scripts/qa/axe-report.ts [BASE_URL] [sti?site=x ...]
 */
import AxeBuilder from '@axe-core/playwright'
import { chromium } from '@playwright/test'

const base = process.argv[2] || 'http://localhost:3100'
const paths = process.argv.slice(3).length
  ? process.argv.slice(3)
  : ['/no?site=industri', '/en?site=industri', '/no?site=sbs', '/no?site=dws', '/en?site=dws']

const browser = await chromium.launch()
const page = await (await browser.newContext()).newPage()
for (const p of paths) {
  await page.goto(base + p, { waitUntil: 'networkidle' })
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  console.log(`\n== ${p}`)
  for (const v of r.violations.filter((x) => x.impact === 'serious' || x.impact === 'critical')) {
    console.log(`  ${v.id} (${v.nodes.length})`)
    for (const n of v.nodes.slice(0, 6)) console.log(`    ${n.target.join(' ')} :: ${n.failureSummary?.split('\n')[1]?.trim() ?? ''}`)
  }
}
await browser.close()
