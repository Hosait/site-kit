import { ArticleFeedComponent } from '@/blocks/components'
import { Img } from '@/components/Img'
import { RichText } from '@/components/RichText'
import { t } from '@/lib/i18n'
import { SITES, type Locale, type SiteKey } from '@/lib/sites'
import type { Article, Media } from '@/payload-types'
import { formatDate } from '@/lib/locales'

/** Kunngjøring/fagbloggartikkel: tittel, ingress, hovedbilde, brødtekst og relaterte artikler. */
export function ArticleView({ article, site, locale }: { article: Article; site: SiteKey; locale: Locale }) {
  const s = t(locale)
  const publisher = SITES[article.site as SiteKey]
  return (
    <>
      <article>
        <header className="wrap-text pb-8 pt-10 md:pt-20">
          <p className="t-small uppercase tracking-wide text-ink/70">
            <time dateTime={article.publishedAt ?? undefined}>{formatDate(article.publishedAt, locale)}</time> | {s.publishedBy}{' '}
            {publisher.name}
          </p>
          <h1 className="t-h2 mt-4">{article.title}</h1>
          {article.lead && <p className="t-lead mt-6">{article.lead}</p>}
        </header>
        {article.heroImage && (
          <figure className="wrap mb-10">
            <Img media={article.heroImage as Media} priority sizes="(min-width: 72rem) 72rem, 100vw" className="w-full rounded-sm" />
            {(article.heroImage as Media).credit && (
              <figcaption className="t-small mt-2 text-ink/70">Foto: {(article.heroImage as Media).credit}</figcaption>
            )}
          </figure>
        )}
        <div className="wrap-text pb-12">
          <RichText data={article.content} site={site} locale={locale} />
        </div>
      </article>
      <aside className="border-t border-ink/10">
        <ArticleFeedComponent
          block={{ blockType: 'articleFeed', heading: s.related, sites: [site], kind: 'all', limit: 3 }}
          site={site}
          locale={locale}
        />
      </aside>
    </>
  )
}
