import Link from 'next/link'

import { ConsentSettingsButton } from '@/components/analytics/ConsentBanner'
import { CMSLink } from '@/components/CMSLink'
import { Logo } from '@/components/Logo'
import { t } from '@/lib/i18n'
import { siteHref, SITE_KEYS, SITES, type Locale, type SiteKey } from '@/lib/sites'
import type { SiteSetting } from '@/payload-types'

/** Bunntekst: kolonner fra CMS-et, fast kolonne med alle Spilka-divisjoner, juridisk tekst. */
export function Footer({ site, locale, settings }: { site: SiteKey; locale: Locale; settings: SiteSetting | null }) {
  const s = t(locale)
  const year = new Date().getFullYear()
  const copyright = settings?.copyright || `${settings?.legalName || 'AS Spilka Industri'} – © ${year}`

  return (
    <footer className="on-dark bg-night text-white">
      <div className="wrap-wide grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.2fr_repeat(4,1fr)] lg:py-20">
        <div>
          <Link href={`/${locale}`} className="text-white" aria-label={s.home}>
            <Logo site={site} tone="white" />
          </Link>
          {settings?.address?.street && (
            <address className="mt-6 text-sm not-italic text-white/75">
              {settings.address.street}
              <br />
              {settings.address.postalCode} {settings.address.city}
            </address>
          )}
          {(settings?.phone || settings?.email) && (
            <p className="mt-3 text-sm text-white/75">
              {settings?.phone && (
                <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="!text-white/75 no-underline hover:!text-white">
                  {settings.phone}
                </a>
              )}
              {settings?.phone && settings?.email && <br />}
              {settings?.email && (
                <a href={`mailto:${settings.email}`} className="!text-white/75 no-underline hover:!text-white">
                  {settings.email}
                </a>
              )}
            </p>
          )}
        </div>

        {(settings?.footerColumns ?? []).map((col, i) => (
          <nav key={col.id ?? i} aria-label={col.heading}>
            <h2 className="mb-3 text-sm font-bold">{col.heading}</h2>
            <ul className="space-y-1.5 text-sm">
              {(col.links ?? []).map((l, j) => (
                <li key={l.id ?? j}>
                  <CMSLink link={l.link} site={site} locale={locale} className="!text-white/75 no-underline hover:!text-white" />
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <nav aria-label={s.divisions}>
          <h2 className="mb-3 text-sm font-bold">{s.divisions}</h2>
          <ul className="space-y-1.5 text-sm">
            {SITE_KEYS.map((key) => (
              <li key={key}>
                <a
                  href={siteHref(key, site, `/${locale}`)}
                  aria-current={key === site ? 'true' : undefined}
                  className="!text-white/75 no-underline hover:!text-white aria-[current=true]:!text-white"
                >
                  {SITES[key].division ?? SITES[key].name}
                </a>
              </li>
            ))}
            <li>
              <a href="https://www.spilkacomposites.com/" className="!text-white/75 no-underline hover:!text-white">
                Spilka Composites
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="wrap-wide flex flex-col gap-4 py-6 text-xs text-white/60 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-2">
            <p>{copyright}</p>
            {settings?.legal && <p>{settings.legal}</p>}
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {(settings?.legalLinks ?? []).map((l, i) => (
              <li key={l.id ?? i}>
                <CMSLink link={l.link} site={site} locale={locale} className="!text-white/60 hover:!text-white" />
              </li>
            ))}
            <li>
              <ConsentSettingsButton label={s.cookieSettings} className="!text-white/60 underline hover:!text-white" />
            </li>
            {(settings?.social ?? []).map((so, i) => (
              <li key={`so-${i}`}>
                <a href={so.url} className="!text-white/60 capitalize hover:!text-white" rel="noopener noreferrer">
                  {so.network}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
