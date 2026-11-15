import { CMSLink } from '@/components/CMSLink'
import { Img } from '@/components/Img'
import { t } from '@/lib/i18n'
import type { CarouselBlock, Media } from '@/payload-types'

import { Carousel } from './CarouselClient'
import type { BlockProps } from './components'
import { Section } from './Section'

export function CarouselComponent({ block, site, locale }: BlockProps<CarouselBlock>) {
  const slides = (block.slides ?? []).filter((s) => s.image && typeof s.image === 'object')
  if (!slides.length) return null
  const s = t(locale)
  const nodes = slides.map((slide, i) => ({
    id: slide.id ?? String(i),
    node: (
      <figure className="m-0">
        <div className="aspect-[16/9] overflow-hidden rounded-t-2xl bg-muted">
          <Img media={slide.image as Media} cover sizes="(min-width: 64rem) 64rem, 100vw" priority={i === 0} />
        </div>
        {(slide.heading || slide.text || slide.link) && (
          <figcaption className="rounded-b-2xl bg-white p-5 text-ink md:p-6">
            {slide.heading && <h3 className="t-h4">{slide.heading}</h3>}
            {slide.text && <p className="mt-2 text-ink/80">{slide.text}</p>}
            {slide.link && <CMSLink link={slide.link} site={site} locale={locale} className="mt-3 inline-flex min-h-11 items-center font-semibold underline" />}
          </figcaption>
        )}
      </figure>
    ),
  }))
  return (
    <Section background={block.background}>
      <div className="wrap">
        {block.heading && <h2 className="t-h3 mb-6">{block.heading}</h2>}
        <Carousel
          slides={nodes}
          autoplay={Boolean(block.autoplay)}
          interval={block.interval}
          strings={{ label: block.heading || s.carouselLabel, previous: s.carouselPrevious, next: s.carouselNext, pause: s.carouselPause, play: s.carouselPlay, slide: s.carouselSlide, of: s.of }}
        />
      </div>
    </Section>
  )
}
