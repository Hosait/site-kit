import themeJson from '@site/theme.json'

import { SITE_CONFIG } from '@/lib/sites'
import { validateTheme } from '@/lib/theme'
import { cn } from '@/utilities/ui'

const { logo } = validateTheme(themeJson)

/** The site's logo from site/theme.json (a file in public/brand/). `tone="white"` for dark backgrounds. */
export function Logo({ className, tone = 'brand' }: { className?: string; tone?: 'brand' | 'white' }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- an SVG logo needs no image optimisation
    <img
      src={logo.src}
      width={logo.width}
      height={logo.height}
      alt={SITE_CONFIG.brand.name}
      className={cn('h-7 w-auto md:h-8', tone === 'white' && 'brightness-0 invert', className)}
    />
  )
}
