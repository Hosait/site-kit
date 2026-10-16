import { NextResponse, type NextRequest } from 'next/server'

import { DEFAULT_SITE, FEATURES, isLocale, isSiteKey, type Locale, LOCALES, SITE_CONFIG, siteFromHost, type SiteKey } from '@/lib/sites'
import { negotiateLocale, searchRewrite } from '@/lib/locales'
import { claimNeededPage, firstUserAllowed } from '@/lib/admin-claim'

/**
 * Host → nettsted. Offentlige stier skrives internt om til /{site}/{locale}/...
 * slik at hvert nettsted kan genereres statisk for seg.
 *
 * Ukjent vert (staging på *.hosait.com, localhost): nettstedet velges med `?site=sbs`
 * og huskes i en cookie. Standard er DEFAULT_SITE fra site/config.ts.
 *
 * Omdirigeringer fra CMS-et utføres her, før siden rendres (raskere, og unngår at Next
 * sender dobbel Location-header når en ISR-side omdirigerer).
 */
const SITE_COOKIE = `${SITE_CONFIG.cookiePrefix}-site`

/**
 * Dokumenter et gammelt nettsted lenket til (som crawlerens liste i site-builder). De går gjennom
 * proxyen bare for å finne en omdirigering; uten treff serveres de som statiske filer (eller 404).
 */
const DOCUMENT = /\.(pdf|docx?|xlsx?|pptx?|zip|csv)$/i

type Redirect = { from: string; to: string; site: SiteKey | null; permanent: boolean }
let redirectCache: { at: number; list: Redirect[] } | null = null
const REDIRECT_TTL_MS = 30_000

async function loadRedirects(): Promise<Redirect[]> {
  if (redirectCache && Date.now() - redirectCache.at < REDIRECT_TTL_MS) return redirectCache.list
  try {
    // Internt kall til samme prosess; dataene bak er cachet med tagger (src/lib/data.ts).
    const port = process.env.PORT || '3000'
    const res = await fetch(`http://127.0.0.1:${port}/next/redirects`, { cache: 'no-store' })
    if (res.ok) redirectCache = { at: Date.now(), list: (await res.json()) as Redirect[] }
  } catch {
    // Ved feil brukes forrige liste; siden har også egen reserve-oppslag.
  }
  return redirectCache?.list ?? []
}

let homeCache: { at: number; map: Partial<Record<SiteKey, Locale[]>> } | null = null

/** Språkene der nettstedet har en publisert forside. Ved feil: alle språk, som før. */
async function loadHomeLocales(site: SiteKey): Promise<readonly Locale[]> {
  if (!homeCache || Date.now() - homeCache.at >= REDIRECT_TTL_MS) {
    let map = homeCache?.map ?? {}
    try {
      const port = process.env.PORT || '3000'
      const res = await fetch(`http://127.0.0.1:${port}/next/home-locales`, { cache: 'no-store' })
      if (res.ok) map = (await res.json()) as Partial<Record<SiteKey, Locale[]>>
    } catch {
      // Forrige svar brukes.
    }
    // Også et mislykket oppslag huskes i REDIRECT_TTL_MS, så det ikke gjøres på nytt ved hvert besøk.
    homeCache = { at: Date.now(), map }
  }
  return homeCache?.map[site] ?? LOCALES
}

/** Første verdi i en header som kan inneholde en kommaliste (flere proxyer). */
const firstHeader = (req: NextRequest, name: string) => req.headers.get(name)?.split(',')[0]?.trim() || null

/**
 * Offentlig adresse (bak Hosaits proxy er req.url intern). Hosait sender X-Forwarded-Proto og
 * X-Forwarded-Host; uten dem (lokalt) brukes forespørselens egen protokoll og Host.
 */
function publicUrl(req: NextRequest, pathAndQuery: string): URL {
  const host = firstHeader(req, 'x-forwarded-host') || req.headers.get('host') || req.nextUrl.host
  const proto = firstHeader(req, 'x-forwarded-proto') || req.nextUrl.protocol.replace(/:$/, '')
  return new URL(pathAndQuery, `${proto}://${host}`)
}

export async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl

  // Den første brukeren opprettes bare via lenken fra Hosait (src/lib/admin-claim.ts). Uten
  // den svarer API-et 403 uten melding i skjemaet, så siden forklarer hvor lenken er.
  if (pathname === '/admin/create-first-user') {
    if (firstUserAllowed({ secret: process.env.ADMIN_CLAIM_SECRET, cookieHeader: req.headers.get('cookie'), nowMs: Date.now() })) {
      return NextResponse.next()
    }
    return new NextResponse(claimNeededPage(SITE_CONFIG.admin.language), {
      status: 403,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  }

  let site: SiteKey | null = siteFromHost(req.headers.get('x-forwarded-host') || req.headers.get('host'))
  let setCookie: SiteKey | null = null
  if (!site) {
    const fromQuery = searchParams.get('site')
    const fromCookie = req.cookies.get(SITE_COOKIE)?.value
    if (isSiteKey(fromQuery)) {
      site = fromQuery
      if (fromCookie !== fromQuery) setCookie = fromQuery
    } else if (isSiteKey(fromCookie)) {
      site = fromCookie
    } else {
      site = DEFAULT_SITE
    }
  }

  const withCookie = (res: NextResponse) => {
    if (setCookie) res.cookies.set(SITE_COOKIE, setCookie, { path: '/', sameSite: 'lax' })
    return res
  }

  if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
    return withCookie(NextResponse.rewrite(new URL(`/${site}${pathname}`, req.url)))
  }

  if (pathname === '/') {
    // Språk uten publisert forside gir standardspråket (ellers 404 på f.eks. /en).
    const locale = negotiateLocale(req.headers.get('accept-language'), await loadHomeLocales(site))
    return withCookie(NextResponse.redirect(publicUrl(req, `/${locale}${req.nextUrl.search}`), 302))
  }

  let decoded = pathname
  try {
    decoded = decodeURIComponent(pathname)
  } catch {}
  const key = decoded.replace(/\/$/, '').normalize('NFC')
  const hit = (await loadRedirects()).find((r) => r.from === key && (!r.site || r.site === site))
  if (hit) {
    const target = /^https?:\/\//.test(hit.to) ? new URL(hit.to) : publicUrl(req, hit.to)
    return withCookie(NextResponse.redirect(target, hit.permanent ? 308 : 307))
  }
  if (DOCUMENT.test(pathname)) return NextResponse.next()

  const search = FEATURES.search ? searchRewrite(pathname) : null
  if (search) {
    const url = new URL(`/${site}/${search.locale}/site-search`, req.url)
    url.search = req.nextUrl.search
    return withCookie(NextResponse.rewrite(url))
  }

  const [first] = pathname.split('/').filter(Boolean)
  // Stier uten språkprefiks går også til nettstedet; siden gir 404 hvis ingenting finnes.
  const prefix = isLocale(first) ? '' : '/_'
  const url = new URL(`/${site}${prefix}${pathname}`, req.url)
  url.search = req.nextUrl.search
  return withCookie(NextResponse.rewrite(url))
}

export const config = {
  // Alt unntatt admin, API, Next-interne filer, forhåndsvisningsruter og statiske filer; av
  // admin bare siden for den første brukeren.
  matcher: ['/((?!admin|api|_next|next/|brand/|fonts/|media/|sequences/|favicon|.*\\.(?:svg|png|jpg|jpeg|webp|avif|ico|woff2?|txt|js|css|map)$).*)', '/robots.txt', '/admin/create-first-user'],
}
