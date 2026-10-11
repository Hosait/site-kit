import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import type { Tab } from 'payload'

/** SEO-fane: tittel, beskrivelse og delingsbilde per språk. Tomme felt får fornuftige standarder. */
export const seoTab: Tab = {
  name: 'meta',
  label: 'SEO',
  localized: true,
  fields: [
    OverviewField({ titlePath: 'meta.title', descriptionPath: 'meta.description', imagePath: 'meta.image' }),
    MetaTitleField({ hasGenerateFn: true }),
    MetaImageField({ relationTo: 'media' }),
    MetaDescriptionField({}),
    PreviewField({ hasGenerateFn: true, titlePath: 'meta.title', descriptionPath: 'meta.description' }),
    {
      name: 'noindex',
      type: 'checkbox',
      label: 'Skjul for søkemotorer (noindex)',
    },
  ],
}
