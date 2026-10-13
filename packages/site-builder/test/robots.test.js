import assert from 'node:assert/strict'
import { test } from 'node:test'

import { parseRobots } from '../src/robots.js'

test('Disallow and Allow use the longest match, and Sitemap lines are collected', () => {
  const r = parseRobots('User-agent: *\nDisallow: /private\nAllow: /private/public\nSitemap: https://x.no/sitemap.xml\n')
  assert.equal(r.allowed('/private/secret'), false)
  assert.equal(r.allowed('/private/public/page'), true)
  assert.equal(r.allowed('/about'), true)
  assert.deepEqual(r.sitemaps, ['https://x.no/sitemap.xml'])
})

test('a group for our agent replaces the * group; * and $ in paths work', () => {
  const text = 'User-agent: *\nDisallow: /\n\nUser-agent: HosaitSiteBuilder\nDisallow: /*.pdf$\n'
  const r = parseRobots(text)
  assert.equal(r.allowed('/about'), true)
  assert.equal(r.allowed('/files/a.pdf'), false)
  assert.equal(r.allowed('/files/a.pdf?x=1'), true)
})

test('an empty or missing robots.txt allows everything; comments are ignored', () => {
  assert.equal(parseRobots('').allowed('/anything'), true)
  assert.equal(parseRobots('# nothing\nUser-agent: *\nDisallow:\n').allowed('/x'), true)
})

test('a pathological wildcard rule is matched in linear time', () => {
  const r = parseRobots('User-agent: *\nDisallow: /*a*a*a*a*a*a*a*a*b\n')
  const t = Date.now()
  assert.equal(r.allowed('/' + 'a'.repeat(5000)), true)
  assert.equal(r.allowed('/aaaaaaaab'), false)
  assert.ok(Date.now() - t < 100, `took ${Date.now() - t} ms`)
})

// --- Hardening ------------------------------------------------------------
test('CR-only line endings are line breaks too', () => {
  const r = parseRobots('User-agent: *\rDisallow: /private\rSitemap: https://x.no/s.xml\r')
  assert.equal(r.allowed('/private/x'), false)
  assert.deepEqual(r.sitemaps, ['https://x.no/s.xml'])
})

test('only an exact product token (any case) or * selects a group; an empty User-agent selects nothing', () => {
  assert.equal(parseRobots('User-agent:\nDisallow: /\n').allowed('/x'), true)
  assert.equal(parseRobots('User-agent: Hosait\nDisallow: /\n').allowed('/x'), true)
  assert.equal(parseRobots('User-agent: hosaitsitebuilder\nDisallow: /\n').allowed('/x'), false)
  assert.equal(parseRobots('User-agent: HosaitSiteBuilder/0.1\nDisallow: /\n').allowed('/x'), false)
  assert.equal(parseRobots('User-agent: HosaitSiteBuilderX\nDisallow: /\n').allowed('/x'), true)
  const r = parseRobots('User-agent:\nDisallow: /a\n\nUser-agent: *\nDisallow: /b\n')
  assert.deepEqual([r.allowed('/a'), r.allowed('/b')], [true, false])
})
