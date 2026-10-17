import assert from 'node:assert/strict'
import { test } from 'node:test'
import { NextRequest } from 'next/server'

import { DEFAULT_LOCALE, DEFAULT_SITE } from '../../src/lib/sites'
import { proxy } from '../../src/proxy'

test('/ sends a browser to the default locale when its own locale has no home page', async () => {
  const realFetch = globalThis.fetch
  // The proxy asks the app which locales have a published home page; here only the default does.
  globalThis.fetch = (async (url: string | URL) =>
    String(url).endsWith('/next/home-locales') ? Response.json({ [DEFAULT_SITE]: [DEFAULT_LOCALE] }) : Response.json([])) as typeof fetch
  try {
    const res = await proxy(new NextRequest('http://localhost:3100/', { headers: { 'accept-language': 'en-US,en' } }))
    assert.equal(res.status, 302)
    assert.equal(new URL(res.headers.get('location') ?? '').pathname, `/${DEFAULT_LOCALE}`)
  } finally {
    globalThis.fetch = realFetch
  }
})

// Keep this test last: it moves the clock an hour ahead, past the answer the test above cached.
test('a failed home-page lookup is remembered, so / does not ask again on every visit', async (t) => {
  const realFetch = globalThis.fetch
  let calls = 0
  globalThis.fetch = (async () => {
    calls++
    throw new Error('connection refused')
  }) as typeof fetch
  t.mock.timers.enable({ apis: ['Date'], now: Date.now() + 3_600_000 })
  const visit = () => proxy(new NextRequest('http://localhost:3100/', { headers: { 'accept-language': 'en-US,en' } }))
  try {
    await visit()
    await visit()
    assert.equal(calls, 1)
    t.mock.timers.tick(30_000)
    await visit()
    assert.equal(calls, 2)
  } finally {
    globalThis.fetch = realFetch
  }
})
