'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { CONSENT_COOKIE, parseConsent, readCookie } from '@/lib/analytics/consent'
import { SITE_KEYS, SITES, type Locale, type SiteKey } from '@/lib/sites'

/** Hosts of this install's own sites: links between them are navigation, not outbound clicks. */
const OWN_HOSTS = new Set(SITE_KEYS.flatMap((k) => SITES[k].hosts))

/**
 * Sporingsskriptet: sidevisninger, tid på siden og viktige klikk, sendt til /next/a med sendBeacon.
 * Leser ingenting fra enheten og lagrer ingenting selv; samtykke og besøks-ID avgjøres av
 * informasjonskapslene som banneret setter (serveren leser dem). Se src/lib/analytics/ingest.ts.
 *
 * Andre komponenter kan registrere hendelser med:
 *   window.dispatchEvent(new CustomEvent('site:track', { detail: { t: 'form', b: 'Kontakt' } }))
 */

// Bare kampanjeparametre sendes fra adressen (aldri søkeord eller andre parametre).
const CAMPAIGN_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'msclkid', 'li_fat_id']
const DOWNLOAD = /\/api\/documents\/file\/|\.(pdf|zip|dwg|dxf|ifc|rvt|docx?|xlsx?|pptx?)(\?|$)/i

type Payload = Record<string, string | number | undefined>

/** Set by <Tracker>: whether the site counts basic statistics without consent (analytics settings). */
let sendWithoutConsent = false

function send(data: Payload) {
  // Without consent nothing leaves the browser, unless the site has turned on statistics without consent.
  if (!sendWithoutConsent && parseConsent(readCookie(document.cookie, CONSENT_COOKIE))?.statistics !== true) return
  const body = JSON.stringify(data)
  try {
    if (navigator.sendBeacon?.('/next/a', new Blob([body], { type: 'text/plain' }))) return
  } catch {}
  void fetch('/next/a', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {})
}

/** Hva serveren har merket hovedinnholdet med (Shell): sidetype, ID, produktgruppe, søk. */
function pageInfo() {
  const d = document.getElementById('innhold')?.dataset ?? {}
  const search = document.querySelector<HTMLElement>('[data-a-search]')?.dataset
  return {
    k: d.aKind || 'other',
    i: d.aId ? Number(d.aId) : undefined,
    search: search?.aSearch,
    hits: search?.aHits ? Number(search.aHits) : undefined,
  }
}

export function Tracker({ site, locale, withoutConsent }: { site: SiteKey; locale: Locale; withoutConsent: boolean }) {
  sendWithoutConsent = withoutConsent
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.toString()
  const base = useRef({ s: site, l: locale })
  base.current = { s: site, l: locale }
  // Synlig tid på gjeldende side (ms), og hvilken side den gjelder.
  const visible = useRef({ path: '', since: 0, total: 0, sent: true })
  const lastKey = useRef<string | null>(null)
  const first = useRef(true)

  // Sidevisning ved hver ny side (også navigasjon uten ny innlasting).
  useEffect(() => {
    const key = `${pathname}?${query}`
    if (lastKey.current === key) return // React StrictMode kjører effekter to ganger i utvikling.
    lastKey.current = key
    flushLeave()

    const info = pageInfo()
    const campaign = new URLSearchParams()
    for (const k of CAMPAIGN_KEYS) {
      const v = searchParams.get(k)
      if (v) campaign.set(k, v)
    }
    send({
      ...base.current,
      t: 'pageview',
      p: pathname,
      r: first.current ? document.referrer : undefined,
      q: campaign.toString() || undefined,
      k: info.k,
      i: info.i,
    })
    if (info.search) send({ ...base.current, t: 'search', p: pathname, k: 'search', b: info.search, v: info.hits })
    first.current = false
    visible.current = { path: pathname, since: document.visibilityState === 'visible' ? performance.now() : 0, total: 0, sent: false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, query])

  function flushLeave() {
    const v = visible.current
    if (v.sent || !v.path) return
    const total = v.total + (v.since ? performance.now() - v.since : 0)
    v.sent = true
    if (total >= 500) send({ ...base.current, t: 'leave', p: v.path, v: Math.round(Math.min(total, 30 * 60_000)) })
  }

  // Tid på siden: teller bare mens fanen er synlig; sendes når siden forlates eller skjules.
  useEffect(() => {
    const onVisibility = () => {
      const v = visible.current
      if (document.visibilityState === 'hidden') {
        if (v.since) v.total += performance.now() - v.since
        v.since = 0
        flushLeave()
      } else if (v.sent && v.path) {
        // Tilbake til fanen: ny måling for samme side.
        visible.current = { ...v, since: performance.now(), total: 0, sent: false }
      } else {
        v.since = performance.now()
      }
    }
    const onPageHide = () => flushLeave()
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', onPageHide)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onPageHide)
    }
  }, [])

  // Klikk: e-post, telefon, nedlastinger, utgående lenker og knapper.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.('a, button, [data-track]')
      if (!el || el.closest('[data-no-track]')) return
      const info = pageInfo()
      const common = { ...base.current, p: window.location.pathname, k: info.k }
      const href = el instanceof HTMLAnchorElement ? el.href : ''
      if (href.startsWith('mailto:')) return send({ ...common, t: 'email', b: href.slice(7).split('?')[0] })
      if (href.startsWith('tel:')) return send({ ...common, t: 'phone', b: href.slice(4) })
      if (href && DOWNLOAD.test(href)) return send({ ...common, t: 'download', h: href, b: el.textContent?.trim().slice(0, 120) })
      if (href && /^https?:/.test(href) && new URL(href).host !== window.location.host) {
        // Lenker til installasjonens egne nettsteder telles som vanlig navigasjon der.
        const host = new URL(href).hostname
        if (!OWN_HOSTS.has(host) && !/hosait\.com$/.test(host)) return send({ ...common, t: 'outbound', h: href })
      }
      const tracked = (el as HTMLElement).dataset?.track
      // Knapper: lenker med knappestil (f.eks. «Kontakt oss») og alt merket data-track.
      if (tracked || (el instanceof HTMLAnchorElement && el.classList.contains('btn'))) {
        const label = tracked || el.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80)
        if (label) send({ ...common, t: 'cta', b: label })
      }
    }
    const onCustom = (e: Event) => {
      const d = (e as CustomEvent<Payload>).detail
      if (d?.t) send({ ...base.current, p: window.location.pathname, ...d })
    }
    document.addEventListener('click', onClick, { capture: true })
    window.addEventListener('site:track', onCustom)
    return () => {
      document.removeEventListener('click', onClick, { capture: true })
      window.removeEventListener('site:track', onCustom)
    }
  }, [])

  return null
}
