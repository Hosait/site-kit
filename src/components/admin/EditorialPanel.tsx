'use client'

import { toast, useAuth, useConfig, useDocumentInfo, useFormFields, useFormModified } from '@payloadcms/ui'
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'

import { rolesThatEdit, rolesThatReview } from '@/lib/editorial/roles'
import { ACTION_LABELS, availableActions, stateOf, WORKFLOW_LABELS, type WorkflowAction } from '@/lib/editorial/workflow'

/**
 * Sidebar panel of a page or article: the approval state with its buttons («Send til
 * godkjenning», «Godkjenn», «Be om endringer») and the comment threads. The server decides what
 * is allowed (src/collections/editorial/endpoint.ts, src/collections/Comments.ts); this panel
 * only hides the buttons that would be refused.
 */
type Person = { id: number; name?: string | null; email?: string }
type Comment = {
  id: number
  text: string
  blockId?: string | null
  resolved?: boolean | null
  createdAt: string
  author?: Person | number | null
  parent?: { id: number } | number | null
}

const box: CSSProperties = { border: '1px solid var(--theme-elevation-150)', borderRadius: 4, padding: 'var(--base)', marginBottom: 'var(--base)' }
const field: CSSProperties = { width: '100%', minHeight: 44, padding: '8px 10px', font: 'inherit', boxSizing: 'border-box', background: 'var(--theme-input-bg)', color: 'var(--theme-text)', border: '1px solid var(--theme-elevation-150)', borderRadius: 4 }
const button = (primary = false): CSSProperties => ({
  minHeight: 44, minWidth: 44, padding: '0 14px', font: 'inherit', cursor: 'pointer', borderRadius: 4,
  border: '1px solid var(--theme-elevation-250)',
  background: primary ? 'var(--theme-elevation-800)' : 'transparent',
  color: primary ? 'var(--theme-elevation-0)' : 'var(--theme-text)',
})
const small: CSSProperties = { fontSize: 13, color: 'var(--theme-elevation-600)' }

type FieldLike = { name?: string; fields?: FieldLike[]; tabs?: FieldLike[]; blocks?: { slug: string; labels?: { singular?: unknown } }[] }
const text = (label: unknown): string | undefined => (typeof label === 'string' ? label : label && typeof label === 'object' ? (Object.values(label)[0] as string | undefined) : undefined)

/** Block slug → the label the editor sees, read from the collection's `layout` field. */
function blockLabels(entity: unknown): Record<string, string> {
  const find = (fields: FieldLike[] | undefined): FieldLike | undefined => {
    for (const f of fields ?? []) {
      if (f.name === 'layout' && f.blocks) return f
      const inner = find(f.fields) ?? find(f.tabs)
      if (inner) return inner
    }
    return undefined
  }
  const layout = find((entity as { fields?: FieldLike[] } | null)?.fields)
  return Object.fromEntries((layout?.blocks ?? []).map((b) => [b.slug, text(b.labels?.singular) ?? b.slug]))
}

const idOf = (v: { id: number } | number | null | undefined) => (typeof v === 'object' && v ? v.id : v)
const nameOf = (a: Comment['author']) => (typeof a === 'object' && a ? a.name || a.email || 'Ukjent' : 'Ukjent')

