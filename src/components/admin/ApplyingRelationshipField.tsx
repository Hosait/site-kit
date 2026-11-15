'use client'

import type { RelationshipFieldClientComponent } from 'payload'
import { RelationshipField, useDocumentInfo, useField, useLocale } from '@payloadcms/ui'
import { useEffect, useRef } from 'react'

const POLL_MS = 500
const POLL_TRIES = 16

/**
 * The ordinary relationship picker for «Start fra sidemal» and «Sett inn lagret seksjon». Choosing one
 * makes the server rewrite the page's sections when the autosave saves it (hooks in
 * src/hooks/reusableContent.ts). Payload does not redraw the open form from an autosave, so the new
 * sections would show only after a reload. Once the saved page has changed, this reloads it. If
 * nothing changes within a few seconds it does nothing: «Lagre» redraws the form as usual.
 */
export const ApplyingRelationshipField: RelationshipFieldClientComponent = (props) => {
  const { path } = props
  const { value, initialValue } = useField<number | string | null>({ path })
  const { id, collectionSlug } = useDocumentInfo()
  const { code } = useLocale()
  const asked = useRef<unknown>(initialValue)

  useEffect(() => {
    if (!value || value === asked.current || !id || !collectionSlug) return
    asked.current = value
    let stopped = false
    const url = `/api/${collectionSlug}/${id}?draft=true&depth=0&locale=${code}&select[updatedAt]=true`
    const updatedAt = async (): Promise<string | undefined> => {
      try {
        const res = await fetch(url, { credentials: 'include' })
        return res.ok ? ((await res.json()) as { updatedAt?: string }).updatedAt : undefined
      } catch {
        return undefined
      }
    }
    void (async () => {
      const before = await updatedAt()
      for (let i = 0; i < POLL_TRIES && !stopped; i++) {
        await new Promise((r) => setTimeout(r, POLL_MS))
        const now = await updatedAt()
        if (!stopped && before && now && now !== before) {
          window.location.reload()
          return
        }
      }
    })()
    return () => {
      stopped = true
    }
  }, [value, id, collectionSlug, code])

  return <RelationshipField {...props} />
}
