import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { hasAnalyticsAccess } from '@/collections/Analytics'
import { audit } from '@/lib/analytics/audit'
import { EXPORTS, parseFilters, type ExportName } from '@/lib/analytics/reports'

export const dynamic = 'force-dynamic'

/**
 * CSV-eksport fra Besøksanalyse: /next/analytics/export?report=sider&days=30[&site=sbs&locale=no]
 * Krever innlogget bruker med tilgang til besøksanalyse. Hver eksport logges.
 */
const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v)
  // Hindrer formler i regneark (=, +, -, @).
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s
  return /[";\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

export async function GET(req: Request) {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: req.headers })
  if (!hasAnalyticsAccess(user)) return new Response('Forbidden', { status: 403 })

  const url = new URL(req.url)
  const report = url.searchParams.get('report') as ExportName | null
  if (!report || !(report in EXPORTS)) return new Response('Ukjent rapport', { status: 400 })
  const filters = parseFilters(Object.fromEntries(url.searchParams))
  const rows = (await EXPORTS[report](payload, filters)) as Record<string, unknown>[]

  const columns = [...new Set(rows.flatMap((r) => Object.keys(r)))]
  // Semikolon og BOM: åpnes riktig i norsk Excel.
  const csv = '﻿' + [columns.join(';'), ...rows.map((r) => columns.map((c) => csvCell(r[c])).join(';'))].join('\r\n')
  await audit(payload, user, 'Eksporterte besøksdata', { report, ...filters, rows: rows.length })

  const name = `besoksanalyse-${report}-${filters.days}d${filters.site ? `-${filters.site}` : ''}.csv`
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'no-store',
    },
  })
}
