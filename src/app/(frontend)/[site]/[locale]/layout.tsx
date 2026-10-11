import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Suspense, type ReactNode } from 'react'

import { ConsentBanner } from '@/components/analytics/ConsentBanner'
import { Tracker } from '@/components/analytics/Tracker'
import { t } from '@/lib/i18n'
import { DEFAULT_SITE, HREFLANG, isLocale, isSiteKey, LOCALE_CONFIG, LOCALES, localePath, SITE_KEYS, SITES, siteHref, siteOrigin } from '@/lib/sites'

import '../../globals.css'

// Selvhostet DM Sans (variabel vekt, latin dekker æøå): ingen kall til Google fra besøkende, og forhåndslastes av Next.
const dmSans = localFont({
  src: [
    { path: '../../../../../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2', weight: '100 1000', style: 'normal' },
  ],
  variable: '--font-dm-sans',
  display: 'swap',
})

export function generateStaticParams() {
  return SITE_KEYS.flatMap((site) => LOCALES.map((locale) => ({ site, locale })))
}

type Params = Promise<{ site: string; locale: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { site } = await params
  const key = isSiteKey(site) ? site : DEFAULT_SITE
  return {
    metadataBase: new URL(siteOrigin(key)),
    title: { default: SITES[key].name, template: `%s | ${SITES[key].name}` },
    icons: { icon: '/favicon.ico' },
    // Staging skal aldri indekseres; bare produksjonsdomenene.
    robots: process.env.SITE_ORIGINS === 'production' ? undefined : { index: false, follow: false },
  }
}

export const viewport: Viewport = { themeColor: '#ffffff', width: 'device-width', initialScale: 1 }

export default async function SiteLayout({ children, params }: { children: ReactNode; params: Params }) {
  const { site, locale } = await params
  const key = isSiteKey(site) ? site : DEFAULT_SITE
  const loc = isLocale(locale) ? locale : 'no'

  return (
    <html lang={HREFLANG[loc]} className={dmSans.variable} data-site={key}>
      <body>
        {children}
        {/* Besøksanalyse og samtykke (se src/lib/analytics). useSearchParams krever Suspense. */}
        <Suspense fallback={null}>
          <Tracker site={key} locale={loc} />
        </Suspense>
        <ConsentBanner site={key} locale={loc} strings={t(loc)} policyHref={siteHref(DEFAULT_SITE, key, localePath(loc, LOCALE_CONFIG[loc].cookiePolicyPath))} />
      </body>
    </html>
  )
}
