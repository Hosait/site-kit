import type { Block, Field } from 'payload'

import { link } from '@/fields/link'
import { richTextEditor } from '@/fields/richText'

import { background, heading, validateHttpsUrl } from './fields'
import { ICON_OPTIONS } from './iconNames'
import { align } from './variants'

/**
 * Blocks added after the first 19: tabs, pricing, logo wall, testimonials, carousel, table,
 * contact card, newsletter, icon features, banner, button group and divider. Rendering is in
 * TabsComponent, CarouselComponent, MoreComponents and the other files next to this one.
 */

const intro: Field = { name: 'intro', type: 'textarea', label: 'Ingress' }
const optionalLink = (name = 'link', appearance = false) => link({ name, required: false, appearance })

export const Tabs: Block = {
  slug: 'tabs',
  labels: { singular: 'Faner', plural: 'Faner' },
  interfaceName: 'TabsBlock',
  fields: [
    heading,
    {
      name: 'items',
      type: 'array',
      label: 'Faner',
      minRows: 1,
      maxRows: 8,
      fields: [
        { name: 'label', type: 'text', label: 'Fanetittel', required: true },
        { name: 'content', type: 'richText', editor: richTextEditor, label: 'Innhold' },
      ],
    },
    background,
  ],
}

export const Pricing: Block = {
  slug: 'pricing',
  labels: { singular: 'Prisplaner', plural: 'Prisplaner' },
  interfaceName: 'PricingBlock',
  fields: [
    heading,
    intro,
    {
      name: 'plans',
      type: 'array',
      label: 'Planer',
      minRows: 1,
      maxRows: 4,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', label: 'Navn', required: true },
            { name: 'highlighted', type: 'checkbox', label: 'Fremhevet plan', defaultValue: false },
            { name: 'badge', type: 'text', label: 'Merkelapp (tom = «Anbefalt» på den fremhevede)' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'price', type: 'text', label: 'Pris', required: true, admin: { description: 'Som tekst, f.eks. «299 kr» eller «Etter avtale».' } },
            { name: 'period', type: 'text', label: 'Periode', admin: { description: 'F.eks. «per måned».' } },
          ],
        },
        { name: 'description', type: 'textarea', label: 'Kort beskrivelse' },
        {
          name: 'features',
          type: 'array',
          label: 'Hva som er med',
          fields: [{ name: 'text', type: 'text', label: 'Punkt', required: true }],
        },
        optionalLink('link', true),
      ],
    },
    background,
    align,
  ],
}

export const LogoWall: Block = {
  slug: 'logoWall',
  labels: { singular: 'Logoer', plural: 'Logoer' },
  interfaceName: 'LogoWallBlock',
  fields: [
    heading,
    {
      name: 'logos',
      type: 'array',
      label: 'Logoer',
      minRows: 1,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Logo', required: true },
        { name: 'name', type: 'text', label: 'Navn (for skjermlesere)', required: true },
        optionalLink('link'),
      ],
    },
    background,
    align,
  ],
}

export const Testimonials: Block = {
  slug: 'testimonials',
  labels: { singular: 'Uttalelser', plural: 'Uttalelser' },
  interfaceName: 'TestimonialsBlock',
  fields: [
    heading,
    {
      name: 'columns',
      type: 'select',
      label: 'Kolonner',
      defaultValue: '2',
      options: ['1', '2', '3'].map((v) => ({ label: v, value: v })),
    },
    {
      name: 'items',
      type: 'array',
      label: 'Uttalelser',
      minRows: 1,
      fields: [
        { name: 'quote', type: 'textarea', label: 'Uttalelse', required: true },
        { name: 'author', type: 'text', label: 'Navn' },
        { name: 'role', type: 'text', label: 'Tittel og firma' },
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Portrett' },
      ],
    },
    background,
    align,
  ],
}

export const Carousel: Block = {
  slug: 'carousel',
  labels: { singular: 'Karusell', plural: 'Karuseller' },
  interfaceName: 'CarouselBlock',
  fields: [
    heading,
    {
      name: 'slides',
      type: 'array',
      label: 'Lysbilder',
      minRows: 1,
      maxRows: 12,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Bilde', required: true },
        { name: 'heading', type: 'text', label: 'Overskrift' },
        { name: 'text', type: 'textarea', label: 'Tekst' },
        optionalLink('link'),
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'autoplay',
          type: 'checkbox',
          label: 'Bytt lysbilde automatisk',
          defaultValue: false,
          admin: { description: 'Av som standard. Besøkende som ber om mindre bevegelse, får aldri automatisk bytte.' },
        },
        {
          name: 'interval',
          type: 'number',
          label: 'Sekunder per lysbilde',
          defaultValue: 6,
          min: 3,
          max: 30,
          admin: { condition: (_, s) => Boolean(s?.autoplay) },
        },
      ],
    },
    background,
  ],
}

