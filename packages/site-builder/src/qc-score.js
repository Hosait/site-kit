// Scores for qc: how closely a new page matches the old one, in content and in pixels. Pure
// functions, so each rule is tested on its own (test/qc-score.test.js).
import path from 'node:path'

import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

import { load } from './html.js'

/** Words of a text or HTML fragment: lower case, letters and digits only. */
export function words(textOrHtml) {
  const text = /<[a-z!/]/i.test(textOrHtml) ? load(textOrHtml).root().text() : String(textOrHtml ?? '')
  return text.toLowerCase().normalize('NFC').match(/[\p{L}\p{N}]+/gu) ?? []
}

/** Dice coefficient over word multisets: 1 when the same words appear as often, 0 when none are shared. */
export function textSimilarity(a, b) {
  const wa = words(a)
  const wb = words(b)
  if (!wa.length && !wb.length) return 1
  const count = new Map()
  for (const w of wa) count.set(w, (count.get(w) ?? 0) + 1)
  let common = 0
  for (const w of wb) {
    const n = count.get(w)
    if (n) { common++; count.set(w, n - 1) }
  }
  return (2 * common) / (wa.length + wb.length)
}

const norm = (s) => words(s).join(' ')

/** Longest common subsequence of two string lists, as the matched pairs of indexes. */
function lcs(a, b) {
  const m = a.length
  const n = b.length
  const t = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1))
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) t[i][j] = a[i] === b[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1])
  const pairs = []
  for (let i = 0, j = 0; i < m && j < n; ) {
    if (a[i] === b[j]) { pairs.push([i, j]); i++; j++ } else if (t[i + 1][j] >= t[i][j + 1]) i++
    else j++
  }
  return pairs
}

/**
 * Headings in order, by text (levels may differ: the kit gives the first section the h1).
 * Score: matched / the longer list; missing are old headings not found in order.
 */
export function headingScore(oldHeadings, newHeadings) {
  const a = oldHeadings.map((h) => norm(h.text)).filter(Boolean)
  const b = newHeadings.map((h) => norm(h.text)).filter(Boolean)
  if (!a.length && !b.length) return { score: 1, missing: [], extra: [] }
  const pairs = lcs(a, b)
  const inA = new Set(pairs.map(([i]) => i))
  const inB = new Set(pairs.map(([, j]) => j))
  return { score: pairs.length / Math.max(a.length, b.length), missing: a.filter((_, i) => !inA.has(i)), extra: b.filter((_, j) => !inB.has(j)) }
}

/**
 * An image's file name without what CMSs add: the extension, a size (-1600x900), a retina or
 * WordPress suffix (@2x, -scaled, -e1690000000), and a number added to keep names unique (-1).
 */
export function imageKey(src) {
  let name
  try { name = decodeURIComponent(path.posix.basename(new URL(src, 'http://x').pathname)) } catch { return '' }
  name = name.toLowerCase().replace(/\.[a-z0-9]{2,5}$/, '')
  for (let i = 0; i < 3; i++) name = name.replace(/(-\d+x\d+|@\dx|-scaled|-e\d{9,}|-\d{1,3})$/, '')
  return name
}

/** Old images found on the new page, by file name (see imageKey) or by the same alt text. */
export function matchImages(oldImages, newImages) {
  const keep = (i) => i.src && !i.src.startsWith('data:')
  const olds = oldImages.filter(keep)
  const pool = newImages.filter(keep).map((i) => ({ key: imageKey(i.src), alt: norm(i.alt), used: false }))
  const missing = []
  for (const o of olds) {
    const key = imageKey(o.src)
    const alt = norm(o.alt)
    const hit = pool.find((p) => !p.used && ((key && p.key === key) || (alt && p.alt === alt)))
    if (hit) hit.used = true
    else missing.push(o.src)
  }
  return { score: olds.length ? (olds.length - missing.length) / olds.length : 1, missing }
}

/** A link as a comparable key: site paths without trailing slash, other links as given. */
function linkKey(href, origin) {
  let u
  try { u = new URL(href) } catch { return null }
  if (u.protocol === 'mailto:' || u.protocol === 'tel:') return u.href.toLowerCase()
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
  const host = u.hostname.replace(/^www\./, '')
  const own = host === new URL(origin).hostname.replace(/^www\./, '')
  const p = (u.pathname.replace(/\/+$/, '') || '/') + u.search
  return own ? `site:${p}` : `ext:${host}${p}`
}

/**
 * Old links found on the new page. A link to the old site counts when the new page links to the
 * same path, or to where the new site moved it (moved: old path → new path).
 */
export function matchLinks(oldLinks, newLinks, { oldOrigin, newOrigin, moved = new Map() }) {
  const have = new Set(newLinks.map((h) => linkKey(h, newOrigin)).filter(Boolean))
  const missing = []
  let total = 0
  for (const href of new Set(oldLinks)) {
    const key = linkKey(href, oldOrigin)
    if (!key) continue
    total++
    if (key.startsWith('site:')) {
      const p = key.slice(5)
      const target = moved.get(p) ?? p
      if (!have.has(`site:${target}`) && !have.has(`site:${p}`)) missing.push(href)
    } else if (!have.has(key)) missing.push(href)
  }
  return { score: total ? (total - missing.length) / total : 1, missing }
}

