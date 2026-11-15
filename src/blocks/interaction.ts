/** Keyboard logic for the tabs and the carousel; pure so it can be tested without a browser. */

export const wrapIndex = (i: number, n: number): number => (n <= 0 ? 0 : ((i % n) + n) % n)

/**
 * The item to move to for a key press in a row of tabs or slides (WAI-ARIA tabs pattern with
 * automatic activation): arrows step and wrap, Home and End jump. `null` for any other key.
 */
export function keyTarget(key: string, current: number, count: number): number | null {
  switch (key) {
    case 'ArrowRight':
      return wrapIndex(current + 1, count)
    case 'ArrowLeft':
      return wrapIndex(current - 1, count)
    case 'Home':
      return 0
    case 'End':
      return Math.max(count - 1, 0)
    default:
      return null
  }
}

/** Seconds between slides, kept between 3 and 30 whatever the editor typed. */
export const slideInterval = (seconds: unknown): number => {
  const n = typeof seconds === 'number' && Number.isFinite(seconds) ? seconds : 6
  return Math.min(Math.max(n, 3), 30)
}

/** A table row padded or cut to `width` cells, so every row lines up under the header. */
export function fitRow(cells: ({ text?: string | null } | null | undefined)[] | null | undefined, width: number): string[] {
  return Array.from({ length: width }, (_, i) => cells?.[i]?.text ?? '')
}

/** `tel:` address from a phone number as people write it («+47 22 33 44 55»). Empty when no digits. */
export function telHref(phone: string | null | undefined): string {
  const digits = (phone ?? '').replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')
  return /\d/.test(digits) ? `tel:${digits}` : ''
}

/** Opening and closing quote marks for the page's language. */
export const quoted = (text: string, locale: string): string => {
  const bare = text.replace(/^[«"“]|[»"”]$/g, '')
  return locale === 'en' ? `“${bare}”` : `«${bare}»`
}
