/**
 * The launch check's part of the parity gate: when this repository rebuilds an old site (a crawl
 * folder with extract.json under .site-builder/), `site-builder qc` must have passed against the
 * same address the launch check runs against. A site that is not a rebuild has no crawl folder and
 * is not held back.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

type QcResult = { newBase?: string; pass?: boolean; complete?: boolean; checkedAt?: string; summary?: { pages: number; passing: number } }

export function qcGate(root: string, base: string): string[] {
  const dir = path.join(root, '.site-builder')
  if (!existsSync(dir)) return []
  const crawls = readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(path.join(dir, d.name, 'extract.json')))
  if (!crawls.length) return []
  const origin = new URL(base).origin
  const results = crawls.flatMap((d) => {
    const file = path.join(dir, d.name, 'qc.json')
    if (!existsSync(file)) return []
    try {
      return [{ folder: d.name, ...(JSON.parse(readFileSync(file, 'utf8')) as QcResult) }]
    } catch {
      return [{ folder: d.name, pass: false, newBase: undefined }]
    }
  })
  const forThis = results.filter((r) => {
    try { return r.newBase !== undefined && new URL(r.newBase).origin === origin } catch { return false }
  })
  const run = `pnpm site-builder qc --out .site-builder/${crawls[0].name} --new ${origin}`
  if (!forThis.length) return [`The parity check has not been run against ${origin}: ${run}`]
  const failing = forThis.filter((r) => r.pass !== true)
  return failing.map((r) => `The parity check against ${origin} did not pass (.site-builder/${r.folder}/qc.md${r.complete === false ? ', incomplete' : ''}${r.summary ? `, ${r.summary.passing} of ${r.summary.pages} pages pass` : ''}): fix it or list the agreed differences in qc.accept.json, then run ${run}`)
}
