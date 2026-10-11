import type { ServerProps } from 'payload'

import { SearchPanelClient } from './SearchPanelClient'

/**
 * «Søkeindeks» på forsiden i admin: viser antall oppføringer og bygger indeksen på nytt.
 * Indeksen holdes ellers oppdatert automatisk ved hver endring. Bare for administratorer.
 */
export function SearchPanel({ user }: ServerProps) {
  if ((user as { role?: string } | undefined)?.role !== 'admin') return null
  return <SearchPanelClient />
}
