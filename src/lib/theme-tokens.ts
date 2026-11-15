/**
 * Optional design tokens in site/theme.json, so a rebuilt site can match the old site's look:
 * typography, containers, section spacing, buttons, cards, links and site style classes.
 * Every group is optional; without it the kit's own CSS (globals.css) applies unchanged.
 * The values end up in a <style> tag, so each one is checked against a narrow pattern here.
 */

export const TYPE_KEYS = ['body', 'display', 'h2', 'h3', 'h4', 'lead', 'eyebrow', 'small'] as const
export type TypeKey = (typeof TYPE_KEYS)[number]
const TRANSFORMS = ['none', 'uppercase', 'lowercase', 'capitalize'] as const
type Transform = (typeof TRANSFORMS)[number]

export type TypeStyle = {
  /** Font size from the md breakpoint up (or everywhere without sizeMobile). */
  size?: string
  sizeMobile?: string
  lineHeight?: string
  weight?: number
  letterSpacing?: string
  transform?: Transform
}

export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px rgb(0 0 0 / 0.06), 0 1px 3px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
} as const
type Shadow = keyof typeof SHADOWS

export type ThemeTokens = {
  typography?: Partial<Record<TypeKey, TypeStyle>>
  containers?: { text?: string; content?: string; wide?: string }
  /** Section spacing for the S/M/L/XL choices in a block's «Seksjonsoppsett». */
  spacing?: { s?: string; m?: string; l?: string; xl?: string }
  button?: { paddingX?: string; paddingY?: string; weight?: number; transform?: Transform; borderWidth?: string }
  card?: { radius?: string; shadow?: Shadow; borderWidth?: string }
  link?: { underline?: boolean }
  /** Classes defined in site/styles.css that editors may pick per section. Names start with «site-». */
  styleClasses?: { name: string; label: string }[]
}

/** The kit's default section spacing (also in globals.css as --space-*). */
export const DEFAULT_SPACING = { s: '1.5rem', m: '3rem', l: '5rem', xl: '7rem' } as const

const LENGTH = /^\d+(\.\d+)?(px|rem)$/
const SIGNED_LENGTH = /^-?\d+(\.\d+)?(px|rem|em)$/
const LINE_HEIGHT = /^\d+(\.\d+)?(px|rem)?$/
const STYLE_CLASS = /^site-[a-z0-9-]{1,40}$/
const isWeight = (v: unknown) => Number.isInteger(v) && (v as number) >= 100 && (v as number) <= 900 && (v as number) % 100 === 0

function checkLengths(obj: Record<string, unknown> | undefined, keys: string[], re: RegExp, path: string, problems: string[]) {
  for (const k of keys) {
    const v = obj?.[k]
    if (v !== undefined && (typeof v !== 'string' || !re.test(v))) problems.push(`${path}.${k} must be a ${re === LENGTH ? 'px or rem length' : 'length'}`)
  }
}

/** Problems with the optional token groups (empty when they are valid or absent). */
export function tokenProblems(input: unknown): string[] {
  const t = (input ?? {}) as Record<string, Record<string, unknown> | undefined>
  const problems: string[] = []
  const typography = t.typography as Record<string, Record<string, unknown>> | undefined
  for (const key of Object.keys(typography ?? {})) {
    if (!(TYPE_KEYS as readonly string[]).includes(key)) {
      problems.push(`typography.${key} is not one of ${TYPE_KEYS.join(', ')}`)
      continue
    }
    const s = typography![key]
    checkLengths(s, ['size', 'sizeMobile'], LENGTH, `typography.${key}`, problems)
    checkLengths(s, ['letterSpacing'], SIGNED_LENGTH, `typography.${key}`, problems)
    checkLengths(s, ['lineHeight'], LINE_HEIGHT, `typography.${key}`, problems)
    if (s?.weight !== undefined && !isWeight(s.weight)) problems.push(`typography.${key}.weight must be 100–900 in steps of 100`)
    if (s?.transform !== undefined && !(TRANSFORMS as readonly string[]).includes(s.transform as string)) problems.push(`typography.${key}.transform must be ${TRANSFORMS.join(', ')}`)
  }
  checkLengths(t.containers, ['text', 'content', 'wide'], LENGTH, 'containers', problems)
  checkLengths(t.spacing, ['s', 'm', 'l', 'xl'], LENGTH, 'spacing', problems)
  checkLengths(t.button, ['paddingX', 'paddingY', 'borderWidth'], LENGTH, 'button', problems)
  if (t.button?.weight !== undefined && !isWeight(t.button.weight)) problems.push('button.weight must be 100–900 in steps of 100')
  if (t.button?.transform !== undefined && !(TRANSFORMS as readonly string[]).includes(t.button.transform as string)) problems.push(`button.transform must be ${TRANSFORMS.join(', ')}`)
  checkLengths(t.card, ['radius', 'borderWidth'], LENGTH, 'card', problems)
  if (t.card?.shadow !== undefined && !Object.hasOwn(SHADOWS, t.card.shadow as string)) problems.push(`card.shadow must be ${Object.keys(SHADOWS).join(', ')}`)
  if (t.link?.underline !== undefined && typeof t.link.underline !== 'boolean') problems.push('link.underline must be true or false')
  const classes = t.styleClasses as unknown
  if (classes !== undefined) {
    if (!Array.isArray(classes)) problems.push('styleClasses must be a list of { name, label }')
    else {
      const seen = new Set<string>()
      classes.forEach((c, i) => {
        const name = (c as { name?: unknown })?.name
        const label = (c as { label?: unknown })?.label
        if (typeof name !== 'string' || !STYLE_CLASS.test(name)) problems.push(`styleClasses[${i}].name must start with «site-» (a-z, 0-9, -)`)
        else if (seen.has(name)) problems.push(`styleClasses[${i}].name «${name}» is listed twice`)
        else seen.add(name)
        if (typeof label !== 'string' || !label.trim() || label.length > 60) problems.push(`styleClasses[${i}].label must be 1–60 characters`)
      })
    }
  }
  return problems
}

