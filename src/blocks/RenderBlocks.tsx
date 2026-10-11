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
import { EmbedComponent } from './EmbedComponent'
import { VideoComponent } from './VideoComponent'

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
  return (
    <>
      {blocks.map((block, index) => {
        const props = { site, locale, isFirst: index === 0 }
        const key = block.id ?? index
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
          case 'formBlock': {
            const b = block as unknown as { form: Form; enableIntro?: boolean | null; introContent?: unknown }
            if (typeof b.form !== 'object') return null
            return <FormBlock key={key} form={b.form} locale={locale} enableIntro={Boolean(b.enableIntro)} introContent={b.introContent as never} />
          }
          default: {
            // Blocks only this site has (site/blocks/custom).
            const Custom = customComponents[(block as AnyBlock).blockType]
            return Custom ? <Custom key={key} block={block} {...props} /> : null
          }
        }
      })}
    </>
  )
}
