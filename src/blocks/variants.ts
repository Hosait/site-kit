import type { Block, Field } from 'payload'

/** Alignment for a block's heading and intro. */
export const align: Field = {
  name: 'align',
  type: 'select',
  label: 'Justering',
  defaultValue: 'left',
  options: [
    { label: 'Venstre', value: 'left' },
    { label: 'Midtstilt', value: 'center' },
  ],
}

export const alignClass = (value: unknown): string => (value === 'center' ? 'text-center mx-auto' : '')

export function assertUniqueSlugs(blocks: Block[]): Block[] {
  const seen = new Set<string>()
  for (const b of blocks) {
    if (seen.has(b.slug)) throw new Error(`Block slug "${b.slug}" is used twice (kit and site/blocks/custom?)`)
    seen.add(b.slug)
  }
  return blocks
}

/**
 * Section settings every kit block gets ("Seksjonsoppsett"). Each defaults to `auto`/empty, and a
 * block whose settings are all default renders exactly as before (SectionFrame adds nothing).
 */
export const SPACE_VALUES = ['auto', 'none', 's', 'm', 'l', 'xl'] as const
export const WIDTH_VALUES = ['auto', 'text', 'content', 'wide', 'full'] as const
export const HIDE_VALUES = ['none', 'mobile', 'desktop'] as const
export const OVERLAY_VALUES = ['none', 'light', 'dark'] as const
export const ANCHOR = /^[a-z0-9][a-z0-9-]{0,62}$/

const spaceOptions = [
  { label: 'Automatisk', value: 'auto' },
  { label: 'Ingen', value: 'none' },
  { label: 'Liten', value: 's' },
  { label: 'Middels', value: 'm' },
  { label: 'Stor', value: 'l' },
  { label: 'Ekstra stor', value: 'xl' },
]

/** Anchors in a page's layout, to refuse the same anchor twice on one page. */
function anchorsInLayout(data: unknown): string[] {
  const layout = (data as { layout?: unknown } | null)?.layout
  if (!Array.isArray(layout)) return []
  return layout.map((b) => (b as { section?: { anchor?: unknown } })?.section?.anchor).filter((a): a is string => typeof a === 'string' && a !== '')
}

export function validateAnchor(value: unknown, data: unknown): true | string {
  if (value === null || value === undefined || value === '') return true
  if (typeof value !== 'string' || !ANCHOR.test(value)) return 'Bruk små bokstaver, tall og bindestrek (f.eks. «kontakt-oss»).'
  if (anchorsInLayout(data).filter((a) => a === value).length > 1) return `Ankeret «${value}» er brukt på en annen seksjon på denne siden.`
  return true
}

export function validateStyleClass(value: unknown, declared: string[]): true | string {
  if (value === null || value === undefined || value === '') return true
  if (typeof value !== 'string' || !declared.includes(value))
    return declared.length ? `Velg en av stilene i site/theme.json: ${declared.join(', ')}.` : 'site/theme.json har ingen stiler (styleClasses).'
  return true
}

