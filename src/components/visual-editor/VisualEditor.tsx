'use client'
import { ChevronLeft, Monitor, Redo2, Smartphone, Undo2 } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import { applyText, historyOf, moveItem, pushHistory, redo, undo, type History, type TextLeaf } from '@/lib/visual-editor/leaves'
import { newBlock, withNewIds } from '@/lib/visual-editor/presets'
import { normalizeLayout, setAt, type EditorConfig, type Path } from '@/lib/visual-editor/schema'

import { rolesThatEdit, rolesThatPublish } from '@/lib/editorial/roles'
import { availableActions, stateOf, WORKFLOW_LABELS, type WorkflowState } from '@/lib/editorial/workflow'

import { listPresets, loadPage, publish, saveDraft, submitForReview, uploadMedia, type Block, type Preset } from './api'
import { Frame, type Drag } from './Frame'
import { Inspector, type Swatch } from './Inspector'
import { Sidebar } from './Sidebar'
import s from './editor.module.css'
import p from './panels.module.css'

export type { Swatch }

type Props = {
  id: number
  site: string
  /** The user's role (Users.role): who may edit, publish and send for approval. */
  role: string
  locale: string
  config: EditorConfig
  previewSrc: string
  formHref: string
  listHref: string
  swatches: Swatch[]
  titles: Record<string, string>
}

type Status = 'loading' | 'idle' | 'dirty' | 'saving' | 'saved' | 'uploading' | 'publishing' | 'published' | 'submitting' | 'submitted' | 'error'
const STATUS_TEXT: Record<Status, string> = {
  loading: 'Henter siden …',
  idle: '',
  dirty: 'Endringer ikke lagret ennå',
  saving: 'Lagrer utkast …',
  saved: 'Utkast lagret',
  uploading: 'Laster opp bilde …',
  publishing: 'Publiserer …',
  published: 'Publisert',
  submitting: 'Sender til godkjenning …',
  submitted: 'Sendt til godkjenning',
  error: 'Noe gikk galt',
}

const MOBILE_WIDTH = 390

