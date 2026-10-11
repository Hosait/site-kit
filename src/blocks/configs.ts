import type { Block, Field } from 'payload'

import { link, linkArray } from '@/fields/link'
import { richTextEditor } from '@/fields/richText'
import { SITE_OPTIONS } from '@/lib/sites'
import { FormBlock } from './Form/config'

/**
 * Alle blokker redaktører kan bygge sider med. Hver blokk har en React-komponent
 * med samme navn i src/blocks/components/ og registreres i RenderBlocks.tsx.
 */

/** Bakgrunnsfarge for en seksjon; fargene kommer fra site/theme.json. */
const background: Field = {
  name: 'background',
  type: 'select',
  label: 'Bakgrunn',
  defaultValue: 'none',
  options: [
    { label: 'Ingen', value: 'none' },
    { label: 'Lys grå', value: 'muted' },
    { label: 'Lys merkefarge', value: 'tint' },
    { label: 'Mørk', value: 'dark' },
    { label: 'Merkefarge', value: 'brand' },
  ],
}

const heading: Field = { name: 'heading', type: 'text', label: 'Overskrift' }
const eyebrow: Field = { name: 'eyebrow', type: 'text', label: 'Liten tekst over overskriften' }
const eyebrowHighlight: Field = {
  name: 'eyebrowHighlight',
  type: 'text',
  label: 'Uthevet del av den lille teksten',
  admin: { description: 'Vises i blått, f.eks. «WE BUILD A BRIGHTER».' },
}
const columns: Field = {
  name: 'columns',
  type: 'select',
  label: 'Kolonner',
  defaultValue: '3',
  options: ['2', '3', '4'].map((v) => ({ label: v, value: v })),
}

export const Hero: Block = {
  slug: 'hero',
  labels: { singular: 'Toppseksjon', plural: 'Toppseksjoner' },
  interfaceName: 'HeroBlock',
  fields: [
    {
      name: 'variant',
      type: 'select',
      label: 'Variant',
      defaultValue: 'text',
      options: [
        { label: 'Bare tekst (stor overskrift + ingress)', value: 'text' },
        { label: 'Stort bilde med tekst over', value: 'image' },
        { label: 'Tekst og bilde side om side', value: 'split' },
      ],
    },
    eyebrow,
    eyebrowHighlight,
    heading,
    { name: 'text', type: 'textarea', label: 'Ingress' },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      label: 'Bilde eller video',
      admin: { condition: (_, s) => s?.variant !== 'text' },
    },
    linkArray('links', 2),
  ],
}

export const Content: Block = {
  slug: 'content',
  labels: { singular: 'Tekst', plural: 'Tekst' },
  interfaceName: 'ContentBlock',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'width',
          type: 'select',
          label: 'Bredde',
          defaultValue: 'text',
          options: [
            { label: 'Tekstkolonne (lesbar)', value: 'text' },
            { label: 'Bred', value: 'wide' },
          ],
        },
        {
          name: 'align',
          type: 'select',
          label: 'Justering',
          defaultValue: 'left',
          options: [
            { label: 'Venstre', value: 'left' },
            { label: 'Midtstilt', value: 'center' },
          ],
        },
        background,
      ],
    },
    { name: 'richText', type: 'richText', editor: richTextEditor, label: 'Innhold' },
  ],
}

export const TextImage: Block = {
  slug: 'textImage',
  labels: { singular: 'Tekst og bilde', plural: 'Tekst og bilde' },
  interfaceName: 'TextImageBlock',
  fields: [
    eyebrow,
    heading,
    { name: 'richText', type: 'richText', editor: richTextEditor, label: 'Tekst' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Bilde', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'imagePosition',
          type: 'select',
          label: 'Bildeplassering',
          defaultValue: 'left',
          options: [
            { label: 'Venstre', value: 'left' },
            { label: 'Høyre', value: 'right' },
          ],
        },
        {
          name: 'layout',
          type: 'select',
          label: 'Oppsett',
          defaultValue: 'split',
          options: [
            { label: 'Side om side', value: 'split' },
            { label: 'Stort bilde, stor tekst ved siden av', value: 'feature' },
          ],
        },
        background,
      ],
    },
    linkArray('links', 2),
  ],
}

export const FullImage: Block = {
  slug: 'fullImage',
  labels: { singular: 'Bilde', plural: 'Bilder' },
  interfaceName: 'FullImageBlock',
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Bilde', required: true },
    { name: 'caption', type: 'text', label: 'Bildetekst' },
    {
      name: 'size',
      type: 'select',
      label: 'Størrelse',
      defaultValue: 'wide',
      options: [
        { label: 'Tekstkolonne', value: 'text' },
        { label: 'Bred', value: 'wide' },
        { label: 'Hele skjermen', value: 'full' },
      ],
    },
  ],
}

