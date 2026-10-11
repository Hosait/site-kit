/**
 * URL-paritet: hver adresse som fantes på det gamle nettstedet (import-data/urls.json, skrevet av
 * Phase 2-crawleren i formen {site: {locale: [{url, status}]}})
 * skal gi 200 – eller 301/308 til en side som gir 200 – i den nye løsningen.
 *
 *   pnpm tsx scripts/qa/url-parity.ts [BASE_URL]
 *
 * Mot staging/lokalt brukes `?site=` (samme vert for alle nettsteder). Skriver rapport til
 * import-data/url-parity.md og avslutter med kode 1 hvis noe mangler.
 */
import fs from 'fs'
import path from 'path'

type Entry = { url: string; path: string; status: number; pageType?: string; redirect?: string }

const base = (process.argv[2] || 'http://localhost:3100').replace(/\/$/, '')
const urls: Record<string, Record<string, Entry[]>> = JSON.parse(fs.readFileSync(path.resolve('import-data/urls.json'), 'utf8'))

const results: { site: string; old: string; status: number; final?: string; note?: string }[] = []

async function check(site: string, oldUrl: string) {
  const u = new URL(oldUrl)
  const target = `${base}${encodeURI(decodeURI(u.pathname))}${u.pathname.includes('?') ? '&' : '?'}site=${site}`
  let res = await fetch(target, { redirect: 'manual' })
  let status = res.status
  let final: string | undefined
  // Følg omdirigeringer (maks 3) og krev 200 til slutt.
  for (let i = 0; i < 3 && status >= 300 && status < 400; i++) {
    const loc = res.headers.get('location')
    if (!loc) break
    final = new URL(loc, target).toString()
    if (!final.includes('site=') && final.startsWith(base)) final += (final.includes('?') ? '&' : '?') + `site=${site}`
    res = await fetch(final, { redirect: 'manual' })
    status = res.status
  }
  results.push({ site, old: oldUrl, status, final })
}

const queue: [string, string][] = []
for (const [site, byLocale] of Object.entries(urls)) {
  for (const entries of Object.values(byLocale)) {
    for (const e of entries) if (e.status === 200) queue.push([site, e.url])
  }
}

// Fire parallelle forespørsler.
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const [site, url] = queue.shift()!
      await check(site, url).catch((err) => results.push({ site, old: url, status: 0, note: String(err) }))
    }
  }),
)

const bad = results.filter((r) => r.status !== 200)
const lines = [
  `# URL-paritet mot ${base}`,
  '',
  `${results.length} gamle adresser (som svarer 200 i dag) sjekket: ${results.length - bad.length} OK, ${bad.length} mangler.`,
  '',
  ...bad.map((r) => `- ${r.status} ${r.site} ${r.old}${r.final ? ` → ${r.final}` : ''}${r.note ? ` (${r.note})` : ''}`),
]
fs.writeFileSync(path.resolve('import-data/url-parity.md'), lines.join('\n') + '\n')
console.log(lines.slice(0, 40).join('\n'))
process.exit(bad.length ? 1 : 0)
