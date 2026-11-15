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
    pnpm site-builder style   --out .site-builder/www.example.com
    pnpm site-builder report  --out .site-builder/www.example.com

Read `report.md` with the customer. `extract.json` holds every page's content and its template.

## 3. Ask the intake questions

Ask the questions in `site/questions.json`. Each answer says what it sets: a path in
`site/config.ts`, `report.*` (for the report and quote) or `cms.*` (entered in the admin after
the first deploy). If you change sites, locales, document types or article kinds in
`site/config.ts`, run `pnpm payload migrate:create <name>` and `pnpm generate:types`, then
`pnpm kit:schema`.

## 4. Theme

Run `pnpm site-builder style --out .site-builder/<host>` after `theme`: it measures the old site's
type, containers, section spacing, buttons, cards and links in a browser and adds them to the
draft as theme tokens. Copy `theme` from `theme.draft.json` into `site/theme.json`, put the logo in `public/brand/`, set
the fonts in `site/fonts.ts`, and run `pnpm kit:theme-check` (every pair needs 4.5:1). Download the
old site's icon (`icon.src` in the draft, a PNG or ICO when the old site has one) into
`public/brand/` too, and set `icon.src` in `site/theme.json` to its `/brand/…` path (`.png`,
`.ico`, `.webp` or `.svg`). `kit:theme-check` refuses an icon over 100 KB, one whose content does
not match its extension, and an SVG with script, event handlers or outside links. If it cannot be
downloaded or does not pass, leave `icon` out: the kit's own icon is used.

To get closer to the old site's look, `site/theme.json` also takes optional tokens: `typography`
(`body`, `display`, `h2`, `h3`, `h4`, `lead`, `eyebrow`, `small`: `size`, `sizeMobile`,
`lineHeight`, `weight`, `letterSpacing`, `transform`), `containers` (`text`, `content`, `wide`),
`spacing` (`s`, `m`, `l`, `xl` for the section spacing choices), `button` (`paddingX`, `paddingY`,
`weight`, `transform`, `borderWidth`), `card` (`radius`, `shadow`: `none|sm|md|lg`, `borderWidth`)
and `link` (`underline`). Lengths are px or rem. Leave a token out and the kit's own value applies.
What the tokens cannot say goes in `site/styles.css`, loaded after the kit's CSS. Classes editors
may pick per section are listed in `styleClasses` (`[{ "name": "site-…", "label": "…" }]`) and
defined there. `kit:theme-check` refuses a styles file that imports other style files, loads from
another site, uses a backslash or is over 50 KB, and a listed class that the file does not define.

## 5. Write the site plan