export const ImageGrid: Block = {
  slug: 'imageGrid',
  labels: { singular: 'Bildegalleri', plural: 'Bildegallerier' },
  interfaceName: 'ImageGridBlock',
  fields: [
    heading,
    columns,
    {
      name: 'images',
      type: 'array',
      label: 'Bilder',
      minRows: 1,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text', label: 'Bildetekst' },
      ],
    },
  ],
}

export const Cards: Block = {
  slug: 'cards',
  labels: { singular: 'Kort', plural: 'Kort' },
  interfaceName: 'CardsBlock',
  fields: [
    heading,
    { name: 'intro', type: 'textarea', label: 'Ingress' },
    columns,
    {
      name: 'items',
      type: 'array',
      label: 'Kort',
      fields: [
        { name: 'title', type: 'text', label: 'Tittel', required: true },
        { name: 'text', type: 'textarea', label: 'Tekst' },
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Bilde' },
        link({ name: 'link', required: false, appearance: false }),
      ],
    },
    background,
  ],
}

export const CallToAction: Block = {
  slug: 'cta',
  labels: { singular: 'Handlingsoppfordring', plural: 'Handlingsoppfordringer' },
  interfaceName: 'CallToActionBlock',
  fields: [heading, { name: 'text', type: 'textarea', label: 'Tekst' }, linkArray('links', 2), background],
}

