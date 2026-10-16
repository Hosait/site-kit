import assert from 'node:assert/strict'
import { test } from 'node:test'

import { detect } from '../src/detect.js'

test('trackers, embeds and the CMS are recognised from scripts, iframes and the generator meta tag', () => {
  const html = `<html><head><meta name="Generator" content="Drupal 10 (https://www.drupal.org)">
    <script async src="https://www.googletagmanager.com/gtm.js?id=GTM-X"></script>
    <script>!function(f,b,e,v){}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js')</script></head>
    <body><iframe width="560" src="https://www.youtube-nocookie.com/embed/abc"></iframe>
    <IFRAME src="https://player.vimeo.com/video/1"></IFRAME>
    <iframe loading="lazy" src="https://www.google.co.uk/maps/embed?pb=x"></iframe></body></html>`
  assert.deepEqual(detect.trackers(html), ['Google Tag Manager', 'Meta Pixel'])
  assert.deepEqual(detect.embeds(html), ['YouTube', 'Vimeo', 'Google Maps'])
  assert.deepEqual(detect.cms(html), ['Drupal'])
  assert.deepEqual(detect.cms('<meta name="generator" content="WordPress 6.4">'), ['WordPress'])
  assert.deepEqual(detect.cms('<meta name="generator" content="Craft CMS"><link href="/umbraco/x.css">'), ['Craft CMS', 'Umbraco'])
})

test('a link to a video, a description that names a CMS, or another iframe is not an embed or a CMS', () => {
  const html = '<a href="https://www.youtube.com/watch?v=abc">video</a><iframe src="https://example.com/"></iframe><meta name="description" content="Moving from WordPress">'
  assert.deepEqual(detect.embeds(html), [])
  assert.deepEqual(detect.cms(html), [])
})

test('pages without a closing > or with long runs of a pattern are read in linear time', () => {
  const fill = (unit, size) => unit.repeat(Math.ceil(size / unit.length)).slice(0, size)
  const inputs = [
    fill('<iframe ', 200_000),
    '<iframe src=' + fill('google.', 200_000),
    fill('<meta generator', 20_000),
    '<meta ' + fill('generator ', 200_000),
    fill('connect.facebook.net/', 400_000),
  ]
  const times = inputs.map((html) => {
    const t = Date.now()
    detect.trackers(html)
    detect.embeds(html)
    detect.cms(html)
    return Date.now() - t
  })
  assert.ok(times.every((ms) => ms < 300), `took ${times.join(', ')} ms`)
})
