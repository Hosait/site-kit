#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

import { crawl } from '../src/crawl.js'
import { extract } from '../src/extract.js'
import { report } from '../src/report.js'
import { theme } from '../src/theme.js'

const HELP = `site-builder <command> [options]

  crawl <url>   Read the site politely and cache its pages (robots.txt, same site, max 500 pages)
  extract       Pull pages, navigation, footer, images and templates out of the cached pages
  theme         Draft site/theme.json colours, fonts and logo from the site's CSS
  report        Write report.md: technology, tracking, templates, quick checks, enhancements

Options:
  --out <dir>        Working folder (default .site-builder/<host> for crawl, required otherwise)
  --max <n>          Page cap for crawl (default 500)
  --budget <min>     Time budget for crawl in minutes (default 15); then it writes what it has
  --allow-private    Allow private and local addresses (for testing and intranet sites)
`

const args = process.argv.slice(2)
const flag = (name) => { const i = args.indexOf(name); return i === -1 ? undefined : args[i + 1] }
const has = (name) => args.includes(name)
const [cmd, target] = args
const usage = (msg) => { if (msg) console.error(msg); console.log(HELP); process.exit(2) }
const positive = (name, fallback, whole = false) => {
  const v = flag(name)
  if (v === undefined) return fallback
  if (!(whole ? /^\d+$/ : /^\d+(\.\d+)?$/).test(v) || !(Number(v) > 0)) usage(`${name} needs a positive ${whole ? 'whole ' : ''}number`)
  return Number(v)
}

try {
  if (cmd === 'crawl') {
    if (!target || target.startsWith('--')) usage('crawl needs a URL')
    const out = flag('--out') ?? path.join('.site-builder', new URL(target).hostname)
    const inv = await crawl(target, { out, maxPages: positive('--max', 500, true), budgetMs: positive('--budget', 15) * 60_000, allowPrivate: has('--allow-private'), log: (s) => console.log(s) })
    console.log(`\n${inv.pages.length} pages, ${inv.media.length} images, ${inv.documents.length} documents → ${out}`)
    for (const n of inv.notes) console.log('note: ' + n)
  } else if (cmd === 'extract' || cmd === 'theme' || cmd === 'report') {
    const out = flag('--out')
    if (!out || !fs.existsSync(path.join(out, 'inventory.json'))) usage(`${cmd} needs --out <dir> pointing at a crawl folder`)
    if (cmd === 'extract') { const m = extract(out); console.log(`${m.pages.length} pages, ${m.templates.length} templates → ${path.join(out, 'extract.json')}`) }
    if (cmd === 'theme') { const t = await theme(out, { allowPrivate: has('--allow-private') }); console.log(JSON.stringify(t.theme.colors)); for (const n of t.notes) console.log('note: ' + n) }
    if (cmd === 'report') { report(out); console.log(`→ ${path.join(out, 'report.md')}`) }
  } else usage(cmd && cmd !== '--help' ? `unknown command: ${cmd}` : undefined)
} catch (e) {
  console.error(e.code === 'EPRIVATE' ? `${e.message}. Use --allow-private only for your own local or intranet sites.` : e.message)
  process.exit(1)
}