Start from the rules: `pnpm site-builder map --out .site-builder/<host>` writes
`seed/site-plan.draft.json` and a todo list (`map.json`; `map.html` to review it). Work through
the todo list only: the sections the rules placed with low confidence (each with its HTML), the
gaps, and the notes on images, documents, menus and article addresses. Do not map everything again.
Then move the draft to `seed/site-plan.json`. The plan is written against
`schema/site-plan.schema.json`, and the blocks and their fields are in `schema/blocks.schema.json`.
What follows applies to everything you change or add by hand. Put
images and PDFs in `seed/media/` (or use public https URLs). Office files (Word, Excel,
PowerPoint), zip and DWG cannot be imported from a URL: download them into `seed/media/` and list
them under `documents`. SVG is not imported: the logo goes in `public/brand/` (step 4), and other
SVG graphics are a gap. Every file is checked by its first bytes, not its name. Link with
`$media`, `$page`, `$pageLink`, `$person`, `$document`, `$form`, `$globalSection`; rich text is `$html`. Every block
takes an optional `section`: `spaceTop` and `spaceBottom` (`auto|none|s|m|l|xl`), `width`
(`auto|text|content|wide|full`), `backgroundMedia` (`{ "$media": "<ref>" }`) with `overlay`
(`none|light|dark`), `anchor` (a slug, unique on the page), `hide` (`none|mobile|desktop`) and
`styleClass` (one of `styleClasses`). Leave it out where the block's own look fits. Besides the
first 19 blocks there are `columns` (`layout`: `1-1`, `2-1`, `1-2`, `1-1-1` or `1-1-1-1`, and exactly
that many `columns`, each `{ "blocks": [ … ] }` holding any block except `columns`, `formBlock`, `hero`
and `newsletter`), `tabs`, `pricing`, `logoWall`, `testimonials`, `carousel`, `table`, `contactCard`,
`newsletter` (`mode` `form` with `{ "$form": … }` for a form that has an e-mail field, or `embed` with an
https `embedUrl`), `iconFeatures` (`icon` is one of a fixed list in `schema/blocks.schema.json`), `banner`,
`buttonGroup` and `divider`; `seed/site-plan.json` has an example of each. Use `table` where the old
site has a real data table (`caption`, `header`, `rows[].cells`), and `contactCard` for address, phone, e-mail and
opening hours (its `mapUrl` is an https embed address). Forms go in
`forms`: their fields, the button text, the message shown after sending, and `retention` (days,
or `"keep"`) from the intake answer; left out, the site default in `site/config.ts` applies. A
`formBlock` points at one with `{ "$form": "<ref>" }`. Submissions are read in the admin and
deleted each night once older than the period; the privacy page says how long each form's
submissions are kept, with the same periods. A section that appears on several pages (a contact
section, a newsletter band, a shared call to action) goes once under `globalSections`
(`{ "ref", "title", "layout" }`, with `layout` per language like a page's), and each page that shows
it has a `globalSection` block with `{ "$globalSection": "<ref>" }`; the editor then changes it in
one place. A global section cannot contain another. Add `redirects` for every old URL that moves, and
`gaps` for anything no block matches (a form that must send e-mail or take payment is still a
gap). Check it until it passes, then try it locally:

    pnpm kit:check-plan seed/site-plan.json
    pnpm kit:import seed/site-plan.json --reset
    pnpm dev

Then run qc (step 6) and fix the worst sections first (`qc.html` shows old, new and the
difference). Run map again only if you have not edited the plan; otherwise fix the plan itself.

## 6. Check

    pnpm typecheck
    pnpm lint
    pnpm test:unit

After the preview is up, run
`pnpm site-builder compare --out .site-builder/<host> --new <preview address>` (add
`--allow-private` for a local preview) and look at `compare.md` (old pages and the old site's
documents, PDFs and the like) and `compare.html` in that folder. Then run the parity check:

    pnpm site-builder qc --out .site-builder/<host> --new <preview address>

It scores every old page on the new site (text, headings, images, links, title and meta), the
menu, footer and counts, and old and new screenshots pixel by pixel, desktop and mobile. Fix the
worst pages first (`qc.html` shows old, new and the difference), and run it again until it
passes. A difference the customer agrees to keep goes in `.site-builder/<host>/qc.accept.json`
with the reason; never accept one on the customer's behalf. Then run the launch checks; fix every
error they report before the site moves to its own domain (`qa:launch` refuses a rebuild whose qc
has not passed against the address it checks):

- `pnpm qa:launch <preview address>` fails on a home page or a sitemap page that does not answer,
  an empty sitemap, placeholder or demo text (the seeded privacy page, «Nordlys Demo», example.com),
  a page without a title, a broken internal link, and an image (every size) or a document in
  storage that does not load. Its warnings (no description, no share image, images without alt
  text) go into the hand-off to the user.
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

The admin adds the site's other users under Brukere, each with a role (and, on a kit with several
sites, the sites they work on). **Utgiver** edits and publishes. **Redaktør** edits and saves
drafts only: the server refuses publishing, unpublishing and deleting a published page from an
editor, in the admin and the API alike, so an editor sends the page with «Send til godkjenning».
**Godkjenner** reads, comments and approves («Godkjenn» or «Be om endringer», which also tell the
editor by e-mail) but changes no text. A publisher then publishes the approved page. Users who
existed before the roles came are publishers, so they lose nothing. Hand the roles over in the
hand-off: they are the owner's decision, not part of the plan. The admin sidebar of a page or
article holds the approval buttons and the comments. Administratorer read «Endringslogg»: who
changed what and when (field names only), kept for two years.

Tell the user about «Visuell redigering»: each page has a button for it, and a user with
«Enkel modus» (on their user, under Brukere) opens pages there directly. It edits the same
sections as the form, on the real page: drag sections in, click text to change it, drop an image
on an image. Blocks in `site/blocks/custom/` work there too; they show without a picture in the
section library.

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
