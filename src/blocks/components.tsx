
import { CMSLink, LinkRow } from '@/components/CMSLink'
import { Img } from '@/components/Img'
import { RichText } from '@/components/RichText'
import { getArticles, getChildPages, type ChildPage } from '@/lib/data'
import { formatDate, t } from '@/lib/i18n'
import { docPath } from '@/lib/links'
import { localePath, siteHref, SITES, type Locale, type SiteKey } from '@/lib/sites'
import type {
  AccordionBlock,
  ArticleFeedBlock,
  CallToActionBlock,
  CardsBlock,
  ChildPagesBlock,
  ContentBlock,
  Document,
  DocumentsBlock,
  FactsBlock,
  FullImageBlock,
  HeroBlock,
  ImageGridBlock,
  Media,
  PeopleBlock,
  Person,
  QuoteBlock,
  StatsBlock,
  TextImageBlock,
  TimelineBlock,
} from '@/payload-types'
import { cn } from '@/utilities/ui'

export type BlockProps<T> = { block: T; site: SiteKey; locale: Locale; isFirst?: boolean }

type Background = 'none' | 'mist' | 'sky' | 'night' | 'sapphire' | null | undefined
const bg = (b: Background) => (b && b !== 'none' ? `bg-section-${b} ${b === 'night' || b === 'sapphire' ? 'on-dark' : ''}` : '')
const hasBg = (b: Background) => Boolean(b && b !== 'none')