/** The `section` group for a block. `styleClasses` are the names declared in site/theme.json. */
export function sectionSettings(styleClasses: { name: string; label: string }[]): Field {
  const names = styleClasses.map((c) => c.name)
  return {
    name: 'section',
    type: 'group',
    label: 'Seksjonsoppsett',
    interfaceName: 'SectionSettings',
    admin: { description: 'Luft, bredde, bakgrunnsbilde, anker og visning. «Automatisk» er blokkens eget oppsett.' },
    fields: [
      {
        type: 'row',
        fields: [
          { name: 'spaceTop', type: 'select', label: 'Luft over', defaultValue: 'auto', options: spaceOptions },
          { name: 'spaceBottom', type: 'select', label: 'Luft under', defaultValue: 'auto', options: spaceOptions },
          {
            name: 'width',
            type: 'select',
            label: 'Bredde',
            defaultValue: 'auto',
            options: [
              { label: 'Automatisk', value: 'auto' },
              { label: 'Smal (tekstkolonne)', value: 'text' },
              { label: 'Normal', value: 'content' },
              { label: 'Bred', value: 'wide' },
              { label: 'Hele skjermen', value: 'full' },
            ],
          },
        ],
      },
      {
        type: 'row',
        fields: [
          { name: 'backgroundMedia', type: 'upload', relationTo: 'media', label: 'Bakgrunnsbilde eller -video' },
          {
            name: 'overlay',
            type: 'select',
            label: 'Toning over bakgrunnsbildet',
            defaultValue: 'none',
            options: [
              { label: 'Ingen', value: 'none' },
              { label: 'Lys (mørk tekst)', value: 'light' },
              { label: 'Mørk (hvit tekst)', value: 'dark' },
            ],
            admin: { condition: (_, s) => Boolean(s?.backgroundMedia) },
          },
        ],
      },
      {
        type: 'row',
        fields: [
          {
            name: 'anchor',
            type: 'text',
            label: 'Anker',
            admin: { description: 'Lenk hit med #anker, f.eks. «kontakt-oss».' },
            validate: (value: unknown, { data }: { data: unknown }) => validateAnchor(value, data),
          },
          {
            name: 'hide',
            type: 'select',
            label: 'Vis på',
            defaultValue: 'none',
            options: [
              { label: 'Alle skjermer', value: 'none' },
              { label: 'Bare større skjermer (skjul på mobil)', value: 'mobile' },
              { label: 'Bare mobil (skjul på større skjermer)', value: 'desktop' },
            ],
          },
          {
            // Text, not select: a select is a Postgres enum, so a new style in theme.json would need a migration.
            name: 'styleClass',
            type: 'text',
            label: 'Stil',
            admin: {
              condition: () => names.length > 0,
              description: styleClasses.map((c) => `${c.name} = ${c.label}`).join(', '),
            },
            validate: (value: unknown) => validateStyleClass(value, names),
          },
        ],
      },
    ],
  }
}

/** Adds the `section` group to each block (last, so it sits under the block's own fields). */
export function withSection(blocks: Block[], styleClasses: { name: string; label: string }[]): Block[] {
  const field = sectionSettings(styleClasses)
  return blocks.map((b) => (b.fields.some((f) => 'name' in f && f.name === 'section') ? b : { ...b, fields: [...b.fields, field] }))
}

export type SectionValues = {
  spaceTop?: string | null
  spaceBottom?: string | null
  width?: string | null
  backgroundMedia?: unknown
  overlay?: string | null
  anchor?: string | null
  hide?: string | null
  styleClass?: string | null
}

/** True when the settings change nothing, so the block renders without a frame. */
export function isDefaultSection(s: SectionValues | null | undefined): boolean {
  if (!s) return true
  return (
    (s.spaceTop ?? 'auto') === 'auto' &&
    (s.spaceBottom ?? 'auto') === 'auto' &&
    (s.width ?? 'auto') === 'auto' &&
    !s.backgroundMedia &&
    !s.anchor &&
    (s.hide ?? 'none') === 'none' &&
    !s.styleClass
  )
}

/** The frame's class names and data attributes (CSS in globals.css, `.sec-frame`). */
export function sectionFrameProps(s: SectionValues, declaredClasses: string[]) {
  const pick = <T extends readonly string[]>(v: unknown, values: T, fallback: T[number]) =>
    (values as readonly string[]).includes(v as string) ? (v as T[number]) : fallback
  const hide = pick(s.hide, HIDE_VALUES, 'none')
  const overlay = s.backgroundMedia ? pick(s.overlay, OVERLAY_VALUES, 'none') : 'none'
  const styleClass = typeof s.styleClass === 'string' && declaredClasses.includes(s.styleClass) ? s.styleClass : undefined
  return {
    id: typeof s.anchor === 'string' && ANCHOR.test(s.anchor) ? s.anchor : undefined,
    className: [
      'sec-frame',
      hide === 'mobile' && 'max-md:hidden',
      hide === 'desktop' && 'md:hidden',
      s.backgroundMedia && 'sec-has-media',
      overlay !== 'none' && `sec-overlay-${overlay}`,
      overlay === 'dark' && 'on-dark',
      styleClass,
    ]
      .filter(Boolean)
      .join(' '),
    'data-pt': pick(s.spaceTop, SPACE_VALUES, 'auto'),
    'data-pb': pick(s.spaceBottom, SPACE_VALUES, 'auto'),
    'data-width': pick(s.width, WIDTH_VALUES, 'auto'),
  }
}

/** Section background (values from the block `background` field; colours from site/theme.json). */
export type Background = 'none' | 'muted' | 'tint' | 'dark' | 'brand' | null | undefined
export const sectionBg = (b: Background) => (b && b !== 'none' ? `bg-section-${b} ${b === 'dark' || b === 'brand' ? 'on-dark' : ''}` : '')
export const hasSectionBg = (b: Background) => Boolean(b && b !== 'none')
