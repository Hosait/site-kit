import Link from 'next/link'

import { Logo } from '@/components/Logo'

/** 404. Vi vet ikke språket her (Next gir ikke params til not-found), så teksten er tospråklig. */
export default function NotFound() {
  return (
    <main id="innhold" className="wrap-text flex min-h-[70vh] flex-col justify-center gap-6 py-20">
      <Logo site="industri" className="self-start" />
      <h1 className="t-h2">Fant ikke siden</h1>
      <p className="t-lead">Siden kan være flyttet eller slettet.</p>
      <p lang="en" className="text-night/70">
        Page not found – it may have moved or been removed.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/no" className="btn btn-primary">
          Til forsiden
        </Link>
        <Link href="/en" className="btn" hrefLang="en">
          Front page (English)
        </Link>
      </div>
    </main>
  )
}
