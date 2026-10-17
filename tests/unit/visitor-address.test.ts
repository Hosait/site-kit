/* eslint-disable @typescript-eslint/no-explicit-any -- ingest and the event route are called with minimal fakes of Payload and the request */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { POST as postEvent } from '../../src/app/(frontend)/next/a/route'
import { GET as getSearch } from '../../src/app/(frontend)/next/search/route'
import { ingest } from '../../src/lib/analytics/ingest'
import { DEFAULT_SITE } from '../../src/lib/sites'

// Review of #30: search and analytics took the first X-Forwarded-For value as the visitor's
// address, and that value is whatever the visitor sends. They now use the same rule as the form
// limit (src/lib/client-address.ts): the rightmost public address.
const edge = '10.50.30.10'

test('a forged first X-Forwarded-For value neither gets round the search limit nor locks out the address it names', async () => {
  // Without locale and current the route answers 400 after the limit, so no database is needed.
  const searchAs = async (forwardedFor: string) =>
    (await getSearch(new Request('https://kit-demo.hosait.com/next/search?q=x', { headers: { 'x-forwarded-for': forwardedFor } }))).status
  const real = '198.51.100.40'
  for (let i = 0; i < 30; i++) assert.equal(await searchAs(`9.9.9.${i}, ${real}, ${edge}`), 400)
  assert.equal(await searchAs(`9.9.9.99, ${real}, ${edge}`), 429)
  assert.equal(await searchAs(`9.9.9.1, ${edge}`), 400, 'the forged address itself is not limited')
})

test('a forged first X-Forwarded-For value does not get round the analytics limit: the 121st event from one address is dropped unread', async () => {
  const sendAs = async (forwardedFor: string) => {
    let read = false
    const req = { headers: new Headers({ 'x-forwarded-for': forwardedFor }), text: async () => ((read = true), 'not json') }
    assert.equal((await postEvent(req as any)).status, 204)
    return read
  }
  const real = '198.51.100.41'
  for (let i = 0; i < 120; i++) assert.equal(await sendAs(`9.9.${i}.1, ${real}, ${edge}`), true)
  assert.equal(await sendAs(`9.9.9.99, ${real}, ${edge}`), false)
})

test('the analytics visitor is the real address: a forged first X-Forwarded-For value is not a new visitor', async () => {
  const visitors: string[] = []
  const payload = {
    findGlobal: async () => ({ basicWithoutConsent: true }),
    logger: { error: () => {} },
    db: {
      drizzle: {
        execute: async (q: any) => {
          const text = q.queryChunks.map((c: any) => (Array.isArray(c?.value) ? c.value.join('') : '')).join('')
          if (text.includes('select salt')) return { rows: [{ salt: 'test-salt' }] }
          if (text.includes('insert into analytics_events')) visitors.push(q.queryChunks.find((c: unknown) => typeof c === 'string' && c.startsWith('a:')))
          return { rows: [] }
        },
      },
    },
  }
  const visitorOf = async (forwardedFor: string) => {
    const headers = new Headers({
      'x-forwarded-for': forwardedFor,
      'x-real-ip': edge,
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
    })
    assert.deepEqual(await ingest(payload as any, headers, { t: 'pageview', s: DEFAULT_SITE, p: '/no' }), { stored: true })
    return visitors.at(-1)
  }
  const real = await visitorOf(`198.51.100.50, ${edge}`)
  assert.match(String(real), /^a:/)
  assert.equal(await visitorOf(`1.2.3.4, 198.51.100.50, ${edge}`), real, 'a forged first value does not make a new visitor')
  assert.notEqual(await visitorOf(`198.51.100.51, ${edge}`), real, 'another address is another visitor')
})
