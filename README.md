# Hosait Site Kit

A website template for Hosait Sites: Next.js 16, Payload CMS 3, Postgres and S3, built from a
proven customer site. Every customer site is a repo generated from this template.

## What belongs to the customer

Kit code lives in `src/`. A site is made its own in these places only, so kit updates can flow in:

| File | What it sets |
|---|---|
| `site/config.ts` | Sites, languages (one or two), brand, e-mail sender, cookie prefix, time zone, document types, article kinds, feature switches |
| `site/theme.json` | Colours, radius, logo (checked for WCAG AA contrast), and optional tokens: type, containers, spacing, buttons, cards, links, style classes |
| `site/styles.css` | The site's own CSS after the kit's (checked: nothing loads from elsewhere) |
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

## Users, roles and approval

Each user (Brukere) has one role, and on a kit with several sites the sites they work on:

| Role | May |
|---|---|
| Administrator | everything |
| Utgiver (`publisher`) | edit and publish |
| Redaktør (`editor`) | edit and save drafts; cannot publish, unpublish or delete what is published |
| Godkjenner (`reviewer`) | read, comment, approve or ask for changes; no editing |

Publishing is enforced on the server (`src/access/siteAccess.ts` and `src/collections/editorial/hooks.ts`),
for pages, articles and any collection with drafts, so the REST and local APIs refuse an editor too.
The role rules are in `src/lib/editorial/roles.ts`. Before the roles existed every editor could
publish; the migration made those users publishers.

Pages and articles have an approval state, changed only by the buttons in the admin sidebar
(`POST /api/{pages|articles}/:id/workflow`): draft → «Send til godkjenning» → in review →
«Godkjenn» or «Be om endringer». Editing a page in review or approved sends it back to draft. The
reviewers of the site get an e-mail (SMTP when `SMTP_HOST` is set, otherwise the console). The
sidebar also has comments per page, optionally on one section (`comments` collection).

`content-audit-log` («Endringslogg», administrators only) records who created, changed, published
or deleted pages, articles, people, documents, media, site settings and users, with the names of the
changed fields and never their values. Nobody can edit or delete a row; the nightly job
`prune-audit-log` deletes rows older than `AUDIT_RETENTION_DAYS` (730 days, `src/lib/editorial/audit.ts`).

## Fill a site with content

A site plan (`site-plan.json`, schema in `schema/site-plan.schema.json`) describes pages as blocks,
articles, people, documents, media, menus, redirects and global sections. `examples/demo/` is a complete example.

There are 32 blocks (the list is `blockTypes` in `schema/blocks.schema.json`). Layout: `columns` (2–4 columns,
ratio presets, stacked on mobile; each column holds any block except columns, forms, `hero` and `newsletter`),
`tabs`, `carousel`, `table`, `divider`. Content: `pricing`, `logoWall`, `testimonials`, `iconFeatures` (a fixed
icon set), `banner`, `buttonGroup`, `contactCard`, `newsletter`. `seed/site-plan.json` has a page with every one
of them (`/no/blokker`, `/en/blocks`). Maps and provider forms in `contactCard` and `newsletter` load only after
a click; `carousel` never changes slide by itself unless `autoplay` is on, and never for visitors who prefer
reduced motion.

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

## Reuse content

All three are in the admin's «Innhold» group and are per site:

- **Felles seksjoner** (`globalSections`): sections shown on several pages, such as a contact
  section. A page uses one with the «Felles seksjon» block and shows its published version, so
  publishing the section rebuilds every page that shows it (cache tag `globalSections`). A global
  section cannot contain another. In a site plan they go under `globalSections`, and a page points
  at one with `{ "$globalSection": "<ref>" }`.
- **Sidemaler** (`pageTemplates`): a ready layout. Choosing one in «Start fra sidemal» on a new page
  copies its sections (in the language the page is created in) when the page is first saved.
- **Lagrede seksjoner** (`sectionPresets`): one block saved under a name. On a page, add the block
  «Sett inn lagret seksjon» and pick one; saving the page swaps it for an independent copy.

Pages are not rebuilt from templates or saved sections afterwards: only global sections stay shared.

## Checks

```bash
pnpm test:unit          # unit tests
pnpm kit:theme-check    # theme.json contrast
pnpm kit:schema         # regenerate schema/blocks.schema.json after block changes
pnpm test:e2e           # Playwright against a running site (BASE_URL for a deployed one)
pnpm qa:axe <url>       # serious accessibility errors on the site's own pages (exit 1)
pnpm qa:launch <url>    # launch check: errors stop the move to the own domain
```

## Spending

`pnpm spend:ci [owner/repo] [YYYY-MM]` counts billable GitHub Actions minutes for a month. CI runs on
pull requests only. Record spending in the Hosait Sites spend ledger.

## Licence

MIT, see [LICENSE](LICENSE).
