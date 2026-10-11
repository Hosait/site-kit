'use client'

import { useEffect, useRef, useState } from 'react'

import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE,
  CONSENT_VERSION,
  parseConsent,
  randomId,
  readCookie,
  serializeConsent,
  VISITOR_COOKIE,
  VISITOR_MAX_AGE,
  type Consent,
} from '@/lib/analytics/consent'
import type { Strings } from '@/lib/i18n'
import type { Locale, SiteKey } from '@/lib/sites'

/** Åpner banneret igjen (lenken «Cookie-innstillinger» i bunnteksten). */
export const OPEN_CONSENT_EVENT = 'site:consent-open'

function setCookie(name: string, value: string, maxAge: number) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`
}

/**
 * Cookie-banner: «Godta alle» og «Avvis valgfrie» er like synlige, «Tilpass» viser kategoriene.
 * Ingen samtykkepliktig informasjonskapsel settes før et valg er gjort. Valget dokumenteres
 * i samtykkeloggen (/next/consent) og kan endres når som helst fra bunnteksten.
 */
export function ConsentBanner({ site, locale, strings, policyHref }: { site: SiteKey; locale: Locale; strings: Strings; policyHref: string }) {
  const [open, setOpen] = useState(false)
  const [customize, setCustomize] = useState(false)
  const [statistics, setStatistics] = useState(false)
  const current = useRef<Consent | null>(null)
  const regionRef = useRef<HTMLDivElement>(null)
  const reopened = useRef(false)

  useEffect(() => {
    const consent = parseConsent(readCookie(document.cookie, CONSENT_COOKIE))
    current.current = consent
    // Tidligere samtykke som er trukket tilbake eller utløpt: fjern besøks-ID-en.
    if (!consent?.statistics && readCookie(document.cookie, VISITOR_COOKIE)) setCookie(VISITOR_COOKIE, '', 0)
    const timer = setTimeout(() => {
      if (!consent) setOpen(true)
      setStatistics(Boolean(consent?.statistics))
    }, 0)
    const onOpen = () => {
      reopened.current = true
      setStatistics(Boolean(current.current?.statistics))
      setCustomize(true)
      setOpen(true)
    }
    window.addEventListener(OPEN_CONSENT_EVENT, onOpen)
    return () => {
      clearTimeout(timer)
      window.removeEventListener(OPEN_CONSENT_EVENT, onOpen)
    }
  }, [])

  // Flytt fokus til banneret når det åpnes fra bunnteksten.
  useEffect(() => {
    if (open && reopened.current) regionRef.current?.focus()
  }, [open])

  function save(stats: boolean, action: 'accept_all' | 'reject_optional' | 'custom') {
    const before = current.current
    const consent: Consent = { version: CONSENT_VERSION, statistics: stats, id: before?.id ?? randomId(12), at: Date.now() }
    setCookie(CONSENT_COOKIE, serializeConsent(consent), CONSENT_MAX_AGE)
    if (stats) {
      if (!readCookie(document.cookie, VISITOR_COOKIE)) setCookie(VISITOR_COOKIE, randomId(16), VISITOR_MAX_AGE)
    } else {
      setCookie(VISITOR_COOKIE, '', 0)
    }
    current.current = consent
    const logged = before?.statistics && !stats ? 'withdraw' : action
    void fetch('/next/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: consent.id, action: logged, statistics: stats, site, locale }),
      keepalive: true,
    }).catch(() => {})
    setStatistics(stats)
    setOpen(false)
    setCustomize(false)
  }

  if (!open) return null

  return (
    <div
      ref={regionRef}
      role="region"
      aria-label={strings.consentTitle}
      tabIndex={-1}
      data-no-track
      className="fixed inset-x-0 bottom-0 z-[60] max-h-[85dvh] overflow-y-auto border-t border-ink/10 bg-white shadow-[0_-8px_30px_rgba(23,33,42,0.12)] outline-none"
    >
      <div className="wrap-wide py-5 md:py-6">
        <h2 className="text-lg font-bold">{strings.consentTitle}</h2>
        <p className="mt-2 max-w-3xl text-sm text-ink/80 md:text-base">
          {strings.consentText}{' '}
          <a href={policyHref} className="whitespace-nowrap underline underline-offset-2">
            {strings.consentReadMore}
          </a>
        </p>

        {customize && (
          <fieldset className="mt-4 max-w-3xl divide-y divide-ink/10 rounded-2xl border border-ink/10">
            <legend className="sr-only">{strings.consentCustomize}</legend>
            <div className="flex items-start justify-between gap-4 p-4">
              <div>
                <p className="font-medium">{strings.consentNecessary}</p>
                <p className="t-small text-ink/70">{strings.consentNecessaryText}</p>
              </div>
              <span className="t-small shrink-0 text-ink/70">{strings.consentAlwaysOn}</span>
            </div>
            <label className="flex cursor-pointer items-start justify-between gap-4 p-4">
              <span>
                <span className="block font-medium">{strings.consentStatistics}</span>
                <span className="t-small block text-ink/70">{strings.consentStatisticsText}</span>
              </span>
              <input
                type="checkbox"
                checked={statistics}
                onChange={(e) => setStatistics(e.target.checked)}
                className="mt-1 size-6 shrink-0 accent-[var(--color-brand)]"
              />
            </label>
          </fieldset>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="btn btn-primary" onClick={() => save(true, 'accept_all')}>
            {strings.consentAccept}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => save(false, 'reject_optional')}>
            {strings.consentReject}
          </button>
          {customize ? (
            <button type="button" className="btn" onClick={() => save(statistics, 'custom')}>
              {strings.consentSave}
            </button>
          ) : (
            <button type="button" className="btn" onClick={() => setCustomize(true)}>
              {strings.consentCustomize}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/** Lenken «Cookie-innstillinger» (bunnteksten): åpner banneret igjen. */
export function ConsentSettingsButton({ label, className }: { label: string; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}>
      {label}
    </button>
  )
}
