import type { Form } from '@payloadcms/plugin-form-builder/types'

import { t } from '@/lib/i18n'
import type { Locale, SiteKey } from '@/lib/sites'
import type { Page } from '@/payload-types'
import {
  AccordionComponent,
  ArticleFeedComponent,
  CallToActionComponent,
  CardsComponent,
  ChildPagesComponent,
  ContentComponent,
  DocumentsComponent,
  FactsComponent,
  FullImageComponent,
  HeroComponent,
  ImageGridComponent,
  PeopleComponent,
  QuoteComponent,
  StatsComponent,
  TextImageComponent,
  TimelineComponent,
} from './components'
import { customComponents } from '@site/blocks/custom/components'

import { FormBlock } from './Form/Component'
import { CarouselComponent } from './CarouselComponent'
import { ColumnsComponent } from './ColumnsComponent'
import { ContactCardComponent } from './ContactCardComponent'
import { EmbedComponent } from './EmbedComponent'
import {
  BannerComponent,
  ButtonGroupComponent,
  DividerComponent,
  IconFeaturesComponent,
  LogoWallComponent,
  PricingComponent,
  TestimonialsComponent,
} from './MoreComponents'
import { NewsletterComponent } from './NewsletterComponent'
import { TableComponent } from './TableComponent'
import { TabsComponent } from './TabsComponent'
import { VideoComponent } from './VideoComponent'
import { SectionFrame } from './SectionFrame'
import type { SectionValues } from './variants'
import themeJson from '@site/theme.json'

/** Style classes editors may pick per section (site/theme.json styleClasses). */
const STYLE_CLASSES = ((themeJson as { styleClasses?: { name: string }[] }).styleClasses ?? []).map(
  (c) => c.name,
)

type AnyBlock = NonNullable<Page['layout']>[number]

/** Tegner sidens seksjoner i rekkefølge. Første seksjon får h1 og laster bildet med en gang. */
export function RenderBlocks({
  blocks,
  site,
  locale,
  pageId,
}: {
  blocks: Page['layout']
  site: SiteKey
  locale: Locale
  pageId?: number
}) {
  if (!blocks?.length) return null
  return <>{blocks.map((block, index) => renderFramed(block, { site, locale, isFirst: index === 0 }, pageId, index))}</>
}

/** A block inside its «Seksjonsoppsett» frame. Blocks in a column use the same frame. */
function renderFramed(block: AnyBlock, props: { site: SiteKey; locale: Locale; isFirst: boolean }, pageId: number | undefined, index: number) {
  return (
    <SectionFrame key={block.id ?? index} section={(block as { section?: SectionValues | null }).section} styleClasses={STYLE_CLASSES}>
      {renderBlock(block, props, pageId)}
    </SectionFrame>
  )
}

function renderBlock(
  block: AnyBlock,
  props: { site: SiteKey; locale: Locale; isFirst: boolean },
  pageId?: number,
) {
  const { locale } = props
  const key = block.id ?? undefined
  switch ((block as AnyBlock).blockType) {
    case 'hero':
      return <HeroComponent key={key} block={block as never} {...props} />
    case 'childPages':
      return <ChildPagesComponent key={key} block={block as never} {...props} pageId={pageId} />
    case 'content':
      return <ContentComponent key={key} block={block as never} {...props} />
    case 'textImage':
      return <TextImageComponent key={key} block={block as never} {...props} />
    case 'fullImage':
      return <FullImageComponent key={key} block={block as never} {...props} />
    case 'imageGrid':
      return <ImageGridComponent key={key} block={block as never} {...props} />
    case 'cards':
      return <CardsComponent key={key} block={block as never} {...props} />
    case 'cta':
      return <CallToActionComponent key={key} block={block as never} {...props} />
    case 'quote':
      return <QuoteComponent key={key} block={block as never} {...props} />
    case 'stats':
      return <StatsComponent key={key} block={block as never} {...props} />
    case 'articleFeed':
      return <ArticleFeedComponent key={key} block={block as never} {...props} />
    case 'people':
      return <PeopleComponent key={key} block={block as never} {...props} />
    case 'facts':
      return <FactsComponent key={key} block={block as never} {...props} />
    case 'documents':
      return <DocumentsComponent key={key} block={block as never} {...props} />
    case 'timeline':
      return <TimelineComponent key={key} block={block as never} {...props} />
    case 'accordion':
      return <AccordionComponent key={key} block={block as never} {...props} />
    case 'video':
      return <VideoComponent key={key} block={block as never} strings={t(locale)} />
    case 'embed':
      return <EmbedComponent key={key} block={block as never} locale={locale} />
    case 'columns':
      return (
        <ColumnsComponent
          key={key}
          block={block as never}
          renderNested={(nested, i) => renderFramed(nested as unknown as AnyBlock, { ...props, isFirst: false }, pageId, i)}
        />
      )
    case 'tabs':
      return <TabsComponent key={key} block={block as never} {...props} />
    case 'pricing':
      return <PricingComponent key={key} block={block as never} {...props} />
    case 'logoWall':
      return <LogoWallComponent key={key} block={block as never} {...props} />
    case 'testimonials':
      return <TestimonialsComponent key={key} block={block as never} {...props} />
    case 'carousel':
      return <CarouselComponent key={key} block={block as never} {...props} />
    case 'table':
      return <TableComponent key={key} block={block as never} />
    case 'contactCard':
      return <ContactCardComponent key={key} block={block as never} {...props} />
    case 'newsletter':
      return <NewsletterComponent key={key} block={block as never} {...props} />
    case 'iconFeatures':
      return <IconFeaturesComponent key={key} block={block as never} {...props} />
    case 'banner':
      return <BannerComponent key={key} block={block as never} {...props} />
    case 'buttonGroup':
      return <ButtonGroupComponent key={key} block={block as never} {...props} />
    case 'divider':
      return <DividerComponent key={key} block={block as never} />
    case 'formBlock': {
      const b = block as unknown as {
        form: Form
        enableIntro?: boolean | null
        introContent?: unknown
      }
      if (typeof b.form !== 'object') return null
      return (
        <FormBlock
          key={key}
          form={b.form}
          locale={locale}
          enableIntro={Boolean(b.enableIntro)}
          introContent={b.introContent as never}
        />
      )
    }
    default: {
      // Blocks only this site has (site/blocks/custom).
      const Custom = customComponents[(block as AnyBlock).blockType]
      return Custom ? <Custom key={key} block={block} {...props} /> : null
    }
  }
}
