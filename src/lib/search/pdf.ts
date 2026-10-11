import fs from 'node:fs/promises'
import path from 'node:path'

/** Mest tekst vi tar med per dokument (store kataloger blir ellers tunge å søke i). */
const MAX_CHARS = 200_000

/**
 * Teksten i en PDF fra dokumentbanken. Fila leses fra disk (uploads/documents, volumet på Hosait)
 * eller hentes fra S3 når adressen er absolutt. Gir tom streng hvis noe feiler.
 */
export async function pdfText(file: { filename?: string | null; url?: string | null }): Promise<string> {
  try {
    let data: Uint8Array
    if (file.url && /^https?:\/\//.test(file.url)) {
      const res = await fetch(file.url)
      if (!res.ok) return ''
      data = new Uint8Array(await res.arrayBuffer())
    } else if (file.filename) {
      data = new Uint8Array(await fs.readFile(path.join(process.cwd(), 'uploads/documents', file.filename)))
    } else {
      return ''
    }
    // drizzle-kit (lastes av Payload i push-modus) legger en tellbar `random` på Array.prototype,
    // og da nekter pdf.js å kjøre. Gjør den ikke-tellbar; funksjonen virker som før.
    const random = Object.getOwnPropertyDescriptor(Array.prototype, 'random')
    if (random?.enumerable) Object.defineProperty(Array.prototype, 'random', { ...random, enumerable: false })
    const { extractText, getDocumentProxy } = await import('unpdf')
    const pdf = await getDocumentProxy(data)
    try {
      const { text } = await extractText(pdf, { mergePages: true })
      return text.replace(/\s+/g, ' ').trim().slice(0, MAX_CHARS)
    } finally {
      await pdf.cleanup()
    }
  } catch (err) {
    console.warn(`Søkeindeks: fikk ikke tekst fra ${file.filename}: ${err instanceof Error ? err.message : String(err)}`)
    return ''
  }
}
