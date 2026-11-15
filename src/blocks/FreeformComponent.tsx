import { CMSLink } from '@/components/CMSLink'
import { Img } from '@/components/Img'
import type { Locale, SiteKey } from '@/lib/sites'
import type { FreeformBlock, Media } from '@/payload-types'
import { cn } from '@/utilities/ui'

import { clampPlace, domOrder, gridArea, rowHeight } from './freeform'
import { Section } from './Section'

type Item = NonNullable<FreeformBlock['items']>[number]

const ALIGN: Record<string, string> = { left: 'text-left items-start', center: 'text-center items-center', right: 'text-right items-end' }
const VALIGN: Record<string, string> = { top: 'justify-start', center: 'justify-center', bottom: 'justify-end' }
const SHAPE_COLOR: Record<string, string> = { tint: 'var(--color-tint)', muted: 'var(--color-muted)', brand: 'var(--color-brand)', dark: 'var(--color-ink)' }
const SHAPE_RADIUS: Record<string, string> = { none: '0', rounded: 'var(--radius-card)', circle: '9999px' }

/**
 * «Fri plassering». On larger screens a 12-column CSS grid places each element at its cells; on
 * mobile they stack. The DOM order is the mobile order (the reading order unless the editor set
 * one), so screen readers and keyboard focus follow it. Shapes are decorative.
 */
export function FreeformComponent({ block, site, locale }: { block: FreeformBlock; site: SiteKey; locale: Locale }) {
  const items = block.items ?? []
  if (!items.length) return null
  return (
    <Section background={block.background}>
      <div className="wrap">
        <div className="ff-grid" style={{ '--ff-row': rowHeight(block.rowHeight) } as React.CSSProperties}>
          {domOrder(items).map((i) => (
            <Element key={items[i].id ?? i} item={items[i]} site={site} locale={locale} />
          ))}
        </div>
      </div>
    </Section>
  )
}

function Element({ item, site, locale }: { item: Item; site: SiteKey; locale: Locale }) {
  const place = clampPlace(item)
  const style = { '--ff-area': gridArea(place) } as React.CSSProperties
  const frame = cn('ff-item', item.hideOnMobile && 'ff-hide-mobile')

  if (item.kind === 'shape') {
    return (
      <div
        className={cn(frame, 'ff-shape')}
        aria-hidden="true"
        style={{ ...style, background: SHAPE_COLOR[item.shapeColor ?? 'tint'] ?? SHAPE_COLOR.tint, borderRadius: SHAPE_RADIUS[item.shapeRadius ?? 'rounded'] }}
      />
    )
  }

  if (item.kind === 'image') {
    const media = item.image && typeof item.image === 'object' ? (item.image as Media) : null
    if (!media) return null
    return (
      <div className={cn(frame, 'ff-media')} style={style}>
        <Img
          media={media}
          cover={item.fit !== 'contain'}
          sizes={`(min-width: 48rem) ${Math.round((place.w / 12) * 100)}vw, 100vw`}
          className={cn('w-full', item.fit === 'contain' && 'h-auto md:h-full md:object-contain')}
        />
      </div>
    )
  }

  const box = cn(frame, 'flex flex-col', ALIGN[item.align ?? 'left'] ?? ALIGN.left, VALIGN[item.valign ?? 'top'] ?? VALIGN.top)

  if (item.kind === 'button') {
    return (
      <div className={box} style={style}>
        <CMSLink link={item.link} site={site} locale={locale} />
      </div>
    )
  }

  const text = item.text?.trim()
  if (!text) return null
  const content =
    item.textStyle === 'heading' ? (
      <h2 className="t-h2">{text}</h2>
    ) : item.textStyle === 'subheading' ? (
      <h3 className="t-h3">{text}</h3>
    ) : item.textStyle === 'lead' ? (
      <p className="t-lead">{text}</p>
    ) : (
      <p>{text}</p>
    )
  return (
    <div className={cn(box, 'ff-text')} style={style}>
      {content}
    </div>
  )
}