export const Table: Block = {
  slug: 'table',
  labels: { singular: 'Tabell', plural: 'Tabeller' },
  interfaceName: 'TableBlock',
  fields: [
    { name: 'caption', type: 'text', label: 'Tabelltittel', required: true, admin: { description: 'Vises over tabellen og leses opp av skjermlesere.' } },
    {
      name: 'header',
      type: 'array',
      label: 'Overskriftsrad',
      minRows: 1,
      maxRows: 8,
      fields: [{ name: 'text', type: 'text', label: 'Kolonneoverskrift', required: true }],
    },
    {
      name: 'rows',
      type: 'array',
      label: 'Rader',
      fields: [
        {
          name: 'cells',
          type: 'array',
          label: 'Celler (like mange som overskriftene)',
          maxRows: 8,
          fields: [{ name: 'text', type: 'text', label: 'Tekst' }],
        },
      ],
    },
    { name: 'rowHeaders', type: 'checkbox', label: 'Første kolonne er radoverskrift', defaultValue: false },
    background,
  ],
}

export const ContactCard: Block = {
  slug: 'contactCard',
  labels: { singular: 'Kontaktkort', plural: 'Kontaktkort' },
  interfaceName: 'ContactCardBlock',
  fields: [
    heading,
    { name: 'name', type: 'text', label: 'Navn på virksomheten' },
    { name: 'address', type: 'textarea', label: 'Adresse', admin: { description: 'Én linje per adresselinje.' } },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', label: 'Telefon' },
        { name: 'email', type: 'email', label: 'E-post' },
      ],
    },
    {
      name: 'hours',
      type: 'array',
      label: 'Åpningstider',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'days', type: 'text', label: 'Dager', required: true, admin: { width: '40%' } },
            { name: 'time', type: 'text', label: 'Tid', required: true, admin: { width: '60%' } },
          ],
        },
      ],
    },
    {
      name: 'mapUrl',
      type: 'text',
      label: 'Kart: innbyggingsadresse (src)',
      admin: { description: 'Valgfritt. Kartet lastes først når besøkende klikker.' },
      validate: (value: unknown) => validateHttpsUrl(value),
    },
    {
      type: 'row',
      fields: [
        {
          name: 'mapTitle',
          type: 'text',
          label: 'Kart: beskrivelse (for skjermlesere)',
          validate: (value: unknown, { siblingData }: { siblingData: unknown }) =>
            (siblingData as { mapUrl?: string })?.mapUrl && !value ? 'Beskriv kartet for skjermlesere.' : true,
        },
        { name: 'mapHeight', type: 'number', label: 'Kart: høyde (px)', defaultValue: 320, min: 240, max: 900 },
      ],
    },
    background,
  ],
}

export const Newsletter: Block = {
  slug: 'newsletter',
  labels: { singular: 'Nyhetsbrev', plural: 'Nyhetsbrev' },
  interfaceName: 'NewsletterBlock',
  fields: [
    heading,
    { name: 'text', type: 'textarea', label: 'Tekst' },
    {
      name: 'mode',
      type: 'select',
      label: 'Påmelding',
      defaultValue: 'form',
      options: [
        { label: 'Skjema på nettstedet (med e-postfelt)', value: 'form' },
        { label: 'Innebygd skjema fra e-posttjenesten (lastes etter klikk)', value: 'embed' },
      ],
    },
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      label: 'Skjema',
      admin: { condition: (_, s) => s?.mode !== 'embed', description: 'Et skjema med et e-postfelt (se Skjemaer).' },
      validate: (value: unknown, { siblingData }: { siblingData: unknown }) =>
        (siblingData as { mode?: string })?.mode !== 'embed' && !value ? 'Velg skjemaet.' : true,
    },
    {
      name: 'embedUrl',
      type: 'text',
      label: 'Innbyggingsadresse (src)',
      admin: { condition: (_, s) => s?.mode === 'embed', description: 'Fra Mailchimp, Brevo e.l. Lastes først når besøkende klikker.' },
      validate: (value: unknown, { siblingData }: { siblingData: unknown }) =>
        (siblingData as { mode?: string })?.mode === 'embed' && !value ? 'Skriv inn adressen til skjemaet.' : validateHttpsUrl(value),
    },
    {
      type: 'row',
      fields: [
        {
          name: 'embedTitle',
          type: 'text',
          label: 'Beskrivelse (for skjermlesere)',
          admin: { condition: (_, s) => s?.mode === 'embed' },
          validate: (value: unknown, { siblingData }: { siblingData: unknown }) =>
            (siblingData as { mode?: string })?.mode === 'embed' && !value ? 'Beskriv skjemaet for skjermlesere.' : true,
        },
        { name: 'embedHeight', type: 'number', label: 'Høyde (px)', defaultValue: 420, min: 240, max: 900, admin: { condition: (_, s) => s?.mode === 'embed' } },
      ],
    },
    background,
    align,
  ],
}