export const Quote: Block = {
  slug: 'quote',
  labels: { singular: 'Sitat', plural: 'Sitater' },
  interfaceName: 'QuoteBlock',
  fields: [
    { name: 'quote', type: 'textarea', label: 'Sitat', required: true },
    { name: 'author', type: 'text', label: 'Navn' },
    { name: 'role', type: 'text', label: 'Tittel' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Portrett' },
    background,
  ],
}

export const Stats: Block = {
  slug: 'stats',
  labels: { singular: 'Nøkkeltall', plural: 'Nøkkeltall' },
  interfaceName: 'StatsBlock',
  fields: [
    heading,
    { name: 'intro', type: 'textarea', label: 'Ingress' },
    {
      name: 'items',
      type: 'array',
      label: 'Tall',
      minRows: 1,
      maxRows: 6,
      fields: [
        { name: 'value', type: 'text', label: 'Tall', required: true },
        { name: 'label', type: 'text', label: 'Forklaring', required: true },
      ],
    },
    {
      name: 'bars',
      type: 'array',
      label: 'Sammenligning (stolper)',
      admin: { description: 'Valgfritt. F.eks. Fixade 50 % mot tradisjonell 100 %.' },
      fields: [
        { name: 'label', type: 'text', label: 'Tekst', required: true },
        { name: 'percent', type: 'number', label: 'Prosent', min: 0, max: 100, required: true },
      ],
    },
    background,
  ],
}

export const Embed: Block = {
  slug: 'embed',
  labels: { singular: 'Kart/innebygd innhold', plural: 'Kart/innebygd innhold' },
  interfaceName: 'EmbedBlock',
  fields: [
    heading,
    {
      name: 'provider',
      type: 'select',
      label: 'Type',
      defaultValue: 'google-maps',
      options: [
        { label: 'Google Maps', value: 'google-maps' },
        { label: 'Annet (iframe)', value: 'other' },
      ],
    },
    { name: 'url', type: 'text', label: 'Innbyggingsadresse (src)', required: true },
    { name: 'title', type: 'text', label: 'Beskrivelse (for skjermlesere)', required: true },
    { name: 'height', type: 'number', label: 'Høyde (px)', defaultValue: 480 },
  ],
}

export const ArticleFeed: Block = {
  slug: 'articleFeed',
  labels: { singular: 'Artikkelstrøm', plural: 'Artikkelstrømmer' },
  interfaceName: 'ArticleFeedBlock',
  fields: [
    heading,
    {
      name: 'sites',
      type: 'select',
      label: 'Hent fra nettsteder',
      hasMany: true,
      options: SITE_OPTIONS,
      admin: { description: 'Tomt = alle nettsteder (felles nyhetsstrøm).' },
    },
    {
      name: 'kind',
      type: 'select',
      label: 'Type',
      defaultValue: 'all',
      options: [
        { label: 'Alle', value: 'all' },
        { label: 'Kunngjøringer', value: 'announcement' },
        { label: 'Fagblogg', value: 'blog' },
      ],
    },
    { name: 'limit', type: 'number', label: 'Antall', defaultValue: 3, min: 1, max: 48 },
    { name: 'paginate', type: 'checkbox', label: 'Vis alle med «Vis flere»', defaultValue: false },
  ],
}

export const People: Block = {
  slug: 'people',
  labels: { singular: 'Personer', plural: 'Personer' },
  interfaceName: 'PeopleBlock',
  fields: [
    heading,
    { name: 'people', type: 'relationship', relationTo: 'people', hasMany: true, label: 'Personer (i rekkefølge)' },
    {
      name: 'layout',
      type: 'select',
      label: 'Visning',
      defaultValue: 'grid',
      options: [
        { label: 'Rutenett med portrett', value: 'grid' },
        { label: 'Kompakt liste', value: 'list' },
      ],
    },
  ],
}

export const Documents: Block = {
  slug: 'documents',
  labels: { singular: 'Dokumentliste', plural: 'Dokumentlister' },
  interfaceName: 'DocumentsBlock',
  fields: [
    heading,
    { name: 'documents', type: 'relationship', relationTo: 'documents', hasMany: true, label: 'Dokumenter' },
  ],
}

export const Timeline: Block = {
  slug: 'timeline',
  labels: { singular: 'Tidslinje', plural: 'Tidslinjer' },
  interfaceName: 'TimelineBlock',
  fields: [
    heading,
    {
      name: 'items',
      type: 'array',
      label: 'Hendelser',
      fields: [
        { name: 'year', type: 'text', label: 'År', required: true },
        { name: 'title', type: 'text', label: 'Tittel' },
        { name: 'text', type: 'textarea', label: 'Tekst' },
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Bilde' },
      ],
    },
  ],
}

export const Accordion: Block = {
  slug: 'accordion',
  labels: { singular: 'Trekkspill (FAQ)', plural: 'Trekkspill' },
  interfaceName: 'AccordionBlock',
  fields: [
    heading,
    {
      name: 'items',
      type: 'array',
      label: 'Punkter',
      fields: [
        { name: 'title', type: 'text', label: 'Tittel', required: true },
        { name: 'content', type: 'richText', editor: richTextEditor, label: 'Innhold' },
      ],
    },
  ],
}

export const Video: Block = {
  slug: 'video',
  labels: { singular: 'Video', plural: 'Videoer' },
  interfaceName: 'VideoBlock',
  fields: [
    heading,
    {
      name: 'url',
      type: 'text',
      label: 'YouTube- eller Vimeo-adresse',
      admin: { description: 'Lastes først når besøkende klikker (ingen sporing før det).' },
    },
    { name: 'file', type: 'upload', relationTo: 'media', label: 'Eller videofil' },
    { name: 'poster', type: 'upload', relationTo: 'media', label: 'Forhåndsbilde' },
  ],
}

export const ChildPages: Block = {
  slug: 'childPages',
  labels: { singular: 'Undersider', plural: 'Undersider' },
  interfaceName: 'ChildPagesBlock',
  fields: [
    heading,
    { name: 'intro', type: 'textarea', label: 'Ingress' },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages',
      label: 'Vis undersidene til',
      admin: { description: 'Tomt = denne siden. Nye undersider dukker opp automatisk.' },
    },
    {
      name: 'depth',
      type: 'select',
      label: 'Nivåer',
      defaultValue: '1',
      options: [
        { label: 'Bare direkte undersider', value: '1' },
        { label: 'To nivåer, gruppert', value: '2' },
      ],
    },
    columns,
  ],
}

export const Facts: Block = {
  slug: 'facts',
  labels: { singular: 'Faktaboks', plural: 'Faktabokser' },
  interfaceName: 'FactsBlock',
  fields: [
    heading,
    {
      name: 'items',
      type: 'array',
      label: 'Fakta',
      minRows: 1,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', label: 'Hva', required: true, admin: { width: '40%' } },
            { name: 'value', type: 'text', label: 'Verdi', required: true, admin: { width: '60%' } },
          ],
        },
      ],
    },
  ],
}

export const pageBlocks: Block[] = [
  Hero,
  Content,
  TextImage,
  FullImage,
  ImageGrid,
  Cards,
  ChildPages,
  CallToAction,
  Quote,
  Stats,
  Facts,
  ArticleFeed,
  People,
  Documents,
  Timeline,
  Accordion,
  Video,
  Embed,
  FormBlock,
]
