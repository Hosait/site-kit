import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { CLAIM_COOKIE, claimCookieValue, claimValid, codeMatches, firstUserAllowed } from '../../src/lib/admin-claim'
import { NextRequest } from 'next/server'

import { GET } from '../../src/app/(frontend)/next/admin-claim/route'
import { Users } from '../../src/collections/Users'
import { config as proxyConfig, proxy } from '../../src/proxy'

// Until the first user exists, /admin lets anyone create one. On Hosait the site has a
// generated ADMIN_CLAIM_SECRET, and only a browser that opened the claim link may.
const SECRET = 'a'.repeat(64)
const NOW = 1_800_000_000_000

test('the claim code must be the secret, compared whole', () => {
  assert.equal(codeMatches(SECRET, SECRET), true)
  for (const bad of [null, '', 'a', SECRET.slice(1), SECRET + 'a', 'b'.repeat(64)]) assert.equal(codeMatches(SECRET, bad), false, String(bad))
})

test('the claim cookie is valid for an hour, for this secret only, and cannot be edited', () => {
  const v = claimCookieValue(SECRET, NOW)
  assert.equal(claimValid(SECRET, v, NOW), true)
  assert.equal(claimValid(SECRET, v, NOW + 59 * 60_000), true)
  assert.equal(claimValid(SECRET, v, NOW + 61 * 60_000), false, 'expired')
  assert.equal(claimValid('b'.repeat(64), v, NOW), false, 'another secret')
  const [exp, sig] = v.split('.')
  assert.equal(claimValid(SECRET, `${Number(exp) + 3_600_000}.${sig}`, NOW + 61 * 60_000), false, 'a later expiry needs a new signature')
  assert.equal(claimValid(SECRET, undefined, NOW), false)
  assert.equal(claimValid(SECRET, 'garbage', NOW), false)
})

test('without a secret (local development) anyone may create the first user, as before', () => {
  assert.equal(firstUserAllowed({ secret: '', cookieHeader: null, nowMs: NOW }), true)
  assert.equal(firstUserAllowed({ secret: undefined, cookieHeader: null, nowMs: NOW }), true)
})

test('with a secret, only a request carrying the claim cookie may', () => {
  const cookie = `consent=1; ${CLAIM_COOKIE}=${claimCookieValue(SECRET, NOW)}; other=x`
  assert.equal(firstUserAllowed({ secret: SECRET, cookieHeader: cookie, nowMs: NOW }), true)
  assert.equal(firstUserAllowed({ secret: SECRET, cookieHeader: 'consent=1', nowMs: NOW }), false)
  assert.equal(firstUserAllowed({ secret: SECRET, cookieHeader: null, nowMs: NOW }), false)
})

const firstUserHook = Users.hooks!.beforeChange![0]
function fakeReq(users: number, payloadAPI: string, cookie?: string) {
  return {
    payloadAPI,
    headers: new Headers(cookie ? { cookie } : {}),
    payload: { count: async () => ({ totalDocs: users }) },
  }
}
const run = (req: ReturnType<typeof fakeReq>) =>
  (firstUserHook as unknown as (a: unknown) => Promise<Record<string, unknown>>)({ data: { email: 'x@example.com' }, operation: 'create', req })

test('the first user over HTTP is refused without the claim cookie, and made admin with it', async () => {
  process.env.ADMIN_CLAIM_SECRET = SECRET
  try {
    await assert.rejects(run(fakeReq(0, 'REST')), (e: { status?: number; message?: string }) => e.status === 403 && /Hosait/.test(e.message ?? ''))
    const cookie = `${CLAIM_COOKIE}=${claimCookieValue(SECRET, Date.now())}`
    assert.equal((await run(fakeReq(0, 'REST', cookie))).role, 'admin')
    assert.equal((await run(fakeReq(0, 'local'))).role, 'admin', 'server scripts (Local API) are not asked')
    assert.equal((await run(fakeReq(1, 'REST'))).role, undefined, 'later users are created by an admin as before')
  } finally {
    delete process.env.ADMIN_CLAIM_SECRET
  }
})

