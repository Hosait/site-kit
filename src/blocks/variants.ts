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

/** Section background (values from the block `background` field; colours from site/theme.json). */
export type Background = 'none' | 'muted' | 'tint' | 'dark' | 'brand' | null | undefined
export const sectionBg = (b: Background) => (b && b !== 'none' ? `bg-section-${b} ${b === 'dark' || b === 'brand' ? 'on-dark' : ''}` : '')
export const hasSectionBg = (b: Background) => Boolean(b && b !== 'none')
