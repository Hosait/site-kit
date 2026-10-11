# Who this file is for

Building a customer site from this template? Follow `AGENTS.md`; the rest of this file is for
Hosait staff working on the kit itself in the `Hosait/site-kit` repository, and does not apply
to sites made from it.

# Hosait Site Kit

A website template: Next.js 16 (App Router) + Payload CMS 3 + Postgres, hosted on Hosait.
Each customer site is generated from it.

## Run locally
- `docker compose up -d` (Postgres on 5433) → `pnpm dev` (port 3100) → admin: http://localhost:3100/admin

## Architecture
- Kit code is in `src/`. A customer's own files are only `site/config.ts`, `site/theme.json`,
  `site/fonts.ts`, `site/blocks/custom/` and `public/brand/`. Don't put customer specifics in `src/`.
- `src/lib/sites.ts` derives sites and locales from `site/config.ts`; `src/proxy.ts` maps Host → `/{site}/{locale}/...`.
- Blocks: config in `src/blocks/configs.ts`, rendering in `src/blocks/components.tsx`, registered in `RenderBlocks.tsx`.
- Site plans: schema in `schema/`, validator and refs in `src/lib/site-plan/`, importer `scripts/kit/import-plan.ts`.
- After changing collections or blocks: `pnpm generate:types`, `pnpm generate:importmap`, `pnpm kit:schema`,
  and a migration (`pnpm payload migrate:create <name>`).

## Rules
- Norwegian in editor-facing admin UI; visitor texts in `src/lib/i18n.ts` (no/en). Code comments in new files: English.
- Mobile first, tap targets ≥ 44 px, WCAG 2.1 AA.
- Nothing optional loads before the visitor consents.
- Never deploy without an explicit OK from Steinar.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
