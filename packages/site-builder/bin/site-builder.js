#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

import { assess } from '../src/assess.js'
import { compare } from '../src/compare.js'
import { crawl } from '../src/crawl.js'
import { crawlGate } from '../src/gate.js'
import { extract } from '../src/extract.js'
import { report } from '../src/report.js'
import { theme } from '../src/theme.js'

const HELP = `site-builder <command> [options]

  assess <url>  Check first whether the site fits a Site Kit rebuild: green, yellow or red
                (writes assess.json and assess.md; exits 3 when the site is red, so do not build it)
  crawl <url>   Read the site politely and cache its pages (robots.txt, same site, max 500 pages).
                Starts only after an assess of the same site that is not red; after yellow,
                with --accepted-scope
  extract       Pull pages, navigation, footer, images and templates out of the cached pages
  theme         Draft site/theme.json colours, fonts and logo from the site's CSS
  report        Write report.md: technology, tracking, templates, quick checks, enhancements
  compare       Check every old URL and document on the new site and take old/new screenshots side by side

Exit codes: 0 done (assess: green or yellow), 3 do not build (assess found the site red, or
crawl refused to start), 2 usage error, 1 other error.

Options:
  --out <dir>        Working folder (default .site-builder/<host> for assess and crawl, required otherwise)
  --max <n>          Page cap for crawl (default 500)
  --max-pages <n>    Page cap for assess (default 40)
  --budget <min>     Time budget in minutes (crawl 15, assess 3, compare 10 by default); then it writes what it has
  --accepted-scope   For crawl after a yellow assess, once the customer has accepted its scope
  --new <url>        The new site's address, for compare
  --allow-private    Allow private and local addresses (for testing and intranet sites; compare: the new site only)
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
const isHttp = (s) => { try { return /^https?:$/.test(new URL(s).protocol) } catch { return false } }

try {
  if (cmd === 'assess') {
    if (!target || target.startsWith('--')) usage('assess needs a URL')
    const out = flag('--out') ?? path.join('.site-builder', new URL(target).hostname)
    const r = await assess(target, { out, maxPages: positive('--max-pages', 40, true), budgetMs: positive('--budget', 3) * 60_000, allowPrivate: has('--allow-private'), log: (s) => console.log(s) })
    console.log(`
${r.class.toUpperCase()}: ${r.counts.pagesRead} pages read → ${path.join(out, 'assess.md')}`)
    for (const reason of r.reasons) console.log(`- ${reason.class}: ${reason.text}`)
    for (const n of r.notes) console.log('note: ' + n)
    if (r.class === 'red') process.exitCode = 3
  } else if (cmd === 'crawl') {
    if (!target || target.startsWith('--')) usage('crawl needs a URL')
    const out = flag('--out') ?? path.join('.site-builder', new URL(target).hostname)
    const maxPages = positive('--max', 500, true)
    const budgetMs = positive('--budget', 15) * 60_000
    const refused = crawlGate(out, target, has('--accepted-scope'))
    if (refused) { console.error(refused); process.exit(3) }
    const inv = await crawl(target, { out, maxPages, budgetMs, allowPrivate: has('--allow-private'), log: (s) => console.log(s) })
    console.log(`\n${inv.pages.length} pages, ${inv.media.length} images, ${inv.documents.length} documents → ${out}`)
    for (const n of inv.notes) console.log('note: ' + n)
  } else if (cmd === 'extract' || cmd === 'theme' || cmd === 'report') {
    const out = flag('--out')
    if (!out || !fs.existsSync(path.join(out, 'inventory.json'))) usage(`${cmd} needs --out <dir> pointing at a crawl folder`)
    if (cmd === 'extract') { const m = extract(out); console.log(`${m.pages.length} pages, ${m.templates.length} templates → ${path.join(out, 'extract.json')}`) }
    if (cmd === 'theme') { const t = await theme(out, { allowPrivate: has('--allow-private') }); console.log(JSON.stringify(t.theme.colors)); for (const n of t.notes) console.log('note: ' + n) }
    if (cmd === 'report') { report(out); console.log(`→ ${path.join(out, 'report.md')}`) }
  } else if (cmd === 'compare') {
    const out = flag('--out')
    const newBase = flag('--new')
    if (!out || !fs.existsSync(path.join(out, 'urls.json'))) usage('compare needs --out <dir> pointing at a crawl folder')
    if (!isHttp(newBase)) usage('compare needs --new <http(s) address of the new site>')
    const r = await compare(out, { newBase, allowPrivate: has('--allow-private'), budgetMs: positive('--budget', 10) * 60_000, log: (s) => console.log(s) })
    const fail = r.results.filter((x) => !x.ok).length
    const docFail = r.documents.filter((x) => !x.ok).length
    console.log(`\n${r.results.length} old addresses checked: ${r.results.length - fail} OK, ${fail} fail.`)
    if (r.documents.length) console.log(`${r.documents.length} old documents checked: ${r.documents.length - docFail} OK, ${docFail} fail.`)
    for (const n of r.notes) console.log('note: ' + n)
    console.log(`→ ${path.join(out, 'compare.md')}`)
    if (fail || docFail) process.exit(1)
  } else usage(cmd && cmd !== '--help' ? `unknown command: ${cmd}` : undefined)
} catch (e) {
  console.error(e.code === 'EPRIVATE' ? `${e.message}. Use --allow-private only for your own local or intranet sites.` : e.message)
  process.exit(1)
}
