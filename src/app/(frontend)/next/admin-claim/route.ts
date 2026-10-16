import { CLAIM_COOKIE, CLAIM_TTL_S, claimCookieValue, codeMatches } from '@/lib/admin-claim'

/**
 * Lenken Hosait viser på prosjektsiden for å opprette den første administratoren:
 * /next/admin-claim?code=<ADMIN_CLAIM_SECRET>. Riktig kode gir en signert informasjonskapsel
 * i en time og sender videre til /admin (se src/lib/admin-claim.ts).
 */
export const dynamic = 'force-dynamic'

export async function GET(req: Request): Promise<Response> {
  const secret = process.env.ADMIN_CLAIM_SECRET
  if (!secret) return new Response('Not found', { status: 404 })
  if (!codeMatches(secret, new URL(req.url).searchParams.get('code'))) {
    return new Response('This link is not valid. Open it again from the project page in Hosait.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  }
  const https = (req.headers.get('x-forwarded-proto') ?? new URL(req.url).protocol.replace(':', '')) === 'https'
  const cookie = `${CLAIM_COOKIE}=${claimCookieValue(secret, Date.now())}; Path=/; Max-Age=${CLAIM_TTL_S}; HttpOnly; SameSite=Lax${https ? '; Secure' : ''}`
  return new Response(null, {
    status: 303,
    headers: { Location: '/admin', 'Set-Cookie': cookie, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
  })
}
