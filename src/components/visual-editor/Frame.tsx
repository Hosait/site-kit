'use client'
import { ArrowDown, ArrowUp, Copy, GripVertical, Trash2 } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { imageLeaves, mediaUrls, normalizeText, textLeaves, type TextLeaf } from '@/lib/visual-editor/leaves'
import type { EditorConfig, Path } from '@/lib/visual-editor/schema'
import type { FreeformItem, Place } from '@/blocks/freeform'

import type { Block } from './api'
import s from './editor.module.css'
import { FreeformOverlay, gridMetrics } from './FreeformOverlay'

export type Drag = { kind: 'new'; slug: string } | { kind: 'preset'; block: Block } | { kind: 'move'; from: number }

type Props = {
  src: string
  layout: Block[]
  config: EditorConfig
  selected: number | null
  /** Pixel width of the preview (mobile), or null for the full stage. */
  width: number | null
  /** Increments after a save that the preview must show. */
  refreshToken: number
  /** The preview is behind the editor's state (a change is being saved). */
  stale: boolean
  drag: Drag | null
  onSelect: (i: number | null) => void
  onText: (block: number, leaf: TextLeaf, text: string) => void
  onImage: (block: number, path: Path) => void
  onImageFile: (block: number, path: Path, file: File) => void
  onDrop: (index: number, drag: Drag) => void
  onDragStart: (drag: Drag) => void
  onDragEnd: () => void
  onMove: (i: number, dir: -1 | 1) => void
  onDuplicate: (i: number) => void
  onRemove: (i: number) => void
  onUndo: () => void
  onRedo: () => void
  /** «Fri plassering»: an element moved or resized on the grid. */
  onFreeform: (block: number, item: number, place: Place) => void
  /** The user's role cannot change content (a reviewer): select and look, nothing more. */
  readOnly?: boolean
}

type Editing = { el: HTMLElement; block: number; leaf: TextLeaf; original: string }
type Box = { i: number; top: number; left: number; width: number; height: number }

/** Shown on top of the page in the frame; adopted, so the page's own DOM and styles are untouched. */
const FRAME_CSS = `
[data-vb-text]{cursor:text}
[data-vb-text]:hover{outline:2px dashed #2563eb;outline-offset:3px}
[data-vb-text][contenteditable]{outline:2px solid #2563eb;outline-offset:3px;background:rgba(37,99,235,.06)}
[data-vb-img]{cursor:pointer}
[data-vb-img].vb-drop{outline:4px solid #2563eb;outline-offset:-4px;filter:brightness(.85)}
a,button{cursor:default}
`

const SKIP = new Set(['SCRIPT', 'STYLE', 'IMG', 'VIDEO', 'SOURCE', 'IFRAME', 'svg', 'path', 'NOSCRIPT'])

