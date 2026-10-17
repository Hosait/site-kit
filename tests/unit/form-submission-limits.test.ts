/* eslint-disable @typescript-eslint/no-explicit-any -- the hook is called with a minimal fake of Payload's arguments */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { NextRequest } from 'next/server'

import { limitSubmissions } from '../../src/collections/formSubmissionHooks'
import { formErrorText } from '../../src/blocks/Form/strings'
import { clientAddress } from '../../src/lib/forms/client-address'
import { ipLimited, MAX_BODY_BYTES, PER_FORM_PER_DAY, PER_IP } from '../../src/lib/forms/limits'
import { config as proxyConfig, proxy } from '../../src/proxy'

// Bjørn's review of #10: POST /api/form-submissions is open to anyone, with no limit on how many
// or how large. A flood of spam would fill the database faster than the nightly job deletes it.
const row = (field: string, value: string) => ({ field, value })
const ok = { form: 1, submissionData: [row('navn', 'Kari'), row('melding', 'Hei')], site: 'main', locale: 'no', pagePath: '/no/kontakt' }

function fakeReq(o: { ip?: string; local?: boolean; user?: object; count?: number } = {}) {
  const counted: any[] = []
  const logs: string[] = []
  const req = {
    payloadAPI: o.local ? 'local' : 'REST',
    user: o.user ?? null,
    headers: new Headers(o.ip ? { 'x-forwarded-for': o.ip } : {}),
    payload: {
      count: async (args: any) => {
        counted.push(args)
        return { totalDocs: o.count ?? 0 }
      },
      logger: { warn: (m: string) => logs.push(m), info: () => {}, error: () => {} },
    },
  }
  return { req, counted, logs }
}
const run = (data: object, req: object, operation = 'create') => (limitSubmissions as any)({ operation, data, req })
const status = (code: number, text: RegExp) => (e: any) => e.status === code && text.test(e.message)

test('a normal submission passes, and the form\'s count looks at the last 24 hours only', async () => {
  const { req, counted } = fakeReq({ ip: '203.0.113.1' })
  assert.deepEqual(await run(ok, req), ok)
  const and = counted[0].where.and
  assert.deepEqual(and[0], { form: { equals: 1 } })
  const since = Date.parse(and[1].createdAt.greater_than)
  assert.ok(Math.abs(Date.now() - 86_400_000 - since) < 5000, and[1].createdAt.greater_than)
})

test('too many fields, a long field name, a long value or a long page address is refused, in the visitor\'s language', async () => {
  const many = Array.from({ length: 51 }, (_, i) => row(`f${i}`, 'x'))
  const cases = [
    { ...ok, submissionData: many },
    { ...ok, submissionData: [row('x'.repeat(101), 'a')] },
    { ...ok, submissionData: [row('melding', 'x'.repeat(10_001))] },
    { ...ok, pagePath: '/' + 'x'.repeat(512) },
    { ...ok, submissionData: 'not a list' },
  ]
  for (const data of cases) await assert.rejects(run(data, fakeReq({ ip: '203.0.113.2' }).req), status(413, /for stort/))
  await assert.rejects(run({ ...cases[0], locale: 'en' }, fakeReq({ ip: '203.0.113.2' }).req), status(413, /too large/))
  assert.deepEqual(await run({ ...ok, submissionData: Array.from({ length: 50 }, (_, i) => row(`f${i}`, 'x'.repeat(10_000))) }, fakeReq({ ip: '203.0.113.3' }).req) !== undefined, true)
})

test('one address may send 10 in 10 minutes; the 11th is refused, other addresses are not', async () => {
  const ip = '198.51.100.7'
  for (let i = 0; i < PER_IP.max; i++) await run(ok, fakeReq({ ip }).req)
  await assert.rejects(run(ok, fakeReq({ ip }).req), status(429, /For mange innsendinger/))
  await run(ok, fakeReq({ ip: '198.51.100.8' }).req)
})

test('the address limit is a window: after 10 minutes the count starts again', () => {
  const ip = '192.0.2.50'
  const t0 = 1_000_000
  for (let i = 0; i < PER_IP.max; i++) assert.equal(ipLimited(ip, t0 + i), false)
  assert.equal(ipLimited(ip, t0 + 100), true)
  assert.equal(ipLimited(ip, t0 + PER_IP.windowMs + 1), false)
})

test('a form that has had 500 submissions in 24 hours takes no more today, and the log says which', async () => {
  const { req, logs } = fakeReq({ ip: '203.0.113.20', count: PER_FORM_PER_DAY })
  await assert.rejects(run(ok, req), status(429, /tar ikke imot flere innsendinger i dag/))
  assert.ok(logs.some((l) => l.includes('form 1') && l.includes(String(PER_FORM_PER_DAY))), JSON.stringify(logs))
  assert.deepEqual(await run(ok, fakeReq({ ip: '203.0.113.21', count: PER_FORM_PER_DAY - 1 }).req), ok)
})

