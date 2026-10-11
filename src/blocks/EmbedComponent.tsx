'use client'

import { useState } from 'react'

import type { Locale } from '@/lib/sites'
import type { EmbedBlock } from '@/payload-types'

/** Kart og annet innebygd innhold lastes først når besøkende klikker – ingen sporing før det. */
export function EmbedComponent({ block, locale }: { block: EmbedBlock; locale: Locale }) {
  const [loaded, setLoaded] = useState(false)
  const height = Math.min(Math.max(block.height ?? 480, 240), 900)
  const isMap = block.provider === 'google-maps'
  return (
    <section className="py-10 md:py-16">
      <div className="wrap-wide">
        {block.heading && <h2 className="t-h3 mb-6">{block.heading}</h2>}
        <div className="relative overflow-hidden rounded-sm bg-mist" style={{ height }}>
          {loaded ? (
            <iframe src={block.url} title={block.title} loading="lazy" className="absolute inset-0 size-full border-0" referrerPolicy="no-referrer-when-downgrade" />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-4 p-6 text-center">
              <p className="max-w-md text-night/80">
                {isMap
                  ? locale === 'no'
                    ? 'Kartet lastes fra Google når du klikker.'
                    : 'The map loads from Google when you click.'
                  : locale === 'no'
                    ? 'Innholdet lastes fra en ekstern tjeneste når du klikker.'
                    : 'The content loads from an external service when you click.'}
              </p>
              <button type="button" className="btn btn-primary" onClick={() => setLoaded(true)}>
                {isMap ? (locale === 'no' ? 'Vis kart' : 'Show map') : locale === 'no' ? 'Vis innhold' : 'Show content'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
