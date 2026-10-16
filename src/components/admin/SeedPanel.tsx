import type { ServerProps } from 'payload'

import { isProduction } from '@/lib/sites'

import { SeedPanelClient } from './SeedPanelClient'

/**
 * «Testinnhold» på forsiden i admin: fyller en tom testinstallasjon fra seed/ i repoet.
 * Vises bare for administratorer og aldri i produksjon (isProduction i src/lib/sites.ts).
 */
export function SeedPanel({ user }: ServerProps) {
  if (isProduction()) return null
  if ((user as { role?: string } | undefined)?.role !== 'admin') return null
  return <SeedPanelClient />
}
