/** The visual editor talks to Payload's REST API, so access control and hooks apply as in the form. */
export type Block = Record<string, unknown> & { id?: string; blockType: string }
export type PageDoc = { id: number; title?: string | null; layout?: Block[] | null; _status?: 'draft' | 'published' | null; workflow?: string | null }
export type MediaDoc = { id: number; url?: string | null; alt?: string | null; filename?: string | null; sizes?: Record<string, { url?: string | null } | undefined> }

type Errors = { errors?: { message?: string; data?: { errors?: { message?: string; label?: string; path?: string }[] } }[] }

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...init })
  const body = (await res.json().catch(() => ({}))) as T & Errors
  if (!res.ok) {
    const first = body.errors?.[0]
    const detail = first?.data?.errors?.map((e) => e.label ?? e.path ?? e.message).filter(Boolean).join(', ')
    throw new Error(detail ? `${first?.message ?? 'Feil'}: ${detail}` : (first?.message ?? `Feil ${res.status}`))
  }
  return body
}

const qs = (params: Record<string, string | number | undefined>) =>
  new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])).toString()

/** The latest draft, with media and relations populated one level (the editor shows them). */
export const loadPage = (id: number, locale: string) =>
  call<PageDoc>(`/api/pages/${id}?${qs({ draft: 'true', depth: 1, locale })}`)

/** Saves a draft. `autosave` updates the current autosave version instead of adding one per change. */
export const saveDraft = (id: number, locale: string, data: { title?: string; layout: Block[] }) =>
  call<{ doc: PageDoc }>(`/api/pages/${id}?${qs({ draft: 'true', autosave: 'true', depth: 0, locale })}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  })

export const publish = (id: number, locale: string, data: { title?: string; layout: Block[] }) =>
  call<{ doc: PageDoc }>(`/api/pages/${id}?${qs({ depth: 0, locale })}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...data, _status: 'published' }),
  })

/** «Send til godkjenning»: the editorial workflow's own endpoint (src/collections/editorial/endpoint.ts). */
export const submitForReview = (id: number) =>
  call<{ ok: boolean; workflow: string }>(`/api/pages/${id}/workflow`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'submit' }),
  })

/** Uploads an image; the file name (without extension) is a starting alt text the editor can improve. */
export function uploadMedia(file: File, locale: string): Promise<MediaDoc> {
  const form = new FormData()
  form.append('file', file)
  form.append('_payload', JSON.stringify({ alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') }))
  return call<{ doc: MediaDoc }>(`/api/media?${qs({ locale })}`, { method: 'POST', body: form }).then((r) => r.doc)
}

export const listMedia = (locale: string) =>
  call<{ docs: MediaDoc[] }>(`/api/media?${qs({ limit: 30, sort: '-createdAt', depth: 0, locale })}`).then((r) => r.docs.filter((m) => !m.url?.match(/\.(mp4|webm|mov)$/i)))

export type Preset = { id: number; name: string; block: Block }

/** Saved sections («Lagrede seksjoner») for the page's site; each holds exactly one block. */
export const listPresets = (site: string, locale: string) =>
  call<{ docs: { id: number; name?: string | null; block?: Block[] | null }[] }>(
    `/api/sectionPresets?${qs({ limit: 100, depth: 1, locale, sort: 'name', 'where[site][equals]': site })}`,
  ).then((r) => r.docs.filter((d) => d.block?.[0]).map((d) => ({ id: d.id, name: d.name || `Seksjon ${d.id}`, block: d.block![0] })))

export type OptionDoc = { id: number | string } & Record<string, unknown>
const optionCache = new Map<string, Promise<{ id: number | string; title: string }[]>>()

/** Choices for a relationship field, fetched once per collection and language while the editor is open. */
export function listDocs(collection: string, titleField: string, locale: string) {
  const key = `${collection}:${titleField}:${locale}`
  if (!optionCache.has(key)) {
    const url = `/api/${collection}?${qs({ limit: 100, depth: 0, locale, [`select[${titleField}]`]: 'true', sort: titleField })}`
    const request = call<{ docs: OptionDoc[] }>(url).then((r) => r.docs.map((d) => ({ id: d.id, title: String(d[titleField] ?? d.id) })))
    request.catch(() => optionCache.delete(key))
    optionCache.set(key, request)
  }
  return optionCache.get(key)!
}
