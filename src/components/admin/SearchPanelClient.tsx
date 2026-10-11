'use client'

import { Button } from '@payloadcms/ui'
import { useCallback, useEffect, useState } from 'react'

type Progress = { running: boolean; total: number; done: number; entries: number; failed: string[]; finishedAt?: string }
type Status = { entries: number; progress: Progress | null }

// Samme header som sjekkes i src/app/(frontend)/next/search/reindex/route.ts.
const call = async (method: 'GET' | 'POST') => {
  const res = await fetch('/next/search/reindex', { method, credentials: 'same-origin', headers: { 'x-site-search': '1' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export function SearchPanelClient() {
  const [status, setStatus] = useState<Status | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setStatus(await call('GET'))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [])

  // Henter status ved åpning, og hvert 2. sekund mens indeksen bygges.
  const running = Boolean(status?.progress?.running)
  useEffect(() => {
    const first = setTimeout(refresh, 0)
    if (!running) return () => clearTimeout(first)
    const timer = setInterval(refresh, 2000)
    return () => {
      clearTimeout(first)
      clearInterval(timer)
    }
  }, [running, refresh])

  const rebuild = async () => {
    setError(null)
    try {
      await call('POST')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
    await refresh()
  }

  const p = status?.progress
  return (
    <div style={{ border: '1px solid var(--theme-elevation-150)', borderRadius: 4, padding: 'var(--base)', marginBottom: 'calc(var(--base) * 2)' }}>
      <h3 style={{ marginTop: 0 }}>Søkeindeks</h3>
      <p>
        Søket på nettstedene oppdateres automatisk når innhold publiseres. Bygg indeksen på nytt etter import av innhold,
        eller hvis søket virker utdatert.
        {status && ` Nå: ${status.entries} oppføringer.`}
      </p>
      <Button buttonStyle="secondary" disabled={running} onClick={rebuild}>
        Bygg søkeindeks
      </Button>
      {error && <p role="alert">Feil: {error}</p>}
      {p && (
        <div role="status">
          <p>
            {p.done} av {p.total} dokumenter{p.running ? ' – pågår (PDF-er tar litt tid).' : p.finishedAt ? ` – ferdig, ${p.entries} oppføringer.` : ''}
          </p>
          <progress max={p.total || 1} value={p.done} style={{ width: '100%' }} />
          {p.failed.length > 0 && (
            <details>
              <summary>{p.failed.length} feilet</summary>
              <ul>
                {p.failed.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
