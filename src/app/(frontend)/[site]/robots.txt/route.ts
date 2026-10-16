import { isProduction, isSiteKey, siteOrigin } from '@/lib/sites'

/** robots.txt per domene, med riktig sitemap. Staging stenger alt ute. */
// Svarer per forespørsel (Host avgjør nettsted); dataene bak er cachet i src/lib/data.ts.
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ site: string }> }) {
  const { site } = await params
  if (!isSiteKey(site)) return new Response('Not found', { status: 404 })
  const body = isProduction()
    ? `User-agent: *\nDisallow: /admin\nDisallow: /api\nDisallow: /next\n\nSitemap: ${siteOrigin(site)}/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n`
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
