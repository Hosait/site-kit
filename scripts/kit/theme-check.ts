// pnpm kit:theme-check: validates site/theme.json (colours, tokens, style classes), its WCAG AA
// contrast pairs, the icon file, and site/styles.css.
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import theme from '../../site/theme.json'
import { checkIconFile, checkTheme, validateTheme } from '../../src/lib/theme'
import { checkSiteStyles } from '../../src/lib/theme-tokens'

const valid = validateTheme(theme)
const problems = checkTheme(valid)
if (valid.icon) {
  const file = path.join('public', valid.icon.src)
  if (!existsSync(file)) problems.push(`icon: ${file} is missing`)
  else for (const p of checkIconFile(readFileSync(file), path.extname(file).slice(1).toLowerCase())) problems.push(`icon ${valid.icon.src}: ${p}`)
}
const stylesFile = path.join('site', 'styles.css')
if (existsSync(stylesFile)) {
  const css = readFileSync(stylesFile, 'utf8')
  problems.push(...checkSiteStyles(css))
  for (const c of valid.styleClasses ?? []) if (!css.includes(`.${c.name}`)) problems.push(`styleClasses: .${c.name} is not defined in site/styles.css`)
} else if (valid.styleClasses?.length) problems.push('styleClasses are listed, but site/styles.css is missing')
for (const p of problems) console.error(`✗ ${p}`)
console.log(problems.length ? `${problems.length} problem(s)` : '✓ theme.json passes')
process.exit(problems.length ? 1 : 0)
