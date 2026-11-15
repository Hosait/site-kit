import type { Field } from 'payload'

/** Fields several block configs share (configs.ts and moreBlocks.ts both import them). */

/** Bakgrunnsfarge for en seksjon; fargene kommer fra site/theme.json. */
export const background: Field = {
  name: 'background',
  type: 'select',
  label: 'Bakgrunn',
  defaultValue: 'none',
  options: [
    { label: 'Ingen', value: 'none' },
    { label: 'Lys grå', value: 'muted' },
    { label: 'Lys merkefarge', value: 'tint' },
    { label: 'Mørk', value: 'dark' },
    { label: 'Merkefarge', value: 'brand' },
  ],
}

export const heading: Field = { name: 'heading', type: 'text', label: 'Overskrift' }

/** An https address (map and newsletter embeds go into an iframe, so nothing else is accepted). */
export function validateHttpsUrl(value: unknown): true | string {
  if (value === null || value === undefined || value === '') return true
  try {
    if (typeof value === 'string' && new URL(value).protocol === 'https:') return true
  } catch {
    // falls through to the message
  }
  return 'Adressen må begynne med https://.'
}
