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
    login or member area (password fields, login forms and links), more than 500 pages in the
    largest language, more than 1500 pages in all languages together, or more than 500 articles.
    A link to the old CMS's own admin login (WordPress, Joomla, Drupal, Umbraco, Ghost) with plain
    admin wording («Logg inn», «Log in», «Admin», «Meta», or an icon) is a note, not a member
    area; member wording on it («Logg inn for medlemmer»), a member folder, registration or
    password reset, and a redirect outside wp-admin stay red. Account wording («Min side», «My
    account», «Mein Konto», «Mon compte», «Mi cuenta» …) is a login wherever it links; member
    wording alone («Bli medlem», «Våre medlemmer») is not. WordPress's own password form for a
    protected post is a note; more than three such pages read is yellow.
  - **yellow**, possible with the customer's OK on scope and storage: more than 200 pages in
    the largest language, more than 100 documents, more than 2 GB of documents and images, or
    built-in services (booking, feeds, embedded apps, forms sent elsewhere).
  - **yellow, not decided yet** (`not-enough-read`): too little could be read (the time budget,
    robots.txt, a home page that leads to another site, or a site that needs JavaScript). It is
    not accepted: the check runs again.
  - **green**: everything else.

  Pages are counted per language (a first path segment such as `/en/` or `/se/` is a language
  when the pages say so), and articles apart from pages: dated or news-section addresses, and
  pages whose JSON-LD is an Article, NewsArticle or BlogPosting (not `og:type`, which SEO plugins
  put on ordinary pages). A one-page site with text and only `#` links is enough to decide.

  The customer's limits (`src/scope.js`): `--exclude <path>` (repeatable) leaves a content part
  out of the move, that path and everything under it in any case, and `--without-member-area`
  means login and «min side» addresses are never requested. What is left out is not counted. A
  shop, a catalogue or a member area is never left out: the check may still read excluded pages
  for a shop or a catalogue, counts product addresses across the whole sitemap, and a login found
  anywhere stays red. A shop, cart, catalogue or login path cannot be excluded. `assess.json`
  keeps the limits (`scope`) and how many addresses were left out.

  The thresholds are `LIMITS` in `src/assess.js`. Exit code: 0 for green and yellow, 3 for red,
  2 for a usage error, 1 for other errors. A page that cannot be read is recorded and the others
  go on; a stop at the time budget is a note.
- **crawl** starts only when `assess.json` in its out folder is for the same site and not red;
  after yellow it also needs `--accepted-scope`, given once the customer has said yes, and after
  a check that could not read enough it does not start at all. Otherwise it exits 3 and says
  why. It leaves out what the check left out, from `assess.json`; it takes no limits of its own.
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
