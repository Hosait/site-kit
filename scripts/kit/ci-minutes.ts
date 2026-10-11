/**
 * pnpm spend:ci [owner/repo] [YYYY-MM]
 * Billable GitHub Actions minutes for a month, per OS and per workflow, from `gh api`.
 * GitHub bills each job rounded up to a whole minute. Prices per OS change; record the
 * minutes in the spend ledger and the NOK amount from the GitHub bill.
 */
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

export type Job = { started_at: string | null; completed_at: string | null; labels: string[] }
type Os = 'linux' | 'windows' | 'macos'

export function billableMinutes(job: Job): { os: Os; minutes: number } {
  const label = job.labels.join(' ').toLowerCase()
  const os: Os = label.includes('macos') ? 'macos' : label.includes('windows') ? 'windows' : 'linux'
  if (!job.started_at || !job.completed_at) return { os, minutes: 0 }
  const ms = Date.parse(job.completed_at) - Date.parse(job.started_at)
  return { os, minutes: ms > 0 ? Math.ceil(ms / 60_000) : 0 }
}

export function summarise(jobs: Job[]): Record<Os, number> {
  const out: Record<Os, number> = { linux: 0, windows: 0, macos: 0 }
  for (const j of jobs) {
    const { os, minutes } = billableMinutes(j)
    out[os] += minutes
  }
  return out
}

const gh = (args: string[]) => execFileSync('gh', ['api', ...args], { encoding: 'utf8', maxBuffer: 1 << 26 })

function main() {
  const repo = process.argv[2] || 'Hosait/site-kit'
  const month = process.argv[3] || new Date().toISOString().slice(0, 7)
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo) || !/^\d{4}-\d{2}$/.test(month)) throw new Error('Usage: pnpm spend:ci [owner/repo] [YYYY-MM]')
  const [y, m] = month.split('-').map(Number)
  const end = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10)
  const runs = gh(['--paginate', `repos/${repo}/actions/runs?per_page=100&created=${month}-01..${end}`, '--jq', '.workflow_runs[] | "\\(.id)\\t\\(.name)"'])
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((l) => l.split('\t'))
  const byWorkflow: Record<string, Job[]> = {}
  for (const [id, name] of runs) {
    const jobs = JSON.parse(gh([`repos/${repo}/actions/runs/${id}/jobs?per_page=100`, '--jq', '[.jobs[] | {started_at, completed_at, labels}]'])) as Job[]
    ;(byWorkflow[name] ??= []).push(...jobs)
  }
  const all = Object.values(byWorkflow).flat()
  console.log(`${repo} ${month}: ${runs.length} runs`)
  for (const [name, jobs] of Object.entries(byWorkflow)) console.log(`  ${name}: ${JSON.stringify(summarise(jobs))}`)
  console.log(`  total: ${JSON.stringify(summarise(all))}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
