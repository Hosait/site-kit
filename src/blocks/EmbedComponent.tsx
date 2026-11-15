'use client'

import { useState } from 'react'

import type { Locale } from '@/lib/sites'
import type { EmbedBlock } from '@/payload-types'
import { t } from '@/lib/i18n'

/**
 * An iframe that loads only when the visitor clicks (no request, no tracking before that).
 * Used by the embed block, the contact card's map and the newsletter's provider form.
 */
export function ConsentEmbed({
  src,
  title,
  height: wanted,
  isMap,
  locale,
}: {
  src: string
  title: string
  height?: number | null
  isMap?: boolean
  locale: Locale
}) {
  const [loaded, setLoaded] = useState(false)
  const height = Math.min(Math.max(wanted ?? 480, 240), 900)
  const s = t(locale)
  return (
    <div className="relative overflow-hidden rounded-sm bg-muted" style={{ height }}>
      {loaded ? (
        <iframe src={src} title={title} loading="lazy" className="absolute inset-0 size-full border-0" referrerPolicy="no-referrer-when-downgrade" />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="max-w-md text-ink/80">{isMap ? s.embedMapNote : s.embedNote}</p>
          <button type="button" className="btn btn-primary" onClick={() => setLoaded(true)}>
            {isMap ? s.embedShowMap : s.embedShow}
          </button>
        </div>
      )}
    </div>
  )
}

/** Kart og annet innebygd innhold lastes først når besøkende klikker – ingen sporing før det. */
export function EmbedComponent({ block, locale }: { block: EmbedBlock; locale: Locale }) {
  return (
    <section className="py-10 md:py-16">
      <div className="wrap-wide">
        {block.heading && <h2 className="t-h3 mb-6">{block.heading}</h2>}
        <ConsentEmbed src={block.url} title={block.title} height={block.height} isMap={block.provider === 'google-maps'} locale={locale} />
      </div>
    </section>
  )
}
