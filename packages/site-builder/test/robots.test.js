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
