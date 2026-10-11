import { getAllRoutes } from '@/lib/data'
import { HREFLANG, isSiteKey, localePath, SITES, siteOrigin, type Locale } from '@/lib/sites'

/** Sitemap per domene med hreflang-par. Dagens SBS/DWS-sitemaps er tomme; dette retter det. */
// Svarer per forespørsel (Host avgjør nettsted); dataene bak er cachet i src/lib/data.ts.
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ site: string }> }) {
  const { site } = await params
  if (!isSiteKey(site)) return new Response('Not found', { status: 404 })
  const origin = siteOrigin(site)
  const routes = (await getAllRoutes(site)).filter((r) => !r.noindex)

  const url = (r: (typeof routes)[number]) =>
    origin +
    (r.collection === 'pages' ? localePath(r.locale, r.value) : localePath(r.locale, `${SITES[site].articleBase[r.locale]}/${r.value}`))

  const byDoc = new Map<string, typeof routes>()
  for (const r of routes) {
    const key = `${r.collection}:${r.id}`
    byDoc.set(key, [...(byDoc.get(key) ?? []), r])
  }

  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const body = routes
    .map((r) => {
      const siblings = byDoc.get(`${r.collection}:${r.id}`) ?? []
      const links =
        siblings.length > 1
          ? siblings
              .map((s) => `<xhtml:link rel="alternate" hreflang="${HREFLANG[s.locale as Locale]}" href="${esc(url(s))}"/>`)
              .join('')
          : ''
      return `<url><loc>${esc(url(r))}</loc><lastmod>${r.updatedAt}</lastmod>${links}</url>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } })
}
