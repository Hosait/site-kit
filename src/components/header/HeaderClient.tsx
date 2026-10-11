'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { Logo } from '@/components/Logo'
import { SearchBox } from './SearchBox'
import type { Strings } from '@/lib/i18n'
import { HREFLANG, type Locale, LOCALE_CONFIG, type SiteKey } from '@/lib/sites'
import { cn } from '@/utilities/ui'
import { otherLocale } from '@/lib/locales'

export type NavItem = { label: string; href: string | null; children: { label: string; href: string }[] }

type Props = {
  site: SiteKey
  locale: Locale
  nav: NavItem[]
  contact: { href: string; label: string } | null
  alternateHref: string | null
  strings: Strings
}

const isActive = (pathname: string, href: string | null) =>
  Boolean(href && !/^https?:/.test(href) && (pathname === href || pathname.startsWith(href + '/')))

export function HeaderClient({ site, locale, nav, contact, alternateHref, strings }: Props) {
  const other = otherLocale(locale)
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const navRef = useRef<HTMLElement>(null)

  // Lukk menyer ved navigasjon, Escape og klikk utenfor.
  // Navigasjon: juster tilstand under rendring i stedet for i en effekt (unngår ekstra rendring).
  const [lastPathname, setLastPathname] = useState(pathname)
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setMobileOpen(false)
    setOpenIndex(null)
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        setOpenIndex(null)
      }
    }
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenIndex(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [])
  useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? 'hidden' : ''
  }, [mobileOpen])

  const home = `/${locale}`

  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="wrap-wide flex h-16 items-center justify-between gap-4 md:h-20 xl:gap-6">
        <Link href={home} className="shrink-0" aria-label={strings.home}>
          <Logo />
        </Link>

        <nav ref={navRef} aria-label={strings.mainNav} className="hidden lg:block">
          <ul className="flex items-center whitespace-nowrap text-sm xl:text-[0.9375rem]">
            {nav.map((item, i) => (
              <li key={i} className="relative flex items-center">
                {i > 0 && <span aria-hidden className="mx-1 h-5 w-px bg-ink/30" />}
                {item.children.length ? (
                  <>
                    <button
                      type="button"
                      className={cn(
                        'flex items-center gap-1 rounded-full px-3 py-2 hover:text-brand-text xl:px-4',
                        (openIndex === i || item.children.some((c) => isActive(pathname, c.href))) && 'text-brand-text',
                      )}
                      aria-expanded={openIndex === i}
                      aria-controls={`submenu-${i}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenIndex(openIndex === i ? null : i)
                      }}
                    >
                      {item.label}
                      <svg aria-hidden viewBox="0 0 12 12" className={cn('size-3 transition-transform', openIndex === i && 'rotate-180')}>
                        <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </button>
                    <div
                      id={`submenu-${i}`}
                      hidden={openIndex !== i}
                      className="absolute left-0 top-full mt-3 min-w-64 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-ink/5"
                    >
                      <ul>
                        {item.href && (
                          <li>
                            <Link href={item.href} className="block rounded-lg px-3 py-2 font-medium text-ink no-underline hover:bg-muted">
                              {item.label}
                            </Link>
                          </li>
                        )}
                        {item.children.map((c, j) => (
                          <li key={j}>
                            <Link
                              href={c.href}
                              aria-current={isActive(pathname, c.href) ? 'page' : undefined}
                              className="block rounded-lg px-3 py-2 text-ink no-underline hover:bg-muted aria-[current=page]:text-brand-text"
                            >
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href!}
                    aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                    className="rounded-full px-3 py-2 text-ink no-underline xl:px-4 hover:text-brand-text aria-[current=page]:text-brand-text"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 lg:gap-3">
          <SearchBox site={site} locale={locale} strings={strings} />
          {alternateHref && other && (
            <Link
              href={alternateHref}
              hrefLang={HREFLANG[other]}
              className="hidden text-sm font-medium text-ink no-underline hover:text-brand-text lg:inline"
            >
              {LOCALE_CONFIG[other].short}
            </Link>
          )}
          {contact && (
            <Link href={contact.href} className="btn btn-primary hidden !min-h-10 lg:inline-flex">
              {contact.label}
            </Link>
          )}
          <button
            type="button"
            className="btn !min-h-11 gap-3 lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen(true)}
          >
            {strings.menu}
            <svg aria-hidden viewBox="0 0 24 16" className="h-4 w-6 text-brand">
              <path d="M0 1h24M0 8h24M0 15h24" stroke="currentColor" strokeWidth="1.75" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobilmeny: hele skjermen, store trykkflater. */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={strings.mainNav}
        hidden={!mobileOpen}
        className="fixed inset-0 z-50 overflow-y-auto bg-white lg:hidden"
      >
        <div className="wrap-wide flex h-16 items-center justify-between">
          <Link href={home} aria-label={strings.home}>
            <Logo />
          </Link>
          <button type="button" className="btn !min-h-11" onClick={() => setMobileOpen(false)}>
            {strings.close} <span aria-hidden>×</span>
          </button>
        </div>
        <nav className="wrap-wide pb-12 pt-4">
          <ul className="divide-y divide-ink/10">
            {nav.map((item, i) => (
              <li key={i} className="py-1">
                {item.children.length ? (
                  <details className="group">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between text-2xl font-bold tracking-tight">
                      {item.label}
                      <span aria-hidden className="text-brand transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <ul className="pb-3 pl-1">
                      {item.href && (
                        <li>
                          <Link href={item.href} className="flex min-h-12 items-center text-lg text-ink no-underline">
                            {item.label}
                          </Link>
                        </li>
                      )}
                      {item.children.map((c, j) => (
                        <li key={j}>
                          <Link href={c.href} className="flex min-h-12 items-center text-lg text-ink no-underline">
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <Link href={item.href!} className="flex min-h-14 items-center text-2xl font-bold tracking-tight text-ink no-underline">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {contact && (
              <Link href={contact.href} className="btn btn-primary">
                {contact.label}
              </Link>
            )}
            {alternateHref && other && (
              <Link href={alternateHref} hrefLang={HREFLANG[other]} className="btn">
                {strings.switchLanguage}
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
