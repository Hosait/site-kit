'use client'

import Link from 'next/link'
import { useState, useSyncExternalStore } from 'react'

import { t } from '@/lib/i18n'
import { negotiateLocale, otherLocale } from '@/lib/locales'
import { HREFLANG, type Locale, SITE_CONFIG } from '@/lib/sites'

const KEY = `${SITE_CONFIG.cookiePrefix}-lang-banner-dismissed`

const noSubscribe = () => () => {}

// Leses bare i nettleseren; på serveren (og ved hydrering) vises ikke banneret.
function browserPrefersOtherLanguage(locale: Locale): boolean {
  try {
    if (localStorage.getItem(KEY) === '1') return false
  } catch {}
  if (!otherLocale(locale)) return false
  return negotiateLocale(navigator.languages?.[0] || navigator.language || '') !== locale
}

/**
 * «Do you prefer English?» – vises bare når nettleserens språk ikke matcher siden
 * og siden finnes på det andre språket. Lukking huskes i nettleseren.
 */
export function LanguageBanner({ locale, alternateHref }: { locale: Locale; alternateHref: string | null }) {
  const prefersOther = useSyncExternalStore(
    noSubscribe,
    () => browserPrefersOtherLanguage(locale),
    () => false,
  )
  const [dismissed, setDismissed] = useState(false)
  const other = otherLocale(locale)

  if (!prefersOther || dismissed || !alternateHref || !other) return null
  const s = t(other)

  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(KEY, '1')
    } catch {}
  }

  return (
    <div className="bg-muted text-sm" lang={HREFLANG[other]}>
      <div className="wrap-wide flex min-h-11 items-center justify-center gap-4">
        <p>
          {s.langBannerPrefix}
          <Link href={alternateHref} hrefLang={HREFLANG[other]} className="font-medium">
            {s.langBannerName}
          </Link>
          ?
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="flex size-8 items-center justify-center rounded-full border border-ink/30 hover:border-brand hover:text-brand"
          aria-label={s.close}
        >
          <span aria-hidden>×</span>
        </button>
      </div>
    </div>
  )
}
