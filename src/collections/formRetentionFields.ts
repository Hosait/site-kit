import type { Field } from 'payload'

import { RETENTION_MAX_DAYS } from '@/lib/forms/retention'

/** "Behold innsendinger" on a form: the site's default, a number of days, or keep. Read by the nightly job. */
export function formRetentionFields(siteDefault: number | null): Field[] {
  const site = siteDefault === null ? 'behold' : `${siteDefault} dager`
  return [
    {
      name: 'retention',
      type: 'select',
      label: 'Behold innsendinger',
      required: true,
      defaultValue: 'default',
      options: [
        { label: `Nettstedets standard (${site})`, value: 'default' },
        { label: 'Antall dager', value: 'days' },
        { label: 'Behold', value: 'keep' },
      ],
      admin: { position: 'sidebar', description: 'Innsendinger som er eldre, slettes hver natt.' },
    },
    {
      name: 'retentionDays',
      type: 'number',
      label: 'Dager',
      min: 1,
      max: RETENTION_MAX_DAYS,
      admin: { position: 'sidebar', step: 1, condition: (_, sibling) => sibling?.retention === 'days' },
      validate: (value: unknown, { siblingData }: { siblingData: unknown }) =>
        (siblingData as { retention?: string } | undefined)?.retention !== 'days' ||
        (Number.isInteger(value) && (value as number) >= 1 && (value as number) <= RETENTION_MAX_DAYS) ||
        `Et helt antall dager fra 1 til ${RETENTION_MAX_DAYS}`,
    },
  ]
}
