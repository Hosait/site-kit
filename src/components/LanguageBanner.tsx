'use client'

import Link from 'next/link'
import { useState, useSyncExternalStore } from 'react'

import { type Locale, SITE_CONFIG } from '@/lib/sites'

const KEY = `${SITE_CONFIG.cookiePrefix}-lang-banner-dismissed`

const noSubscribe = () => () => {}

// Leses bare i nettleseren; på serveren (og ved hydrering) vises ikke banneret.
function browserPrefersOtherLanguage(locale: Locale): boolean {
  try {
    if (localStorage.getItem(KEY) === '1') return false
  } catch {}
  const browser = (navigator.languages?.[0] || navigator.language || '').toLowerCase()
  const browserIsNorwegian = /^(nb|no|nn)\b/.test(browser)
  return locale === 'no' ? !browserIsNorwegian : browserIsNorwegian
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

  if (!prefersOther || dismissed || !alternateHref) return null

  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(KEY, '1')
    } catch {}
  }

  return (
    <div className="bg-mist text-sm" lang={locale === 'no' ? 'en' : 'nb'}>
      <div className="wrap-wide flex min-h-11 items-center justify-center gap-4">
        <p>
          {locale === 'no' ? 'Do you prefer ' : 'Foretrekker du '}
          <Link href={alternateHref} hrefLang={locale === 'no' ? 'en' : 'nb'} className="font-medium">
            {locale === 'no' ? 'English' : 'norsk'}
          </Link>
          ?
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="flex size-8 items-center justify-center rounded-full border border-night/30 hover:border-blue hover:text-blue"
          aria-label={locale === 'no' ? 'Close' : 'Lukk'}
        >
          <span aria-hidden>×</span>
        </button>
      </div>
    </div>
  )
}
