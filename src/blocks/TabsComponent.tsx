import { RichText } from '@/components/RichText'
import { t } from '@/lib/i18n'
import type { TabsBlock } from '@/payload-types'

import type { BlockProps } from './components'
import { Section } from './Section'
import { Tabs } from './TabsClient'

export function TabsComponent({ block, site, locale }: BlockProps<TabsBlock>) {
  const items = block.items ?? []
  if (!items.length) return null
  const tabs = items.map((it, i) => ({
    id: it.id ?? String(i),
    label: it.label,
    panel: <RichText data={it.content} site={site} locale={locale} />,
  }))
  return (
    <Section background={block.background}>
      <div className="wrap">
        {block.heading && <h2 className="t-h3 mb-6">{block.heading}</h2>}
        <Tabs label={block.heading || t(locale).tabsLabel} tabs={tabs} />
      </div>
    </Section>
  )
}
