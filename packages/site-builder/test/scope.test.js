import assert from 'node:assert/strict'
import { test } from 'node:test'

import { leftOut, makeScope, MAX_EXCLUDE } from '../src/scope.js'

// The customer's limits: content parts of the site that are not moved or counted (an intranet,
// an archive).
const u = (p) => new URL(`https://www.fjordlys.no${p}`)

test('an excluded path covers itself and what is under it, in any case, but not a longer name', () => {
  const s = makeScope({ exclude: ['/Intranett/', '/arkiv'] })
  assert.deepEqual(s, { exclude: ['/intranett', '/arkiv'] })
  for (const p of ['/intranett', '/intranett/', '/INTRANETT/rutiner', '/arkiv/2019/sak?id=3']) assert.equal(leftOut(s, u(p)), true, p)
  for (const p of ['/', '/arkivet', '/om-oss/arkiv', '/intranettside']) assert.equal(leftOut(s, u(p)), false, p)
})

test('a path that is not a plain site path is refused, as are the whole site and too many paths', () => {
  for (const bad of ['intranett', '/', '/a/../b', '/a b', 'https://other.no/x', '/' + 'a'.repeat(200), '/a?b=1', '/a#b']) {
    assert.throws(() => makeScope({ exclude: [bad] }), /exclude/, bad)
  }
  assert.throws(() => makeScope({ exclude: Array.from({ length: MAX_EXCLUDE + 1 }, (_, i) => `/p${i}`) }), /exclude/)
  assert.deepEqual(makeScope({ exclude: ['/a', '/a/'] }).exclude, ['/a'], 'the same path once')
})

// Review of #31 (Steinar's decision): a shop, a catalogue and a member area are never left out.
test('a shop, cart, catalogue or login path cannot be excluded', () => {
  for (const p of ['/produkter', '/shop/sko', '/handlekurv', '/checkout', '/min-side', '/login', '/products']) {
    assert.throws(() => makeScope({ exclude: [p] }), /shop, catalogue or login path/, p)
  }
  assert.deepEqual(makeScope({ exclude: ['/arkiv', '/intranett'] }).exclude, ['/arkiv', '/intranett'])
})

// Review of #31, round 2: an excluded path written with percent-encoding is the same path.
test('an excluded path matches its percent-encoded form', () => {
  const s = makeScope({ exclude: ['/arkiv'] })
  for (const p of ['/%61rkiv/2019/sak', '/ARKIV', '/%61%72%6B%69%76']) assert.equal(leftOut(s, u(p)), true, p)
})

// Bjørn's review of #31, round 3: an excluded path is written plainly, so the check above sees the
// path it is (//produkter was read as a host name, /%70rodukter not as /produkter).
test('an excluded path with percent-encoding or a double slash is refused', () => {
  for (const bad of ['/%61rkiv', '/%70rodukter', '//produkter', '/arkiv//2019']) assert.throws(() => makeScope({ exclude: [bad] }), /exclude/, bad)
  assert.equal(leftOut(makeScope(), u('/login')), false, 'no limits: nothing left out')
})