test('the claim link sets the cookie and opens the admin; a wrong code gets nothing', async () => {
  process.env.ADMIN_CLAIM_SECRET = SECRET
  try {
    const ok = await GET(new Request(`https://kit-demo.hosait.com/next/admin-claim?code=${SECRET}`, { headers: { 'x-forwarded-proto': 'https' } }))
    assert.equal(ok.status, 303)
    assert.equal(ok.headers.get('location'), '/admin')
    const set = ok.headers.get('set-cookie') ?? ''
    assert.match(set, new RegExp(`^${CLAIM_COOKIE}=\\d+\\.[0-9a-f]{64}; `))
    for (const attr of ['Path=/', 'Max-Age=3600', 'HttpOnly', 'SameSite=Lax', 'Secure']) assert.ok(set.includes(attr), attr)
    assert.equal(ok.headers.get('cache-control'), 'no-store')

    const bad = await GET(new Request('https://kit-demo.hosait.com/next/admin-claim?code=nope'))
    assert.equal(bad.status, 403)
    assert.equal(bad.headers.get('set-cookie'), null)
  } finally {
    delete process.env.ADMIN_CLAIM_SECRET
  }
  const off = await GET(new Request(`https://kit-demo.hosait.com/next/admin-claim?code=${SECRET}`))
  assert.equal(off.status, 404, 'no secret: nothing to claim')
})

// The admin's own form only gets a silent 403 from the API, so the page itself explains
// where the link is when it cannot be used.
test('the create-first-user page says where the link is, unless the claim cookie is there', async () => {
  const page = (cookie?: string) =>
    proxy(new NextRequest('http://localhost:3101/admin/create-first-user', { headers: cookie ? { cookie } : {} }))
  const realFetch = globalThis.fetch
  globalThis.fetch = (async () => Response.json({ initialized: false })) as unknown as typeof fetch
  process.env.ADMIN_CLAIM_SECRET = SECRET
  try {
    const blocked = await page()
    assert.equal(blocked.status, 403)
    assert.match(blocked.headers.get('content-type') ?? '', /text\/html/)
    assert.match(await blocked.text(), /Neste steg|Next steps/)
    const open = await page(`${CLAIM_COOKIE}=${claimCookieValue(SECRET, Date.now())}`)
    assert.equal(open.headers.get('x-middleware-next'), '1')
  } finally {
    globalThis.fetch = realFetch
    delete process.env.ADMIN_CLAIM_SECRET
  }
  assert.equal((await page()).headers.get('x-middleware-next'), '1', 'no secret: the page is open as before')
  assert.ok(proxyConfig.matcher.includes('/admin/create-first-user'))
})

// Bjørn's review: once the site has users, the page still said "create it from Hosait" with a 403.
// The proxy asks Payload (GET /api/users/init) and sends people to the sign-in instead.
test('once a user exists, the create-first-user page sends people to /admin to sign in', async () => {
  const realFetch = globalThis.fetch
  const asked: string[] = []
  const init = (answer: boolean | 'down') => {
    globalThis.fetch = (async (url: string | URL) => {
      asked.push(String(url))
      if (answer === 'down') throw new Error('connect ECONNREFUSED')
      return Response.json({ initialized: answer })
    }) as typeof fetch
  }
  const page = () => proxy(new NextRequest('https://kit-demo.hosait.com/admin/create-first-user'))
  process.env.ADMIN_CLAIM_SECRET = SECRET
  try {
    init(true)
    const signIn = await page()
    assert.equal(signIn.status, 303)
    assert.equal(signIn.headers.get('location'), 'https://kit-demo.hosait.com/admin')
    assert.match(asked[0], /^http:\/\/127\.0\.0\.1:\d+\/api\/users\/init$/)
    init(false)
    assert.equal((await page()).status, 403, 'no users yet: the explanation')
    init('down')
    assert.equal((await page()).status, 403, 'no answer: the explanation, as before')
  } finally {
    globalThis.fetch = realFetch
    delete process.env.ADMIN_CLAIM_SECRET
  }
})

test('Hosait generates the secret and hands it to the web service', () => {
  const env = JSON.parse(readFileSync('hosait.json', 'utf8')).env as { name: string; required?: boolean; generate?: string }[]
  const row = env.find((e) => e.name === 'ADMIN_CLAIM_SECRET')
  assert.ok(row && row.required === true && row.generate === 'hex32')
  assert.match(readFileSync('docker-compose.hosait.yml', 'utf8'), /ADMIN_CLAIM_SECRET: \$\{ADMIN_CLAIM_SECRET\}/)
})
