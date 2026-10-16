// pnpm kit:theme-check: validates site/theme.json, its WCAG AA contrast pairs, and the icon file.
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import theme from '../../site/theme.json'
import { checkIconFile, checkTheme, validateTheme } from '../../src/lib/theme'

const valid = validateTheme(theme)
const problems = checkTheme(valid)
if (valid.icon) {
  const file = path.join('public', valid.icon.src)
  if (!existsSync(file)) problems.push(`icon: ${file} is missing`)
  else for (const p of checkIconFile(readFileSync(file), path.extname(file).slice(1).toLowerCase())) problems.push(`icon ${valid.icon.src}: ${p}`)
}
for (const p of problems) console.error(`✗ ${p}`)
console.log(problems.length ? `${problems.length} problem(s)` : '✓ theme.json passes')
process.exit(problems.length ? 1 : 0)
