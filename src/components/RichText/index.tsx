import type { DefaultNodeTypes, DefaultTypedEditorState, SerializedLinkNode, SerializedUploadNode } from '@payloadcms/richtext-lexical'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { Img } from '@/components/Img'
import { docPath } from '@/lib/links'
import { isSiteKey, siteHref, type Locale, type SiteKey } from '@/lib/sites'
import type { Document, Media } from '@/payload-types'
import { cn } from '@/utilities/ui'

type Props = {
  data: DefaultTypedEditorState | null | undefined
  site: SiteKey
  locale: Locale
  className?: string
}

/** Rik tekst fra CMS-et med interne lenker løst til riktig nettsted og språk. */
export function RichText({ data, site, locale, className }: Props) {
  if (!data?.root?.children?.length) return null

  const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
    const { value, relationTo } = linkNode.fields.doc ?? {}
    if (!value || typeof value !== 'object') return '#'
    if (relationTo === 'documents') return (value as unknown as Document).url ?? '#'
    const doc = value as { site?: string; path?: string; slug?: string }
    const path = docPath(relationTo as 'pages' | 'articles', doc as never, locale) ?? '#'
    return siteHref(isSiteKey(doc.site) ? doc.site : site, site, path)
  }

  const converters: JSXConvertersFunction<DefaultNodeTypes> = ({ defaultConverters }) => ({
    ...defaultConverters,
    ...LinkJSXConverter({ internalDocToHref }),
    upload: ({ node }) => {
      const value = (node as SerializedUploadNode).value
      if (!value || typeof value !== 'object') return null
      const media = value as Media
      if (media.mimeType?.startsWith('image/')) {
        return (
          <figure className="not-prose my-8">
            <Img media={media} sizes="(min-width: 48rem) 40rem, 100vw" className="w-full rounded-lg" />
            {media.credit && <figcaption className="t-small mt-2 text-night/70">{media.credit}</figcaption>}
          </figure>
        )
      }
      return (
        <a href={media.url ?? '#'} className="link-arrow">
          {media.filename}
        </a>
      )
    },
  })

  return <ConvertRichText data={data} converters={converters} className={cn('prose-spilka', className)} />
}

export default RichText
