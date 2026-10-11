'use client'

import { useEffect, useId, useRef, useState } from 'react'

import type { ImageSequenceBlock } from '@/payload-types'

/** Bildesekvenser som ligger i public/sequences/<navn>/000.webp … (generert fra Craft-rammene). */
export const SEQUENCES: Record<string, { frames: number; width: number; height: number; alt: Record<'no' | 'en', string> }> = {
  'classic-black': {
    frames: 54,
    width: 720,
    height: 720,
    alt: { no: 'Vindu med Spilka Classic™-hengsler som åpnes', en: 'Window with Spilka Classic™ hinges opening' },
  },
}

const frameUrl = (name: string, i: number) => `/sequences/${name}/${String(i).padStart(3, '0')}.webp`

/**
 * Interaktiv animasjon: glideren (eller dra på bildet) går fra «Lukket» til «Åpent».
 * Rammene lastes først når seksjonen nærmer seg skjermen.
 */
export function ImageSequence({ block, locale }: { block: ImageSequenceBlock; locale: 'no' | 'en' }) {
  const seq = SEQUENCES[block.sequence ?? '']
  const [frame, setFrame] = useState(0)
  const [ready, setReady] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    if (!seq || !ref.current) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        let loaded = 0
        for (let i = 0; i < seq.frames; i++) {
          const img = new Image()
          img.onload = () => {
            if (++loaded === seq.frames) setReady(true)
          }
          img.src = frameUrl(block.sequence!, i)
        }
      },
      { rootMargin: '400px' },
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [seq, block.sequence])

  if (!seq) return null
  const max = seq.frames - 1
  const start = block.startLabel || (locale === 'no' ? 'Lukket' : 'Closed')
  const end = block.endLabel || (locale === 'no' ? 'Åpent' : 'Open')

  const onPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1 && e.pointerType === 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    setFrame(Math.round(Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1) * max))
  }

  return (
    <section className="bg-section-sky py-16 md:py-24">
      <div className="wrap grid items-center gap-10 md:grid-cols-2">
        <div>
          {block.heading && <h2 className="t-h2">{block.heading}</h2>}
          {block.intro && <p className="t-lead mt-4">{block.intro}</p>}
          <div className="mt-8">
            <label htmlFor={id} className="sr-only">
              {start} – {end}
            </label>
            <input
              id={id}
              type="range"
              min={0}
              max={max}
              value={frame}
              onChange={(e) => setFrame(Number(e.target.value))}
              aria-valuetext={frame === 0 ? start : frame === max ? end : `${Math.round((frame / max) * 100)} %`}
              className="h-11 w-full cursor-pointer accent-blue"
            />
            <div className="flex justify-between text-sm font-medium">
              <span>{start}</span>
              <span>{end}</span>
            </div>
          </div>
        </div>
        <div
          ref={ref}
          className="relative mx-auto aspect-square w-full max-w-[32rem] touch-pan-y select-none"
          onPointerMove={onPointer}
          onPointerDown={onPointer}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={frameUrl(block.sequence!, ready ? frame : 0)}
            width={seq.width}
            height={seq.height}
            alt={seq.alt[locale]}
            className="size-full object-contain"
            draggable={false}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}
