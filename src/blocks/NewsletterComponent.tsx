import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'

import { t } from '@/lib/i18n'
import type { NewsletterBlock } from '@/payload-types'
import { cn } from '@/utilities/ui'

import type { BlockProps } from './components'
import { ConsentEmbed } from './EmbedComponent'
import { FormBlock } from './Form/Component'
import { Section } from './Section'
import { alignClass } from './variants'

/**
 * Newsletter sign-up: either the e-mail service's own form (an iframe that loads after a click) or one of
 * the site's forms with an e-mail field, which posts to the site itself and loads nothing from outside.
 */
export function NewsletterComponent({ block, locale }: BlockProps<NewsletterBlock>) {
  const form = block.mode !== 'embed' && block.form && typeof block.form === 'object' ? (block.form as unknown as FormType) : null
  const embed = block.mode === 'embed' && block.embedUrl ? block.embedUrl : null
  if (!form && !embed) return null
  return (
    <Section background={block.background}>
      <div className={cn('wrap-text', block.align === 'center' && 'text-center')}>
        {block.heading && <h2 className="t-h2">{block.heading}</h2>}
        {block.text && <p className={cn('t-lead mt-4', alignClass(block.align))}>{block.text}</p>}
        <div className="mt-8 text-left">
          {form && (
            // The form brings its own page-section padding and container; the section around it has them already.
            <div className="[&>div]:p-0">
              <FormBlock form={form} locale={locale} enableIntro={false} />
            </div>
          )}
          {embed && <ConsentEmbed src={embed} title={block.embedTitle || block.heading || t(locale).newsletter} height={block.embedHeight} locale={locale} />}
        </div>
      </div>
    </Section>
  )
}
