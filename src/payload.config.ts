import { postgresAdapter } from '@payloadcms/db-postgres'
import { nb } from '@payloadcms/translations/languages/nb'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

import { Articles } from './collections/Articles'
import { AnalyticsDaily, AnalyticsEvents, AnalyticsSalts, AnalyticsSettings, AuditLog, ConsentLog } from './collections/Analytics'
import { jobs } from './jobs'
import { migrations } from './migrations'
import { Documents } from './collections/Documents'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { People } from './collections/People'
import { SearchIndex } from './collections/SearchIndex'
import { SiteSettings } from './collections/SiteSettings'
import { Users } from './collections/Users'
import { richTextEditor } from './fields/richText'
import { plugins } from './plugins'
import { getServerSideURL } from './utilities/getURL'
import { DEFAULT_LOCALE, FEATURES, LOCALE_CONFIG, LOCALES, SITE_CONFIG } from './lib/sites'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    importMap: { baseDir: path.resolve(dirname) },
    user: Users.slug,
    // Feature switches in site/config.ts decide which admin panels exist.
    components: {
      beforeDashboard: ['/components/admin/SeedPanel#SeedPanel', ...(FEATURES.search ? ['/components/admin/SearchPanel#SearchPanel'] : [])],
      afterNavLinks: FEATURES.analytics === 'builtin' ? ['/components/analytics/admin/AnalyticsNav#AnalyticsNav'] : [],
      views:
        FEATURES.analytics === 'builtin'
          ? { analytics: { Component: '/components/analytics/admin/AnalyticsView#AnalyticsView', path: '/analytics' } }
          : {},
    },
    meta: { titleSuffix: SITE_CONFIG.admin.titleSuffix },
    livePreview: {
      breakpoints: [
        { label: 'Mobil', name: 'mobile', width: 375, height: 812 },
        { label: 'Nettbrett', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  i18n: { supportedLanguages: { nb, en }, fallbackLanguage: SITE_CONFIG.admin.language },
  localization: {
    locales: LOCALES.map((code) => ({ code, label: LOCALE_CONFIG[code].label })),
    defaultLocale: DEFAULT_LOCALE,
    fallback: false,
  },
  editor: richTextEditor,
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    // Skjemaendringer går via migrasjoner (pnpm payload migrate:create). I produksjon kjøres
    // nye migrasjoner automatisk ved oppstart; lokalt synkes skjemaet direkte (push).
    push: process.env.NODE_ENV !== 'production',
    prodMigrations: migrations,
  }),
  collections: [Pages, Articles, People, Documents, Media, SiteSettings, Users, SearchIndex, AnalyticsEvents, AnalyticsDaily, AnalyticsSalts, ConsentLog, AuditLog],
  globals: [AnalyticsSettings],
  cors: [getServerSideURL()].filter(Boolean),
  plugins,
  jobs,
  // E-post (kvitteringer fra kontaktskjema) når SMTP er satt opp; ellers skrives e-post til loggen.
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM || SITE_CONFIG.email.fromAddress,
        defaultFromName: SITE_CONFIG.email.fromName,
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_PORT === '465',
          auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
        },
      })
    : undefined,
  secret: process.env.PAYLOAD_SECRET || '',
  sharp,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
})
