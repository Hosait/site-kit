'use client'

import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useEffect, useState, useSyncExternalStore } from 'react'

import { keyTarget, slideInterval, wrapIndex } from './interaction'

export type CarouselSlide = { id: string; node: React.ReactNode }
export type CarouselStrings = { label: string; previous: string; next: string; pause: string; play: string; slide: string; of: string }

const REDUCED = '(prefers-reduced-motion: reduce)'
const subscribeReduced = (onChange: () => void) => {
  const m = window.matchMedia(REDUCED)
  m.addEventListener('change', onChange)
  return () => m.removeEventListener('change', onChange)
}

const button =
  'inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-current bg-transparent hover:bg-current/10'

/**
 * A carousel after the WAI-ARIA pattern: previous and next buttons, arrow/Home/End keys, a
 * pause button when it changes by itself, and a polite live region while it is not moving.
 * It never starts on its own unless the editor asked for it, and never when the visitor prefers
 * reduced motion. It also holds still while the pointer or the keyboard focus is inside it.
 */
export function Carousel({ slides, autoplay, interval, strings }: { slides: CarouselSlide[]; autoplay: boolean; interval?: number | null; strings: CarouselStrings }) {
  const count = slides.length
  const [index, setIndex] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const [hold, setHold] = useState(false)
  // The server snapshot says "reduced", so nothing moves before the browser has answered.
  const reduced = useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => true)
  const movesByItself = autoplay && !reduced && count > 1
  const running = movesByItself && !userPaused && !hold

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setIndex((i) => wrapIndex(i + 1, count)), slideInterval(interval) * 1000)
    return () => clearInterval(id)
  }, [running, interval, count])

  const go = (to: number) => setIndex(wrapIndex(to, count))

  return (
    <section
      aria-roledescription="carousel"
      aria-label={strings.label}
      onKeyDown={(e) => {
        const next = keyTarget(e.key, index, count)
        if (next === null) return
        e.preventDefault()
        setIndex(next)
      }}
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHold(false)
      }}
    >
      <div aria-live={running ? 'off' : 'polite'}>
        {slides.map((slide, i) => (
          <div key={slide.id} role="group" aria-roledescription="slide" aria-label={`${strings.slide} ${i + 1} ${strings.of} ${count}`} hidden={i !== index}>
            {slide.node}
          </div>
        ))}
      </div>
      {count > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button type="button" className={button} aria-label={strings.previous} onClick={() => go(index - 1)}>
            <ChevronLeft aria-hidden="true" className="size-6" />
          </button>
          {movesByItself && (
            <button type="button" className={button} aria-label={userPaused ? strings.play : strings.pause} onClick={() => setUserPaused((p) => !p)}>
              {userPaused ? <Play aria-hidden="true" className="size-5" /> : <Pause aria-hidden="true" className="size-5" />}
            </button>
          )}
          <span aria-hidden="true" className="min-w-14 text-center tabular-nums">
            {index + 1} / {count}
          </span>
          <button type="button" className={button} aria-label={strings.next} onClick={() => go(index + 1)}>
            <ChevronRight aria-hidden="true" className="size-6" />
          </button>
        </div>
      )}
    </section>
  )
}