/** Quotation marks a block adds around a value (a quote is shown as «…»). */
const unquote = (s: string) => s.replace(/^[«»“”„"']+|[«»“”„"']+$/g, '')

function markers(doc: Document): HTMLElement[] {
  return Array.from(doc.querySelectorAll<HTMLElement>('[data-vb-block]'))
}

/** A marker is `display: contents`, so its box is the union of its children's boxes. */
function boxOf(marker: HTMLElement): Omit<Box, 'i'> | null {
  let top = Infinity, left = Infinity, right = -Infinity, bottom = -Infinity
  for (const child of Array.from(marker.children)) {
    const r = child.getBoundingClientRect()
    if (!r.width && !r.height) continue
    top = Math.min(top, r.top); left = Math.min(left, r.left); right = Math.max(right, r.right); bottom = Math.max(bottom, r.bottom)
  }
  return top === Infinity ? null : { top, left, width: right - left, height: bottom - top }
}

const pathsOf = (el: Element, base: string) =>
  [el.getAttribute('src'), ...(el.getAttribute('srcset') ?? '').split(',').map((p) => p.trim().split(/\s+/)[0])]
    .filter((u): u is string => Boolean(u))
    .map((u) => {
      try {
        return decodeURIComponent(new URL(u, base).pathname)
      } catch {
        return u
      }
    })

export function Frame(props: Props) {
  const { src, selected, width, refreshToken, stale, drag } = props
  // Handlers inside the frame's document read the latest props through this ref.
  const p = useRef(props)
  useLayoutEffect(() => {
    p.current = props
  })
  const frameRef = useRef<HTMLIFrameElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const docRef = useRef<Document | null>(null)
  const texts = useRef(new Map<Element, { block: number; leaf: TextLeaf }>())
  const images = useRef(new Map<Element, { block: number; path: Path }>())
  const editing = useRef<Editing | null>(null)
  const domDirty = useRef(false)
  /** The page in the frame has hydrated; marking elements before that would be a hydration mismatch. */
  const hydrated = useRef(false)
  const scrollY = useRef(0)
  const [, setTick] = useState(0)
  const [hover, setHover] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const [doc, setDoc] = useState<Document | null>(null)

  const repaint = () => setTick((t) => t + 1)

  /** Finds the text and images of each section in the rendered page by their values. */
  function scan() {
    const doc = docRef.current
    if (!doc || editing.current || !hydrated.current) return
    for (const el of texts.current.keys()) el.removeAttribute('data-vb-text')
    for (const el of images.current.keys()) el.removeAttribute('data-vb-img')
    texts.current.clear()
    images.current.clear()
    const { layout, config } = p.current
    for (const marker of markers(doc)) {
      const i = Number(marker.dataset.vbBlock)
      const block = layout[i]
      const def = block && config.blocks[block.blockType]
      if (!def) continue
      const els = Array.from(marker.querySelectorAll<HTMLElement>('*')).filter((el) => !SKIP.has(el.tagName))
      const values = els.map((el) => unquote(normalizeText(el.textContent ?? '')))
      const claimed = new Set<Element>()
      for (const leaf of textLeaves(block, def.fields, config)) {
        const want = unquote(normalizeText(leaf.value))
        const k = els.findIndex(
          (el, n) => values[n] === want && !claimed.has(el) && !Array.from(el.children).some((c) => unquote(normalizeText(c.textContent ?? '')) === want),
        )
        if (k < 0) continue
        claimed.add(els[k])
        els[k].setAttribute('data-vb-text', '')
        texts.current.set(els[k], { block: i, leaf })
      }
      const leaves = imageLeaves(block, def.fields, config).filter((l) => l.media)
      for (const el of Array.from(marker.querySelectorAll('img, video'))) {
        const urls = pathsOf(el, doc.baseURI)
        const leaf = leaves.find((l) => mediaUrls(l.media).some((u) => urls.includes(u)))
        if (!leaf) continue
        el.setAttribute('data-vb-img', '')
        images.current.set(el, { block: i, path: leaf.path })
      }
    }
  }

  function startEdit(el: HTMLElement, x: number, y: number) {
    const hit = texts.current.get(el)
    const doc = docRef.current
    if (!hit || !doc) return
    editing.current = { el, ...hit, original: el.textContent ?? '' }
    el.setAttribute('contenteditable', 'plaintext-only')
    el.setAttribute('spellcheck', 'true')
    el.focus()
    const range = doc.caretRangeFromPoint?.(x, y)
    const sel = doc.getSelection()
    if (range && sel) {
      sel.removeAllRanges()
      sel.addRange(range)
    }
    el.addEventListener('blur', () => finishEdit(true), { once: true })
  }

  function finishEdit(save: boolean) {
    const ed = editing.current
    if (!ed) return
    editing.current = null
    ed.el.removeAttribute('contenteditable')
    // Quotation marks the block adds around the value are not part of it.
    const value = normalizeText(ed.leaf.value)
    const decorated = unquote(normalizeText(ed.original)) !== normalizeText(ed.original) && unquote(value) === value
    const clean = (s: string) => (decorated ? unquote(s.trim()) : s)
    const text = clean(ed.leaf.multiline ? ed.el.innerText.replace(/\n{3,}/g, '\n\n').trim() : normalizeText(ed.el.textContent ?? ''))
    const before = clean(ed.leaf.multiline ? ed.original.trim() : normalizeText(ed.original))
    if (!save && ed.el.textContent !== ed.original) {
      ed.el.textContent = ed.original
      domDirty.current = true
    } else if (save && text !== before) {
      // The browser changed text React rendered; reload instead of patching it on the next refresh.
      domDirty.current = true
      p.current.onText(ed.block, ed.leaf, text)
    }
    scan()
  }

  function onLoad() {
    const frame = frameRef.current
    const doc = frame?.contentDocument
    const win = frame?.contentWindow
    if (!doc || !win || doc === docRef.current || doc.location.href === 'about:blank') return
    docRef.current = doc
    setDoc(doc)
    editing.current = null
    const sheet = new (win as unknown as typeof globalThis).CSSStyleSheet()
    sheet.replaceSync(FRAME_CSS)
    doc.adoptedStyleSheets = [...doc.adoptedStyleSheets, sheet]

    doc.addEventListener('mousemove', (e) => {
      const m = (e.target as Element).closest?.('[data-vb-block]') as HTMLElement | null
      setHover(m ? Number(m.dataset.vbBlock) : null)
    })
    doc.documentElement.addEventListener('mouseleave', () => setHover(null))
    doc.addEventListener(
      'click',
      (e) => {
        const target = e.target as Element
        if (editing.current?.el.contains(target)) return
        // A click right after the page re-rendered may come before the debounced scan; and a page
        // someone clicks in is ready, even if its «ready» message came before we listened.
        hydrated.current = true
        if (!target.closest('[data-vb-text]')) scan()
        const textEl = target.closest('[data-vb-text]') as HTMLElement | null
        if (target.closest('a, button, [role=button], input[type=submit]') || textEl) e.preventDefault()
        const marker = target.closest('[data-vb-block]') as HTMLElement | null
        if (!marker) return p.current.onSelect(null)
        const i = Number(marker.dataset.vbBlock)
        p.current.onSelect(i)
        const img = target.closest('[data-vb-img]')
        const hit = img && images.current.get(img)
        if (hit) p.current.onImage(hit.block, hit.path)
        if (textEl && !p.current.readOnly) startEdit(textEl, e.clientX, e.clientY)
      },
      true,
    )
    doc.addEventListener('submit', (e) => e.preventDefault(), true)
    doc.addEventListener('keydown', (e) => {
      const ed = editing.current
      if (ed) {
        if (e.key === 'Escape') {
          e.preventDefault()
          finishEdit(false)
          ed.el.blur()
        } else if (e.key === 'Enter' && !e.shiftKey && !ed.leaf.multiline) {
          e.preventDefault()
          ed.el.blur()
        }
        return
      }
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) p.current.onRedo()
        else p.current.onUndo()
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        p.current.onRedo()
      } else if (e.key === 'Escape') p.current.onSelect(null)
    })
    // Dropping an image file on an image replaces it. Files are never opened by the frame itself.
    const clearDrop = () => doc.querySelectorAll('.vb-drop').forEach((el) => el.classList.remove('vb-drop'))
    doc.addEventListener('dragover', (e) => {
      if (!e.dataTransfer?.types.includes('Files')) return
      e.preventDefault()
      const img = (e.target as Element).closest('[data-vb-img]')
      clearDrop()
      if (img) img.classList.add('vb-drop')
      e.dataTransfer.dropEffect = img ? 'copy' : 'none'
    })
    doc.addEventListener('dragleave', clearDrop)
    doc.addEventListener('drop', (e) => {
      if (!e.dataTransfer?.types.includes('Files')) return
      e.preventDefault()
      clearDrop()
      const img = (e.target as Element).closest('[data-vb-img]')
      const hit = img && images.current.get(img)
      const file = e.dataTransfer.files[0]
      if (hit && file?.type.startsWith('image/')) p.current.onImageFile(hit.block, hit.path, file)
    })
    // Leaving the frame (a click in the editor around it) ends text editing.
    win.addEventListener('blur', () => finishEdit(true))
    win.addEventListener('scroll', repaint, { passive: true })
    win.addEventListener('resize', repaint)
    let timer: number | undefined
    new (win as unknown as typeof globalThis).MutationObserver(() => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        scan()
        setRefreshing(false)
        repaint()
      }, 120)
    }).observe(doc.body, { childList: true, subtree: true, characterData: true })

    if (scrollY.current) win.scrollTo(0, scrollY.current)
    // Without a ready message (no live-preview listener on the page), mark the page after a while.
    window.setTimeout(() => {
      if (hydrated.current || docRef.current !== doc) return
      hydrated.current = true
      scan()
      repaint()
    }, 3000)
    scan()
    setRefreshing(false)
    repaint()
  }

  // The page's live-preview listener says «ready» once it has hydrated (Payload's ready message).
  // Any press in the editor around the frame first saves the text being edited.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frameRef.current?.contentWindow || e.data?.type !== 'payload-live-preview' || !e.data.ready) return
      hydrated.current = true
      scan()
      repaint()
    }
    const onPointer = () => finishEdit(true)
    window.addEventListener('message', onMessage)
    window.addEventListener('pointerdown', onPointer, true)
    return () => {
      window.removeEventListener('message', onMessage)
      window.removeEventListener('pointerdown', onPointer, true)
    }
  })

  // The page may finish loading before the editor hydrates; React then never sees its load event.
  // Boxes are redrawn when the preview changes width (desktop/mobile), after its animation too.
  useEffect(() => {
    if (frameRef.current?.contentDocument?.readyState === 'complete') onLoad()
    const frame = frameRef.current
    if (!frame) return
    const observer = new ResizeObserver(() => repaint())
    observer.observe(frame)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // A save the preview must show: refresh the route (fast), or reload after text edits on the page.
  useEffect(() => {
    if (!refreshToken) return
    const win = frameRef.current?.contentWindow
    if (!win) return
    finishEdit(true)
    setRefreshing(true)
    if (domDirty.current) {
      domDirty.current = false
      hydrated.current = false
      scrollY.current = win.scrollY
      win.location.reload()
    } else win.postMessage({ type: 'payload-document-event' }, window.location.origin)
    const fallback = window.setTimeout(() => setRefreshing(false), 2000)
    return () => window.clearTimeout(fallback)
    // Runs once per save to show, not when the handlers it calls are recreated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken])

  // New values (undo, inspector edits) must be found again in the page.
  useEffect(() => {
    if (!stale && !refreshing) scan()
  }, [props.layout, stale, refreshing])

  // A section chosen in the list (or just added) is scrolled into view when it is outside it.
  useEffect(() => {
    const doc = docRef.current
    if (!doc || selected === null || stale || refreshing) return
    const marker = doc.querySelector<HTMLElement>(`[data-vb-block="${selected}"]`)
    const box = marker && boxOf(marker)
    const height = doc.defaultView?.innerHeight ?? 0
    if (box && (box.top < 0 || box.top > height - 80)) marker.firstElementChild?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [selected, stale, refreshing])

  const hidden = stale || refreshing
  const boxes: Box[] = doc && !hidden ? markers(doc).flatMap((m) => {
    const b = boxOf(m)
    return b ? [{ i: Number(m.dataset.vbBlock), ...b }] : []
  }) : []
  const sel = boxes.find((b) => b.i === selected)
  const hov = hover !== selected ? boxes.find((b) => b.i === hover) : undefined
  const count = props.layout.length

  function indexAt(clientY: number) {
    const top = overlayRef.current?.getBoundingClientRect().top ?? 0
    const y = clientY - top
    return boxes.filter((b) => b.top + b.height / 2 < y).length
  }
  const lineY =
    dropIndex === null ? null : dropIndex < boxes.length ? boxes[dropIndex].top : boxes.length ? boxes[boxes.length - 1].top + boxes[boxes.length - 1].height : 0

  return (
    <div className={s.frameWrap} style={{ width: width ?? '100%' }}>
      <iframe ref={frameRef} src={src} title="Forhåndsvisning av siden" className={s.frame} data-stale={hidden || undefined} onLoad={onLoad} />
      <div ref={overlayRef} className={s.overlay}>
        {hov && <div className={s.hoverBox} style={{ top: hov.top, left: hov.left, width: hov.width, height: hov.height }} />}
        {sel && !props.readOnly && (
          <div className={s.selectBox} style={{ top: sel.top, left: sel.left, width: sel.width, height: sel.height }}>
            <div className={s.toolbar} style={{ top: sel.top > 60 ? -54 : Math.max(0, -sel.top) + 8 }} role="toolbar" aria-label="Valgt seksjon">
              <button
                type="button"
                className={s.iconBtn}
                draggable
                aria-label="Dra for å flytte seksjonen"
                title="Dra for å flytte"
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', `move:${sel.i}`)
                  e.dataTransfer.effectAllowed = 'move'
                  p.current.onDragStart({ kind: 'move', from: sel.i })
                }}
                onDragEnd={() => p.current.onDragEnd()}
              >
                <GripVertical size={18} aria-hidden />
              </button>
              <span className={s.toolbarLabel}>{props.config.blocks[props.layout[sel.i]?.blockType]?.label}</span>
              <button type="button" className={s.iconBtn} aria-label="Flytt opp" title="Flytt opp" disabled={sel.i === 0} onClick={() => p.current.onMove(sel.i, -1)}>
                <ArrowUp size={18} aria-hidden />
              </button>
              <button type="button" className={s.iconBtn} aria-label="Flytt ned" title="Flytt ned" disabled={sel.i >= count - 1} onClick={() => p.current.onMove(sel.i, 1)}>
                <ArrowDown size={18} aria-hidden />
              </button>
              <button type="button" className={s.iconBtn} aria-label="Dupliser seksjonen" title="Dupliser" onClick={() => p.current.onDuplicate(sel.i)}>
                <Copy size={18} aria-hidden />
              </button>
              <button type="button" className={s.iconBtn} aria-label="Slett seksjonen" title="Slett" onClick={() => p.current.onRemove(sel.i)}>
                <Trash2 size={18} aria-hidden />
              </button>
            </div>
          </div>
        )}
        {selected !== null && !props.readOnly && props.layout[selected]?.blockType === 'freeform' && !drag && (
          <FreeformOverlay
            metrics={gridMetrics(doc, selected)}
            items={(props.layout[selected].items as FreeformItem[] | undefined) ?? []}
            onChange={(item, place) => p.current.onFreeform(selected, item, place)}
          />
        )}
        {count === 0 && !drag && (
          <p className={s.empty}>Siden er tom. Dra en seksjon hit fra biblioteket, eller klikk på en seksjon i biblioteket.</p>
        )}
        {drag && (
          <div
            className={s.dropLayer}
            data-testid="vb-drop-layer"
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = drag.kind === 'move' ? 'move' : 'copy'
              setDropIndex(indexAt(e.clientY))
            }}
            onDragLeave={() => setDropIndex(null)}
            onDrop={(e) => {
              e.preventDefault()
              const index = indexAt(e.clientY)
              setDropIndex(null)
              p.current.onDrop(index, drag)
            }}
          >
            {lineY !== null && <div className={s.dropLine} style={{ top: Math.max(2, lineY - 2) }} />}
          </div>
        )}
        {hidden && <p className={s.updating} role="status">Oppdaterer forhåndsvisningen …</p>}
      </div>
    </div>
  )
}
