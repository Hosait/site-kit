# Building a site on Site Kit

For an AI agent (or a person) rebuilding an existing website on this template and publishing it
on Hosait. You fill in content, theme and configuration; you do not write front-end code. Where
no block fits a part of the old site, list it as a gap in the plan.

## 1. Set up

    pnpm install
    pnpm site-builder:install
    docker compose up -d          # local Postgres (port 5433)
    cp .env.example .env

## 2. Read the old site

    pnpm site-builder crawl https://www.example.com
    pnpm site-builder extract --out .site-builder/www.example.com
    pnpm site-builder theme   --out .site-builder/www.example.com
    pnpm site-builder report  --out .site-builder/www.example.com

Read `report.md` with the customer. `extract.json` holds every page's content and its template.

## 3. Ask the intake questions

Ask the questions in `site/questions.json`. Each answer says what it sets: a path in
`site/config.ts`, `report.*` (for the report and quote) or `cms.*` (entered in the admin after
the first deploy). If you change sites, locales, document types or article kinds in
`site/config.ts`, run `pnpm payload migrate:create <name>` and `pnpm generate:types`, then
`pnpm kit:schema`.

## 4. Theme

Copy `theme` from `theme.draft.json` into `site/theme.json`, put the logo in `public/brand/`, set
the fonts in `site/fonts.ts`, and run `pnpm kit:theme-check` (every pair needs 4.5:1).

## 5. Write the site plan

Write `seed/site-plan.json` against `schema/site-plan.schema.json`; the blocks and their fields
are in `schema/blocks.schema.json`. Map each template once, then fill every page of it. Put
images and PDFs in `seed/media/` (or use public https URLs). Office files (Word, Excel,
PowerPoint), zip and DWG cannot be imported from a URL: download them into `seed/media/` and list
them under `documents`. SVG is not imported: the logo goes in `public/brand/` (step 4), and other
SVG graphics are a gap. Every file is checked by its first bytes, not its name. Link with
`$media`, `$page`, `$pageLink`, `$person`, `$document`; rich text is `$html`. Add `redirects` for
every old URL that moves, and `gaps` for anything no block matches. Check it until it passes,
then try it locally:

    pnpm kit:check-plan seed/site-plan.json
    pnpm kit:import seed/site-plan.json --reset
    pnpm dev

## 6. Check

    pnpm typecheck
    pnpm lint
    pnpm test:unit

After the preview is up: copy `.site-builder/<host>/urls.json` to `import-data/urls.json` and run
`pnpm qa:urls <preview address>`; run `pnpm qa:axe`.

## 7. Publish on Hosait

Push the repository and connect it to a blank Hosait project: the Hosait wizard, or the MCP tool
`connect_repository` when the hosait connection covers a blank project (the plugin's sign-in to a
blank project, or a project token with the `source` permission). The first deploy generates the
secrets and imports `seed/site-plan.json` into the empty database. Hosait's deploy result (and
`nextSteps` from `get_project_status`) says whether the import worked. If it failed, the import
removed what it wrote, and its reason is in the web service's log (`get_runtime_logs`, or Logs
on the project page; lines starting with `[seed]`). Fix the plan and push; then the user presses
"Run seed again" on the project page. A push alone does not run the seed again.
Never commit `.env` or any secret.

Right after the first deploy, the user creates the first admin user at `/admin` on the
hosait.com address: until someone has, that page lets anyone create one.

When the site moves to its own domain:

1. In `site/config.ts`, `origin` and `hosts` name the domain (and `www.` if it is used). Commit
   and push the change.
2. In Hosait, the user adds the domain under Settings → Domains and follows the DNS steps there.
   Each extra name (the bare domain next to `www.`, an old domain) gets "Serve the site here".
3. The user sets the variable `SITE_ORIGINS` to `production` under the project's Variables in
   Hosait (the plugin's sign-in cannot change variables) and redeploys. Until then every page is
   `noindex`, `robots.txt` blocks search engines, and the sitemap uses the hosait.com address.
---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
