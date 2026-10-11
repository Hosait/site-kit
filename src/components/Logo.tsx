import { SITES, type SiteKey } from '@/lib/sites'
import { cn } from '@/utilities/ui'
import { LOGO_PATHS } from './logoPaths'

/** Indeksene til ®-tegnet i LOGO_PATHS; det ligger forskjøvet i originalfila. */
const REGISTERED = new Set([2, 3])

/** Spilka-ordmerket, inline for rask første visning, med divisjonsnavn under for SBS og DWS. */
export function Logo({ site, className, tone = 'brand' }: { site: SiteKey; className?: string; tone?: 'brand' | 'white' }) {
  const { name } = SITES[site]
  return (
    <span className={cn('inline-flex flex-col leading-none', tone === 'white' ? 'text-white' : 'text-blue', className)}>
      <svg viewBox="0 0 111 32" className="h-7 w-auto md:h-8" role="img" aria-label={name} fill="currentColor">
        {LOGO_PATHS.map((d, i) =>
          REGISTERED.has(i) ? (
            <path key={i} d={d} transform="translate(104.490948 7.031760)" />
          ) : (
            <path key={i} d={d} />
          ),
        )}
      </svg>
    </span>
  )
}
