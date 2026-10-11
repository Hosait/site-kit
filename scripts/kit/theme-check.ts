// pnpm kit:theme-check: validates site/theme.json and its WCAG AA contrast pairs.
import theme from '../../site/theme.json'
import { checkTheme, validateTheme } from '../../src/lib/theme'

const problems = checkTheme(validateTheme(theme))
for (const p of problems) console.error(`✗ ${p}`)
console.log(problems.length ? `${problems.length} contrast problem(s)` : '✓ theme.json passes')
process.exit(problems.length ? 1 : 0)