export function VisualEditor({ id, site, role, locale, config, previewSrc, formHref, listHref, swatches, titles }: Props) {
  const [hist, setHistState] = useState<History<Block[]>>(historyOf([]))
  const histRef = useRef(hist)
  const [title, setTitle] = useState('')
  const titleRef = useRef('')
  const [selected, setSelected] = useState<number | null>(null)
  const [mobile, setMobile] = useState(false)
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)
  const [stale, setStale] = useState(false)
  const [drag, setDrag] = useState<Drag | null>(null)
  const [focusImage, setFocusImage] = useState<Path | null>(null)
  const [presets, setPresets] = useState<Preset[]>([])
  const [workflow, setWorkflow] = useState<WorkflowState>('draft')
  const canEdit = rolesThatEdit(role)
  const canPublish = rolesThatPublish(role)
  const canSubmit = canEdit && availableActions(workflow, { edit: canEdit, review: false }).includes('submit')
  const titleId = useId()

  // Nothing may change or save before the page's own data has loaded, or an early change would
  // save a layout without the sections the page already has.
  const loaded = useRef(false)
  const [ready, setReady] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const inflight = useRef<Promise<void> | null>(null)
  const queued = useRef(false)
  const needsRefresh = useRef(false)
  const layout = hist.present

  const setHistory = (h: History<Block[]>) => {
    histRef.current = h
    setHistState(h)
  }

  useEffect(() => {
    // Saved sections are optional: an older database or no access just leaves the list empty.
    listPresets(site, locale)
      .then(setPresets)
      .catch(() => setPresets([]))
    loadPage(id, locale)
      .then((doc) => {
        setHistory(historyOf(doc.layout ?? []))
        loaded.current = true
        setReady(true)
        titleRef.current = doc.title ?? ''
        setTitle(titleRef.current)
        setIsPublished(doc._status === 'published')
        setWorkflow(stateOf(doc.workflow))
        setStatus('idle')
      })
      .catch((e: Error) => {
        setError(e.message)
        setStatus('error')
      })
  }, [id, site, locale])

  function flush() {
    window.clearTimeout(timer.current)
    timer.current = undefined
    if (inflight.current) {
      queued.current = true
      return
    }
    const refresh = needsRefresh.current
    needsRefresh.current = false
    setStatus('saving')
    inflight.current = saveDraft(id, locale, { title: titleRef.current, layout: normalizeLayout(histRef.current.present, config) })
      .then(({ doc }) => {
        // An edit sends a page in review back to draft (src/lib/editorial/workflow.ts).
        setWorkflow(stateOf(doc?.workflow))
        setStatus('saved')
        setError('')
        if (refresh) setRefreshToken((t) => t + 1)
      })
      .catch((e: Error) => {
        needsRefresh.current ||= refresh
        setError(e.message)
        setStatus('error')
      })
      .finally(() => {
        inflight.current = null
        if (queued.current) {
          queued.current = false
          flush()
        } else if (!needsRefresh.current) setStale(false)
      })
  }

  /** Text typed on the page is already shown, so it saves without refreshing the preview. */
  function schedule(opts: { refresh: boolean; delay?: number }) {
    if (!loaded.current || !canEdit) return
    if (opts.refresh) {
      needsRefresh.current = true
      setStale(true)
    }
    setIsPublished(false)
    setStatus('dirty')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(flush, opts.delay ?? (opts.refresh ? 150 : 400))
  }

  const lastTyping = useRef(0)
  type ChangeOpts = { refresh?: boolean; delay?: number; typing?: boolean }
  const change = (next: Block[], opts: ChangeOpts = {}) => {
    if (!loaded.current || !canEdit) return
    // Typing in the settings panel is one undo step per pause, not one per key.
    const coalesce = opts.typing && Date.now() - lastTyping.current < 1500 && histRef.current.past.length > 0
    lastTyping.current = opts.typing ? Date.now() : 0
    setHistory(coalesce ? { ...histRef.current, present: next, future: [] } : pushHistory(histRef.current, next))
    schedule({ refresh: opts.refresh ?? true, delay: opts.delay })
  }
  const updateBlock = (i: number, next: Block, opts: ChangeOpts = {}) =>
    change(histRef.current.present.map((b, n) => (n === i ? next : b)), opts)

  const doUndo = () => {
    if (!histRef.current.past.length) return
    setHistory(undo(histRef.current))
    schedule({ refresh: true })
  }
  const doRedo = () => {
    if (!histRef.current.future.length) return
    setHistory(redo(histRef.current))
    schedule({ refresh: true })
  }

  const insertAt = (block: Block, index: number) => {
    const cur = histRef.current.present
    change([...cur.slice(0, index), block, ...cur.slice(index)])
    setSelected(index)
  }
  const addAt = (slug: string, index: number) => insertAt(newBlock(slug, config) as Block, index)
  const moveTo = (from: number, to: number) => {
    const next = moveItem(histRef.current.present, from, to)
    if (next === histRef.current.present) return
    change(next)
    setSelected(to > from ? to - 1 : to)
  }
  const duplicate = (i: number) => {
    const cur = histRef.current.present
    change([...cur.slice(0, i + 1), withNewIds(cur[i]), ...cur.slice(i + 1)])
    setSelected(i + 1)
  }
  const remove = (i: number) => {
    change(histRef.current.present.filter((_, n) => n !== i))
    setSelected(null)
  }
  const onText = (i: number, leaf: TextLeaf, text: string) => updateBlock(i, applyText(histRef.current.present[i], leaf, text), { refresh: false })
  const onImageFile = (i: number, path: Path, file: File) => {
    setStatus('uploading')
    uploadMedia(file, locale)
      .then((media) => updateBlock(i, setAt(histRef.current.present[i], path, media)))
      .catch((e: Error) => {
        setError(e.message)
        setStatus('error')
      })
  }

  /** Saves what is pending first, so the approval is for the text on the screen. */
  const doSubmit = async () => {
    if (!loaded.current) return
    if (timer.current) flush()
    while (inflight.current) await inflight.current
    setStatus('submitting')
    try {
      const res = await submitForReview(id)
      setWorkflow(stateOf(res.workflow))
      setStatus('submitted')
      setError('')
    } catch (e) {
      setError((e as Error).message)
      setStatus('error')
    }
  }

  const doPublish = async () => {
    if (!loaded.current) return
    window.clearTimeout(timer.current)
    if (inflight.current) await inflight.current
    setStatus('publishing')
    try {
      await publish(id, locale, { title: titleRef.current, layout: normalizeLayout(histRef.current.present, config) })
      needsRefresh.current = false
      setIsPublished(true)
      setStatus('published')
      setError('')
      setRefreshToken((t) => t + 1)
    } catch (e) {
      setError((e as Error).message)
      setStatus('error')
    }
  }

  // Ctrl/Cmd+Z and Shift+Ctrl/Cmd+Z when focus is in the editor (the frame handles its own keys).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, select, [contenteditable]')) return
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) doRedo()
        else doUndo()
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        doRedo()
      }
    }
    const onLeave = (e: BeforeUnloadEvent) => {
      if (timer.current || inflight.current) e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('beforeunload', onLeave)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('beforeunload', onLeave)
    }
  })

  const sel = selected !== null && selected < layout.length ? selected : null
  const block = sel !== null ? layout[sel] : null
  const def = block ? config.blocks[block.blockType] : undefined
  const startDrag = (d: Drag) => window.setTimeout(() => setDrag(d), 0)

  return (
    <div className={s.root}>
      <header className={s.top}>
        <a href={listHref} className={s.back}>
          <ChevronLeft size={18} aria-hidden /> Sider
        </a>
        <h1 className={s.title}>
          <span className={s.titleKicker}>Visuell redigering</span>
          {title || 'Uten tittel'}
        </h1>
        <div className={s.tools} role="group" aria-label="Angre og gjør om">
          <button type="button" className={s.iconBtn} aria-label="Angre" title="Angre (Ctrl/Cmd+Z)" disabled={!hist.past.length} onClick={doUndo}>
            <Undo2 size={18} aria-hidden />
          </button>
          <button type="button" className={s.iconBtn} aria-label="Gjør om" title="Gjør om (Shift+Ctrl/Cmd+Z)" disabled={!hist.future.length} onClick={doRedo}>
            <Redo2 size={18} aria-hidden />
          </button>
        </div>
        <div className={s.tools} role="group" aria-label="Forhåndsvis som">
          <button type="button" className={s.iconBtn} aria-pressed={!mobile} aria-label="Stor skjerm" title="Stor skjerm" onClick={() => setMobile(false)}>
            <Monitor size={18} aria-hidden />
          </button>
          <button type="button" className={s.iconBtn} aria-pressed={mobile} aria-label="Mobil" title="Mobil" onClick={() => setMobile(true)}>
            <Smartphone size={18} aria-hidden />
          </button>
        </div>
        <p className={s.status} role="status" data-status={status}>
          {status === 'error' ? `${STATUS_TEXT.error}: ${error}` : STATUS_TEXT[status]}
          {status === 'idle' && (isPublished ? 'Publisert' : 'Utkast – ikke publisert')}
          {workflow !== 'draft' && ` · ${WORKFLOW_LABELS[workflow]}`}
        </p>
        <a href={formHref} className={s.btn}>
          Avansert redigering
        </a>
        {canSubmit && (
          <button type="button" className={canPublish ? s.btn : s.primary} onClick={doSubmit} disabled={!ready || status === 'submitting'}>
            Send til godkjenning
          </button>
        )}
        {canPublish && (
          <button type="button" className={s.primary} onClick={doPublish} disabled={!ready || status === 'publishing'}>
            Publiser
          </button>
        )}
      </header>

      <aside className={s.left} aria-label="Seksjoner">
        {!ready && <p className={s.hint}>Henter siden …</p>}
        {ready && !canEdit && <p className={s.hint}>Du kan se siden her, men rollen din kan ikke endre den. Godkjenn eller be om endringer i skjemaet.</p>}
        {ready && canEdit && <Sidebar
          config={config}
          layout={layout}
          selected={sel}
          onAdd={(slug) => addAt(slug, sel === null ? layout.length : sel + 1)}
          presets={presets}
          onAddPreset={(block) => insertAt(withNewIds(block), sel === null ? layout.length : sel + 1)}
          onSelect={setSelected}
          onMove={moveTo}
          onDragStart={startDrag}
          onDragEnd={() => setDrag(null)}
        />}
      </aside>

      <main className={s.stage} aria-label="Forhåndsvisning">
        <Frame
          src={previewSrc}
          layout={layout}
          config={config}
          selected={sel}
          width={mobile ? MOBILE_WIDTH : null}
          refreshToken={refreshToken}
          stale={stale}
          readOnly={!canEdit}
          drag={drag}
          onSelect={(i) => {
            setSelected(i)
            setFocusImage(null)
          }}
          onText={onText}
          onImage={(_, path) => setFocusImage(path)}
          onImageFile={onImageFile}
          onDrop={(index, d) => {
            setDrag(null)
            if (d.kind === 'new') addAt(d.slug, index)
            else if (d.kind === 'preset') insertAt(withNewIds(d.block), index)
            else moveTo(d.from, index)
          }}
          onDragStart={startDrag}
          onDragEnd={() => setDrag(null)}
          onMove={(i, dir) => moveTo(i, dir < 0 ? i - 1 : i + 2)}
          onDuplicate={duplicate}
          onRemove={remove}
          onUndo={doUndo}
          onRedo={doRedo}
          onFreeform={(i, item, place) => {
            const items = (histRef.current.present[i].items as Record<string, unknown>[] | undefined) ?? []
            updateBlock(i, { ...histRef.current.present[i], items: items.map((it, n) => (n === item ? { ...it, ...place } : it)) })
          }}
        />
      </main>

      <aside className={s.right} aria-label="Innstillinger">
        {block && def ? (
          <Inspector
            key={block.id ?? sel}
            block={block}
            def={def}
            swatches={swatches}
            ctx={{ config, locale, titles }}
            focusImage={focusImage}
            onChange={(next, opts) => updateBlock(sel!, next, opts?.typing ? { delay: 700, typing: true } : {})}
            onImageFile={(path, file) => onImageFile(sel!, path, file)}
          />
        ) : (
          <div className={p.inspector}>
            <h2 className={s.panelTitle}>Siden</h2>
            <div className={s.field}>
              <label htmlFor={titleId}>Sidetittel</label>
              <input
                id={titleId}
                type="text"
                value={title}
                onChange={(e) => {
                  titleRef.current = e.target.value
                  setTitle(e.target.value)
                  schedule({ refresh: true, delay: 700 })
                }}
              />
            </div>
            <ul className={p.tips}>
              <li>Klikk på en seksjon for å velge den, og på en tekst for å skrive rett på siden.</li>
              <li>Dra seksjoner fra biblioteket inn på siden, og flytt dem med håndtaket eller pilene.</li>
              <li>Slipp en bildefil oppå et bilde for å bytte det.</li>
              <li>Endringer lagres som utkast. Besøkende ser dem først når du publiserer.</li>
            </ul>
          </div>
        )}
      </aside>
    </div>
  )
}
