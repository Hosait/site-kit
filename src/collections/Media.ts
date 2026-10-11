import type { CollectionConfig, ImageSize } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'

/**
 * Bilder og video. Alle størrelser lages som WebP ved opplasting, slik at serveren
 * aldri skalerer bilder når besøkende ber om dem (Hosait gir oss 1 CPU).
 */
const webp = (name: string, width: number, height?: number): ImageSize => ({
  name,
  width,
  height,
  withoutEnlargement: true,
  formatOptions: { format: 'webp', options: { quality: 78 } },
  ...(height ? { position: 'centre' } : {}),
})

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Bilde/video', plural: 'Bilder og video' },
  folders: true,
  access: { create: authenticated, delete: authenticated, read: anyone, update: authenticated },
  admin: { group: 'Innhold', defaultColumns: ['filename', 'alt', 'updatedAt'] },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alternativ tekst',
      localized: true,
      admin: {
        description:
          'Beskriv hva bildet viser for dem som ikke ser det (universell utforming). Tomt bare for rent dekorative bilder.',
      },
    },
    { name: 'credit', type: 'text', label: 'Fotograf/kreditering' },
  ],
  upload: {
    staticDir: 'uploads/media',
    adminThumbnail: 'thumb',
    focalPoint: true,
    mimeTypes: ['image/*', 'video/mp4', 'video/webm'],
    imageSizes: [
      webp('thumb', 400),
      webp('sm', 768),
      webp('md', 1280),
      webp('lg', 1920),
      webp('xl', 2560),
      webp('og', 1200, 630),
    ],
  },
}
