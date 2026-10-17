/**
 * What a visitor may send to POST /api/form-submissions (and GraphQL): how large, and how many.
 * The body size is checked in src/proxy.ts before Payload reads it; the rest in the
 * form-submissions hook (src/collections/formSubmissionHooks.ts).
 */
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/sites'

export const MAX_BODY_BYTES = 64 * 1024
export const MAX_FIELDS = 50
export const MAX_FIELD_NAME = 100
export const MAX_VALUE = 10_000
/** site, locale and pagePath, which the form block sends along. */
export const MAX_META = 512
/** Per address, across forms; generous, since an office or an event shares one address. */
export const PER_IP = { windowMs: 10 * 60_000, max: 10 }
export const PER_FORM_PER_DAY = 500

const TEXT: Record<Locale, Record<'tooLarge' | 'tooMany' | 'formFull', string>> = {
  no: {
    tooLarge: 'Skjemaet er for stort til å sendes. Kort ned teksten og prøv igjen.',
    tooMany: 'For mange innsendinger fra deg på kort tid. Vent noen minutter og prøv igjen.',
    formFull: 'Skjemaet tar ikke imot flere innsendinger i dag. Prøv igjen i morgen, eller ta kontakt på en annen måte.',
  },
  en: {
    tooLarge: 'The form is too large to send. Shorten the text and try again.',
    tooMany: 'Too many submissions from you in a short time. Wait a few minutes and try again.',
    formFull: 'This form takes no more submissions today. Try again tomorrow, or get in touch another way.',
  },
}

export function limitText(kind: keyof (typeof TEXT)['no'], locale: unknown): string {
  return TEXT[isLocale(locale) ? locale : DEFAULT_LOCALE][kind]
}

const long = (v: unknown, max: number) => v != null && String(v).length > max

/** True when a submission has more fields, or longer names, values or page data, than allowed. */
export function tooLarge(data: { submissionData?: unknown; site?: unknown; locale?: unknown; pagePath?: unknown }): boolean {
  const rows = data.submissionData
  if (rows != null && !Array.isArray(rows)) return true
  if ((rows ?? []).length > MAX_FIELDS) return true
  for (const r of (rows ?? []) as { field?: unknown; value?: unknown }[]) {
    if (long(r?.field, MAX_FIELD_NAME) || long(r?.value, MAX_VALUE)) return true
  }
  return long(data.site, MAX_META) || long(data.locale, MAX_META) || long(data.pagePath, MAX_META)
}

const hits = new Map<string, { at: number; n: number }>()

/** The address's PER_IP.max submissions per window are used up (one fixed window per address). */
export function ipLimited(ip: string, now: number): boolean {
  const h = hits.get(ip)
  if (!h || now - h.at > PER_IP.windowMs) {
    if (hits.size > 5000) hits.clear()
    hits.set(ip, { at: now, n: 1 })
    return false
  }
  h.n++
  return h.n > PER_IP.max
}
