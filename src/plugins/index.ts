import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import type { Plugin } from 'payload'

import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { DEFAULT_SITE, isSiteKey, localePath, siteOrigin, SITES } from '@/lib/sites'
import { SITE_OPTIONS } from '@/lib/sites'

const generateTitle: GenerateTitle = ({ doc }) => {
  const key: unknown = doc?.site
  const site = isSiteKey(key) ? SITES[key] : SITES[DEFAULT_SITE]
  return doc?.title ? `${doc.title} | ${site.name}` : site.name
}

const generateURL: GenerateURL = ({ doc, locale, collectionSlug }) => {
  const key: unknown = doc?.site
  const site = isSiteKey(key) ? key : DEFAULT_SITE
  const loc = locale === 'en' ? 'en' : 'no'
  const path =
    collectionSlug === 'articles'
      ? localePath(loc, `${SITES[site].articleBase[loc]}/${doc?.slug ?? ''}`)
      : localePath(loc, (doc?.path as string) ?? '')
  return siteOrigin(site) + path
}

/**
 * Media og dokumenter lagres i Hosaits S3 når S3_BUCKET er satt; ellers på disk (lokal utvikling).
 * Filene ligger under prefikset `public/`, som er gjort offentlig lesbart i Hosait, og lenkes
 * direkte til s3.hosait.com – Node-prosessen serverer aldri bildebytes.
 */
const s3PublicBase = process.env.S3_BUCKET
  ? `${(process.env.S3_ENDPOINT || 'https://s3.hosait.com').replace(/\/$/, '')}/${process.env.S3_BUCKET}`
  : ''
const publicCollection = (folder: string) => ({
  prefix: `public/${folder}`,
  disablePayloadAccessControl: true as const,
  generateFileURL: ({ filename, prefix }: { filename: string; prefix?: string }) =>
    `${s3PublicBase}/${prefix || `public/${folder}`}/${encodeURIComponent(filename)}`,
})
// Alltid registrert (alwaysInsertFields), slik at databaseskjemaet er likt lokalt og på Hosait;
// selve S3-lagringen er bare på når S3_BUCKET er satt.
const storage: Plugin[] = [
  s3Storage({
    enabled: Boolean(process.env.S3_BUCKET),
    alwaysInsertFields: true,
    collections: { media: publicCollection('media'), documents: publicCollection('documents') },
    bucket: process.env.S3_BUCKET || 'local',
    config: {
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || 'oslo',
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      },
    },
  }),
]

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'articles'],
    overrides: {
      labels: { singular: 'Omdirigering', plural: 'Omdirigeringer' },
      admin: { group: 'Nettsted' },
      // @ts-expect-error mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => [
        {
          name: 'site',
          type: 'select',
          label: 'Nettsted',
          options: SITE_OPTIONS,
          admin: { description: 'Tomt = gjelder alle nettsteder.' },
        },
        ...defaultFields.map((field) =>
          'name' in field && field.name === 'from'
            ? { ...field, admin: { description: 'Gammel sti, f.eks. /en/career/test' } }
            : field,
        ),
        {
          name: 'permanent',
          type: 'checkbox',
          label: 'Permanent (301)',
          defaultValue: true,
        },
      ],
      hooks: { afterChange: [revalidateRedirects] },
    },
  }),
  seoPlugin({ generateTitle, generateURL }),
  formBuilderPlugin({
    fields: { payment: false, state: false },
    formOverrides: {
      labels: { singular: 'Skjema', plural: 'Skjemaer' },
      admin: { group: 'Skjema' },
      fields: ({ defaultFields }) =>
        defaultFields.map((field) =>
          'name' in field && field.name === 'confirmationMessage'
            ? {
                ...field,
                editor: lexicalEditor({
                  features: ({ rootFeatures }) => [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
                  ],
                }),
              }
            : field,
        ),
    },
    formSubmissionOverrides: {
      labels: { singular: 'Innsending', plural: 'Innsendinger' },
      admin: { group: 'Skjema', defaultColumns: ['form', 'site', 'pagePath', 'createdAt'] },
      // Hvor skjemaet ble sendt fra (siden, ikke besøket): til besøksanalysen.
      fields: ({ defaultFields }) => [
        ...defaultFields,
        { name: 'site', type: 'text', label: 'Nettsted', admin: { readOnly: true, position: 'sidebar' } },
        { name: 'locale', type: 'text', label: 'Språk', admin: { readOnly: true, position: 'sidebar' } },
        { name: 'pagePath', type: 'text', label: 'Side', admin: { readOnly: true, position: 'sidebar' } },
      ],
    },
  }),
  ...storage,
]
