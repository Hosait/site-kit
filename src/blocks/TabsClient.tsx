'use client'

import { useId, useRef, useState } from 'react'

import { keyTarget } from './interaction'

export type TabItem = { id: string; label: string; panel: React.ReactNode }

/**
 * WAI-ARIA tabs with automatic activation: one tab is in the tab order, arrows move and select
 * (wrapping), Home and End jump to the first and last. The panels are drawn on the server and
 * passed in; the inactive ones stay in the page, hidden.
 */
export function Tabs({ label, tabs }: { label: string; tabs: TabItem[] }) {
  const base = useId()
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (e: React.KeyboardEvent) => {
    const next = keyTarget(e.key, active, tabs.length)
    if (next === null) return
    e.preventDefault()
    setActive(next)
    refs.current[next]?.focus()
  }

  return (
    <div>
      <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="flex overflow-x-auto overflow-y-hidden border-b border-current/20">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${base}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className="min-h-11 shrink-0 cursor-pointer whitespace-nowrap border-b-4 border-transparent px-4 py-2 text-lg opacity-80 hover:opacity-100 aria-selected:border-current aria-selected:font-bold aria-selected:opacity-100"
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div key={tab.id} role="tabpanel" id={`${base}-panel-${i}`} aria-labelledby={`${base}-tab-${i}`} tabIndex={0} hidden={i !== active} className="pt-6">
          {tab.panel}
        </div>
      ))}
    </div>
  )
}
