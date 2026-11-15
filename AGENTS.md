# Building a site on Site Kit

For an AI agent (or a person) rebuilding an existing website on this template and publishing it
on Hosait. You fill in content, theme and configuration; you do not write front-end code. Where
no block fits a part of the old site, list it as a gap in the plan.

## 0. Check that the site fits

Hosait Sites moves simple content websites: about, services, news, people and contact, up to
about 200 pages. Two checks decide, before anything else is set up, read or written.

First, Hosait's check. The user makes the Hosait project with «Flytt nettsiden din» on
hosait.com, which checks the site on Hosait's side. Read that project with the Hosait MCP tools
(`get_project_status`) and look at `project.siteMove`. Go on only when it is there, its `class`
is green (or yellow with `acceptedScope` true), its `assessedAt` is less than 7 days old and its
`url` is the site you are moving. Otherwise stop: tell the user plainly to run the check at
hosait.com → New project → «Flytt nettsiden din» first; nothing is built before Hosait's check
has said yes. Do not offer a way around it, and do not use the check below instead.

Then this check, the second one:

    pnpm site-builder:install
    pnpm site-builder assess https://www.example.com

In a few minutes it reads a sample of the site and writes `assess.md` (for the user) and
`assess.json` (class, reasons and evidence) in `.site-builder/<host>/`.

If the user has asked for parts of the site to be left out, pass them to `assess`:
`--exclude <path>` for each content part not to move, such as `--exclude /intranett` or
`--exclude /arkiv`. What is left out is not moved or counted, and `crawl` leaves out the same,
from `assess.json`. A shop, a catalogue, payment and a member area stay red whatever is left
out, and a shop, cart, catalogue or login path cannot be excluded; the size can change by leaving
out content pages. Use the limits only when the user asked for them before the check.

- **red** (the command exits 3): stop here. Tell the user plainly why, from `assess.md`: Hosait
  does not move web shops, product catalogues, sites with a login or member area, or sites of
  more than 500 pages (in one language; 1500 in all) or 500 articles. Do not offer to move part
  of the site, and do not go on to step 1.
- **yellow**: show the user `assess.md` and ask them to accept the scope and the storage it lists
  (more pages or documents than a standard move, a lot of media, or built-in services). Go on only when they say yes, and run `crawl` with `--accepted-scope`.
- **Not decided yet** (yellow, `not-enough-read`): do not ask the user to accept it. Run the
  check again, with a larger `--budget` or at the address a note names. If it still cannot read
  the site, stop and tell the user the site could not be checked.
- **green**: go on to step 1.

`crawl` starts only after a check of the same site that is not red, is less than 7 days old,
and could read enough, and after yellow only with `--accepted-scope`.

## 1. Set up

    pnpm install
    pnpm site-builder:install
    docker compose up -d          # local Postgres (port 5433)
    cp .env.example .env

## 2. Read the old site

    pnpm site-builder crawl https://www.example.com      # with --accepted-scope after a yes to yellow
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
the fonts in `site/fonts.ts`, and run `pnpm kit:theme-check` (every pair needs 4.5:1). Download the
old site's icon (`icon.src` in the draft, a PNG or ICO when the old site has one) into
`public/brand/` too, and set `icon.src` in `site/theme.json` to its `/brand/…` path (`.png`,
`.ico`, `.webp` or `.svg`). `kit:theme-check` refuses an icon over 100 KB, one whose content does
not match its extension, and an SVG with script, event handlers or outside links. If it cannot be
downloaded or does not pass, leave `icon` out: the kit's own icon is used.

## 5. Write the site plan

