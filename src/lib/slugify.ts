const TRANSLIT: Record<string, string> = { æ: 'ae', ø: 'o', å: 'a', ä: 'a', ö: 'o', ü: 'u', é: 'e', è: 'e', ß: 'ss' }

/**
 * Normaliserer en slug. Bokstaver utenfor ASCII (æøå) beholdes som standard, fordi
 * mange eksisterende Craft-adresser har dem og må fortsette å virke.
 * Nye slugs fra titler translittereres (`transliterate: true`).
 */
export function slugify(input: string, { transliterate = false } = {}): string {
  let s = input.normalize('NFC').toLowerCase().trim()
  if (transliterate) s = s.replace(/[æøåäöüéèß]/g, (c) => TRANSLIT[c] ?? c)
  return s
    .replace(/['’"«»]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}
