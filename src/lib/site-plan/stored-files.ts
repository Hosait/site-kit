/**
 * After an import: are the files that the media and document rows promise where visitors fetch
 * them? A row without its file is a broken image or PDF on the live site that nothing else reports.
 */
import type { Payload } from 'payload'

type Stored = { url?: string | null; sizes?: Record<string, { url?: string | null } | null> | null }
type Exists = (url: string) => Promise<boolean>

const CONCURRENCY = 8
const ROWS_PER_READ = 200

/** Files in object storage have an absolute address; files on local disk are written before their row is. */
function storedUrls(doc: Stored): string[] {
  const urls = [doc.url, ...Object.values(doc.sizes ?? {}).map((s) => s?.url)]
  return urls.filter((u): u is string => typeof u === 'string' && /^https?:\/\//.test(u))
}

/** Whether the file answers. A failure is tried three times, so a passing error does not fail an import. */
export async function urlExists(url: string, opts: { fetch?: typeof fetch; delayMs?: number } = {}): Promise<boolean> {
  const get = opts.fetch ?? fetch
  const delay = opts.delayMs ?? 300
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, delay * attempt))
    try {
      let res = await get(url, { method: 'HEAD', signal: AbortSignal.timeout(15_000) })
      if (res.status === 403 || res.status === 405 || res.status === 501) {
        // Some stores answer HEAD differently from GET: ask for the first byte instead.
        res = await get(url, { headers: { Range: 'bytes=0-0' }, signal: AbortSignal.timeout(15_000) })
        await res.body?.cancel()
      }
      if (res.ok) return true
    } catch {
      // Tried again.
    }
  }
  return false
}

/** Reads the rows back and checks every file address they hold: the file and each image size. */
export async function missingStoredFiles(
  payload: Payload,
  ids: { media: (string | number)[]; documents: (string | number)[] },
  exists: Exists = urlExists,
): Promise<{ checked: number; missing: string[] }> {
  const urls = new Set<string>()
  for (const collection of ['media', 'documents'] as const) {
    for (let i = 0; i < ids[collection].length; i += ROWS_PER_READ) {
      const { docs } = await payload.find({ collection, where: { id: { in: ids[collection].slice(i, i + ROWS_PER_READ) } }, pagination: false, depth: 0 })
      for (const doc of docs) for (const u of storedUrls(doc as unknown as Stored)) urls.add(u)
    }
  }
  const list = [...urls]
  const missing: string[] = []
  let next = 0
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, list.length) }, async () => {
    while (next < list.length) {
      const url = list[next++]
      if (!(await exists(url))) missing.push(url)
    }
  }))
  return { checked: list.length, missing: missing.sort() }
}
