'use client'

import { Button } from '@payloadcms/ui'
import { useCallback, useEffect, useState } from 'react'

type Progress = { running: boolean; total: number; done: number; failed: string[]; finishedAt?: string }

// Samme header som sjekkes i src/app/(frontend)/next/seed/[step]/route.ts.
const call = async (step: string, method: 'GET' | 'POST') => {
  const res = await fetch(`/next/seed/${step}`, { method, credentials: 'same-origin', headers: { 'x-site-seed': '1' } })
  const body = await res.json().catch(() => ({ ok: false, error: `HTTP ${res.status}` }))
  if (!res.ok && body.ok !== false) return { ok: false, error: `HTTP ${res.status}` }
  return body
}

export function SeedPanelClient() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [media, setMedia] = useState<Progress | null>(null)

  const refresh = useCallback(async () => {
    const body = await call('status', 'GET')
    if ('media' in body) setMedia(body.media)
  }, [])

  // Henter status ved åpning, og hvert 3. sekund mens bildene lastes.
  useEffect(() => {
    const first = setTimeout(refresh, 0)
    if (!media?.running) return () => clearTimeout(first)
    const timer = setInterval(refresh, 3000)
    return () => {
      clearTimeout(first)
      clearInterval(timer)
    }
  }, [media?.running, refresh])

  const seedDb = async () => {
    if (!window.confirm('Dette erstatter alt innhold (sider, artikler, personer, dokumenter, bilder) med testinnholdet. Brukere berøres ikke. Fortsette?')) return
    setBusy(true)
    setMessage('Legger inn innhold …')
    const body = await call('db', 'POST')
    setBusy(false)
    setMessage(
      body.ok
        ? `Ferdig: ${body.counts.pages} sider, ${body.counts.articles} artikler, ${body.counts.media} bilder registrert. Hent bildene i steg 2.`
        : `Feil: ${body.error}`,
    )
  }

  const seedMedia = async () => {
    setBusy(true)
    const body = await call('media', 'POST')
    setBusy(false)
    if (!body.ok) setMessage(`Feil: ${body.error}`)
    else setMessage(null)
    await refresh()
  }

  const pct = media && media.total ? Math.round((media.done / media.total) * 100) : 0

  return (
    <div style={{ border: '1px solid var(--theme-elevation-150)', borderRadius: 4, padding: 'var(--base)', marginBottom: 'calc(var(--base) * 2)' }}>
      <h3 style={{ marginTop: 0 }}>Testinnhold</h3>
      <p>Fyller denne testinstallasjonen med innholdet fra dagens nettsteder. Kjør steg 1, deretter steg 2.</p>
      <div style={{ display: 'flex', gap: 'var(--base)', flexWrap: 'wrap' }}>
        <Button buttonStyle="secondary" disabled={busy || media?.running} onClick={seedDb}>
          1. Legg inn innhold
        </Button>
        <Button buttonStyle="secondary" disabled={busy || media?.running} onClick={seedMedia}>
          2. Hent bilder og dokumenter
        </Button>
      </div>
      {message && <p role="status">{message}</p>}
      {media && (
        <div role="status">
          <p>
            Bilder og dokumenter: {media.done} av {media.total} ({pct} %)
            {media.running ? ' – pågår, tar ca. 15 minutter. Du kan lukke siden.' : media.finishedAt ? ' – ferdig.' : ''}
          </p>
          <progress max={media.total || 1} value={media.done} style={{ width: '100%' }} />
          {media.failed.length > 0 && (
            <details>
              <summary>{media.failed.length} feilet</summary>
              <ul>
                {media.failed.map((f) => (
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