/** Title, description, share image and canonical: what the old page had, the new one must have. */
export function metaProblems(oldPage, newPage, { expectedPath }) {
  const problems = []
  const same = (a, b) => norm(a) === norm(b)
  // Separators and the site name are written differently by every CMS: compare the words.
  if (oldPage.title && textSimilarity(oldPage.title, newPage.title ?? '') < 1) problems.push(`title «${oldPage.title}» is «${newPage.title ?? ''}»`)
  if (oldPage.description && !same(oldPage.description, newPage.description ?? '')) problems.push('description differs')
  if (oldPage.ogImage && !newPage.ogImage) problems.push('no share image (og:image)')
  if (oldPage.canonical) {
    let p = null
    try { p = newPage.canonical && (new URL(newPage.canonical).pathname.replace(/\/+$/, '') || '/') } catch {}
    const want = expectedPath.replace(/\/+$/, '') || '/'
    if (p !== want) problems.push(`canonical is ${newPage.canonical ?? 'missing'}, expected the path ${want}`)
  }
  return problems
}

/** Nav or footer links ({ label, href }, as extract writes them) as «label → path» keys, old paths translated through moved. */
export function linkListScore(oldItems, newItems, { oldOrigin, newOrigin, moved = new Map() }) {
  const key = (item, origin, translate) => {
    const k = linkKey(item.href, origin)
    if (!k) return null
    const target = k.startsWith('site:') && translate ? `site:${moved.get(k.slice(5)) ?? k.slice(5)}` : k
    return `${norm(item.label)} → ${target}`
  }
  const have = new Set(newItems.map((i) => key(i, newOrigin, false)).filter(Boolean))
  const olds = [...new Set(oldItems.map((i) => key(i, oldOrigin, true)).filter(Boolean))]
  const missing = olds.filter((k) => !have.has(k))
  return { score: olds.length ? (olds.length - missing.length) / olds.length : 1, missing }
}

/**
 * Bands to compare: the stretches between headings both pages have, in order, so a section that
 * moved down does not count as a difference all the way to the bottom.
 * @param {{text: string, y: number}[]} oldBoxes @param {{text: string, y: number}[]} newBoxes
 */
export function bands(oldBoxes, newBoxes, oldHeight, newHeight) {
  const a = oldBoxes.map((b) => norm(b.text))
  const b = newBoxes.map((x) => norm(x.text))
  const cuts = [[0, 0]]
  for (const [i, j] of lcs(a, b)) {
    const y0 = Math.round(oldBoxes[i].y)
    const y1 = Math.round(newBoxes[j].y)
    const [p0, p1] = cuts.at(-1)
    if (y0 > p0 && y1 > p1 && y0 < oldHeight && y1 < newHeight) cuts.push([y0, y1])
  }
  cuts.push([oldHeight, newHeight])
  const out = []
  for (let k = 0; k < cuts.length - 1; k++) out.push({ old: [cuts[k][0], cuts[k + 1][0]], new: [cuts[k][1], cuts[k + 1][1]] })
  return out.filter((band) => band.old[1] > band.old[0] || band.new[1] > band.new[0])
}

/** Copies rows [from, to) of src into a white image of the given height. */
function strip(src, from, to, width, height) {
  const out = new PNG({ width, height })
  out.data.fill(255)
  const w = Math.min(width, src.width)
  for (let y = 0; y < Math.min(to - from, height); y++) {
    const s = ((from + y) * src.width) * 4
    src.data.copy(out.data, y * width * 4, s, s + w * 4)
  }
  return out
}

/**
 * Pixel similarity of two full-page screenshots (PNG buffers), band by band (see bands()); the
 * shorter band of each pair is padded with white, so missing or extra height counts as different.
 * @returns {{ similarity: number, diff: Buffer, width: number, height: number }}
 */
export function visualScore(oldPng, newPng, { oldBoxes = [], newBoxes = [], threshold = 0.1 } = {}) {
  const a = PNG.sync.read(oldPng)
  const b = PNG.sync.read(newPng)
  const width = Math.min(a.width, b.width)
  const parts = bands(oldBoxes, newBoxes, a.height, b.height)
  let differing = 0
  let total = 0
  const diffs = []
  for (const band of parts) {
    const h = Math.max(band.old[1] - band.old[0], band.new[1] - band.new[0])
    if (h <= 0) continue
    const sa = strip(a, band.old[0], band.old[1], width, h)
    const sb = strip(b, band.new[0], band.new[1], width, h)
    const d = new PNG({ width, height: h })
    differing += pixelmatch(sa.data, sb.data, d.data, width, h, { threshold, alpha: 0.2 })
    total += width * h
    diffs.push(d)
  }
  const height = diffs.reduce((s, d) => s + d.height, 0)
  const out = new PNG({ width, height: Math.max(height, 1) })
  let y = 0
  for (const d of diffs) { d.data.copy(out.data, y * width * 4); y += d.height }
  return { similarity: total ? 1 - differing / total : 1, diff: PNG.sync.write(out), width, height }
}