Write `seed/site-plan.json` against `schema/site-plan.schema.json`; the blocks and their fields
are in `schema/blocks.schema.json`. Map each template once, then fill every page of it. Put
images and PDFs in `seed/media/` (or use public https URLs). Office files (Word, Excel,
PowerPoint), zip and DWG cannot be imported from a URL: download them into `seed/media/` and list
them under `documents`. SVG is not imported: the logo goes in `public/brand/` (step 4), and other
SVG graphics are a gap. Every file is checked by its first bytes, not its name. Link with
`$media`, `$page`, `$pageLink`, `$person`, `$document`, `$form`; rich text is `$html`. Forms go in
`forms`: their fields, the button text, the message shown after sending, and `retention` (days,
or `"keep"`) from the intake answer; left out, the site default in `site/config.ts` applies. A
`formBlock` points at one with `{ "$form": "<ref>" }`. Submissions are read in the admin and
deleted each night once older than the period; the privacy page says how long each form's
submissions are kept, with the same periods. Add `redirects` for every old URL that moves, and
`gaps` for anything no block matches (a form that must send e-mail or take payment is still a
gap). Check it until it passes, then try it locally:

    pnpm kit:check-plan seed/site-plan.json
    pnpm kit:import seed/site-plan.json --reset
    pnpm dev

## 6. Check

    pnpm typecheck
    pnpm lint
    pnpm test:unit

After the preview is up, run
`pnpm site-builder compare --out .site-builder/<host> --new <preview address>` (add
`--allow-private` for a local preview) and look at `compare.md` (old pages and the old site's
documents, PDFs and the like) and `compare.html` in that folder. Then run the launch checks; fix
every error they report before the site moves to its own domain:

- `pnpm qa:launch <preview address>` fails on a sitemap page that does not answer, placeholder or
  demo text (the seeded privacy page, «Nordlys Demo», example.com), a page without a title and a
  broken internal link. Its warnings (no description, no share image, images without alt text) go
  into the hand-off to the user.
- `pnpm qa:axe <preview address>` fails on serious accessibility errors on the site's own pages.
  It needs Playwright's Chromium (`pnpm exec playwright install chromium`).

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

Right after the first deploy, the user creates the first admin user. Only the claim link can:
"Create your admin user" under Next steps on the project page in Hosait opens
`/next/admin-claim?code=…` (the code is the variable `ADMIN_CLAIM_SECRET`, which Hosait
generates), and that opens `/admin` for an hour. Without it `/admin` refuses the first user. If
the step opens plain `/admin`, the user copies `ADMIN_CLAIM_SECRET` from the project's Variables
and opens `<address>/next/admin-claim?code=<value>`. Never ask for the value. Once a user exists, an
import cut off part-way (the web service restarted during it) leaves pages that make "Run seed
again" refuse; the admin then replaces the content with "Legg inn innhold" in the Testinnhold
panel on the admin dashboard.

Before the domain switch, run `pnpm site-builder compare` again with `--new` set to the site's
hosait.com address.

When the site moves to its own domain (only once `pnpm qa:launch` and `pnpm qa:axe` pass on the
preview):

1. In `site/config.ts`, `origin` and `hosts` name the domain (and `www.` if it is used). Commit
   and push the change.
2. In Hosait, the user adds the domain under Settings → Domains and follows the DNS steps there.
   Each extra name (the bare domain next to `www.`, an old domain) gets "Serve the site here".
3. Nothing to set. Once Hosait has verified the domain, the next deploy or restart serves it as
   the project's address (`HOSAIT_URL`), and because it is one of the `hosts` the site switches
   to production by itself: indexing on, canonical URLs and the sitemap on the domain, the seed
   route locked. If the domain was verified after the last deploy, the user redeploys in Hosait.
   Until then every page is `noindex` and `robots.txt` blocks search engines. The variable
   `SITE_ORIGINS` (`staging` or `production`) overrides this; leave it unset.
4. Once the domain answers, run `pnpm qa:launch https://<domain>`. On one of the site's own
   `hosts` it also fails while search engines are shut out: `robots.txt` blocks them, a page is
   `noindex`, or a canonical address is on another host. Then the site is still in staging: the
   user redeploys in Hosait, and you run the check again.
---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
