import Link from 'next/link'

import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/sites'

/** Brødsmulesti over innholdet på undersider (forside › forelder › …). Siste ledd er siden selv og vises ikke. */
export function Breadcrumbs({ crumbs, locale, home }: { crumbs: { title: string; href: string }[]; locale: Locale; home: string }) {
  const s = t(locale)
  return (
    <nav aria-label={s.breadcrumbs} className="wrap-wide pt-5">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-night/70">
        <li>
          <Link href={home} className="text-night/70 no-underline hover:text-blue">
            {s.home}
          </Link>
        </li>
        {crumbs.map((c) => (
          <li key={c.href} className="flex items-center gap-2">
            <span aria-hidden>›</span>
            <Link href={c.href} className="text-night/70 no-underline hover:text-blue">
              {c.title}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}
