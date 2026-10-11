import { t } from '@/lib/i18n'
import { linkLabel, resolveLink } from '@/lib/links'
import type { Locale, SiteKey } from '@/lib/sites'
import type { SiteSetting } from '@/payload-types'
import { HeaderClient, type NavItem } from './HeaderClient'

type Props = {
  site: SiteKey
  locale: Locale
  settings: SiteSetting | null
  /** Samme side på det andre språket, hvis den finnes. */
  alternateHref: string | null
}

/** Gjør menyen om til ferdige lenker på serveren; klientdelen håndterer bare åpne/lukke. */
export function Header({ site, locale, settings, alternateHref }: Props) {
  const nav: NavItem[] = (settings?.nav ?? [])
    .map((item) => ({
      label: linkLabel(item.link),
      href: resolveLink(item.link, site, locale),
      children: (item.children ?? [])
        .map((c) => ({ label: linkLabel(c.link), href: resolveLink(c.link, site, locale) }))
        .filter((c): c is { label: string; href: string } => Boolean(c.href && c.label)),
    }))
    .filter((i) => i.label && (i.href || i.children.length))

  const contactHref = resolveLink(settings?.contactLink, site, locale)
  const contactLabel = linkLabel(settings?.contactLink) || t(locale).contact

  return (
    <HeaderClient
      site={site}
      locale={locale}
      nav={nav}
      contact={contactHref ? { href: contactHref, label: contactLabel } : null}
      alternateHref={alternateHref}
      strings={t(locale)}
    />
  )
}
