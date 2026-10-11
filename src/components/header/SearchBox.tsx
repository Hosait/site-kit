'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { Highlight } from '@/components/search/Highlight'
import { SEARCH_SEGMENT, type Strings } from '@/lib/i18n'
import { SITES, type Locale, type SiteKey } from '@/lib/sites'

type Suggestion = { kind: 'page' | 'article' | 'document' | 'person'; site: SiteKey; title: string; snippet: string; href: string | null }

const MIN_CHARS = 2

/**
 * Søk i headeren: knappen åpner et felt under menyen med forslag mens man skriver
 * (fra /next/search). Enter går til søkesiden. Uten JavaScript er knappen en lenke dit.
 */
export function SearchBox({ site, locale, strings }: { site: SiteKey; locale: Locale; strings: Strings }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [items, setItems] = useState<Suggestion[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const buttonRef = useRef<HTMLAnchorElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const action = `/${locale}/${SEARCH_SEGMENT[locale]}`

  // Lukk ved navigasjon (juster under rendring, som i HeaderClient).
  const [lastPathname, setLastPathname] = useState(pathname)
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [open])

  // Forslag: venter 200 ms etter siste tastetrykk og avbryter forrige forespørsel.
  const term = q.trim()
  useEffect(() => {
    if (term.length < MIN_CHARS) return
    const ctrl = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: term, locale, current: site, limit: '6' })
        const res = await fetch(`/next/search?${params}`, { signal: ctrl.signal })
        if (!res.ok) return
        const body = (await res.json()) as { total: number; hits: Suggestion[] }
        setItems(body.hits)
        setTotal(body.total)
      } catch {
        // Avbrutt eller nettverksfeil: behold forrige forslag.
      }
    }, 200)
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [term, locale, site])
  const showSuggestions = term.length >= MIN_CHARS

  const focusFirst = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown') return
    const first = panelRef.current?.querySelector<HTMLAnchorElement>('[data-suggestion]')
    if (first) {
      e.preventDefault()
      first.focus()
    }
  }
  const moveFocus = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const links = [...(panelRef.current?.querySelectorAll<HTMLAnchorElement>('[data-suggestion]') ?? [])]
    const i = links.indexOf(e.currentTarget)
    const next = e.key === 'ArrowDown' ? links[i + 1] : links[i - 1]
    if (next) next.focus()
    else if (e.key === 'ArrowUp') inputRef.current?.focus()
  }

  return (
    <>
      <a
        ref={buttonRef}
        href={action}
        role="button"
        aria-expanded={open}
        aria-controls="site-search"
        aria-label={strings.openSearch}
        className="inline-flex size-11 items-center justify-center rounded-full text-night hover:bg-mist hover:text-blue-text"
        onClick={(e) => {
          e.preventDefault()
          setOpen((v) => !v)
        }}
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </a>

      <div
        ref={panelRef}
        id="site-search"
        data-no-track
        hidden={!open}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-night/10 bg-white shadow-xl"
      >
        <div className="wrap-wide py-4 md:py-6">
          <form role="search" action={action} method="get" className="flex gap-2">
            <label htmlFor="site-search-q" className="sr-only">
              {strings.searchLabel}
            </label>
            <input
              ref={inputRef}
              id="site-search-q"
              name="q"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={focusFirst}
              placeholder={strings.searchPlaceholder}
              autoComplete="off"
              enterKeyHint="search"
              maxLength={100}
              className="min-h-12 min-w-0 flex-1 rounded-full border border-night/20 bg-white px-5 text-base focus:border-blue"
            />
            <button type="submit" className="btn btn-primary">
              {strings.search}
            </button>
          </form>

          {showSuggestions && total !== null && (
            <div className="mt-3">
              <p role="status" className="sr-only">
                {total} {total === 1 ? strings.oneResultFor : strings.resultsFor} «{term}»
              </p>
              {items.length > 0 ? (
                <ul className="divide-y divide-night/10">
                  {items.map((it, i) => (
                    <li key={i}>
                      <a
                        data-suggestion
                        href={it.href ?? `${action}?q=${encodeURIComponent(term)}&kind=person`}
                        onKeyDown={moveFocus}
                        className="block rounded-lg px-2 py-3 text-night no-underline hover:bg-mist focus:bg-mist"
                      >
                        <span className="block font-medium">{it.title}</span>
                        <span className="t-small block text-night/70">
                          {SITES[it.site].name} · {strings[`one_${it.kind}`]}
                        </span>
                        {it.snippet && (
                          <span className="t-small mt-0.5 line-clamp-1 text-night/80">
                            <Highlight text={it.snippet} />
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="t-small px-2 py-3 text-night/70">
                  {strings.noResults} «{term}»
                </p>
              )}
              {total > items.length && (
                <a
                  data-suggestion
                  href={`${action}?q=${encodeURIComponent(term)}`}
                  onKeyDown={moveFocus}
                  className="mt-2 inline-flex min-h-11 items-center px-2 font-medium"
                >
                  {strings.seeAllResults} ({total}) →
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
