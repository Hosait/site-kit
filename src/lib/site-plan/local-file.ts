/**
 * A plan's local media or document path (under seed/), resolved to an ordinary file inside the
 * plan's folder. Symbolic links are followed and the result checked again, so a link cannot
 * bring a file from elsewhere on the server into the site's public media.
 */
import fs from 'node:fs'
import path from 'node:path'

export async function resolveLocalFile(baseDir: string, source: string): Promise<string> {
  const base = await fs.promises.realpath(baseDir)
  const inside = (p: string) => p.startsWith(base + path.sep)
  const abs = path.resolve(base, source)
  if (!inside(abs)) throw new Error(`${source}: outside the plan's folder`)
  let real: string
  try {
    real = await fs.promises.realpath(abs)
  } catch {
    throw new Error(`${source}: not found in the plan's folder`)
  }
  if (!inside(real)) throw new Error(`${source}: outside the plan's folder`)
  if (!(await fs.promises.lstat(real)).isFile()) throw new Error(`${source}: not a regular file`)
  return real
}