export const IconFeatures: Block = {
  slug: 'iconFeatures',
  labels: { singular: 'Ikoner og fordeler', plural: 'Ikoner og fordeler' },
  interfaceName: 'IconFeaturesBlock',
  fields: [
    heading,
    intro,
    {
      name: 'columns',
      type: 'select',
      label: 'Kolonner',
      defaultValue: '3',
      options: ['2', '3', '4'].map((v) => ({ label: v, value: v })),
    },
    {
      name: 'items',
      type: 'array',
      label: 'Punkter',
      minRows: 1,
      fields: [
        {
          name: 'icon',
          type: 'select',
          label: 'Ikon',
          defaultValue: 'check',
          options: [...ICON_OPTIONS],
        },
        { name: 'title', type: 'text', label: 'Tittel', required: true },
        { name: 'text', type: 'textarea', label: 'Tekst' },
        optionalLink('link'),
      ],
    },
    background,
    align,
  ],
}

export const Banner: Block = {
  slug: 'banner',
  labels: { singular: 'Varselfelt', plural: 'Varselfelt' },
  interfaceName: 'BannerBlock',
  fields: [
    {
      name: 'variant',
      type: 'select',
      label: 'Type',
      defaultValue: 'info',
      options: [
        { label: 'Informasjon (blå)', value: 'info' },
        { label: 'Advarsel (gul)', value: 'warning' },
        { label: 'Bekreftelse (grønn)', value: 'success' },
      ],
    },
    { name: 'title', type: 'text', label: 'Tittel' },
    { name: 'text', type: 'textarea', label: 'Tekst', required: true },
    optionalLink('link', false),
  ],
}

export const ButtonGroup: Block = {
  slug: 'buttonGroup',
  labels: { singular: 'Knapper', plural: 'Knapper' },
  interfaceName: 'ButtonGroupBlock',
  fields: [
    {
      name: 'links',
      type: 'array',
      label: 'Knapper',
      minRows: 1,
      maxRows: 6,
      fields: [link({ name: 'link' })],
      admin: { initCollapsed: true },
    },
    {
      name: 'justify',
      type: 'select',
      label: 'Plassering',
      defaultValue: 'left',
      options: [
        { label: 'Venstre', value: 'left' },
        { label: 'Midtstilt', value: 'center' },
        { label: 'Høyre', value: 'right' },
      ],
    },
    background,
  ],
}

export const Divider: Block = {
  slug: 'divider',
  labels: { singular: 'Skillelinje eller luft', plural: 'Skillelinjer og luft' },
  interfaceName: 'DividerBlock',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'kind',
          type: 'select',
          label: 'Type',
          defaultValue: 'line',
          options: [
            { label: 'Skillelinje', value: 'line' },
            { label: 'Bare luft', value: 'space' },
          ],
        },
        {
          name: 'size',
          type: 'select',
          label: 'Høyde',
          defaultValue: 'm',
          options: [
            { label: 'Liten', value: 's' },
            { label: 'Middels', value: 'm' },
            { label: 'Stor', value: 'l' },
            { label: 'Ekstra stor', value: 'xl' },
          ],
        },
      ],
    },
  ],
}

/** The twelve new blocks, in the order the editor lists them. */
export const moreBlocks: Block[] = [Tabs, Pricing, LogoWall, Testimonials, Carousel, Table, ContactCard, Newsletter, IconFeatures, Banner, ButtonGroup, Divider]
