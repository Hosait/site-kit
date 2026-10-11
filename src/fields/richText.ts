import {
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  LinkFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

/** Standard rik-tekst: overskrifter h2–h4, lister, lenker (også internt), sitat, tabell og bilder. */
export const richTextEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter((f) => !['heading', 'link'].includes(f.key)),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    LinkFeature({ enabledCollections: ['pages', 'articles', 'documents'] }),
    EXPERIMENTAL_TableFeature(),
    FixedToolbarFeature(),
  ],
})
