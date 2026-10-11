import type { Metadata, Viewport } from 'next'
import { Suspense, type ReactNode } from 'react'

import { ConsentBanner } from '@/components/analytics/ConsentBanner'
import { Tracker } from '@/components/analytics/Tracker'
import { analyticsSettings } from '@/lib/analytics/ingest'
import { t } from '@/lib/i18n'
import { DEFAULT_LOCALE, DEFAULT_SITE, FEATURES, HREFLANG, isLocale, isSiteKey, LOCALE_CONFIG, localePath, LOCALES, SITE_KEYS, siteHref, siteOrigin, SITES } from '@/lib/sites'

import configPromise from '@payload-config'
import themeJson from '@site/theme.json'
import { getPayload } from 'payload'
import { siteFont } from '@site/fonts'
import { themeToCss, validateTheme } from '@/lib/theme'

import '../../globals.css'

const THEME = validateTheme(themeJson)
const THEME_CSS = themeToCss(THEME)

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

export const viewport: Viewport = { themeColor: THEME.colors.background, width: 'device-width', initialScale: 1 }

export default async function SiteLayout({ children, params }: { children: ReactNode; params: Params }) {
  const { site, locale } = await params
  const key = isSiteKey(site) ? site : DEFAULT_SITE
  const loc = isLocale(locale) ? locale : DEFAULT_LOCALE
  const stats = await analyticsSettings(await getPayload({ config: configPromise }))

  return (
    <html lang={HREFLANG[loc]} className={siteFont.variable} data-site={key}>
      <head>
        {/* Colours and radius from site/theme.json (validated: hex and px/rem only). */}
        <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />
      </head>
      <body>
        {children}
        {/* Besøksanalyse og samtykke (se src/lib/analytics); av når site/config.ts sier analytics: 'none'. useSearchParams krever Suspense. */}
        {FEATURES.analytics === 'builtin' && (
          <>
            <Suspense fallback={null}>
              <Tracker site={key} locale={loc} withoutConsent={stats.basicWithoutConsent} />
            </Suspense>
            <ConsentBanner site={key} locale={loc} strings={t(loc)} policyHref={siteHref(DEFAULT_SITE, key, localePath(loc, LOCALE_CONFIG[loc].cookiePolicyPath))} />
          </>
        )}
      </body>
    </html>
  )
}
