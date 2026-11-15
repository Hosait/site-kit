'use client'
import { Button, useAuth, useDocumentInfo } from '@payloadcms/ui'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * In the page form: a button to the visual editor. Users with «Enkel modus» are sent there when they
 * open a page, unless they came from the editor's «Avansert redigering» link (`?form=1`).
 */
export function OpenVisualEditor() {
  const { id } = useDocumentInfo()
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const checked = useRef(false)
  // The admin route from the address (…/admin/collections/pages/:id), so no config context is needed.
  const adminRoute = pathname.split('/collections/')[0] || '/admin'
  const href = id ? `${adminRoute}/visual/pages/${id}` : null

  useEffect(() => {
    if (checked.current || !href || !user) return
    checked.current = true
    // Only the page's own edit view, not a drawer that shows the page inside another document.
    const ownView = pathname === `${adminRoute}/collections/pages/${id}`
    if (ownView && (user as { simpleMode?: boolean | null }).simpleMode && search.get('form') !== '1') router.replace(href)
  }, [href, user, pathname, search, id, adminRoute, router])

  if (!href) return null
  return (
    <Button el="link" url={href} buttonStyle="secondary" size="medium" margin={false}>
      Visuell redigering
    </Button>
  )
}
