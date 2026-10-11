import type { Media } from '@/payload-types'

type Props = {
  media: Media | number | null | undefined
  /** `sizes`-attributtet: hvor bredt bildet vises. */
  sizes?: string
  className?: string
  /** Øverste bilde på siden: last med en gang (bedre LCP). */
  priority?: boolean
  /** Dekk rammen (object-fit: cover) og bruk fokuspunktet. */
  cover?: boolean
  alt?: string
}

const ORDER = ['thumb', 'sm', 'md', 'lg', 'xl'] as const

/**
 * Responsivt bilde fra Payload. Størrelsene er laget som WebP ved opplasting,
 * så vi bygger bare srcset – ingen skalering på serveren når siden vises.
 */
export function Img({ media, sizes = '100vw', className, priority, cover, alt }: Props) {
  if (!media || typeof media !== 'object' || !media.url) return null

  if (media.mimeType?.startsWith('video/')) {
    return (
      <video
        className={className}
        src={media.url}
        autoPlay
        muted
        loop
        playsInline
        aria-label={alt ?? media.alt ?? undefined}
        style={cover ? { objectFit: 'cover', width: '100%', height: '100%' } : undefined}
      />
    )
  }

  const srcSet = ORDER.map((name) => media.sizes?.[name])
    .filter((s): s is NonNullable<typeof s> => Boolean(s?.url && s.width))
    .map((s) => `${s.url} ${s.width}w`)
  if (media.mimeType === 'image/svg+xml' || srcSet.length === 0) srcSet.length = 0

  const fallback = media.sizes?.md?.url || media.sizes?.lg?.url || media.url
  const focal =
    cover && media.focalX != null && media.focalY != null ? `${media.focalX}% ${media.focalY}%` : undefined

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={fallback}
      srcSet={srcSet.length ? srcSet.join(', ') : undefined}
      sizes={srcSet.length ? sizes : undefined}
      width={media.width ?? undefined}
      height={media.height ?? undefined}
      alt={alt ?? media.alt ?? ''}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={className}
      style={cover ? { objectFit: 'cover', objectPosition: focal, width: '100%', height: '100%' } : undefined}
    />
  )
}
