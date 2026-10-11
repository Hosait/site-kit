import { sql } from '@payloadcms/db-postgres'
import type { Payload, PayloadRequest } from 'payload'

/**
 * Oppsett for besøksanalyse og kontaktskjema på eksisterende innhold. Trygt å kjøre flere ganger:
 * endrer bare det som mangler. Kjøres av migrasjonen og etter «Legg inn innhold» (seed).
 *
 * 1. Produktgruppe på de øverste produktsidene (arves av undersidene) og på dokumentene.
 * 2. Kontaktskjema (norsk og engelsk) og skjemablokk nederst på kontaktsidene.
 */
type Row = Record<string, unknown>
type SQL = ReturnType<typeof sql>
const run = async (payload: Payload, q: SQL): Promise<Row[]> =>
  (await (payload.db as unknown as { drizzle: { execute: (q: SQL) => Promise<{ rows: Row[] }> } }).drizzle.execute(q)).rows

// [nettsted, sti (norsk), produktgruppe]
const PAGE_GROUPS: [string, string, string][] = [
  ['dws', 'katalog/classic', 'Classic'],
  ['dws', 'katalog/opus', 'Opus'],
  ['dws', 'katalog/swing', 'Swing'],
  ['dws', 'systemlosninger/classic', 'Classic'],
  ['dws', 'systemlosninger/opus', 'Opus'],
  ['dws', 'systemlosninger/swing', 'Swing'],
  ['dws', 'systemlosninger/sidehengt', 'SideHinged'],
  ['dws', 'systemlosninger/topphengt', 'TopHinged'],
  ['sbs', 'fixade', 'FixedFrame'],
  ['sbs', 'fixade-solar', 'FixedFrame'],
]

export async function setProductGroups(payload: Payload) {
  const values = sql.join(
    PAGE_GROUPS.map(([site, path, group]) => sql`(${site}, ${path}, ${group})`),
    sql`, `,
  )
  const pages = await run(
    payload,
    sql`update pages p set product_group = m.g::enum_pages_product_group
        from (values ${values}) as m(site, path, g), pages_locales l
        where l._parent_id = p.id and l._locale = 'no' and l.path = m.path and p.site::text = m.site and p.product_group is null
        returning p.id`,
  )
  // Siste versjon må ha samme verdi, ellers forsvinner den neste gang siden publiseres fra admin.
  await run(
    payload,
    sql`update _pages_v v set version_product_group = p.product_group::text::enum__pages_v_version_product_group
        from pages p where v.parent_id = p.id and v.latest and p.product_group is not null and v.version_product_group is null`,
  )
  // Dokumenter: fra tittelen (norsk, ellers engelsk).
  const docs = await run(
    payload,
    sql`update documents d set product_group = g.group::enum_documents_product_group
        from (
          select d2.id, case
            when t ilike '%fixade%' then 'FixedFrame'
            when t ilike '%opus%' then 'Opus'
            when t ilike '%classic%' then 'Classic'
            when t ilike '%swing%' then 'Swing'
            when t ~* 'sidehengt|side-hung|side hung|side-hinged' then 'SideHinged'
            when t ~* 'topphengt|top-hung|top hung|top-hinged' then 'TopHinged'
          end as group
          from documents d2
          cross join lateral (
            select coalesce(max(title) filter (where _locale = 'no'), max(title)) as t from documents_locales where _parent_id = d2.id
          ) titles
        ) g
        where g.id = d.id and g.group is not null and d.product_group is null
        returning d.id`,
  )
  return { pages: pages.length, documents: docs.length }
}

const lexical = (text: string) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        children: [{ type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }],
      },
    ],
  },
})

const FORMS = {
  no: {
    title: 'Kontaktskjema',
    submitButtonLabel: 'Send',
    confirmation: 'Takk! Vi har mottatt henvendelsen og svarer så snart vi kan.',
    fields: [
      { blockType: 'text', name: 'name', label: 'Navn', required: true, width: 50 },
      { blockType: 'text', name: 'company', label: 'Firma', required: false, width: 50 },
      { blockType: 'email', name: 'email', label: 'E-post', required: true, width: 50 },
      { blockType: 'text', name: 'phone', label: 'Telefon', required: false, width: 50 },
      { blockType: 'textarea', name: 'message', label: 'Hva kan vi hjelpe deg med?', required: true, width: 100 },
      {
        blockType: 'checkbox',
        name: 'consent',
        label: 'Jeg godtar at Spilka lagrer opplysningene for å svare på henvendelsen, som beskrevet i personvernerklæringen.',
        required: true,
        width: 100,
      },
    ],
  },
  en: {
    title: 'Contact form',
    submitButtonLabel: 'Send',
    confirmation: 'Thank you! We have received your enquiry and will reply as soon as we can.',
    fields: [
      { blockType: 'text', name: 'name', label: 'Name', required: true, width: 50 },
      { blockType: 'text', name: 'company', label: 'Company', required: false, width: 50 },
      { blockType: 'email', name: 'email', label: 'Email', required: true, width: 50 },
      { blockType: 'text', name: 'phone', label: 'Phone', required: false, width: 50 },
      { blockType: 'textarea', name: 'message', label: 'How can we help?', required: true, width: 100 },
      {
        blockType: 'checkbox',
        name: 'consent',
        label: 'I agree that Spilka stores this information to reply to my enquiry, as described in the privacy policy.',
        required: true,
        width: 100,
      },
    ],
  },
} as const

export async function ensureContactForms(payload: Payload, req?: PayloadRequest) {
  const ids: Record<'no' | 'en', number> = { no: 0, en: 0 }
  for (const locale of ['no', 'en'] as const) {
    const f = FORMS[locale]
    const existing = await payload.find({ collection: 'forms', where: { title: { equals: f.title } }, limit: 1, depth: 0, req })
    ids[locale] =
      existing.docs[0]?.id ??
      (
        await payload.create({
          collection: 'forms',
          data: {
            title: f.title,
            submitButtonLabel: f.submitButtonLabel,
            confirmationType: 'message',
            confirmationMessage: lexical(f.confirmation) as never,
            fields: f.fields.map((x) => ({ ...x })) as never,
          },
          req,
        })
      ).id
  }

  // Skjemablokk nederst på kontaktsidene (stien «kontakt» eller «contact» på hvert nettsted).
  let placed = 0
  const pages = await run(
    payload,
    sql`select distinct p.id from pages p join pages_locales l on l._parent_id = p.id where l._locale = 'no' and l.path = 'kontakt'`,
  )
  for (const { id } of pages) {
    for (const locale of ['no', 'en'] as const) {
      const page = await payload.findByID({ collection: 'pages', id: Number(id), locale, depth: 0, draft: false, req }).catch(() => null)
      if (!page?.title) continue
      const layout = (page.layout ?? []) as { blockType: string }[]
      if (layout.some((b) => b.blockType === 'formBlock')) continue
      await payload.update({
        collection: 'pages',
        id: Number(id),
        locale,
        data: { layout: [...layout, { blockType: 'formBlock', form: ids[locale], enableIntro: false }] as never, _status: 'published' },
        context: { disableRevalidate: true },
        req,
      })
      placed++
    }
  }
  return { forms: ids, placed }
}
