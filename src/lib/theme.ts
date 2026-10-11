/**
 * site/theme.json → CSS custom properties. The values go into a <style> tag, so only
 * plain hex colours and px/rem lengths are accepted.
 */
export type ColorKey = 'ink' | 'brand' | 'brandText' | 'brandDark' | 'tint' | 'muted' | 'highlight' | 'background'
export type Theme = {
  colors: Record<ColorKey, string>
  radius: { button: string; card: string }
  logo: { src: string; width: number; height: number }
}

export const COLOR_VARS: Record<ColorKey, string> = {
  ink: '--color-ink',
  brand: '--color-brand',
  brandText: '--color-brand-text',
  brandDark: '--color-brand-dark',
  tint: '--color-tint',
  muted: '--color-muted',
  highlight: '--color-highlight',
  background: '--color-background',
}

const HEX = /^#[0-9a-f]{6}$/i
const LENGTH = /^\d+(\.\d+)?(px|rem)$/
const LOGO = /^\/brand\/[a-z0-9._-]+\.(svg|png|webp)$/

export function validateTheme(input: unknown): Theme {
  const t = input as Partial<Theme> | null
  const problems: string[] = []
  for (const key of Object.keys(COLOR_VARS) as ColorKey[]) {
    const v = t?.colors?.[key]
    if (typeof v !== 'string' || !HEX.test(v)) problems.push(`colors.${key} must be #rrggbb`)
  }
  for (const key of ['button', 'card'] as const) {
    const v = t?.radius?.[key]
    if (typeof v !== 'string' || !LENGTH.test(v)) problems.push(`radius.${key} must be a px or rem length`)
  }
  if (typeof t?.logo?.src !== 'string' || !LOGO.test(t.logo.src)) problems.push('logo.src must be /brand/<file>.svg|png|webp')
  if (!(Number(t?.logo?.width) > 0) || !(Number(t?.logo?.height) > 0)) problems.push('logo.width and logo.height must be positive')
  if (problems.length) throw new Error(`site/theme.json: ${problems.join('; ')}`)
  return t as Theme
}

export function themeToCss(theme: Theme): string {
  const vars = (Object.keys(COLOR_VARS) as ColorKey[]).map((k) => `${COLOR_VARS[k]}:${theme.colors[k]};`)
  vars.push(`--radius-button:${theme.radius.button};`, `--radius-card:${theme.radius.card};`)
  return `:root{${vars.join('')}}`
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

/** Text/background pairs the components use; each needs 4.5:1 (WCAG 2.1 AA, normal text). */
const PAIRS: [fg: ColorKey | 'white', bg: ColorKey | 'white'][] = [
  ['ink', 'background'], ['ink', 'muted'], ['ink', 'tint'],
  ['brandText', 'background'], ['brandText', 'muted'],
  ['brandDark', 'tint'], // .bg-section-tint switches link text to brandDark
  ['white', 'ink'], ['white', 'brandDark'], ['white', 'brandText'],
]

export function checkTheme(theme: Theme): string[] {
  const color = (k: ColorKey | 'white') => (k === 'white' ? '#ffffff' : theme.colors[k])
  return PAIRS.flatMap(([fg, bg]) => {
    const r = contrastRatio(color(fg), color(bg))
    return r >= 4.5 ? [] : [`${fg} on ${bg}: ${r.toFixed(2)}:1, needs 4.5:1`]
  })
}
