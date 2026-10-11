import Link from 'next/link'
import type { ReactNode } from 'react'

import { isExternal, linkLabel, resolveLink, type LinkValue } from '@/lib/links'
import type { Locale, SiteKey } from '@/lib/sites'
import { cn } from '@/utilities/ui'

type Props = {
  link: LinkValue | null | undefined
  site: SiteKey
  locale: Locale
  className?: string
  children?: ReactNode
  /** Overstyr utseende fra CMS-et. */
  appearance?: LinkValue['appearance'] | 'plain'
}

const APPEARANCE: Record<string, string> = {
  primary: 'btn btn-primary',
  secondary: 'btn',
  text: 'link-arrow',
  plain: '',
}

export function CMSLink({ link, site, locale, className, children, appearance }: Props) {
  const href = resolveLink(link, site, locale)
  if (!href) return null
  const look = APPEARANCE[appearance ?? link?.appearance ?? 'plain'] ?? ''
  const content = children ?? linkLabel(link)
  const newTab = link?.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  if (isExternal(href) || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return (
      <a href={href} className={cn(look, className)} {...newTab}>
        {content}
      </a>
    )
  }
  return (
    <Link href={href} className={cn(look, className)} {...newTab}>
      {content}
    </Link>
  )
}

export function LinkRow({
  links,
  site,
  locale,
  className,
}: {
  links?: { link?: LinkValue | null; id?: string | null }[] | null
  site: SiteKey
  locale: Locale
  className?: string
}) {
  if (!links?.length) return null
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {links.map((l, i) => (
        <CMSLink key={l.id ?? i} link={l.link} site={site} locale={locale} />
      ))}
    </div>
  )
}
