import { t } from '@/lib/i18n'
import type { ContactCardBlock } from '@/payload-types'
import { cn } from '@/utilities/ui'

import type { BlockProps } from './components'
import { ConsentEmbed } from './EmbedComponent'
import { telHref } from './interaction'
import { Section } from './Section'

const linkClass = 'inline-flex min-h-11 items-center underline'

/** Address, phone, email and opening hours; the map (if any) loads only after a click, through the consent embed. */
export function ContactCardComponent({ block, locale }: BlockProps<ContactCardBlock>) {
  const s = t(locale)
  const tel = telHref(block.phone)
  const hasMap = Boolean(block.mapUrl)
  return (
    <Section background={block.background}>
      <div className="wrap-wide">
        {block.heading && <h2 className="t-h3 mb-6">{block.heading}</h2>}
        <div className={cn('grid gap-8', hasMap && 'md:grid-cols-2')}>
          <div>
            {block.name && <p className="t-h4">{block.name}</p>}
            {block.address && (
              <address className="mt-3 whitespace-pre-line not-italic">
                <span className="sr-only">{s.address}: </span>
                {block.address}
              </address>
            )}
            {block.phone && (
              <p className="mt-2">
                <span className="font-bold">{s.phone}: </span>
                {tel ? (
                  <a href={tel} className={linkClass}>
                    {block.phone}
                  </a>
                ) : (
                  block.phone
                )}
              </p>
            )}
            {block.email && (
              <p className="mt-1">
                <span className="font-bold">{s.email}: </span>
                <a href={`mailto:${block.email}`} className={linkClass}>
                  {block.email}
                </a>
              </p>
            )}
            {block.hours && block.hours.length > 0 && (
              <>
                <h3 className="t-h4 mt-6">{s.openingHours}</h3>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
                  {block.hours.map((h, i) => (
                    <div key={h.id ?? i} className="contents">
                      <dt className="font-medium">{h.days}</dt>
                      <dd>{h.time}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </div>
          {hasMap && <ConsentEmbed src={block.mapUrl!} title={block.mapTitle || block.name || s.address} height={block.mapHeight} isMap locale={locale} />}
        </div>
      </div>
    </Section>
  )
}
