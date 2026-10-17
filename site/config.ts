import type { SiteConfigInput } from '@/lib/site-config'

/**
 * Everything that makes this site this site, apart from content (site-plan.json) and
 * look (theme.json). Hosait Sites fills it from the intake answers.
 *
 * Sites, locales, documentTypes and articleKinds become database enums. Changing them after
 * the first deploy needs a migration: pnpm payload migrate:create <name> && pnpm generate:types
 */
export const siteConfig = {
  brand: { name: 'Nordlys Demo', legalName: 'Nordlys Demo AS', orgNumber: '000 000 000', country: 'NO' },
  sites: {
    main: {
      name: 'Nordlys Demo',
      origin: 'https://www.example.com',
      hosts: ['www.example.com', 'example.com', 'main.localhost'],
      articleBase: { no: 'nyheter', en: 'news' },
    },
  },
  locales: {
    no: {
      label: 'Norsk', short: 'NO', hreflang: 'nb', intl: 'nb-NO', ogLocale: 'nb_NO', textSearch: 'norwegian',
      searchSegment: 'sok', cookiePolicyPath: 'informasjonskapsler', aliases: ['nb', 'nn'],
    },
    en: {
      label: 'English', short: 'EN', hreflang: 'en', intl: 'en-GB', ogLocale: 'en_GB', textSearch: 'english',
      searchSegment: 'search', cookiePolicyPath: 'cookies', aliases: [],
    },
  },
  defaultLocale: 'no',
  admin: { language: 'nb', titleSuffix: ' – CMS' },
  email: { fromName: 'Nordlys Demo', fromAddress: 'nettsted@example.com' },
  timezone: 'Europe/Oslo',
  cookiePrefix: 'site',
  documentTypes: {
    brochure: { no: 'Brosjyre', en: 'Brochure' },
    datasheet: { no: 'Datablad', en: 'Data sheet' },
    manual: { no: 'Brukerveiledning', en: 'Manual' },
    certificate: { no: 'Sertifikat', en: 'Certificate' },
    other: { no: 'Annet', en: 'Other' },
  },
  articleKinds: {
    news: { no: 'Nyhet', en: 'News' },
    blog: { no: 'Fagblogg', en: 'Blog' },
  },
  features: { analytics: 'builtin', search: true },
  // How long form submissions are kept, in days; a form can set its own period or "keep".
  // null keeps them. Hosait Sites sets it from the intake answer.
  forms: { retentionDays: 90 },
} as const satisfies SiteConfigInput
