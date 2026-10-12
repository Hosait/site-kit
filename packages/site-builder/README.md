# @hosait/site-builder

Reads an existing website so it can be rebuilt on Hosait Site Kit. The steps that need no AI:

    site-builder crawl https://www.example.com     # → .site-builder/www.example.com/
    site-builder extract --out .site-builder/www.example.com
    site-builder theme   --out .site-builder/www.example.com
    site-builder report  --out .site-builder/www.example.com
    site-builder compare --out .site-builder/www.example.com --new https://preview.example.com

In a Site Kit repository: `pnpm site-builder:install` once, then `pnpm site-builder crawl <url>`.

- **crawl** reads robots.txt and obeys it (when it answers with a server error, nothing is
  read), reads the sitemap, follows links on the same site (www and apex count as one), and
  stops at 500 pages or after 15 minutes (`--max`, `--budget <minutes>`), keeping what it has
  read. Two requests at a time, with a pause. It caches each page's HTML in `raw/`, lists media
  (up to 5,000), documents (up to 2,000), trackers, embeds and the CMS in `inventory.json`, and
  writes `urls.json` for Site Kit's `pnpm qa:urls`. `notes` in `inventory.json` says when a cap
  or the time budget was reached.
- **extract** writes `extract.json`: per page the title, meta, headings, main content, images
  and links, plus a template fingerprint, the navigation and the footer. This is what you (or
  your AI) map to Site Kit blocks in `seed/site-plan.json`. A page that cannot be read is listed
  under `errors`, and the others go on.
- **theme** writes `theme.draft.json`. Copy `theme` into `site/theme.json`, use `fonts` in
  `site/fonts.ts`, and save the logo under `public/brand/`. Colours are already darkened where
  Site Kit's 4.5:1 contrast check needs it; `notes` lists each change.
- **report** writes `report.md` for the customer.
- **compare** checks every old address that answered 200 on the new site: it must answer 200,
  or 301/308 to a page on the new site that does (at most 3 redirects). Four requests at a time.
  It writes `compare.md` and `compare.json`, and exits 1 when an address fails. With Playwright
  installed it also takes old and new screenshots (the home page and the first page of each
  template, desktop and mobile) into `shots/`, side by side in `compare.html`.

Private, loopback and link-local addresses are refused, and this is checked when connecting.
`--allow-private` is for your own local or intranet sites.
