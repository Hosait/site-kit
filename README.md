# Hosait Site Kit

A website template for Hosait Sites: Next.js 16, Payload CMS 3, Postgres and S3, built from a
proven customer site. Every customer site is a repo generated from this template.

## What belongs to the customer

Kit code lives in `src/`. A site is made its own in these places only, so kit updates can flow in:

| File | What it sets |
|---|---|
| `site/config.ts` | Sites, languages (one or two), brand, e-mail sender, cookie prefix, time zone, document types, article kinds, feature switches |
| `site/theme.json` | Colours, radius, logo (checked for WCAG AA contrast) |
| `site/fonts.ts` | The typeface (self-hosted with `next/font/local`) |
| `site/blocks/custom/` | Blocks only this site uses |
| `public/brand/` | Logo file |

Sites, languages, document types and article kinds become database enums, and the search indexes
are per language. The shipped migrations fit the demo config (one site, no/en). A new site whose
config differs regenerates the initial migration before its first deploy: delete `src/migrations/*`,
run `pnpm payload migrate:create initial`, and add the search-index lines for its languages (copy them
from the demo's initial migration with that language's text-search config). After the first deploy,
every such change needs a new migration (`pnpm payload migrate:create <name> && pnpm generate:types`);
CI fails if the schema changed without one.

## Run it locally

```bash
docker compose up -d          # Postgres on port 5433
cp .env.example .env          # then set PAYLOAD_SECRET
pnpm install
pnpm dev                      # http://localhost:3100, admin at /admin
pnpm tsx scripts/dev-admin.ts # a local admin user; password saved in .env
```

## Fill a site with content

A site plan (`site-plan.json`, schema in `schema/site-plan.schema.json`) describes pages as blocks,
articles, people, documents, media, menus and redirects. `examples/demo/` is a complete example.

Images and PDFs sit in a folder next to the plan, or are public https URLs. Try a plan locally:

```bash
pnpm kit:import seed/site-plan.json --reset   # into the local database
```

To ship it, commit it as `seed/site-plan.json` with local files under `seed/`. On Hosait the
first publish runs `seed.run` from `hosait.json`, which imports the plan into the empty database
in the background (`/next/seed/status` shows progress). The admin dashboard's seed panel does the
same by hand. It never replaces content unless asked (`?replace=1`). Older sites can still ship a
SQL dump (`pnpm kit:export-seed` → `seed/content.sql.gz` and `seed/files/`, with
`"files": "seed/files"` added under `seed` in `hosait.json`), which is used when there is no plan.

## Checks

```bash
pnpm test:unit          # unit tests
pnpm kit:theme-check    # theme.json contrast
pnpm kit:schema         # regenerate schema/blocks.schema.json after block changes
pnpm test:e2e           # Playwright against a running site (BASE_URL for a deployed one)
pnpm qa:axe <url>       # accessibility report
pnpm qa:launch <url>    # launch check: errors stop the move to the own domain
```

## Spending

`pnpm spend:ci [owner/repo] [YYYY-MM]` counts billable GitHub Actions minutes for a month. CI runs on
pull requests only. Record spending in the Hosait Sites spend ledger.

## Licence

MIT, see [LICENSE](LICENSE).