export function EditorialPanel() {
  const { id, collectionSlug } = useDocumentInfo()
  const { user } = useAuth()
  const modified = useFormModified()
  const { config, getEntityConfig } = useConfig()
  const api = config.routes.api
  const role = (user as { role?: string } | null)?.role

  const [workflow, setWorkflow] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [note, setNote] = useState('')
  const [blockId, setBlockId] = useState('')
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [showResolved, setShowResolved] = useState(false)
  const [busy, setBusy] = useState(false)

  // «id:blockType|id:blockType»: a string, so typing in other fields does not redraw the panel.
  const sectionKey = useFormFields(([fields]) => {
    const rows = (fields.layout as { rows?: { id: string }[] } | undefined)?.rows ?? []
    return rows.map((r, i) => `${r.id}:${String(fields[`layout.${i}.blockType`]?.value ?? '')}`).join('|')
  })
  const blockNames = useMemo(() => blockLabels(collectionSlug ? getEntityConfig({ collectionSlug }) : null), [collectionSlug, getEntityConfig])
  const sections = useMemo(() => {
    if (!sectionKey) return []
    return sectionKey.split('|').map((s, i) => {
      const [rowId, type] = s.split(':')
      return { id: rowId, label: `Seksjon ${i + 1}: ${blockNames[type] ?? type}` }
    })
  }, [sectionKey, blockNames])

  const load = useCallback(async () => {
    if (!id || !collectionSlug) return
    const q = new URLSearchParams({ 'where[doc.value][equals]': String(id), 'where[doc.relationTo][equals]': collectionSlug, depth: '1', limit: '200', sort: 'createdAt', 'populate[users][name]': 'true', 'populate[users][email]': 'true' })
    const [doc, list] = await Promise.all([
      fetch(`${api}/${collectionSlug}/${id}?draft=true&depth=0`, { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`${api}/comments?${q}`, { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ])
    if (doc) setWorkflow(stateOf(doc.workflow))
    if (list) setComments(list.docs)
  }, [api, collectionSlug, id])

  useEffect(() => {
    const first = setTimeout(load, 0)
    return () => clearTimeout(first)
  }, [load])

  const send = async (url: string, method: string, body?: unknown) => {
    setBusy(true)
    try {
      const res = await fetch(url, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json.error || json.errors?.[0]?.message || `Feil ${res.status}`)
        return null
      }
      return json
    } finally {
      setBusy(false)
    }
  }

  const act = async (action: WorkflowAction) => {
    const res = await send(`${api}/${collectionSlug}/${id}/workflow`, 'POST', { action, message: note })
    if (!res) return
    setNote('')
    toast.success(action === 'submit' ? (res.notified ? `Sendt til godkjenning (${res.notified} varslet på e-post).` : 'Sendt til godkjenning. Ingen godkjenner er satt opp for dette nettstedet.') : `${ACTION_LABELS[action]}: ferdig.`)
    await load()
  }

  const addComment = async () => {
    if (!text.trim() || !id) return
    const res = await send(`${api}/comments`, 'POST', { doc: { relationTo: collectionSlug, value: id }, text: text.trim(), blockId: blockId || undefined, parent: replyTo ?? undefined })
    if (!res) return
    setText('')
    setBlockId('')
    setReplyTo(null)
    await load()
  }

  if (!id || !collectionSlug) return <p style={small}>Lagre først for å bruke godkjenning og kommentarer.</p>

  const state = stateOf(workflow)
  const actions = availableActions(state, { edit: rolesThatEdit(role), review: rolesThatReview(role) })
  const top = comments.filter((c) => !idOf(c.parent))
  const open = top.filter((c) => !c.resolved)
  const resolved = top.filter((c) => c.resolved)
  const sectionLabel = (b?: string | null) => (b ? (sections.find((s) => s.id === b)?.label ?? 'Seksjon som er fjernet') : null)

  const renderComment = (c: Comment, reply = false) => (
    <li key={c.id} style={{ marginLeft: reply ? 16 : 0, marginTop: 12, listStyle: 'none', opacity: c.resolved ? 0.7 : 1 }}>
      <div style={small}>
        <strong>{nameOf(c.author)}</strong> · {new Date(c.createdAt).toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short' })}
        {sectionLabel(c.blockId) && <> · {sectionLabel(c.blockId)}</>}
      </div>
      <p style={{ margin: '4px 0', whiteSpace: 'pre-wrap' }}>{c.text}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {!reply && (
          <button type="button" style={button()} onClick={() => setReplyTo(c.id)}>
            Svar
          </button>
        )}
        {!reply && (
          <button type="button" style={button()} disabled={busy} onClick={async () => { if (await send(`${api}/comments/${c.id}`, 'PATCH', { resolved: !c.resolved })) await load() }}>
            {c.resolved ? 'Åpne igjen' : 'Løst'}
          </button>
        )}
        {(typeof c.author === 'object' && c.author ? c.author.id : c.author) === user?.id && (
          <button type="button" style={button()} disabled={busy} onClick={async () => { if (window.confirm('Slette kommentaren?') && (await send(`${api}/comments/${c.id}`, 'DELETE'))) await load() }}>
            Slett
          </button>
        )}
      </div>
      <ul style={{ padding: 0, margin: 0 }}>{comments.filter((r) => idOf(r.parent) === c.id).map((r) => renderComment(r, true))}</ul>
    </li>
  )

  return (
    <section aria-label="Godkjenning og kommentarer">
      <div style={box}>
        <h4 style={{ margin: '0 0 8px' }}>Godkjenning</h4>
        <p role="status" style={{ margin: '0 0 8px' }}>
          Status: <strong>{WORKFLOW_LABELS[state]}</strong>
        </p>
        {actions.length > 0 && (
          <>
            <label htmlFor="workflow-note" style={small}>Melding (valgfritt)</label>
            <textarea id="workflow-note" style={{ ...field, minHeight: 64 }} value={note} onChange={(e) => setNote(e.target.value)} />
            {modified && <p style={small}>Lagre utkastet først, så sendes det som er lagret.</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {actions.map((a, i) => (
                <button key={a} type="button" style={button(i === 0)} disabled={busy || modified} onClick={() => act(a)}>
                  {ACTION_LABELS[a]}
                </button>
              ))}
            </div>
          </>
        )}
        {state === 'approved' && <p style={small}>En utgiver kan nå publisere siden.</p>}
      </div>

      <div style={box}>
        <h4 style={{ margin: '0 0 8px' }}>Kommentarer ({open.length} åpne)</h4>
        <ul style={{ padding: 0, margin: 0 }}>{open.map((c) => renderComment(c))}</ul>
        {open.length === 0 && <p style={small}>Ingen åpne kommentarer.</p>}
        {resolved.length > 0 && (
          <>
            <button type="button" style={{ ...button(), marginTop: 8 }} aria-expanded={showResolved} onClick={() => setShowResolved(!showResolved)}>
              {showResolved ? 'Skjul løste' : `Vis løste (${resolved.length})`}
            </button>
            {showResolved && <ul style={{ padding: 0, margin: 0 }}>{resolved.map((c) => renderComment(c))}</ul>}
          </>
        )}

        <div style={{ marginTop: 16 }}>
          <label htmlFor="comment-text" style={small}>{replyTo ? 'Svar på kommentar' : 'Ny kommentar'}</label>
          <textarea id="comment-text" style={{ ...field, minHeight: 88 }} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} />
          {!replyTo && sections.length > 0 && (
            <>
              <label htmlFor="comment-section" style={small}>Gjelder (valgfritt)</label>
              <select id="comment-section" style={field} value={blockId} onChange={(e) => setBlockId(e.target.value)}>
                <option value="">Hele siden</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" style={button(true)} disabled={busy || !text.trim()} onClick={addComment}>Legg til kommentar</button>
            {replyTo && <button type="button" style={button()} onClick={() => setReplyTo(null)}>Avbryt svar</button>}
          </div>
        </div>
      </div>
    </section>
  )
}
