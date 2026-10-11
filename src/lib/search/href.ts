import { siteHref, type SiteKey } from '@/lib/sites'
import type { SearchHit } from './query'

/**
 * Lenke til et søketreff sett fra nettstedet man står på. Sider og artikler på et annet
 * nettsted blir absolutte (eget domene i produksjon, underdomene på staging);
 * dokumenter lenker til fila; personer har ingen egen side.
 */
export function hitHref(hit: Pick<SearchHit, 'kind' | 'site' | 'path'>, current: SiteKey): string | null {
  if (!hit.path) return null
  if (hit.kind === 'document') return hit.path
  return siteHref(hit.site, current, hit.path)
}
