import { NavGroup } from '@payloadcms/ui'
import type { ServerProps } from 'payload'

import { hasAnalyticsAccess } from '@/collections/Analytics'

const LINKS = [
  { tab: '', label: 'Oversikt' },
  { tab: 'sources', label: 'Besøkende og trafikkilder' },
  { tab: 'behaviour', label: 'Sider og brukeratferd' },
  { tab: 'conversions', label: 'Konverteringer' },
  { tab: 'reports', label: 'Rapporter' },
  { tab: 'settings', label: 'Innstillinger og cookies' },
]

/** Menygruppen «Besøksanalyse» i admin. Vises bare for brukere med tilgang. */
export function AnalyticsNav({ user }: ServerProps) {
  if (!hasAnalyticsAccess(user)) return null
  return (
    <NavGroup label="Besøksanalyse">
      {LINKS.map((l) => (
        <a key={l.tab} href={`/admin/analytics${l.tab ? `?tab=${l.tab}` : ''}`} className="nav__link">
          <span className="nav__link-label">{l.label}</span>
        </a>
      ))}
    </NavGroup>
  )
}
