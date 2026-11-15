/**
 * The fixed icon set for the «Ikoner og fordeler» block (names and Norwegian labels). Editors
 * pick from this list; nothing is uploaded. The drawings are in icons.tsx, and a test keeps the
 * two lists equal. Adding an icon here means adding it there and a migration (the choice is a
 * Postgres enum).
 */
export const ICON_OPTIONS = [
  { value: 'check', label: 'Hake' },
  { value: 'star', label: 'Stjerne' },
  { value: 'heart', label: 'Hjerte' },
  { value: 'shield', label: 'Skjold' },
  { value: 'lock', label: 'Lås' },
  { value: 'clock', label: 'Klokke' },
  { value: 'calendar', label: 'Kalender' },
  { value: 'mail', label: 'E-post' },
  { value: 'phone', label: 'Telefon' },
  { value: 'map-pin', label: 'Kartnål' },
  { value: 'users', label: 'Personer' },
  { value: 'home', label: 'Hus' },
  { value: 'tool', label: 'Verktøy' },
  { value: 'lightbulb', label: 'Lyspære' },
  { value: 'chart', label: 'Diagram' },
  { value: 'leaf', label: 'Blad' },
  { value: 'award', label: 'Utmerkelse' },
  { value: 'truck', label: 'Lastebil' },
  { value: 'message', label: 'Melding' },
  { value: 'search', label: 'Søk' },
  { value: 'settings', label: 'Innstillinger' },
  { value: 'zap', label: 'Lyn' },
  { value: 'thumbs-up', label: 'Tommel opp' },
  { value: 'book', label: 'Bok' },
  { value: 'globe', label: 'Globus' },
  { value: 'handshake', label: 'Håndtrykk' },
  { value: 'target', label: 'Blink' },
  { value: 'rocket', label: 'Rakett' },
] as const

export type IconName = (typeof ICON_OPTIONS)[number]['value']