test('the seed and import (local API), signed-in editors and updates are not limited', async () => {
  const huge = { ...ok, submissionData: Array.from({ length: 80 }, (_, i) => row(`f${i}`, 'x')) }
  assert.deepEqual(await run(huge, fakeReq({ local: true, count: 10_000 }).req), huge)
  assert.deepEqual(await run(huge, fakeReq({ ip: '203.0.113.30', user: { id: 1 }, count: 10_000 }).req), huge)
  assert.deepEqual(await run(huge, fakeReq({ ip: '203.0.113.31', count: 10_000 }).req, 'update'), huge)
})

// Payload reads the whole body before any hook runs, so its size is checked in the proxy.
test('the proxy refuses a submission body over 64 KB, or one without a length, before Payload reads it', async () => {
  const post = (path: string, headers: Record<string, string>) =>
    proxy(new NextRequest(`https://kit-demo.hosait.com${path}`, { method: 'POST', headers }))
  for (const path of ['/api/form-submissions', '/api/graphql']) {
    const big = await post(path, { 'content-length': String(MAX_BODY_BYTES + 1), referer: 'https://kit-demo.hosait.com/en/contact' })
    assert.equal(big.status, 413, path)
    assert.match((await big.json()).errors[0].message, /too large/)
    assert.equal((await post(path, {})).status, 411, path)
    assert.equal((await post(path, { 'content-length': '900' })).headers.get('x-middleware-next'), '1', path)
  }
  const get = await proxy(new NextRequest('https://kit-demo.hosait.com/api/form-submissions?limit=10'))
  assert.equal(get.headers.get('x-middleware-next'), '1', 'the admin\'s list is untouched')
  assert.ok(proxyConfig.matcher.includes('/api/:path*'), 'every API path goes through the proxy')
})

// The form showed its own "something went wrong" for every error, so a visitor never learnt why.
// The limits' own messages (413, 429) are shown; anything else keeps the generic text.
test('the form shows the limit\'s message for 413 and 429, and its own text for any other error', () => {
  const generic = 'Noe gikk galt. Prøv igjen, eller send oss en e-post.'
  assert.equal(formErrorText({ status: 429, message: 'For mange innsendinger fra deg på kort tid.' }, generic), 'For mange innsendinger fra deg på kort tid.')
  assert.equal(formErrorText({ status: 413, message: 'Skjemaet er for stort til å sendes.' }, generic), 'Skjemaet er for stort til å sendes.')
  for (const status of [400, 403, 500]) assert.equal(formErrorText({ status, message: 'The following field is invalid: form' }, generic), generic, String(status))
  assert.equal(formErrorText({ status: 429, message: '' }, generic), generic)
})

// Review of #30: the first X-Forwarded-For value is whatever the visitor sends. Hosait's edge (NPM)
// appends the real address, and the worker's ingress appends the edge's internal one, so the
// visitor is the rightmost public address.
test('the visitor is the rightmost public address in X-Forwarded-For, not a value the visitor sent', () => {
  assert.equal(clientAddress('198.51.100.20, 10.50.30.10'), '198.51.100.20')
  assert.equal(clientAddress('1.2.3.4, 198.51.100.20, 10.50.30.10'), '198.51.100.20', 'a forged first value is ignored')
  assert.equal(clientAddress('2a01:4f8::1, ::1'), '2a01:4f8::1')
  assert.equal(clientAddress('::ffff:10.50.30.10'), '10.50.30.10', 'all internal (a local test): the leftmost')
  assert.equal(clientAddress('203.0.113.9'), '203.0.113.9')
  assert.equal(clientAddress(null), 'local')
})

test('a forged X-Forwarded-For neither gets round the address limit nor locks out the address it names', async () => {
  const real = '198.51.100.30'
  for (let i = 0; i < PER_IP.max; i++) await run(ok, fakeReq({ ip: `9.9.9.${i}, ${real}, 10.50.30.10` }).req)
  await assert.rejects(run(ok, fakeReq({ ip: `9.9.9.99, ${real}, 10.50.30.10` }).req), status(429, /For mange innsendinger/))
  assert.deepEqual(await run(ok, fakeReq({ ip: '9.9.9.1, 10.50.30.10' }).req), ok, 'the forged address itself is not locked out')
})

// Review of #30, round 2: Payload's route decodes the path, so /api/form%2Dsubmissions reached it
// past the size check, and it parsed the whole body. The proxy decodes the path the same way.
test('an encoded path to the submissions or GraphQL endpoint gets the same size check', async () => {
  const post = (path: string, headers: Record<string, string>) =>
    proxy(new NextRequest(`https://kit-demo.hosait.com${path}`, { method: 'POST', headers }))
  for (const path of ['/api/form%2Dsubmissions', '/api/%66orm-submissions', '/api/form-submissions/', '/api/%67raphql']) {
    assert.equal((await post(path, { 'content-length': String(MAX_BODY_BYTES + 1) })).status, 413, path)
    assert.equal((await post(path, {})).status, 411, path)
  }
  assert.equal((await post('/api/media/file/my%20logo.png', { 'content-length': String(MAX_BODY_BYTES + 1) })).headers.get('x-middleware-next'), '1', 'other API paths are untouched')
  assert.ok(proxyConfig.matcher.includes('/api/:path*'))
})
