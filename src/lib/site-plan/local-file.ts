/**
 * A plan's local media or document path (under seed/), resolved to an ordinary file inside the
 * plan's folder. Symbolic links are followed and the result checked again, so a link cannot
 * bring a file from elsewhere on the server into the site's public media.
 */
import fs from 'node:fs'
import path from 'node:path'

import { sniffMediaType } from './fetch-media'

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

const ALLOWED = {
  media: 'JPEG, PNG, WebP, GIF, AVIF, MP4 or WebM',
  documents: 'PDF, Word, Excel, PowerPoint, zip or DWG',
} as const

/** A document's kind by its first bytes: PDF, zip (also Word, Excel and PowerPoint since 2007), the older Office format, or DWG. */
function documentType(b: Buffer): string | null {
  const at = (offset: number, s: string) => b.length >= offset + s.length && b.toString('latin1', offset, offset + s.length) === s
  if (at(0, '%PDF-')) return 'application/pdf'
  if (at(0, 'PK\x03\x04') || at(0, 'PK\x05\x06')) return 'application/zip'
  if (at(0, '\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1')) return 'application/x-ole-storage'
  if (/^AC10\d\d/.test(b.toString('latin1', 0, 6))) return 'image/vnd.dwg'
  return null
}

/**
 * Why a file from seed/ may not be imported into a collection, or null when it may. The file is
 * judged by its first bytes, as a downloaded one is, never by its name. SVG can carry scripts and
 * is never imported; a site's logo goes in public/brand/ instead.
 */
export async function localFileProblem(collection: 'media' | 'documents', filePath: string, source: string): Promise<string | null> {
  const head = Buffer.alloc(512)
  const fh = await fs.promises.open(filePath, 'r')
  let n: number
  try {
    n = (await fh.read(head, 0, head.length, 0)).bytesRead
  } finally {
    await fh.close()
  }
  const b = head.subarray(0, n)
  const type = collection === 'media' ? sniffMediaType(b) : documentType(b)
  if (type && (collection === 'documents' || /^(image|video)\//.test(type))) return null
  if (/<svg[\s>]/i.test(b.toString('latin1'))) return `${source}: SVG is not imported; put the logo in public/brand/ by hand`
  return `${source}: not an allowed file type for ${collection} (${ALLOWED[collection]})`
}
