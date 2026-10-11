/**
 * Samtykke til informasjonskapsler. Deles av banneret, sporingsskriptet og serveren.
 *
 * - `<cookiePrefix>-consent`: valget (nødvendig for å huske det; ingen sporing). `v1.<statistikk 0/1>.<id>.<tid>`
 * - `<cookiePrefix>-vid`: anonym besøks-ID, settes bare med samtykke til statistikk. Gjør det mulig å se
 *   tilbakevendende besøkende og besøk over flere dager.
 *
 * Øk CONSENT_VERSION når kategoriene eller teksten endres vesentlig: alle blir spurt på nytt.
 */
import { SITE_CONFIG } from '@/lib/sites'

export const CONSENT_VERSION = 1
export const CONSENT_COOKIE = `${SITE_CONFIG.cookiePrefix}-consent`
export const VISITOR_COOKIE = `${SITE_CONFIG.cookiePrefix}-vid`
/** Samtykket huskes i 12 måneder; deretter spørres det på nytt. */
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 365
export const VISITOR_MAX_AGE = 60 * 60 * 24 * 395

export type Consent = { version: number; statistics: boolean; id: string; at: number }

export function parseConsent(raw: string | null | undefined): Consent | null {
  const m = /^v(\d+)\.([01])\.([A-Za-z0-9_-]{8,40})\.(\d{10,13})$/.exec(raw ?? '')
  if (!m) return null
  const consent = { version: Number(m[1]), statistics: m[2] === '1', id: m[3], at: Number(m[4]) }
  return consent.version === CONSENT_VERSION ? consent : null
}

export const serializeConsent = (c: Consent) => `v${c.version}.${c.statistics ? 1 : 0}.${c.id}.${c.at}`

export const isVisitorId = (v: unknown): v is string => typeof v === 'string' && /^[A-Za-z0-9_-]{16,40}$/.test(v)

/** Leser en informasjonskapsel fra `document.cookie` eller en Cookie-header. */
export function readCookie(cookieHeader: string | null | undefined, name: string): string | null {
  for (const part of (cookieHeader ?? '').split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) {
      try {
        return decodeURIComponent(v.join('='))
      } catch {
        return null
      }
    }
  }
  return null
}

/** Tilfeldig ID (nettleser og Node 19+). */
export function randomId(bytes = 16): string {
  const a = new Uint8Array(bytes)
  crypto.getRandomValues(a)
  return btoa(String.fromCharCode(...a)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
