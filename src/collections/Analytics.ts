import type { Access, CollectionConfig, GlobalConfig } from 'payload'

import { adminOnly, isAdmin } from '@/access/siteAccess'
import { audit } from '@/lib/analytics/audit'
import { clearSettingsCache } from '@/lib/analytics/ingest'
import type { User } from '@/payload-types'
import { revalidatePath } from 'next/cache'

/**
 * Besøksanalyse: rådata, døgnsalt, samtykkelogg, revisjonslogg og innstillinger.
 * Hendelsene skrives med SQL i src/lib/analytics/ingest.ts; samlingene finnes for skjema og migrasjoner.
 * Ingen IP-adresser lagres. Rapportene ligger under /admin/analytics.
 */

/** Administratorer og brukere med «Tilgang til besøksanalyse». */
/** Re-render cached pages after the analytics settings change (injectable for tests). */
export async function revalidateStatsSettings(revalidate: (path: string, type: 'layout') => void = revalidatePath) {
  try {
    revalidate('/', 'layout')
  } catch {
    // Outside a Next request (scripts, tests with the real function) there is no cache to clear.
  }
}

export const hasAnalyticsAccess = (user: unknown): boolean => {
  const u = user as (User & { analyticsAccess?: boolean | null }) | null
  return Boolean(u && (isAdmin(u) || u.analyticsAccess))
}
const analyticsAccess: Access = ({ req: { user } }) => hasAnalyticsAccess(user)
const nobody: Access = () => false
const readOnly = { read: analyticsAccess, create: nobody, update: nobody, delete: nobody }

export const AnalyticsEvents: CollectionConfig = {
  slug: 'analytics-events',
  labels: { singular: 'Hendelse', plural: 'Besøkshendelser' },
  admin: { hidden: true },
  access: readOnly,
  fields: [
    { name: 'site', type: 'text', required: true, index: true },
    { name: 'locale', type: 'text' },
    // pageview | leave | download | email | phone | outbound | cta | search | form
    { name: 'type', type: 'text', required: true, index: true },
    { name: 'path', type: 'text' },
    // page | article | search | other
    { name: 'pageKind', type: 'text' },
    { name: 'pageId', type: 'number' },
    // Nedlastet dokument (documents.id).
    { name: 'docId', type: 'number' },
    // Knappetekst, søkeord, utgående vert eller skjemanavn.
    { name: 'label', type: 'text' },
    // Tid på siden i ms (leave) eller antall treff (search).
    { name: 'value', type: 'number' },
    // Uten samtykke: hash av døgnsalt, nettsted, IP og nettleser (byttes hver dag). Med samtykke: hash av <cookiePrefix>-vid.
    { name: 'visitor', type: 'text', required: true, index: true },
    { name: 'session', type: 'text', required: true, index: true },
    { name: 'consent', type: 'checkbox' },
    // Første besøk for denne besøks-ID-en (bare kjent med samtykke).
    { name: 'isNew', type: 'checkbox' },
    { name: 'channel', type: 'text' },
    { name: 'source', type: 'text' },
    { name: 'medium', type: 'text' },
    { name: 'campaign', type: 'text' },
    { name: 'country', type: 'text' },
    { name: 'device', type: 'text' },
  ],
}

export const AnalyticsDaily: CollectionConfig = {
  slug: 'analytics-daily',
  labels: { singular: 'Dagssum', plural: 'Dagssummer' },
  admin: { hidden: true },
  access: readOnly,
  fields: [
    // YYYY-MM-DD i norsk tid.
    { name: 'day', type: 'text', required: true, index: true },
    { name: 'site', type: 'text', required: true },
    { name: 'locale', type: 'text' },
    // total | group | channel | country
    { name: 'dimension', type: 'text', required: true, index: true },
    { name: 'key', type: 'text' },
    { name: 'visitors', type: 'number' },
    { name: 'sessions', type: 'number' },
    { name: 'pageviews', type: 'number' },
    { name: 'conversions', type: 'number' },
  ],
}

