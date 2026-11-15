import { Check, Info, TriangleAlert, CircleCheck } from 'lucide-react'

import { CMSLink } from '@/components/CMSLink'
import { Img } from '@/components/Img'
import { t } from '@/lib/i18n'
import type { BannerBlock, ButtonGroupBlock, DividerBlock, IconFeaturesBlock, LogoWallBlock, Media, PricingBlock, TestimonialsBlock } from '@/payload-types'
import { cn } from '@/utilities/ui'

import type { BlockProps } from './components'
import { Icon } from './icons'
import { quoted } from './interaction'
import { Section } from './Section'
import { alignClass } from './variants'

/** Server components for the simple new blocks; the ones that need JavaScript or are longer have their own file. */

/* ---------- Prisplaner ---------- */

const PLAN_GRID: Record<number, string> = { 1: 'mx-auto max-w-md', 2: 'md:grid-cols-2', 3: 'md:grid-cols-2 lg:grid-cols-3', 4: 'md:grid-cols-2 lg:grid-cols-4' }

export function PricingComponent({ block, site, locale }: BlockProps<PricingBlock>) {
  const plans = block.plans ?? []
  if (!plans.length) return null
  const s = t(locale)
  return (
    <Section background={block.background}>
      <div className="wrap-wide">
        {block.heading && <h2 className={cn('t-h2 mb-4', alignClass(block.align))}>{block.heading}</h2>}
        {block.intro && <p className={cn('t-lead mb-10 max-w-3xl', alignClass(block.align))}>{block.intro}</p>}
        <ul role="list" className={cn('grid items-stretch gap-6', PLAN_GRID[plans.length] ?? PLAN_GRID[4])}>
          {plans.map((plan, i) => {
            const badge = plan.badge || (plan.highlighted ? s.recommended : '')
            return (
              <li
                key={plan.id ?? i}
                className={cn('kit-card relative flex flex-col rounded-2xl bg-white p-6 text-ink shadow-sm ring-1 ring-ink/10 md:p-8', plan.highlighted && 'shadow-lg ring-2 ring-brand')}
              >
                {badge && <p className="mb-3 w-fit rounded-full bg-brand-dark px-3 py-1 text-sm font-bold text-white">{badge}</p>}
                <h3 className="t-h4">{plan.name}</h3>
                <p className="mt-3">
                  <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                  {plan.period && <span className="ml-2 text-ink/70">{plan.period}</span>}
                </p>
                {plan.description && <p className="mt-3 text-ink/80">{plan.description}</p>}
                {plan.features && plan.features.length > 0 && (
                  <ul role="list" className="mt-6 space-y-3">
                    {plan.features.map((f, j) => (
                      <li key={f.id ?? j} className="flex gap-3">
                        <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-text" />
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {plan.link && (
                  <div className="mt-auto pt-8">
                    <CMSLink link={plan.link} site={site} locale={locale} />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </Section>
  )
}

/* ---------- Logoer ---------- */

export function LogoWallComponent({ block, site, locale }: BlockProps<LogoWallBlock>) {
  const logos = (block.logos ?? []).filter((l) => l.image && typeof l.image === 'object')
  if (!logos.length) return null
  return (
    <Section background={block.background}>
      <div className="wrap-wide">
        {block.heading && <h2 className={cn('t-h3 mb-8', alignClass(block.align))}>{block.heading}</h2>}
        <ul role="list" className={cn('flex flex-wrap items-center gap-x-10 gap-y-6', block.align === 'center' ? 'justify-center' : 'justify-start')}>
          {logos.map((logo, i) => {
            const img = <Img media={logo.image as Media} alt={logo.name} sizes="160px" className="h-12 w-auto max-w-40 object-contain md:h-14" />
            const linked = logo.link?.type === 'custom' ? logo.link.url : logo.link?.reference
            return (
              <li key={logo.id ?? i}>
                {linked ? (
                  <CMSLink link={logo.link} site={site} locale={locale} className="inline-flex min-h-11 items-center">
                    {img}
                  </CMSLink>
                ) : (
                  img
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </Section>
  )
}

/* ---------- Uttalelser ---------- */

const TESTIMONIAL_GRID: Record<string, string> = { '1': 'mx-auto max-w-3xl', '2': 'md:grid-cols-2', '3': 'md:grid-cols-2 lg:grid-cols-3' }

export function TestimonialsComponent({ block, locale }: BlockProps<TestimonialsBlock>) {
  const items = block.items ?? []
  if (!items.length) return null
  return (
    <Section background={block.background}>
      <div className="wrap-wide">
        {block.heading && <h2 className={cn('t-h2 mb-10', alignClass(block.align))}>{block.heading}</h2>}
        <ul role="list" className={cn('grid gap-6', TESTIMONIAL_GRID[block.columns ?? '2'] ?? TESTIMONIAL_GRID['2'])}>
          {items.map((it, i) => (
            <li key={it.id ?? i}>
              <figure className="kit-card flex h-full flex-col rounded-2xl bg-white p-6 text-ink shadow-sm ring-1 ring-ink/10 md:p-8">
                <blockquote className="text-lg">
                  <p>{quoted(it.quote, locale)}</p>
                </blockquote>
                {(it.author || it.role || it.image) && (
                  <figcaption className="mt-auto flex items-center gap-4 pt-6">
                    {it.image && (
                      <span className="size-12 shrink-0 overflow-hidden rounded-full">
                        <Img media={it.image as Media} cover sizes="48px" alt="" />
                      </span>
                    )}
                    <span>
                      {it.author && <span className="block font-bold">{it.author}</span>}
                      {it.role && <span className="t-small block text-ink/70">{it.role}</span>}
                    </span>
                  </figcaption>
                )}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}

/* ---------- Ikoner og fordeler ---------- */

const FEATURE_GRID: Record<string, string> = { '2': 'sm:grid-cols-2', '3': 'sm:grid-cols-2 lg:grid-cols-3', '4': 'sm:grid-cols-2 lg:grid-cols-4' }

export function IconFeaturesComponent({ block, site, locale }: BlockProps<IconFeaturesBlock>) {
  const items = block.items ?? []
  if (!items.length) return null
  const center = block.align === 'center'
  return (
    <Section background={block.background}>
      <div className="wrap-wide">
        {block.heading && <h2 className={cn('t-h2 mb-4', alignClass(block.align))}>{block.heading}</h2>}
        {block.intro && <p className={cn('t-lead mb-10 max-w-3xl', alignClass(block.align))}>{block.intro}</p>}
        <ul role="list" className={cn('grid gap-8', FEATURE_GRID[block.columns ?? '3'] ?? FEATURE_GRID['3'])}>
          {items.map((it, i) => (
            <li key={it.id ?? i} className={cn('flex flex-col gap-3', center && 'items-center text-center')}>
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-tint text-brand-dark">
                <Icon name={it.icon} className="size-6" />
              </span>
              <h3 className="t-h4">{it.title}</h3>
              {it.text && <p className="opacity-90">{it.text}</p>}
              {it.link && <CMSLink link={it.link} site={site} locale={locale} className="inline-flex min-h-11 items-center font-semibold underline" />}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}

/* ---------- Varselfelt ---------- */

const BANNER = {
  info: { box: 'border-sky-300 bg-sky-50 text-sky-950', Svg: Info },
  warning: { box: 'border-amber-300 bg-amber-50 text-amber-950', Svg: TriangleAlert },
  success: { box: 'border-green-300 bg-green-50 text-green-950', Svg: CircleCheck },
} as const

export function BannerComponent({ block, site, locale }: BlockProps<BannerBlock>) {
  const s = t(locale)
  const variant = block.variant && block.variant in BANNER ? block.variant : 'info'
  const { box, Svg } = BANNER[variant]
  const kind = { info: s.bannerInfo, warning: s.bannerWarning, success: s.bannerSuccess }[variant]
  return (
    <div className="py-4 md:py-6">
      <div className="wrap">
        <div role="note" className={cn('flex gap-4 rounded-2xl border p-5 md:p-6', box)}>
          <Svg aria-hidden="true" className="mt-0.5 size-6 shrink-0" />
          <div>
            <p className="font-bold">
              <span className="sr-only">{kind}: </span>
              {block.title}
            </p>
            <p className={cn(block.title && 'mt-1')}>{block.text}</p>
            {block.link && <CMSLink link={block.link} site={site} locale={locale} className="mt-2 inline-flex min-h-11 items-center font-semibold underline" />}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Knapper ---------- */

const JUSTIFY: Record<string, string> = { left: 'justify-start', center: 'justify-center', right: 'justify-end' }

export function ButtonGroupComponent({ block, site, locale }: BlockProps<ButtonGroupBlock>) {
  const links = block.links ?? []
  if (!links.length) return null
  return (
    <Section background={block.background}>
      <div className="wrap">
        <div className={cn('flex flex-wrap items-center gap-3', JUSTIFY[block.justify ?? 'left'] ?? JUSTIFY.left)}>
          {links.map((l, i) => (
            <CMSLink key={l.id ?? i} link={l.link} site={site} locale={locale} />
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ---------- Skillelinje eller luft ---------- */

export function DividerComponent({ block }: { block: DividerBlock }) {
  const size = block.size && ['s', 'm', 'l', 'xl'].includes(block.size) ? block.size : 'm'
  if (block.kind === 'space') return <div aria-hidden="true" style={{ height: `var(--space-${size})` }} />
  return (
    <div style={{ paddingBlock: `calc(var(--space-${size}) / 2)` }}>
      <div className="wrap">
        <hr className="m-0 border-0 border-t border-ink/20" />
      </div>
    </div>
  )
}
