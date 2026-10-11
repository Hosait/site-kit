import type { CollectionConfig } from 'payload'

import { adminOnly, isAdmin } from '@/access/siteAccess'
import { authenticated } from '@/access/authenticated'
import { SITE_OPTIONS } from '@/lib/sites'
import { audit } from '@/lib/analytics/audit'
import type { User } from '@/payload-types'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Bruker', plural: 'Brukere' },
  access: {
    admin: authenticated,
    create: adminOnly,
    delete: adminOnly,
    read: authenticated,
    // Brukere kan endre seg selv; bare admin kan endre andre.
    update: ({ req: { user }, id }) => isAdmin(user as User | null) || user?.id === id,
  },
  admin: {
    defaultColumns: ['name', 'email', 'role', 'sites'],
    useAsTitle: 'name',
    group: 'Administrasjon',
  },
  auth: true,
  fields: [
    { name: 'name', type: 'text', label: 'Navn' },
    {
      name: 'role',
      type: 'select',
      label: 'Rolle',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Redaktør', value: 'editor' },
      ],
      access: { update: ({ req: { user } }) => isAdmin(user as User | null) },
      saveToJWT: true,
    },
    {
      name: 'sites',
      type: 'select',
      label: 'Nettsteder (redaktør)',
      hasMany: true,
      options: SITE_OPTIONS,
      admin: { condition: (data) => data?.role !== 'admin' },
      access: { update: ({ req: { user } }) => isAdmin(user as User | null) },
      saveToJWT: true,
    },
    {
      name: 'analyticsAccess',
      type: 'checkbox',
      label: 'Tilgang til besøksanalyse',
      defaultValue: false,
      admin: { condition: (data) => data?.role !== 'admin', description: 'Administratorer har alltid tilgang.' },
      access: { update: ({ req: { user } }) => isAdmin(user as User | null) },
      saveToJWT: true,
    },
  ],
  hooks: {
    // Endringer i tilgang til besøksanalysen logges.
    afterChange: [
      async ({ doc, previousDoc, req, operation }) => {
        if (operation === 'update' && Boolean(doc.analyticsAccess) !== Boolean(previousDoc?.analyticsAccess)) {
          await audit(req.payload, req.user, doc.analyticsAccess ? 'Ga tilgang til besøksanalyse' : 'Fjernet tilgang til besøksanalyse', {
            userId: doc.id,
            email: doc.email,
          })
        }
        return doc
      },
    ],
    // Første bruker som opprettes blir administrator.
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', req })
          if (totalDocs === 0) data.role = 'admin'
        }
        return data
      },
    ],
  },
  timestamps: true,
}
