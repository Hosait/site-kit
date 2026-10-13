/**
 * A plan's local media or document path (under seed/), resolved to an ordinary file inside the
 * plan's folder. Symbolic links are followed and the result checked again, so a link cannot
 * bring a file from elsewhere on the server into the site's public media.
 */
import fs from 'node:fs'
import path from 'node:path'

import { fileTypeFromFile } from 'file-type'
import { validateMimeType } from 'payload/shared'

import { DOCUMENT_MIME_TYPES, MEDIA_MIME_TYPES } from '../upload-types'

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

const KINDS = {
  media: { types: MEDIA_MIME_TYPES, says: 'images, or MP4 or WebM video' },
  documents: { types: DOCUMENT_MIME_TYPES, says: 'PDF, Word, Excel, PowerPoint, zip or DWG' },
} as const

/**
 * Why a file from seed/ may not be imported into a collection, or null when it may. Its type is
 * read from the file the way Payload reads an upload (never from its name) and checked against the
 * collection's own list, so the check and the import agree. SVG can carry scripts and is never
 * imported; a site's logo goes in public/brand/ instead.
 */
export async function localFileProblem(collection: 'media' | 'documents', filePath: string, source: string): Promise<string | null> {
  const type = await fileTypeFromFile(filePath)
  if (type && validateMimeType(type.mime, [...KINDS[collection].types])) return null
  const head = Buffer.alloc(512)
  const fh = await fs.promises.open(filePath, 'r')
  try {
    await fh.read(head, 0, head.length, 0)
  } finally {
    await fh.close()
  }
  if (/<svg[\s>]/i.test(head.toString('latin1'))) return `${source}: SVG is not imported; put the logo in public/brand/ by hand`
  return `${source}: not an allowed file type for ${collection} (${type?.mime ?? 'unknown type'}; ${collection} takes ${KINDS[collection].says})`
}