export const AnalyticsSalts: CollectionConfig = {
  slug: 'analytics-salts',
  admin: { hidden: true },
  access: { read: adminOnly, create: nobody, update: nobody, delete: nobody },
  fields: [
    { name: 'day', type: 'text', required: true, unique: true },
    { name: 'salt', type: 'text', required: true },
  ],
}

export const ConsentLog: CollectionConfig = {
  slug: 'consent-log',
  labels: { singular: 'Samtykke', plural: 'Samtykkelogg' },
  admin: {
    // Nås fra Besøksanalyse → Innstillinger og cookies (egen menygruppe i AnalyticsNav).
    group: false,
    useAsTitle: 'consentId',
    defaultColumns: ['createdAt', 'action', 'statistics', 'site', 'locale', 'version'],
    description: 'Dokumentasjon av samtykker fra cookie-banneret. Inneholder ingen IP-adresser.',
  },
  access: readOnly,
  fields: [
    { name: 'consentId', type: 'text', required: true, index: true },
    { name: 'action', type: 'text', required: true },
    { name: 'statistics', type: 'checkbox' },
    { name: 'version', type: 'number', required: true },
    { name: 'site', type: 'text' },
    { name: 'locale', type: 'text' },
  ],
}

export const AuditLog: CollectionConfig = {
  slug: 'audit-log',
  labels: { singular: 'Logghendelse', plural: 'Revisjonslogg' },
  admin: {
    // Nås fra Besøksanalyse → Innstillinger og cookies (egen menygruppe i AnalyticsNav).
    group: false,
    useAsTitle: 'action',
    defaultColumns: ['createdAt', 'user', 'action', 'details'],
    description: 'Administrative handlinger i besøksanalysen (innstillinger, tilganger, eksport).',
  },
  access: readOnly,
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users' },
    { name: 'action', type: 'text', required: true },
    { name: 'details', type: 'json' },
  ],
}

export const AnalyticsSettings: GlobalConfig = {
  slug: 'analytics-settings',
  label: 'Innstillinger for besøksanalyse',
  admin: { group: false },
  access: { read: () => true, update: adminOnly },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        clearSettingsCache()
        // The layout passes 'statistics without consent' to the tracker, so cached pages must re-render.
        await revalidateStatsSettings()
        const changed = Object.fromEntries(
          ['basicWithoutConsent', 'retentionDays', 'aggregateDays', 'consentLogDays']
            .filter((k) => doc[k] !== previousDoc?.[k])
            .map((k) => [k, { fra: previousDoc?.[k] ?? null, til: doc[k] }]),
        )
        if (Object.keys(changed).length) await audit(req.payload, req.user, 'Endret innstillinger for besøksanalyse', changed)
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'basicWithoutConsent',
      type: 'checkbox',
      label: 'Enkel statistikk uten samtykke',
      defaultValue: false,
      admin: {
        description:
          'Teller besøk uten informasjonskapsler og uten å lagre noe på enheten (døgnbasert, anonym). ' +
          'Av: bare besøkende som har godtatt statistikk telles. ⚖️ Krever juridisk vurdering før lansering.',
      },
    },
    {
      name: 'retentionDays',
      type: 'number',
      label: 'Lagringstid for besøksdata (dager)',
      defaultValue: 395,
      min: 30,
      max: 760,
      admin: { description: 'Eldre hendelser slettes automatisk. 395 dager = 13 måneder (sammenligning med i fjor).' },
    },
    {
      name: 'aggregateDays',
      type: 'number',
      label: 'Lagringstid for daglige summer (dager)',
      defaultValue: 760,
      min: 365,
      max: 3650,
      admin: { description: 'Bare tall per dag (ingen besøks-ID-er). 760 dager = 25 måneder langtidsutvikling.' },
    },
    {
      name: 'consentLogDays',
      type: 'number',
      label: 'Lagringstid for samtykkelogg (dager)',
      defaultValue: 1095,
      min: 365,
      max: 3650,
      admin: { description: '⚖️ Hvor lenge dokumentasjon av samtykke bør oppbevares, bør avklares juridisk.' },
    },
  ],
}