/** Seksjonsramme med luft som i dag: mer luft når seksjonen har bakgrunnsfarge. */
function Section({
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
  return <Tag className={cn(hasBg(background) ? 'py-16 md:py-24' : 'py-10 md:py-16', bg(background), className)}>{children}</Tag>
}

function Eyebrow({
  text,
  highlight,
  className,
  as: Tag = 'p',
}: {
  text?: string | null
  highlight?: string | null
  className?: string
  as?: 'p' | 'span'
}) {
  if (!text && !highlight) return null
  // «TODAY WE BUILD A BRIGHTER FUTURE» med «WE BUILD A BRIGHTER» i blått.
  const full = text ?? ''
  const idx = highlight ? full.toLowerCase().indexOf(highlight.toLowerCase()) : -1
  return (
    <Tag className={cn('t-eyebrow', Tag === 'span' && 'block', className)}>
      {idx >= 0 ? (
        <>
          {full.slice(0, idx)}
          <span className="text-blue-text">{full.slice(idx, idx + highlight!.length)}</span>
          {full.slice(idx + highlight!.length)}
        </>
      ) : (
        <>
          {full} {highlight && <span className="text-blue-text">{highlight}</span>}
        </>
      )}
    </Tag>
  )
}

/* ---------- Hero ---------- */

export function HeroComponent({ block, site, locale, isFirst }: BlockProps<HeroBlock>) {
  const H = isFirst ? 'h1' : 'h2'
  const media = block.media as Media | null

  if (block.variant === 'image' && media) {
    return (
      <section className="relative isolate flex min-h-[70vh] items-end overflow-hidden bg-night text-white md:min-h-[80vh]">
        <div className="absolute inset-0 -z-10">
          <Img media={media} cover priority={isFirst} sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-night/30 to-transparent" />
        </div>
        <div className="wrap-wide on-dark pb-12 pt-32 md:pb-20">
          <Eyebrow text={block.eyebrow} highlight={block.eyebrowHighlight} className="mb-4 text-white/90" />
          {block.heading && <H className="t-display max-w-4xl">{block.heading}</H>}
          {block.text && <p className="t-lead mt-6 max-w-2xl">{block.text}</p>}
          <LinkRow links={block.links} site={site} locale={locale} className="mt-8" />
        </div>
      </section>
    )
  }

  if (block.variant === 'split' && media) {
    return (
      <section className="wrap-wide grid items-center gap-8 py-10 md:grid-cols-2 md:gap-16 md:py-16">
        <div>
          <Eyebrow text={block.eyebrow} highlight={block.eyebrowHighlight} className="mb-4" />
          {block.heading && <H className="t-display">{block.heading}</H>}
          {block.text && <p className="t-lead mt-6">{block.text}</p>}
          <LinkRow links={block.links} site={site} locale={locale} className="mt-8" />
        </div>
        <div className="overflow-hidden rounded-2xl">
          <Img media={media} priority={isFirst} sizes="(min-width: 48rem) 50vw, 100vw" className="w-full" />
        </div>
      </section>
    )
  }

  return (
    <section className="wrap-wide pb-6 pt-10 md:pb-10 md:pt-20">
      <Eyebrow text={block.eyebrow} highlight={block.eyebrowHighlight} className="mb-4" />
      {block.heading && <H className="t-display max-w-5xl">{block.heading}</H>}
      {block.text && <p className="t-lead mt-6 max-w-3xl">{block.text}</p>}
      <LinkRow links={block.links} site={site} locale={locale} className="mt-8" />
    </section>
  )
}


export function ContentComponent({ block, site, locale }: BlockProps<ContentBlock>) {
  return (
    <Section background={block.background}>
      <div className={cn(block.width === 'wide' ? 'wrap' : 'wrap-text', block.align === 'center' && 'text-center')}>
        <RichText data={block.richText} site={site} locale={locale} className={cn(block.align === 'center' && 'mx-auto')} />
      </div>
    </Section>
  )
}

/* ---------- Tekst og bilde ---------- */

export function TextImageComponent({ block, site, locale }: BlockProps<TextImageBlock>) {
  const imageRight = block.imagePosition === 'right'
  const feature = block.layout === 'feature'
  return (
    <Section background={block.background}>
      <div className={cn('grid items-center gap-8 md:gap-12', feature ? 'wrap-wide md:grid-cols-[1.2fr_1fr]' : 'wrap md:grid-cols-2')}>
        <div className={cn('overflow-hidden', feature ? 'rounded-sm' : 'rounded-2xl', imageRight && 'md:order-2')}>
          <Img media={block.image as Media} sizes={feature ? '(min-width: 48rem) 55vw, 100vw' : '(min-width: 48rem) 36rem, 100vw'} className="w-full" />
        </div>
        <div className={cn(imageRight && 'md:order-1')}>
          {block.eyebrow && <p className="t-eyebrow mb-3 text-blue-text">{block.eyebrow}</p>}
          {block.heading && <h2 className={cn(feature ? 't-display' : 't-h2', 'mb-6')}>{block.heading}</h2>}
          <RichText data={block.richText} site={site} locale={locale} className={cn(feature && 'prose-lg [&_p]:t-lead')} />
          <LinkRow links={block.links} site={site} locale={locale} className="mt-6" />
        </div>
      </div>
    </Section>
  )
}

/* ---------- Bilder ---------- */

export function FullImageComponent({ block }: BlockProps<FullImageBlock>) {
  const media = block.image as Media
  const wrap = block.size === 'full' ? '' : block.size === 'text' ? 'wrap-text' : 'wrap-wide'
  return (
    <figure className={cn('py-6 md:py-10', wrap)}>
      <Img
        media={media}
        sizes={block.size === 'full' ? '100vw' : block.size === 'text' ? '40rem' : '(min-width: 88rem) 88rem, 100vw'}
        className={cn('w-full', block.size !== 'full' && 'rounded-sm')}
      />
      {(block.caption || media?.credit) && (
        <figcaption className={cn('t-small mt-3 text-night/70', block.size === 'full' && 'wrap-wide')}>
          {block.caption}
          {media?.credit && <span className="ml-2 text-night/50">Foto: {media.credit}</span>}
        </figcaption>
      )}
    </figure>
  )
}

export function ImageGridComponent({ block }: BlockProps<ImageGridBlock>) {
  const cols = { '2': 'sm:grid-cols-2', '3': 'sm:grid-cols-2 lg:grid-cols-3', '4': 'sm:grid-cols-2 lg:grid-cols-4' }[block.columns ?? '3']
  return (
    <Section>
      <div className="wrap-wide">
        {block.heading && <h2 className="t-h3 mb-8">{block.heading}</h2>}
        <ul className={cn('grid gap-4 md:gap-6', cols)}>
          {(block.images ?? []).map((im, i) => (
            <li key={im.id ?? i}>
              <figure>
                <div className="aspect-[4/3] overflow-hidden rounded-sm bg-mist">
                  <Img media={im.image as Media} cover sizes="(min-width: 64rem) 30vw, (min-width: 40rem) 50vw, 100vw" />
                </div>
                {im.caption && <figcaption className="t-small mt-2 text-night/70">{im.caption}</figcaption>}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}

/* ---------- Kort ---------- */

export function CardsComponent({ block, site, locale }: BlockProps<CardsBlock>) {
  const cols = { '2': 'md:grid-cols-2', '3': 'md:grid-cols-2 lg:grid-cols-3', '4': 'sm:grid-cols-2 lg:grid-cols-4' }[block.columns ?? '3']
  return (
    <Section background={block.background}>
      <div className="wrap-wide">
        {block.heading && <h2 className="t-h2 mb-4">{block.heading}</h2>}
        {block.intro && <p className="t-lead mb-10 max-w-3xl">{block.intro}</p>}
        <ul className={cn('grid gap-6', cols)}>
          {(block.items ?? []).map((item, i) => {
            const linked = item.link?.type === 'custom' ? item.link.url : item.link?.reference
            return (
              <li key={item.id ?? i} className="group relative flex flex-col overflow-hidden rounded-sm bg-white text-night shadow-sm ring-1 ring-night/5">
                {item.image && (
                  <div className="aspect-[16/9] overflow-hidden bg-mist">
                    <Img media={item.image as Media} cover sizes="(min-width: 64rem) 28rem, 100vw" className="transition-transform duration-500 group-hover:scale-105" />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <h3 className="t-h4">
                    {linked ? (
                      <CMSLink link={item.link} site={site} locale={locale} className="text-night no-underline after:absolute after:inset-0">
                        {item.title}
                      </CMSLink>
                    ) : (
                      item.title
                    )}
                  </h3>
                  {item.text && <p className="text-night/80">{item.text}</p>}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </Section>
  )
}

/* ---------- CTA, sitat, tall ---------- */

export function CallToActionComponent({ block, site, locale }: BlockProps<CallToActionBlock>) {
  return (
    <Section background={block.background ?? 'mist'}>
      <div className="wrap-text text-center">
        {block.heading && <h2 className="t-h2">{block.heading}</h2>}
        {block.text && <p className="t-lead mt-4">{block.text}</p>}
        <LinkRow links={block.links} site={site} locale={locale} className="mt-8 justify-center" />
      </div>
    </Section>
  )
}

export function QuoteComponent({ block }: BlockProps<QuoteBlock>) {
  return (
    <Section background={block.background}>
      <figure className="wrap-text">
        <blockquote className="t-h3 font-medium">
          <p>«{block.quote.replace(/^[«"“]|[»"”]$/g, '')}»</p>
        </blockquote>
        {(block.author || block.role) && (
          <figcaption className="mt-6 flex items-center gap-4">
            {block.image && (
              <span className="size-14 overflow-hidden rounded-full">
                <Img media={block.image as Media} cover sizes="56px" />
              </span>
            )}
            <span>
              {block.author && <span className="block font-bold">{block.author}</span>}
              {block.role && <span className="t-small block opacity-75">{block.role}</span>}
            </span>
          </figcaption>
        )}
      </figure>
    </Section>
  )
}

export function StatsComponent({ block }: BlockProps<StatsBlock>) {
  return (
    <Section background={block.background}>
      <div className="wrap">
        {block.heading && <h2 className="t-h2 mb-4">{block.heading}</h2>}
        {block.intro && <p className="t-lead mb-10 max-w-3xl">{block.intro}</p>}
        <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {(block.items ?? []).map((it, i) => (
            <div key={it.id ?? i} className="border-t-2 border-blue pt-4">
              <dt className="sr-only">{it.label}</dt>
              <dd>
                <span className="block text-5xl font-bold tracking-tight text-blue-text md:text-6xl">{it.value}</span>
                <span className="mt-2 block text-lg">{it.label}</span>
              </dd>
            </div>
          ))}
        </dl>
        {block.bars && block.bars.length > 0 && (
          <ul className="mt-10 space-y-5">
            {block.bars.map((bar, i) => (
              <li key={bar.id ?? i}>
                <div className="mb-2 flex justify-between gap-4 text-sm font-medium">
                  <span>{bar.label}</span>
                  <span>{bar.percent} %</span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-night/10" aria-hidden>
                  <div className={cn('h-full rounded-full', i === 0 ? 'bg-blue' : 'bg-night/40')} style={{ width: `${bar.percent}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  )
}

/* ---------- Artikkelstrøm («Fikk du med deg disse?») ---------- */

export async function ArticleFeedComponent({ block, site, locale }: BlockProps<ArticleFeedBlock>) {
  const s = t(locale)
  const res = await getArticles({
    locale,
    sites: (block.sites as SiteKey[] | null) ?? null,
    kind: block.kind ?? 'all',
    limit: block.paginate ? 48 : (block.limit ?? 3),
  })
  if (!res.docs.length) return null
  return (
    <Section>
      <div className="wrap-wide">
        {block.heading && <h2 className="t-h2 mb-8 md:mb-12">{block.heading}</h2>}
        <ul className="grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {res.docs.map((a) => {
            const path = docPath('articles', a, locale)
            const href = path ? siteHref(a.site as SiteKey, site, path) : null
            return (
              <li key={a.id} className="group relative flex flex-col">
                <div className="aspect-[16/10] overflow-hidden rounded-sm bg-mist">
                  <Img
                    media={a.heroImage as Media}
                    cover
                    sizes="(min-width: 64rem) 28rem, (min-width: 48rem) 50vw, 100vw"
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="t-h4 mt-5">
                  {href ? (
                    <a href={href} className="text-night no-underline after:absolute after:inset-0 group-hover:text-blue">
                      {a.title}
                    </a>
                  ) : (
                    a.title
                  )}
                </h3>
                {a.lead && <p className="mt-3 line-clamp-3 text-night/80">{a.lead}</p>}
                <p className="t-small mt-4 uppercase tracking-wide text-night/70">
                  {formatDate(a.publishedAt, locale)} | {s.publishedBy} {SITES[a.site as SiteKey].division ?? SITES[a.site as SiteKey].name}
                </p>
              </li>
            )
          })}
        </ul>
      </div>
    </Section>
  )
}

/* ---------- Personer ---------- */

export function PeopleComponent({ block, locale }: BlockProps<PeopleBlock>) {
  const s = t(locale)
  const people = (block.people ?? []).filter((p): p is Person => typeof p === 'object')
  const list = block.layout === 'list'
  return (
    <Section>
      <div className="wrap-wide">
        {block.heading && <h2 className="t-h2 mb-10">{block.heading}</h2>}
        <ul className={cn('grid gap-x-6 gap-y-12', list ? 'md:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3')}>
          {people.map((p) => (
            <li key={p.id} className={cn(list && 'flex items-center gap-5')}>
              {p.image ? (
                <div className={cn('overflow-hidden bg-mist', list ? 'size-24 shrink-0 rounded-full' : 'mb-5 aspect-square rounded-sm')}>
                  <Img media={p.image as Media} cover sizes={list ? '96px' : '(min-width: 64rem) 28rem, 50vw'} alt={p.name} />
                </div>
              ) : (
                !list && (
                  <div aria-hidden className="mb-5 flex aspect-square items-center justify-center rounded-sm bg-mist text-6xl font-bold text-sapphire/80">
                    {p.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                )
              )}
              <div>
                {p.role && <p className="t-small font-bold uppercase tracking-wide">{p.role}</p>}
                <h3 className="t-h4 mt-1">{p.name}</h3>
                <p className="mt-2 space-y-1">
                  {p.phone && (
                    <a href={`tel:${p.phone.replace(/\s/g, '')}`} className="block w-fit" aria-label={`${s.phone} ${p.name}`}>
                      {p.phone}
                    </a>
                  )}
                  {p.email && (
                    <a href={`mailto:${p.email}`} className="block w-fit break-all">
                      {p.email}
                    </a>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}

/* ---------- Dokumenter ---------- */

const formatBytes = (n?: number | null) =>
  !n ? '' : n > 1_000_000 ? `${(n / 1_000_000).toFixed(1).replace('.', ',')} MB` : `${Math.max(1, Math.round(n / 1000))} kB`

export function DocumentsComponent({ block, locale }: BlockProps<DocumentsBlock>) {
  const s = t(locale)
  const docs = (block.documents ?? []).filter((d): d is Document => typeof d === 'object')
  if (!docs.length) return null
  return (
    <Section>
      <div className="wrap">
        {block.heading && <h2 className="t-h3 mb-6">{block.heading}</h2>}
        <ul className="divide-y divide-night/10 border-y border-night/10">
          {docs.map((d) => (
            <li key={d.id}>
              <a href={d.url ?? '#'} className="group flex min-h-16 items-center justify-between gap-4 py-3 text-night no-underline" download>
                <span>
                  <span className="font-medium group-hover:text-blue">{d.title}</span>
                  <span className="t-small block text-night/70">
                    {(d.filename?.split('.').pop() ?? '').toUpperCase()} {formatBytes(d.filesize)}
                  </span>
                </span>
                <span className="btn shrink-0 !min-h-10">{s.download}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}

/* ---------- Tidslinje ---------- */

export function TimelineComponent({ block }: BlockProps<TimelineBlock>) {
  return (
    <Section>
      <div className="wrap">
        {block.heading && <h2 className="t-h2 mb-12">{block.heading}</h2>}
        <ol className="relative space-y-12 border-l-2 border-sky pl-8 md:pl-12">
          {(block.items ?? []).map((it, i) => (
            <li key={it.id ?? i} className="relative">
              <span aria-hidden className="absolute -left-[2.6rem] top-1 size-4 rounded-full bg-blue ring-4 ring-white md:-left-[3.6rem]" />
              <p className="text-3xl font-bold tracking-tight text-blue-text">{it.year}</p>
              {it.title && <h3 className="t-h4 mt-2">{it.title}</h3>}
              {it.text && <p className="mt-2 max-w-2xl">{it.text}</p>}
              {it.image && (
                <div className="mt-4 max-w-xl overflow-hidden rounded-sm">
                  <Img media={it.image as Media} sizes="36rem" className="w-full" />
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}

/* ---------- Trekkspill ---------- */

export function AccordionComponent({ block, site, locale }: BlockProps<AccordionBlock>) {
  return (
    <Section>
      <div className="wrap-text">
        {block.heading && <h2 className="t-h3 mb-6">{block.heading}</h2>}
        <div className="divide-y divide-night/10 border-y border-night/10">
          {(block.items ?? []).map((it, i) => (
            <details key={it.id ?? i} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-lg font-medium">
                {it.title}
                <span aria-hidden className="text-2xl text-blue transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="pb-6">
                <RichText data={it.content} site={site} locale={locale} />
              </div>
            </details>
          ))}
        </div>
      </div>
    </Section>
  )
}


/* ---------- Undersider (katalog, systemløsninger, referanser) ---------- */

function ChildCard({ page, locale }: { page: ChildPage; locale: Locale }) {
  return (
    <li className="group relative flex flex-col overflow-hidden rounded-sm bg-white ring-1 ring-night/10 transition-shadow hover:shadow-lg">
      <div className="aspect-[4/3] overflow-hidden bg-mist">
        {page.image ? (
          <Img
            media={page.image as Media}
            sizes="(min-width: 64rem) 22rem, (min-width: 40rem) 50vw, 100vw"
            className="size-full object-contain p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div aria-hidden className="flex size-full items-center justify-center text-4xl font-bold text-sky">
            {page.title.slice(0, 1)}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="t-h4 !text-xl">
          <a href={localePath(locale, page.path)} className="text-night no-underline after:absolute after:inset-0 group-hover:text-blue">
            {page.title}
          </a>
        </h3>
        {page.summary && <p className="t-small text-night/75">{page.summary}</p>}
      </div>
    </li>
  )
}

export async function ChildPagesComponent({ block, site, locale, pageId }: BlockProps<ChildPagesBlock> & { pageId?: number }) {
  const parent = typeof block.parent === 'object' && block.parent ? block.parent.id : (block.parent ?? pageId)
  if (!parent) return null
  const depth = block.depth === '2' ? 2 : 1
  const pages = await getChildPages(site, locale, parent, depth)
  if (!pages.length) return null
  const cols = { '2': 'sm:grid-cols-2', '3': 'sm:grid-cols-2 lg:grid-cols-3', '4': 'sm:grid-cols-2 lg:grid-cols-4' }[block.columns ?? '3']
  const grouped = depth === 2 && pages.some((p) => p.children.length)

  return (
    <Section>
      <div className="wrap-wide">
        {block.heading && <h2 className="t-h2 mb-4">{block.heading}</h2>}
        {block.intro && <p className="t-lead mb-10 max-w-3xl">{block.intro}</p>}
        {grouped ? (
          <div className="space-y-14">
            {pages.map((group) => (
              <section key={group.id} aria-labelledby={`grp-${group.id}`}>
                <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-night/10 pb-3">
                  <h3 id={`grp-${group.id}`} className="t-h3">
                    {group.title}
                  </h3>
                  <a href={localePath(locale, group.path)} className="link-arrow shrink-0">
                    {t(locale).readMore}
                  </a>
                </div>
                {group.children.length > 0 && (
                  <ul className={cn('grid gap-5', cols)}>
                    {group.children.map((p) => (
                      <ChildCard key={p.id} page={p} locale={locale} />
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        ) : (
          <ul className={cn('grid gap-5', cols)}>
            {pages.map((p) => (
              <ChildCard key={p.id} page={p} locale={locale} />
            ))}
          </ul>
        )}
      </div>
    </Section>
  )
}

/* ---------- Faktaboks (referanseprosjekter, spesifikasjoner) ---------- */

export function FactsComponent({ block }: BlockProps<FactsBlock>) {
  if (!block.items?.length) return null
  return (
    <Section>
      <div className="wrap">
        <div className="rounded-2xl bg-mist p-6 md:p-10">
          {block.heading && <h2 className="t-h3 mb-6">{block.heading}</h2>}
          <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {block.items.map((it, i) => (
              <div key={it.id ?? i} className="border-t border-night/15 pt-3">
                <dt className="t-small text-night/70">{it.label}</dt>
                <dd className="mt-1 text-lg font-medium">{it.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  )
}
