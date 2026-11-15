/**
 * node scripts/kit/preflight.mjs   (same as: pnpm kit:preflight)
 *
 * Checks that this machine has every local tool a site move needs, before the move starts.
 * Plain Node with no dependencies, so it runs before `pnpm install` and even without pnpm.
 * It cannot check the Hosait MCP connection: that lives in the AI agent (see AGENTS.md,
 * «Before you start»). Exit code 0 when everything is in place, 1 when something is missing.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * @typedef {{ name: string, ok: boolean, detail: string, fix?: string, who?: 'agent' | 'user' }} Row
 * @typedef {{
 *   nodeVersion: string,
 *   minNode: string,
 *   pnpmMajors: number[],
 *   run: (cmd: string, args: string[]) => string | null,
 *   exists: (path: string) => boolean,
 *   chromium: () => Promise<string | null>,
 * }} Env
 */

/** True when `version` (such as v22.11.0) is `min` or newer, comparing numbers part by part. */
export function atLeast(version, min) {
  const parse = (/** @type {string} */ v) => v.replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0)
  const a = parse(version)
  const b = parse(min)
  for (let i = 0; i < 3; i++) {
    if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) > (b[i] ?? 0)
  }
  return true
}

/**
 * @param {Env} env
 * @returns {Promise<Row[]>}
 */
export async function preflight(env) {
  /** @type {Row[]} */
  const rows = []

  const nodeOk = atLeast(env.nodeVersion, env.minNode)
  rows.push(nodeOk
    ? { name: 'Node.js', ok: true, detail: env.nodeVersion }
    : { name: 'Node.js', ok: false, detail: `${env.nodeVersion} is too old`, fix: `Install Node.js ${env.minNode} or newer (22 LTS is fine): https://nodejs.org`, who: 'user' })

  const pnpm = env.run('pnpm', ['--version'])
  const pnpmMajor = pnpm ? parseInt(pnpm, 10) : NaN
  if (!pnpm) rows.push({ name: 'pnpm', ok: false, detail: 'not found', fix: 'Install pnpm: npm install -g pnpm', who: 'user' })
  else if (!env.pnpmMajors.includes(pnpmMajor)) rows.push({ name: 'pnpm', ok: false, detail: `${pnpm} is not a supported version`, fix: `Install pnpm ${env.pnpmMajors.join(', ')}: npm install -g pnpm`, who: 'user' })
  else rows.push({ name: 'pnpm', ok: true, detail: pnpm })

  rows.push(env.run('git', ['--version'])
    ? { name: 'git', ok: true, detail: 'found' }
    : { name: 'git', ok: false, detail: 'not found', fix: 'Install git: https://git-scm.com/downloads', who: 'user' })

  if (!env.run('docker', ['--version'])) rows.push({ name: 'Docker', ok: false, detail: 'not found', fix: 'Install Docker Desktop: https://www.docker.com/products/docker-desktop', who: 'user' })
  else if (!env.run('docker', ['info'])) rows.push({ name: 'Docker', ok: false, detail: 'installed but not running', fix: 'Start Docker Desktop and wait until it says it is running', who: 'user' })
  else rows.push({ name: 'Docker', ok: true, detail: 'running' })

  const kitInstalled = env.exists('node_modules/@playwright/test/package.json')
  rows.push(kitInstalled
    ? { name: 'Site Kit packages', ok: true, detail: 'installed' }
    : { name: 'Site Kit packages', ok: false, detail: 'not installed', fix: 'pnpm install', who: 'agent' })

  rows.push(env.exists('packages/site-builder/node_modules')
    ? { name: 'site-builder', ok: true, detail: 'installed' }
    : { name: 'site-builder', ok: false, detail: 'not installed', fix: 'pnpm site-builder:install', who: 'agent' })

  const chrome = kitInstalled ? await env.chromium() : null
  if (!kitInstalled) rows.push({ name: 'Chromium for Playwright', ok: false, detail: 'install the Site Kit packages first' })
  else if (!chrome || !env.exists(chrome)) rows.push({ name: 'Chromium for Playwright', ok: false, detail: 'not installed', fix: 'pnpm exec playwright install chromium', who: 'agent' })
  else rows.push({ name: 'Chromium for Playwright', ok: true, detail: 'installed' })

  return rows
}

/**
 * @param {Row[]} rows
 * @returns {{ text: string, code: number }}
 */
export function report(rows) {
  const width = Math.max(...rows.map((r) => r.name.length))
  const lines = ['Site Kit preflight', '']
  for (const r of rows) lines.push(`  ${r.ok ? 'ok     ' : 'MISSING'}  ${r.name.padEnd(width)}  ${r.detail}`)
  const missing = rows.filter((r) => !r.ok)
  if (missing.length === 0) return { text: [...lines, '', 'All set: this machine can do a site move.'].join('\n'), code: 0 }

  const byAgent = missing.filter((r) => r.who === 'agent')
  const byUser = missing.filter((r) => r.who === 'user')
  lines.push('')
  if (byUser.length) lines.push('Ask the user to:', ...byUser.map((r) => `  - ${r.name}: ${r.fix}`))
  if (byAgent.length) lines.push('Run yourself:', ...byAgent.map((r) => `  - ${r.fix}`))
  lines.push('', `${missing.length} missing. Fix ${missing.length === 1 ? 'it' : 'them'}, then run the check again: node scripts/kit/preflight.mjs`)
  return { text: lines.join('\n'), code: 1 }
}

/** @param {string} cmd @param {string[]} args @returns {string | null} */
function run(cmd, args) {
  try {
    const out = execFileSync(cmd, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 15_000,
      shell: process.platform === 'win32',
    })
    return out.trim() || 'ok'
  } catch {
    return null
  }
}

async function chromium() {
  try {
    const { chromium: browser } = await import('@playwright/test')
    return browser.executablePath()
  } catch {
    return null
  }
}

async function main() {
  const root = fileURLToPath(new URL('../../', import.meta.url))
  process.chdir(root)
  const engines = JSON.parse(readFileSync('package.json', 'utf8')).engines ?? {}
  const rows = await preflight({
    nodeVersion: process.version,
    minNode: String(engines.node ?? '>=20.18.1').replace(/^>=\s*/, ''),
    pnpmMajors: [...String(engines.pnpm ?? '^10').matchAll(/\^(\d+)/g)].map((m) => Number(m[1])),
    run,
    exists: existsSync,
    chromium,
  })
  const { text, code } = report(rows)
  console.log(text)
  process.exitCode = code
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main()
