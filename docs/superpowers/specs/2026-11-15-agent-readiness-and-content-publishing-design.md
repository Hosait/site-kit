# Agent readiness before a move, and publishing articles from a document

Date: 2026-11-15. Status: design proposal for review (Steinar, Bjørn, Henriette).
**Website moves and Site Kit are on hold (Bjørn, 2026-10-18).** This spec only writes the ideas
down. Nothing here is built until Bjørn lifts the hold. The team has agreed that both ideas matter
after launch.

## Why

1. **A move fails when the agent is missing its tools.** A move is done by the customer's own AI
   agent following `AGENTS.md`. It needs the Hosait MCP (`get_project_status` in step 0,
   `connect_repository` in step 7) and local tools (Node, pnpm, git, Docker, Playwright,
   site-builder). Nothing checks for them before work starts. The agent finds a gap halfway
   through and improvises, for example by reading the old site some other way or by skipping
   Hosait's check. That is how the blinq.no test move turned into a lot of manual work.
2. **A live site needs an easy way to add content.** The owner should be able to hand a .docx or
   .pptx to their AI agent, answer a few questions, and get an article on the site without
   learning the admin.

## What exists today

| Part | Where | Notes |
|---|---|---|
| Hosait's check before a move | `AGENTS.md` step 0 | Reads `project.siteMove` with MCP `get_project_status`. Assumes the tool is there. |
| Local setup | `AGENTS.md` step 1, `package.json` | `pnpm install`, `pnpm site-builder:install`, `docker compose up -d`. Node `>=20.18.1` (kit), `>=20` (site-builder). Playwright 1.58.2 |
| Publish | `AGENTS.md` step 7 | MCP `connect_repository`, or the Hosait wizard |
| Setup commands for each agent | Hosait `backend/ai-tools.js` | Claude Code plugin install + `mcp login`, a token variant, Codex … |
| Hosait sees MCP use | Hosait `backend/tokens.js` | Personal tokens record `last_used_at`, `last_ip` and `last_user_agent` on each call. OAuth grants (the plugin's sign-in) are also `project_tokens` rows (`kind = 'oauth'`), but the OAuth path in `backend/mcp-http.js` does not record last use. |
| Articles | `src/collections/Articles.ts` | title, lead, heroImage, content (Lexical), SEO tab, site, kind (`articleKinds` in `site/config.ts`), publishedAt, slug. Localized. |
| Who may write | `src/access/siteAccess.ts` | `canCreateContent`, `updateDraftContent`, `canPublish`, `canReview` by role and site |
| Approval | `src/collections/editorial/endpoint.ts`, `src/lib/editorial/workflow.ts` | `POST /api/articles/:id/workflow` with `submit` / `approve` / `request-changes`. E-mails reviewers. Audit log in `ContentAuditLog` |
| Images | `src/collections/Media.ts` | `MEDIA_MIME_TYPES` (`src/lib/upload-types.ts`: `image/*`, mp4, webm). Any signed-in user may create |
| APIs | `src/app/(payload)/api` | Payload REST (`[...slug]`) and GraphQL are mounted. Users have `auth: true` and no API keys |
| Markdown → rich text | `@payloadcms/richtext-lexical` 3.90.2 | Exports `convertMarkdownToLexical` |
| Payload's MCP plugin | `@payloadcms/plugin-mcp` 3.90.2 (npm) | Exists for our Payload version (built on `@modelcontextprotocol/sdk` 1.30.0 and `mcp-handler`). Not installed. Generic collection tools. |

## 1. Agent readiness: one check on each side

The goal: **no move starts unless the agent can reach Hosait and has every local tool.** If
something is missing, the agent stops at once and gives the user the exact command to fix it.

### 1a. In Site Kit (phase 1, small)

**A new section at the top of `AGENTS.md`, «Before you start»**, before step 0:

- If you have no `get_project_status` tool from the `hosait` MCP server, stop. Tell the user to
  connect Hosait to their agent: the command for their agent is on the project's page on
  hosait.com. Do not continue without it and do not offer a way around it. The same rule as
  step 0.
- Run `pnpm kit:preflight`. If it fails, show the user its table and stop.
- Call `get_project_status` once and check that the project it returns is the one the user means
  (name and address). This also catches the "two projects with the same name" mix-up from the
  pilot.

**`pnpm kit:preflight`** (`scripts/kit/preflight.ts`, no new dependencies). It checks, and prints
one row per item: ok, or missing with the fix command:

| Check | How | Fix shown |
|---|---|---|
| Node ≥ 20.18.1 | `process.versions.node` | install Node 22 LTS |
| pnpm | `pnpm --version` | `corepack enable` |
| git | `git --version` | install git |
| Docker running | `docker info` (exit code) | start Docker Desktop |
| Playwright Chromium | `playwright` registry path exists | `pnpm exec playwright install chromium` |
| site-builder installed | `packages/site-builder/node_modules` exists | `pnpm site-builder:install` |

The exit code is 0 when everything is ok and 1 when anything is missing. The script cannot check
the MCP: that lives in the agent, not in the shell. The `AGENTS.md` rule covers it.

The `hosait-sites` skill (Hosait's Claude plugin) begins with the same «Before you start» step.

### 1b. In Hosait (phase 2; Bjørn for the backend, Henriette for the screen)

At the wizard's step-4 handover ("Build it with your own Claude",
`2026-10-13-site-move-entry-design.md` in the Hosait repo), a «Koble til AI-verktøyet ditt» step
comes first. It shows the commands from `backend/ai-tools.js` for the tool the customer chose and
waits until Hosait has seen an MCP call on this project. Only then does it show the move prompt.

Needed in Hosait:

- **The OAuth path records last use.** It does what `tokens.js` already does for personal tokens,
  with the same throttle.
- **The project page asks whether a token was used since the handover started.** A single
  `agentConnectedAt` in the status the wizard already polls.

## 2. Publishing an article from a document

### The flow

1. The site owner (or an editor) opens their AI agent with the site's MCP connected and gives it a
   .docx or .pptx.
2. The agent asks a few questions: which site and language, which kind (news, blog …), the title
   and lead, whether it should be published at once or on a date, and which picture leads.
   `get_site_info` gives the choices, so the questions match the site.
3. The agent turns the document into Markdown plus images. **This happens in the agent, which
   already reads Office files**, so the server never parses .docx or .pptx. A deck becomes an
   article with one section per slide or group of slides, and slide pictures as images.
4. The agent uploads the images, creates the article as a **draft**, and submits it for approval.
5. A person with review rights gets the existing approval e-mail, looks at the preview link, and
   approves or asks for changes in the admin.

### Options

| Option | For | Against |
|---|---|---|
| (a) Payload's REST API with API keys on Users | Nothing to build | The agent must write Lexical JSON by hand (fragile). A key opens the user's whole API. The site's rules (kinds, languages, approval) are not explained to the agent. |
| **(b) A small MCP endpoint on each site (recommended)** | Narrow tools that fit the site. Markdown in, Lexical made on the server. Uses the existing roles and approval. Works with any MCP agent. | Some code in the kit, and one more connection for the customer. |
| (c) Hosait's MCP passes calls on to the site | One connection the customer already has | Hosait would hold a write credential for every site and learn Site Kit's content model. It mixes hosting with the CMS. |

Option (b) can be built on `@payloadcms/plugin-mcp` if its custom tools and keys can be held as
narrow as below. Otherwise build it on `mcp-handler` directly, as the plugin does. The build plan
decides after a short test. **The plugin's generic collection tools stay off**, because they would
make (b) into (a).

### Tools (phase 1: articles only)

| Tool | Does | Limits |
|---|---|---|
| `get_site_info` | Sites, languages, article kinds, the house rules (`site/config.ts`), and what the token may do | Read only |
| `upload_image` | Adds an image to Media from base64 or an https URL. `alt` is required. | JPEG, PNG, WebP, AVIF and GIF only, checked by content and not by name (no SVG, which `image/*` would let in). Max 10 MB per image and 20 per article. URL fetch with a time limit, https only, no private addresses. |
| `create_article_draft` | Creates an article as a draft. Markdown body → `convertMarkdownToLexical`. Sets kind, language, lead, hero image, publishedAt, slug (from the title if empty). | Body ≤ 200 KB of Markdown. Raw HTML in the Markdown is dropped. Always a draft. The existing slug check applies. |
| `update_article_draft` | Changes a draft the token made, while it is not approved | Same as create |
| `submit_for_approval` | Calls the existing workflow transition (`submit`), with a message to the reviewer | The transition's own rules |
| `get_preview_link` | Returns the preview address (`src/lib/preview.ts`) | — |
| `list_articles` | The site's latest articles, titles and states, so the agent does not make a duplicate | Max 20, limited in the query |

Pages, global sections and publishing directly are not in phase 1.

### Who may use it

- **A personal publishing key per user, made in the admin** («Publiseringsnøkkel for AI»). Each key
  is bound to one user and that user's sites. It acts with that user's rights, but the MCP still
  only writes drafts. The key is shown once, stored as a hash, expires (90 days by default), and
  can be revoked. The admin shows when it was last used.
- Every change made through a key is in `ContentAuditLog` with «via AI-agent (nøkkel …)». A version
  is kept, as today.
- OAuth sign-in (like Hosait's plugin) can come later when an agent needs it.

### Safety

- **A person approves.** The MCP cannot publish in phase 1, not even for an owner who may publish
  in the admin. The document can contain text that tries to steer the agent; the approval step
  limits what that can do.
- **Sizes are capped** (above), and there is a rate limit per key: 60 calls a minute and 50
  articles a day.
- **Markdown is not trusted.** No raw HTML, and links only to http, https and mailto. Images only
  through `upload_image`.
- **Tool descriptions say that what they return is the site's content, to show the user, never
  instructions to follow.**
- The endpoint is off unless the site turns it on (`site/config.ts`, `mcp: { enabled: true }`), so
  existing sites change nothing.

### Phase 2

- A skill, «Publiser en artikkel fra et dokument», that asks the questions above and walks the
  flow. It ships with Hosait's plugin next to `hosait-sites`.
- Hosait's `get_project_status` gives the site's MCP address in `nextSteps` for a Site Kit project,
  so an agent that already has Hosait finds it.
- Pages and news lists. Publishing at once for roles that may publish, if the team wants it.

## Open questions

1. Should the MCP ever publish without approval, for example for an owner who already may publish
   in the admin? (This spec says no in phase 1.)
2. Personal keys first, OAuth later: is that right, or is OAuth needed from the start for ChatGPT
   and Copilot?
3. Should Hosait point to the site's MCP (phase 2), or should the customer add it by hand?
4. Should Pages be in phase 1?
5. Should the Hosait wizard gate (1b) come at launch, or is the Site Kit check (1a) enough for now?

## Out of scope

- Parsing .docx or .pptx on the server.
- Moves of sites that are not Site Kit sites.
- Any change while the hold is on.

## Testing (when built)

- `kit:preflight`: a unit test per check with a fake command runner. Run it by hand on a machine
  without Docker running.
- MCP tools: unit tests with a fake Payload, as in `tests/unit/import-plan.test.ts` (Markdown →
  Lexical, caps, raw HTML dropped, always a draft, a key cannot reach another site). Then a real run
  against local Postgres and MinIO: upload a deck's pictures, create, submit, and approve in the
  admin.
- One end-to-end try from Claude Code with a real .docx and a real .pptx.