const SELECTOR: Record<TypeKey, string> = {
  body: 'body',
  display: '.t-display',
  h2: '.t-h2',
  h3: '.t-h3',
  h4: '.t-h4',
  lead: '.t-lead',
  eyebrow: '.t-eyebrow',
  small: '.t-small',
}

const decl = (prop: string, v: string | number | undefined) => (v === undefined ? '' : `${prop}:${v};`)

/**
 * CSS for the tokens that are set. It goes in the inline <style> tag, which is not in a cascade
 * layer, so it wins over the kit's layered component classes without !important.
 */
export function tokensToCss(t: ThemeTokens): string {
  const base: string[] = []
  const desktop: string[] = []
  const vars: string[] = []
  for (const key of TYPE_KEYS) {
    const s = t.typography?.[key]
    if (!s) continue
    const mobileSize = s.sizeMobile ?? s.size
    const rule = decl('font-size', mobileSize) + decl('line-height', s.lineHeight) + decl('font-weight', s.weight) + decl('letter-spacing', s.letterSpacing) + decl('text-transform', s.transform)
    if (rule) base.push(`${SELECTOR[key]}{${rule}}`)
    if (s.sizeMobile && s.size) desktop.push(`${SELECTOR[key]}{font-size:${s.size};}`)
  }
  if (t.containers?.text) vars.push(`--container-text:${t.containers.text};`)
  if (t.containers?.content) vars.push(`--container-content:${t.containers.content};`)
  if (t.containers?.wide) vars.push(`--container-wide:${t.containers.wide};`)
  for (const k of ['s', 'm', 'l', 'xl'] as const) if (t.spacing?.[k]) vars.push(`--space-${k}:${t.spacing[k]};`)
  const b = t.button
  if (b) {
    const padding = b.paddingY || b.paddingX ? `padding:${b.paddingY ?? '0.625rem'} ${b.paddingX ?? '1.5rem'};` : ''
    const rule = padding + decl('font-weight', b.weight) + decl('text-transform', b.transform) + decl('border-width', b.borderWidth)
    if (rule) base.push(`.btn{${rule}}`)
  }
  const c = t.card
  if (c) {
    const rule = decl('border-radius', c.radius) + decl('box-shadow', c.shadow && SHADOWS[c.shadow]) + (c.borderWidth ? `border:${c.borderWidth} solid rgb(0 0 0 / 0.1);` : '')
    if (rule) base.push(`.kit-card{${rule}}`)
  }
  if (t.link?.underline !== undefined) base.push(`main a:not(.btn):not(.link-arrow){text-decoration:${t.link.underline ? 'underline' : 'none'};}`)
  return (vars.length ? `:root{${vars.join('')}}` : '') + base.join('') + (desktop.length ? `@media (min-width:48rem){${desktop.join('')}}` : '')
}

/** Problems with site/styles.css: it must load nothing from elsewhere and stay small. */
export function checkSiteStyles(css: string): string[] {
  const problems: string[] = []
  if (Buffer.byteLength(css, 'utf8') > 50 * 1024) problems.push('site/styles.css is larger than 50 KB')
  const checks: [RegExp, string][] = [
    [/@import/i, '@import (load styles from the kit or write them here)'],
    [/url\(\s*["']?\s*(?:[a-z][a-z0-9+.-]*:|[\\/]{2})/i, 'url() to another site or scheme (use /brand/… files)'],
    [/image-set\s*\(/i, 'image-set() (use url() with a /brand/… file)'],
    [/expression\s*\(|behavior\s*:|-moz-binding/i, 'an old script-in-CSS feature (expression, behavior, -moz-binding)'],
    [/\\/, 'a backslash (a CSS escape could spell @import or url())'],
    [/<\/?style/i, 'a <style> tag'],
  ]
  // Both as written and without comments: a comment can split a token (u/**/rl(), and a "/*" inside a
  // string can make a naive comment strip hide real code after it.
  const stripped = css.replace(/\/\*[\s\S]*?(?:\*\/|$)/g, '')
  for (const [re, what] of checks) if (re.test(css) || re.test(stripped)) problems.push(`site/styles.css has ${what}`)
  return problems
}
