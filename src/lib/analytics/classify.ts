/**
 * Klassifisering for besøksanalysen: enhetstype, roboter og trafikkilde.
 * Ren logikk uten avhengigheter (testes i tests/unit/analytics.test.ts).
 */

export type Device = 'mobile' | 'tablet' | 'desktop'
export type Channel = 'direct' | 'search' | 'social' | 'referral' | 'campaign' | 'email'

/** Enhetstype fra User-Agent (sendes uansett med hver forespørsel; vi leser ingenting fra enheten). */
export function deviceFrom(ua: string, mobileHint?: string | null): Device {
  if (/iPad|Tablet|PlayBook|Silk|Kindle|Nexus (7|9|10)|SM-T\d/i.test(ua)) return 'tablet'
  if (/Android/i.test(ua) && !/Mobile/i.test(ua)) return 'tablet'
  if (mobileHint === '?1' || /Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) return 'mobile'
  return 'desktop'
}

const BOT =
  /bot\b|bot\/|crawl|spider|slurp|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|preview|facebookexternalhit|embedly|whatsapp|curl|wget|python-requests|axios|node-fetch|go-http|java\/|httpclient|scrapy|playwright|puppeteer|phantomjs/i

export const isBot = (ua: string) => !ua || ua.length < 20 || BOT.test(ua)

const SEARCH: [RegExp, string][] = [
  [/(^|\.)google\./, 'Google'],
  [/(^|\.)bing\.com$/, 'Bing'],
  [/(^|\.)duckduckgo\.com$/, 'DuckDuckGo'],
  [/(^|\.)yahoo\./, 'Yahoo'],
  [/(^|\.)ecosia\.org$/, 'Ecosia'],
  [/(^|\.)yandex\./, 'Yandex'],
  [/(^|\.)baidu\.com$/, 'Baidu'],
  [/(^|\.)startpage\.com$/, 'Startpage'],
  [/(^|\.)qwant\.com$/, 'Qwant'],
  [/(^|\.)brave\.com$/, 'Brave'],
  [/(^|\.)kvasir\.no$/, 'Kvasir'],
  [/(^|\.)perplexity\.ai$/, 'Perplexity'],
  [/(^|\.)chatgpt\.com$/, 'ChatGPT'],
]
const SOCIAL: [RegExp, string][] = [
  [/(^|\.)linkedin\.com$|(^|\.)lnkd\.in$/, 'LinkedIn'],
  [/(^|\.)facebook\.com$|(^|\.)fb\.(com|me)$/, 'Facebook'],
  [/(^|\.)instagram\.com$/, 'Instagram'],
  [/(^|\.)(twitter|x)\.com$|(^|\.)t\.co$/, 'X'],
  [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/, 'YouTube'],
  [/(^|\.)pinterest\./, 'Pinterest'],
  [/(^|\.)reddit\.com$/, 'Reddit'],
  [/(^|\.)tiktok\.com$/, 'TikTok'],
]
const MAIL = /(^|\.)(mail\.google\.com|outlook\.(live|office)\.com|mail\.yahoo\.com)$/

export type Source = { channel: Channel; source: string | null; medium: string | null; campaign: string | null }

/**
 * Trafikkilde for første side i et besøk. UTM-parametre vinner; ellers avgjør henvisningen.
 * Henvisninger fra egne domener (inkl. de andre Spilka-nettstedene) regnes som direkte.
 */
export function sourceFrom(referrer: string | null | undefined, landing: URLSearchParams, ownHosts: string[]): Source {
  const utmSource = clean(landing.get('utm_source'))
  const utmMedium = clean(landing.get('utm_medium'))
  const campaign = clean(landing.get('utm_campaign'))
  if (utmSource || campaign) {
    const medium = utmMedium?.toLowerCase() ?? null
    const channel: Channel = medium === 'email' || medium === 'e-post' || medium === 'newsletter' ? 'email' : 'campaign'
    return { channel, source: utmSource, medium: utmMedium, campaign }
  }
  if (landing.get('gclid') || landing.get('msclkid')) return { channel: 'campaign', source: 'Google Ads', medium: 'cpc', campaign: null }
  if (landing.get('li_fat_id')) return { channel: 'campaign', source: 'LinkedIn Ads', medium: 'cpc', campaign: null }

  const host = hostOf(referrer)
  if (!host || ownHosts.some((h) => host === h || host.endsWith(`.${h}`))) return { channel: 'direct', source: null, medium: null, campaign: null }
  for (const [re, name] of SEARCH) if (re.test(host)) return { channel: 'search', source: name, medium: null, campaign: null }
  for (const [re, name] of SOCIAL) if (re.test(host)) return { channel: 'social', source: name, medium: null, campaign: null }
  if (MAIL.test(host)) return { channel: 'email', source: host, medium: null, campaign: null }
  return { channel: 'referral', source: host, medium: null, campaign: null }
}

export function hostOf(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return null
  }
}

const clean = (v: string | null) => (v ? v.trim().slice(0, 100) || null : null)

/** Sti uten spørrestreng og avsluttende skråstrek, maks 300 tegn. */
export function cleanPath(path: string): string {
  const p = (path.split(/[?#]/)[0] || '/').replace(/\/+$/, '') || '/'
  return p.slice(0, 300)
}
