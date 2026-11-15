/**
 * site/theme.json → CSS custom properties. The values go into a <style> tag, so only
 * plain hex colours and px/rem lengths are accepted.
 */
export type ColorKey = 'ink' | 'brand' | 'brandText' | 'brandDark' | 'tint' | 'muted' | 'highlight' | 'background'
export type Theme = {
  colors: Record<ColorKey, string>
  radius: { button: string; card: string }
  logo: { src: string; width: number; height: number }
  /** The site's icon (favicon), from the old site; without it the kit's /favicon.ico. */
  icon?: { src: string }
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
const ICON = /^\/brand\/[a-z0-9_-][a-z0-9._-]*\.(svg|png|webp|ico)$/

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
  if (t?.icon !== undefined && (typeof t.icon?.src !== 'string' || !ICON.test(t.icon.src) || t.icon.src.includes('..'))) problems.push('icon.src must be /brand/<file>.svg|png|webp|ico')
  if (problems.length) throw new Error(`site/theme.json: ${problems.join('; ')}`)
  return t as Theme
}

const MAX_ICON_BYTES = 100 * 1024
const MAGIC: Record<string, (b: Buffer) => boolean> = {
  png: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  ico: (b) => b.subarray(0, 4).equals(Buffer.from([0, 0, 1, 0])),
  webp: (b) => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP',
  svg: (b) => /^(?:\ufeff)?\s*(?:<\?xml[^>]*>\s*)?<svg[\s>]/i.test(b.subarray(0, 1024).toString('utf8')),
}
// What an icon SVG must not hold: script, embedded HTML, event handlers, script or outside links,
// a DTD (entities), or bytes a browser could read differently (another encoding, control characters).
const SVG_UNSAFE: [RegExp, string][] = [
  // ISO-2022-JP and the like switch character sets with escape bytes inside a tag name.
  [/<\?xml[^>]*\sencoding\s*=\s*["'](?!utf-8["'])/i, 'an encoding other than UTF-8'],
  [/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/, 'a control character'],
  // Also in another namespace, with any letters in its prefix: <h:script>, <ä:script>.
  [/<(?:[^\s<>/:]+:)?script/i, 'a <script>'],
  [/<(?:[^\s<>/:]+:)?foreignObject/i, 'a <foreignObject>'],
  // A character reference can hide javascript: (&#106;avascript:); an icon needs none.
  [/&#/, 'a character reference (&#…;)'],
  [/\son[a-z]+\s*=/i, 'an on…= event handler'],
  [/javascript:/i, 'a javascript: link'],
  [/\ssrcdoc\s*=/i, 'a srcdoc attribute'],
  // A link may only point inside the icon (#id) or be a plain relative path: no scheme (http:,
  // data:), no // or \\ at the start.
  [/[\s:]href\s*=\s*["']\s*(?:[a-z][a-z0-9+.-]*:|[\\/]{2}|\\)/i, 'a link to another site or another scheme'],
  [/url\(\s*["']?\s*(?:[a-z][a-z0-9+.-]*:|[\\/]{2}|\\)/i, 'a style that loads from elsewhere (url())'],
  [/@import/i, 'a style that loads from elsewhere (@import)'],
  [/image-set\s*\(/i, 'a style that loads from elsewhere (image-set())'],
  // A CSS escape can spell @import or url() (@\69mport, u\72 l(…)); an icon needs no backslash.
  [/\\/, 'a backslash (a CSS escape)'],
  // An animation can set a link after this check: <set attributeName="href" to="https://…"/>.
  [/attributeName\s*=\s*["']\s*(?:[^\s"':]+:)?href/i, 'an animation that changes a link'],
  [/<!DOCTYPE|<!ENTITY/i, 'a DTD'],
]

// The text of each <style> element (to the end when one is not closed). Inside it, a CDATA section
// or a comment can split @import or url() so the checks above miss it.
const STYLE_TEXT = /<(?:[^\s<>/:]+:)?style\b[^<>]*>([\s\S]*?)(?:<\/(?:[^\s<>/:]+:)?style\s*>|$)/gi

// The only namespaces an icon needs; XHTML (an <h:iframe> without foreignObject) and the rest are refused.
const SVG_NAMESPACES = new Set(['http://www.w3.org/2000/svg', 'http://www.w3.org/1999/xlink'])

/**
 * What is wrong with an icon file (empty when nothing): at most 100 KB, bytes that match the
 * extension, and for SVG nothing that runs or loads from elsewhere. /brand/ is served from the
 * same origin as /admin, and the file comes from the old site, so kit:theme-check checks it.
 */
export function checkIconFile(bytes: Buffer, ext: string): string[] {
  const problems: string[] = []
  if (bytes.length > MAX_ICON_BYTES) problems.push('the icon is larger than 100 KB')
  const isType = MAGIC[ext]
  if (!isType || !isType(bytes)) return [...problems, `the file is not a ${ext} (its first bytes do not match)`]
  if (ext === 'svg') {
    const text = bytes.toString('utf8')
    for (const [re, what] of SVG_UNSAFE) if (re.test(text)) problems.push(`the SVG has ${what}`)
    for (const m of text.matchAll(STYLE_TEXT)) {
      if (/<!\[CDATA\[|<!--/.test(m[1])) { problems.push('the SVG has a CDATA section or a comment inside <style>'); break }
    }
    for (const m of text.matchAll(/\sxmlns(?::[^\s=]+)?\s*=\s*["']([^"']*)["']/gi)) {
      if (!SVG_NAMESPACES.has(m[1].trim())) { problems.push(`the SVG has a namespace other than SVG and xlink (${m[1].slice(0, 60)})`); break }
    }
  }
  return problems
}

/** The address of the site's icon: theme.json's, else the kit's own. */
export const siteIcon = (theme: Theme): string => theme.icon?.src ?? '/favicon.ico'

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
  ['white', 'brand'], // skip link (Shell.tsx)
  ['highlight', 'background'], // form errors
  ['tint', 'ink'], ['tint', 'brandDark'], // links in dark sections (globals.css .bg-section-dark/-brand)
]

export function checkTheme(theme: Theme): string[] {
  const color = (k: ColorKey | 'white') => (k === 'white' ? '#ffffff' : theme.colors[k])
  return PAIRS.flatMap(([fg, bg]) => {
    const r = contrastRatio(color(fg), color(bg))
    return r >= 4.5 ? [] : [`${fg} on ${bg}: ${r.toFixed(2)}:1, needs 4.5:1`]
  })
}
