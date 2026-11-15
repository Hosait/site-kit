import { cn } from '@/utilities/ui'

import { hasSectionBg, sectionBg, type Background } from './variants'

/** Seksjonsramme med luft som i dag: mer luft når seksjonen har bakgrunnsfarge. */
export function Section({
  background,
  className,
  children,
  as: Tag = 'section',
}: {
  background?: Background
  className?: string
  children: React.ReactNode
  as?: 'section' | 'div'
}) {
  return <Tag className={cn(hasSectionBg(background) ? 'py-16 md:py-24' : 'py-10 md:py-16', sectionBg(background), className)}>{children}</Tag>
}
