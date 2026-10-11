import type { ServerProps } from 'payload'

import { SeedPanelClient } from './SeedPanelClient'

/**
 * «Testinnhold» på forsiden i admin: fyller en tom testinstallasjon fra seed/ i repoet.
 * Vises bare for administratorer og aldri i produksjon (SITE_ORIGINS=production).
 */
export function SeedPanel({ user }: ServerProps) {
  if (process.env.SITE_ORIGINS === 'production') return null
  if ((user as { role?: string } | undefined)?.role !== 'admin') return null
  return <SeedPanelClient />
}
