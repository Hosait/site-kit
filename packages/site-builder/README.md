# @hosait/site-builder

Reads an existing website so it can be rebuilt on Hosait Site Kit. The steps that need no AI:

    site-builder assess https://www.example.com    # first: does the site fit? green, yellow or red
    site-builder crawl https://www.example.com     # → .site-builder/www.example.com/
    site-builder extract --out .site-builder/www.example.com
    site-builder theme   --out .site-builder/www.example.com
    site-builder report  --out .site-builder/www.example.com

In a Site Kit repository: `pnpm site-builder:install` once, then `pnpm site-builder assess <url>`.

- **assess** decides, before anything is built, whether the site is a simple content site that
  Site Kit can rebuild. In at most 3 minutes and 40 pages (`--budget <minutes>`, `--max-pages`)
  it reads robots.txt (and obeys it) and every sitemap (same caps as crawl), counts pages,
  documents and images, and reads the home page, the main navigation and a spread across the
  sitemap (by path prefix and position, the same pages every time). It asks up to 5 documents
  and 5 images on the same site for their size (HEAD), and never fetches another site. It
  writes `assess.json` (class, reasons with evidence, counts, estimates, notes) and `assess.md`
  for the customer. Document, image and size figures are estimates from the pages read.
  - **red**, decline: a web shop (priced Product/Offer markup, cart, checkout or add-to-cart
    links and forms, robots.txt rules for cart actions, a shop system), a payment service, a
    product catalogue (Product markup on many pages, or product addresses in the sitemap), a
    login or member area (password fields, login forms and links), or more than 500 pages.
  - **yellow**, possible with the customer's OK on scope and storage: more than 200 pages, more
    than 100 documents, more than 2 GB of documents and images, built-in services (booking,
    feeds, embedded apps, forms sent elsewhere), or too little read to decide.
  - **green**: everything else.

  The thresholds are `LIMITS` in `src/assess.js`. Exit code: 0 for green and yellow, 3 for red,
  2 for a usage error, 1 for other errors. A page that cannot be read is recorded and the others
  go on; a stop at the time budget is a note.
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

Private, loopback and link-local addresses are refused, and this is checked when connecting.
`--allow-private` is for your own local or intranet sites.
