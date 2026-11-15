import { Img } from '@/components/Img'
import type { Media } from '@/payload-types'

import { isDefaultSection, sectionFrameProps, type SectionValues } from './variants'

/**
 * Applies a block's «Seksjonsoppsett» (spacing, width, background media, anchor, visibility,
 * style class). With default settings it renders the block alone, so existing pages are unchanged.
 */
export function SectionFrame({
  section,
  styleClasses,
  children,
}: {
  section: SectionValues | null | undefined
  styleClasses: string[]
  children: React.ReactNode
}) {
  if (!section || isDefaultSection(section)) return <>{children}</>
  const props = sectionFrameProps(section, styleClasses)
  const media = section.backgroundMedia && typeof section.backgroundMedia === 'object' ? (section.backgroundMedia as Media) : null
  return (
    <div {...props}>
      {media && (
        <div className="sec-media" aria-hidden="true">
          {/* Decorative: the section's own text carries the content. */}
          <Img media={media} cover sizes="100vw" alt="" />
        </div>
      )}
      {children}
    </div>
  )
}
