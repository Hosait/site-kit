# SpilkaWWW

Ny løsning for spilka.com, spilka-sbs.com og spilka-dws.com (erstatter Craft CMS).
Next.js 16 (App Router) + Payload CMS 3 + Postgres, hostes på Hosait.

## Kjøre lokalt
- `docker compose up -d` (Postgres på 5433) → `pnpm dev` (port 3100) → admin: http://localhost:3100/admin
- Bytt nettsted lokalt: `?site=sbs` / `?site=dws` (huskes i cookie), eller vertene `industri.localhost`, `sbs.localhost`, `dws.localhost`.

## Arkitektur
- `src/lib/sites.ts` – de tre nettstedene, språk (`no`/`en`), URL-hjelpere. `src/proxy.ts` – Host → `/{site}/{locale}/...`.
- Én catch-all rute: `src/app/(frontend)/[site]/[locale]/[[...path]]/page.tsx` slår opp side (på `path`), artikkel (`articleBase/slug`) eller omdirigering.
- Samlinger i `src/collections/`. Alt innhold har `site`. Sider er hierarkiske; `path` bygges i hook per språk.
- Blokker: konfig i `src/blocks/configs.ts`, visning i `src/blocks/components.tsx`, registreres i `RenderBlocks.tsx`.
- Data hentes via `src/lib/data.ts` (unstable_cache + tagger); hooks i `src/lib/revalidate.ts` tømmer taggene.
- Søk: `src/lib/search/` (indeks i samlingen `search-index`, hooks på sider/artikler/dokumenter/personer, Postgres-fulltekst). Søkesiden er `/no/sok` og `/en/search`.
- Besøksanalyse og samtykke: `src/lib/analytics/` (mottak `/next/a`, rapporter, samtykke), banner og sporing i `src/components/analytics/`, admin-siden `/admin/analytics`. Ingen IP-adresser lagres.
- Bilder: WebP-størrelser lages ved opplasting (`Media.ts`); `components/Img.tsx` bygger srcset. Ingen runtime-skalering.
- Etter endring i samlinger/blokker: `pnpm generate:types` og ved nye admin-komponenter `pnpm generate:importmap`.

## Regler
- Norsk i grensesnitt for redaktører og kodekommentarer; UI-tekster til besøkende i `src/lib/i18n.ts` (no/en).
- Mobil først, trykkflater ≥ 44 px, WCAG 2.1 AA.
- Aldri deploy uten eksplisitt «deploy» fra Bjørn.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
