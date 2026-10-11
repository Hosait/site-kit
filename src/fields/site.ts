import type { Field } from 'payload'

import { DEFAULT_SITE, SINGLE_SITE, SITE_OPTIONS } from '@/lib/sites'

/** Hvilket nettsted dokumentet hører til. Brukes av ruting, tilgang og spørringer. */
export const siteField = (overrides: Partial<Field> = {}): Field =>
  ({
    name: 'site',
    type: 'select',
    label: 'Nettsted',
    options: SITE_OPTIONS,
    required: true,
    index: true,
    defaultValue: DEFAULT_SITE,
    admin: { position: 'sidebar', hidden: SINGLE_SITE },
    ...overrides,
  }) as Field
