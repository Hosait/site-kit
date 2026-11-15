import assert from 'node:assert/strict'
import { test } from 'node:test'

import { urlExists } from '../../src/lib/site-plan/stored-files'

type Reply = number | Error
function fakeFetch(...replies: Reply[]) {
  const calls: { method: string; range?: string }[] = []
  const impl = async (_url: string, init?: RequestInit) => {
    const headers = new Headers(init?.headers)
    calls.push({ method: init?.method ?? 'GET', range: headers.get('range') ?? undefined })
    const r = replies[Math.min(calls.length - 1, replies.length - 1)]
    if (r instanceof Error) throw r
    return new Response(r === 200 || r === 206 ? 'x' : '', { status: r })
  }
  return { impl, calls }
}
const opts = (impl: typeof fetch) => ({ fetch: impl, delayMs: 0 })

test('a file that answers 200 exists', async () => {
  const { impl, calls } = fakeFetch(200)
  assert.equal(await urlExists('https://s3.example/a.jpg', opts(impl as never)), true)
  assert.deepEqual(calls.map((c) => c.method), ['HEAD'])
})

test('a store that refuses HEAD is asked for the first byte instead', async () => {
  const { impl, calls } = fakeFetch(403, 206)
  assert.equal(await urlExists('https://s3.example/a.jpg', opts(impl as never)), true)
  assert.deepEqual(calls, [{ method: 'HEAD' }, { method: 'GET', range: 'bytes=0-0' }].map((c) => ({ range: undefined, ...c })))
})

test('a missing file is reported only after three tries, so a passing error does not fail an import', async () => {
  const gone = fakeFetch(404)
  assert.equal(await urlExists('https://s3.example/a.jpg', opts(gone.impl as never)), false)
  assert.equal(gone.calls.length, 3)
  const flaky = fakeFetch(500, new Error('socket hang up'), 200)
  assert.equal(await urlExists('https://s3.example/a.jpg', opts(flaky.impl as never)), true)
})
