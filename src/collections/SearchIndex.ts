import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/siteAccess'

/**
 * Søkeindeks på tvers av alle nettsteder: én rad per dokument og språk.
 * Fylles av src/lib/search/indexer.ts (hooks på sider, artikler, dokumenter og personer)
 * og søkes med Postgres-fulltekst i src/lib/search/query.ts. Ikke redigerbar i admin.
 */
export const SearchIndex: CollectionConfig = {
  slug: 'search-index',
  labels: { singular: 'Søkeoppføring', plural: 'Søkeindeks' },
  admin: { hidden: true, useAsTitle: 'title' },
  access: { read: adminOnly, create: () => false, update: () => false, delete: () => false },
  timestamps: true,
  fields: [
    // `pages:12:no` – samling, ID og språk.
    { name: 'key', type: 'text', required: true, unique: true, index: true },
    { name: 'kind', type: 'text', required: true, index: true },
    { name: 'docId', type: 'number', required: true, index: true },
    { name: 'locale', type: 'text', required: true, index: true },
    // Nettstedet treffet hører til (lenke og merkelapp).
    { name: 'site', type: 'text', required: true },
    // Alle nettsteder treffet vises på, med mellomrom rundt: « main other ».
    { name: 'sites', type: 'text', required: true },
    { name: 'title', type: 'text', required: true },
    { name: 'summary', type: 'textarea' },
    { name: 'body', type: 'textarea' },
    // Sti på nettstedet (/no/...), eller filadresse for dokumenter. Tom for personer.
    { name: 'path', type: 'text' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'date', type: 'date' },
    // Visningsdata som varierer per type (e-post, telefon, dokumenttype, filstørrelse).
    { name: 'extra', type: 'json' },
    // Filnavn og -størrelse for dokumenter: PDF-teksten hentes bare på nytt når fila er endret.
    { name: 'source', type: 'text' },
  ],
}
