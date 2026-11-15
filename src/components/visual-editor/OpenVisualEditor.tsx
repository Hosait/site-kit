'use client'
import { Button, useAuth, useConfig, useDocumentInfo } from '@payloadcms/ui'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * In the page form: a button to the visual editor. Users with «Enkel modus» are sent there when they
 * open a page, unless they came from the editor's «Avansert redigering» link (`?form=1`).
 */
export function OpenVisualEditor() {
  const { id } = useDocumentInfo()
  const { user } = useAuth()
  const { config } = useConfig()
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const checked = useRef(false)
  const href = id ? `${config.routes.admin}/visual/pages/${id}` : null

  useEffect(() => {
    if (checked.current || !href || !user) return
    checked.current = true
    // Only the page's own edit view, not a drawer that shows the page inside another document.
    const ownView = pathname === `${config.routes.admin}/collections/pages/${id}`
    if (ownView && (user as { simpleMode?: boolean | null }).simpleMode && search.get('form') !== '1') router.replace(href)
  }, [href, user, pathname, search, id, config.routes.admin, router])

  if (!href) return null
  return (
    <Button el="link" url={href} buttonStyle="secondary" size="medium" margin={false}>
      Visuell redigering
    </Button>
  )
}
