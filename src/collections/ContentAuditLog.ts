import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/siteAccess'
import { AUDIT_RETENTION_DAYS } from '@/lib/editorial/audit'

const nobody = () => false

/**
 * Who changed what, and when: one row per create, change, publication and deletion of content
 * (hooks in src/collections/editorial/audit.ts). Field names only, never their values.
 * Append-only: no one can add, edit or delete a row through the admin or the API. Rows are
 * written by the hooks with the local API, and the nightly job (src/jobs/pruneAuditLog.ts)
 * deletes the old ones. The analytics admin log (`audit-log`) is a separate collection.
 */
export const ContentAuditLog: CollectionConfig = {
  slug: 'content-audit-log',
  labels: { singular: 'Endring', plural: 'Endringslogg' },
  access: { read: adminOnly, create: nobody, update: nobody, delete: nobody },
  admin: {
    group: 'Administrasjon',
    useAsTitle: 'docTitle',
    defaultColumns: ['createdAt', 'actor', 'operation', 'collection', 'docTitle', 'changedFields'],
    description: `Hvem som endret hva og når (bare navn på felt, ikke innholdet). Loggen kan ikke endres; rader eldre enn ${AUDIT_RETENTION_DAYS} dager slettes hver natt.`,
    listSearchableFields: ['docTitle', 'actor', 'collection'],
  },
  defaultSort: '-createdAt',
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', label: 'Bruker' },
    { name: 'actor', type: 'text', label: 'Utført av', index: true, admin: { description: 'E-post på tidspunktet, eller «system» for import og jobber.' } },
    {
      name: 'operation',
      type: 'select',
      label: 'Handling',
      required: true,
      index: true,
      options: [
        { label: 'Opprettet', value: 'create' },
        { label: 'Endret', value: 'update' },
        { label: 'Publisert', value: 'publish' },
        { label: 'Avpublisert', value: 'unpublish' },
        { label: 'Slettet', value: 'delete' },
      ],
    },
    { name: 'collection', type: 'text', label: 'Samling', required: true, index: true },
    { name: 'docId', type: 'text', label: 'Dokument-ID', required: true, index: true },
    { name: 'docTitle', type: 'text', label: 'Dokument' },
    { name: 'site', type: 'text', label: 'Nettsted' },
    { name: 'changedFields', type: 'json', label: 'Endrede felt', admin: { description: 'Navn på feltene som ble endret.' } },
  ],
}
