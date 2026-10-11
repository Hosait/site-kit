import type { ReactNode } from 'react'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/header/Header'
import { LanguageBanner } from '@/components/LanguageBanner'
import { getSettings } from '@/lib/data'
import { t } from '@/lib/i18n'
import type { Locale, SiteKey } from '@/lib/sites'

/** Ramme rundt alle sider: hopp-lenke, språkbanner, meny, innhold og bunntekst. */
export async function Shell({
  site,
  locale,
  alternateHref,
  analytics,
  children,
}: {
  site: SiteKey
  locale: Locale
  alternateHref: string | null
  /** Hva siden er, for besøksanalysen (leses av src/components/analytics/Tracker.tsx). */
  analytics?: { kind: 'page' | 'article' | 'search' | 'other'; id?: number; group?: string | null }
  children: ReactNode
}) {
  const settings = await getSettings(site, locale)
  return (
    <>
      <a
        href="#innhold"
        className="sr-only z-50 rounded-full bg-blue px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t(locale).skipToContent}
      </a>
      <LanguageBanner locale={locale} alternateHref={alternateHref} />
      <Header site={site} locale={locale} settings={settings} alternateHref={alternateHref} />
      <main
        id="innhold"
        tabIndex={-1}
        className="outline-none"
        data-a-kind={analytics?.kind}
        data-a-id={analytics?.id}
        data-a-group={analytics?.group ?? undefined}
      >
        {children}
      </main>
      <Footer site={site} locale={locale} settings={settings} />
    </>
  )
}
