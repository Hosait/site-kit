/**
 * Until the first user exists, Payload's /admin lets anyone create one, and on Hosait the site
 * is public on its hosait.com address from the first deploy. With ADMIN_CLAIM_SECRET set
 * (Hosait generates it, see hosait.json), only a browser that opened the claim link
 * /next/admin-claim?code=<secret> may create that first user: the link sets a signed cookie
 * for an hour, and the Users collection checks it. Unset (local development), anyone may.
 */
import { createHmac, timingSafeEqual } from 'node:crypto'

export const CLAIM_COOKIE = 'admin-claim'
export const CLAIM_TTL_S = 3600

function sameText(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

const signature = (secret: string, exp: number) => createHmac('sha256', secret).update(`admin-claim:${exp}`).digest('hex')

export function codeMatches(secret: string, code: string | null | undefined): boolean {
  return !!secret && !!code && sameText(secret, code)
}

/** `<expiry ms>.<hmac>`: valid for CLAIM_TTL_S from nowMs. */
export function claimCookieValue(secret: string, nowMs: number): string {
  const exp = nowMs + CLAIM_TTL_S * 1000
  return `${exp}.${signature(secret, exp)}`
}

export function claimValid(secret: string, value: string | null | undefined, nowMs: number): boolean {
  const m = /^(\d{1,16})\.([0-9a-f]{64})$/.exec(value ?? '')
  if (!m) return false
  const exp = Number(m[1])
  return exp > nowMs && sameText(m[2], signature(secret, exp))
}

function cookieFrom(header: string | null, name: string): string | null {
  for (const part of (header ?? '').split(';')) {
    const i = part.indexOf('=')
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim()
  }
  return null
}

export function firstUserAllowed(o: { secret: string | undefined; cookieHeader: string | null; nowMs: number }): boolean {
  if (!o.secret) return true
  return claimValid(o.secret, cookieFrom(o.cookieHeader, CLAIM_COOKIE), o.nowMs)
}

const NEEDED = {
  nb: {
    title: 'Opprett administratoren fra Hosait',
    body: 'Den første administratoren kan bare opprettes fra Hosait. Åpne prosjektet i Hosait og velg «Åpne» ved «Opprett admin-brukeren din» under «Neste steg». Lenken tar deg hit igjen, og da kan du opprette brukeren.',
    fallback: 'Kommer du hit igjen etter lenken? Finn variabelen ADMIN_CLAIM_SECRET under Variabler i Hosait, og åpne /next/admin-claim?code= etterfulgt av verdien.',
  },
  en: {
    title: 'Create the admin user from Hosait',
    body: 'The first admin user can only be created from Hosait. Open the project in Hosait and choose "Open" next to "Create your admin user" under "Next steps". The link brings you back here, where you can create the user.',
    fallback: 'Back on this page after the link? Find the variable ADMIN_CLAIM_SECRET under Variables in Hosait, and open /next/admin-claim?code= followed by its value.',
  },
}

/** The page /admin/create-first-user shows without the claim cookie (src/proxy.ts). */
export function claimNeededPage(adminLanguage: string): string {
  const lang = adminLanguage === 'nb' ? 'nb' : 'en'
  const t = NEEDED[lang]
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${t.title}</title></head>` +
    `<body style="font-family:system-ui,sans-serif;max-width:36rem;margin:4rem auto;padding:0 1rem;line-height:1.5">` +
    `<h1 style="font-size:1.5rem">${t.title}</h1><p>${t.body}</p><p style="font-size:.9rem;opacity:.75">${t.fallback}</p></body></html>`
}
