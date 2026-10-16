/**
 * The launch check against a running site (the rules are in src/lib/launch-check.ts):
 *   pnpm qa:launch [BASE_URL]
 * Prints errors and warnings, grouped by what was found, and exits 1 when there are errors.
 */
import { launchCheck, type Finding } from '../../src/lib/launch-check'

const base = (process.argv[2] || 'http://localhost:3100').replace(/\/$/, '')
const r = await launchCheck(base)

function grouped(list: Finding[]): string[] {
  const by = new Map<string, string[]>()
  for (const f of list) by.set(f.text, [...(by.get(f.text) ?? []), f.page])
  return [...by].map(([text, pages]) => `- ${text}: ${pages.length === 1 ? pages[0] : `${pages.length} pages, for example ${pages.slice(0, 3).join(', ')}`}`)
}

const lines = [
  `# Launch check: ${base}`,
  '',
  `${r.pages} pages and ${r.linksChecked} internal links checked: ${r.errors.length} errors, ${r.warnings.length} warnings.`,
  '',
  ...(r.errors.length ? ['## Errors (fix them before the site moves to its own domain)', '', ...grouped(r.errors), ''] : []),
  ...(r.warnings.length ? ['## Warnings', '', ...grouped(r.warnings), ''] : []),
  ...(r.notes.length ? ['## Notes', '', ...r.notes.map((n) => `- ${n}`), ''] : []),
]
console.log(lines.join('\n'))
process.exit(r.errors.length ? 1 : 0)
