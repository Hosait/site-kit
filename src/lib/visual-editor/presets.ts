import { defaultsFor, newId, type EditorConfig } from './schema'

/** A Lexical rich-text value with one paragraph per string. */
export function richText(...paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        children: [{ type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }],
      })),
    },
  }
}

const row = (data: Record<string, unknown>) => ({ id: newId(), ...data })

/**
 * Starting content for a new section, in Norwegian, so there is text to click on and replace.
 * Blocks without a preset get the defaults from their schema (site blocks, new kit blocks).
 */
const PRESETS: Record<string, () => Record<string, unknown>> = {
  hero: () => ({ variant: 'text', heading: 'Skriv en tydelig overskrift', text: 'En kort ingress som forteller hva siden handler om.' }),
  content: () => ({ richText: richText('Skriv teksten din her. Klikk på teksten for å endre den.') }),
  textImage: () => ({ heading: 'Overskrift', richText: richText('Fortell litt om bildet og hva du tilbyr.') }),
  fullImage: () => ({ caption: 'Bildetekst' }),
  imageGrid: () => ({ heading: 'Bilder', images: [] }),
  cards: () => ({
    heading: 'Det vi tilbyr',
    items: [1, 2, 3].map((n) => row({ title: `Kort ${n}`, text: 'En kort beskrivelse.' })),
  }),
  childPages: () => ({ heading: 'Les mer' }),
  cta: () => ({ heading: 'Klar for en prat?', text: 'Ta kontakt, så hører du fra oss.', links: [] }),
  quote: () => ({ quote: 'Et godt sitat fra en fornøyd kunde.', author: 'Navn Navnesen', role: 'Tittel' }),
  stats: () => ({
    heading: 'Nøkkeltall',
    items: [row({ value: '25', label: 'år på markedet' }), row({ value: '120', label: 'kunder' }), row({ value: '98 %', label: 'fornøyde' })],
  }),
  facts: () => ({ heading: 'Fakta', items: [row({ label: 'Adresse', value: 'Gateveien 1, 0150 Oslo' })] }),
  articleFeed: () => ({ heading: 'Siste nytt', limit: 3 }),
  people: () => ({ heading: 'Folkene våre' }),
  documents: () => ({ heading: 'Dokumenter' }),
  timeline: () => ({ heading: 'Historien vår', items: [row({ year: '2020', title: 'Starten', text: 'Hva som skjedde.' })] }),
  accordion: () => ({
    heading: 'Spørsmål og svar',
    items: [row({ title: 'Et vanlig spørsmål?', content: richText('Svaret på spørsmålet.') })],
  }),
  video: () => ({ heading: 'Video' }),
  columns: () => ({
    layout: '1-1',
    columns: ['Tekst i første kolonne.', 'Tekst i andre kolonne.'].map((text) => row({ blocks: [{ id: newId(), blockType: 'content', richText: richText(text) }] })),
  }),
  tabs: () => ({
    heading: 'Faner',
    items: [row({ label: 'Første fane', content: richText('Innhold i første fane.') }), row({ label: 'Andre fane', content: richText('Innhold i andre fane.') })],
  }),
  pricing: () => ({
    heading: 'Priser',
    plans: [
      row({ name: 'Basis', price: '990 kr', period: 'per måned', description: 'For deg som skal i gang.', features: [row({ text: 'Det viktigste' }), row({ text: 'Hjelp på e-post' })] }),
      row({ name: 'Pluss', highlighted: true, badge: 'Mest valgt', price: '1 990 kr', period: 'per måned', description: 'For deg som vil ha mer.', features: [row({ text: 'Alt i Basis' }), row({ text: 'Hjelp på telefon' })] }),
    ],
  }),
  logoWall: () => ({ heading: 'Kunder og partnere', logos: [] }),
  testimonials: () => ({
    heading: 'Dette sier kundene',
    items: [row({ quote: 'Et godt sitat fra en fornøyd kunde.', author: 'Navn Navnesen', role: 'Tittel' }), row({ quote: 'Enda et godt ord om oss.', author: 'Kari Nordmann', role: 'Daglig leder' })],
  }),
  carousel: () => ({ heading: 'Bilder', slides: [] }),
  table: () => ({
    caption: 'Tabell',
    header: [row({ text: 'Kolonne 1' }), row({ text: 'Kolonne 2' })],
    rows: [row({ cells: [row({ text: 'Verdi' }), row({ text: 'Verdi' })] })],
  }),
  contactCard: () => ({ heading: 'Kontakt oss', name: 'Firmanavn AS', address: 'Gateveien 1, 0150 Oslo', phone: '22 00 00 00', hours: [row({ days: 'Mandag–fredag', time: '08–16' })] }),
  newsletter: () => ({ heading: 'Nyhetsbrev', text: 'Få nyheter fra oss på e-post.' }),
  iconFeatures: () => ({
    heading: 'Hvorfor velge oss',
    items: [
      row({ icon: 'check', title: 'Enkelt', text: 'En kort forklaring.' }),
      row({ icon: 'clock', title: 'Raskt', text: 'En kort forklaring.' }),
      row({ icon: 'shield', title: 'Trygt', text: 'En kort forklaring.' }),
    ],
  }),
  banner: () => ({ variant: 'info', title: 'Viktig beskjed', text: 'Skriv beskjeden her.' }),
  buttonGroup: () => ({ links: [row({ link: { type: 'custom', url: '/', label: 'Les mer', appearance: 'primary' } })] }),
  freeform: () => ({
    rowHeight: 'm',
    items: [
      freeformItem('shape', { x: 1, y: 1, w: 12, h: 7 }),
      freeformItem('text', { x: 2, y: 2, w: 5, h: 2 }, { text: 'Fri plassering', textStyle: 'heading' }),
      freeformItem('text', { x: 2, y: 4, w: 5, h: 2 }, { text: 'Dra elementene dit du vil ha dem, og endre størrelsen i hjørnet.', textStyle: 'lead' }),
      freeformItem('button', { x: 2, y: 6, w: 3, h: 1 }),
      freeformItem('image', { x: 8, y: 2, w: 4, h: 5 }),
    ],
  }),
}

