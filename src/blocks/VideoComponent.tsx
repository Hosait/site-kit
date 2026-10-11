'use client'

import { useState } from 'react'

import { Img } from '@/components/Img'
import type { Strings } from '@/lib/i18n'
import type { Media, VideoBlock } from '@/payload-types'

/** youtube.com/watch?v=…, youtu.be/…, vimeo.com/… → innebygd adresse uten sporing der det går. */
function embedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&dnt=1`
  return null
}

/** Video lastes først ved klikk: ingen tredjepartskall (eller cookies) før brukeren ber om det. */
export function VideoComponent({ block, strings }: { block: VideoBlock; strings: Strings }) {
  const [playing, setPlaying] = useState(false)
  const file = block.file as Media | null
  const poster = block.poster as Media | null
  const src = block.url ? embedUrl(block.url) : null

  return (
    <section className="py-10 md:py-16">
      <div className="wrap">
        {block.heading && <h2 className="t-h3 mb-6">{block.heading}</h2>}
        <div className="relative aspect-video overflow-hidden rounded-sm bg-night">
          {file?.url ? (
            <video controls preload="none" poster={poster?.sizes?.lg?.url ?? poster?.url ?? undefined} className="size-full">
              <source src={file.url} type={file.mimeType ?? 'video/mp4'} />
            </video>
          ) : playing && src ? (
            <iframe
              src={src}
              title={block.heading ?? 'Video'}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 size-full"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group absolute inset-0 flex size-full items-center justify-center"
              aria-label={`${strings.playVideo}${block.heading ? `: ${block.heading}` : ''}`}
            >
              {poster && <Img media={poster} cover sizes="(min-width: 72rem) 72rem, 100vw" className="absolute inset-0 opacity-80" />}
              <span className="relative flex size-20 items-center justify-center rounded-full bg-blue text-white shadow-lg transition-transform group-hover:scale-110">
                <svg aria-hidden viewBox="0 0 24 24" className="ml-1 size-8" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="t-small absolute bottom-3 left-3 right-3 text-white/80">{strings.videoConsent}</span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
