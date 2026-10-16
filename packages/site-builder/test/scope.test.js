import assert from 'node:assert/strict'
import { test } from 'node:test'

import { leftOut, makeScope, MAX_EXCLUDE } from '../src/scope.js'

// The customer's limits: parts of the site that are never read or moved (an intranet, an
// archive), and the member area, so nothing behind a login is ever requested.
const u = (p) => new URL(`https://www.fjordlys.no${p}`)

test('an excluded path covers itself and what is under it, in any case, but not a longer name', () => {
  const s = makeScope({ exclude: ['/Intranett/', '/arkiv'] })
  assert.deepEqual(s.exclude, ['/intranett', '/arkiv'])
  for (const p of ['/intranett', '/intranett/', '/INTRANETT/rutiner', '/arkiv/2019/sak?id=3']) assert.equal(leftOut(s, u(p)), true, p)
  for (const p of ['/', '/arkivet', '/om-oss/arkiv', '/intranettside']) assert.equal(leftOut(s, u(p)), false, p)
})

test('without the member area, login and «min side» addresses are left out; other pages are not', () => {
  const s = makeScope({ withoutMemberArea: true })
  for (const p of ['/login', '/min-side', '/min-side/faktura', '/my-account', '/konto', '/wp-login.php']) assert.equal(leftOut(s, u(p)), true, p)
  for (const p of ['/medlemmer', '/om-oss', '/kontakt']) assert.equal(leftOut(s, u(p)), false, p)
  assert.equal(leftOut(makeScope(), u('/login')), false, 'no limits: nothing left out')
})

test('a path that is not a plain site path is refused, as are the whole site and too many paths', () => {
  for (const bad of ['intranett', '/', '/a/../b', '/a b', 'https://other.no/x', '/' + 'a'.repeat(200), '/a?b=1', '/a#b']) {
    assert.throws(() => makeScope({ exclude: [bad] }), /exclude/, bad)
  }
  assert.throws(() => makeScope({ exclude: Array.from({ length: MAX_EXCLUDE + 1 }, (_, i) => `/p${i}`) }), /exclude/)
  assert.deepEqual(makeScope({ exclude: ['/a', '/a/'] }).exclude, ['/a'], 'the same path once')
})