/** A new element for «Fri plassering» with starting content for its kind. */
export function freeformItem(
  kind: string,
  place: { x: number; y: number; w: number; h: number },
  extra: Record<string, unknown> = {},
): { id: string } & Record<string, unknown> {
  const content: Record<string, Record<string, unknown>> = {
    text: { text: 'Ny tekst', textStyle: 'body', align: 'left', valign: 'top' },
    image: { fit: 'cover' },
    button: { link: { type: 'custom', url: '/', label: 'Les mer', appearance: 'primary' }, align: 'left', valign: 'top' },
    shape: { shapeColor: 'tint', shapeRadius: 'rounded', hideOnMobile: true },
  }
  return row({ kind, ...place, hideOnMobile: false, ...content[kind], ...extra })
}

/** A new block of type `slug`, ready to insert into `layout`. */
export function newBlock(slug: string, cfg: EditorConfig): Record<string, unknown> {
  const def = cfg.blocks[slug]
  return { ...defaultsFor(def?.fields ?? []), ...(PRESETS[slug]?.() ?? {}), id: newId(), blockType: slug }
}

/** Gives a copy of a block (and every nested row and block) new ids, for «Dupliser». */
export function withNewIds<T>(value: T): T {
  if (Array.isArray(value)) return value.map(withNewIds) as T
  if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>
    // Populated media and relations keep their ids; only rows and blocks (string ids) get new ones.
    const isRow = typeof o.id === 'string'
    const copy: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(o)) copy[k] = k === 'id' ? v : withNewIdsDeep(k, v)
    if (isRow) copy.id = newId()
    return copy as T
  }
  return value
}

const withNewIdsDeep = (key: string, v: unknown) => (key === 'root' ? v : withNewIds(v))
