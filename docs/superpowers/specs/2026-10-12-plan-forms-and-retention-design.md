# Forms in the site plan, and how long submissions are kept

Date: 2026-10-12. Status: design approved in conversation (Steinar), spec for review.
Builds on site-kit#2 (`feat/phase2a-site-builder`), where the plan import lives.

## Why

The hosait-sites test runs found two gaps that every real rebuild meets:

1. **A site plan cannot create a form.** Site Kit has Payload's form-builder plugin (`forms`,
   `form-submissions`) and a Form block, but the plan has no `forms` section, and a Form block
   has no way to point at a form the import creates. Today an old contact form becomes a gap.
2. **Nothing deletes form submissions.** They are personal data. Customers ask for a period
   (for example 90 days), and a privacy policy usually names one per purpose.

## Decisions (from the conversation)

| Question | Decision |
|---|---|
| Who sets how long submissions are kept | **Per form**, with a site-wide default |
| E-mail when a form is submitted | **No.** Submissions are kept in the admin only. E-mail is separate, later work (customer sites have no outgoing e-mail yet) |
| When nothing is set | **A default in the template:** 90 days in `site/config.ts`, changeable per site; a form can set its own period or "keep" |
| What runs the nightly deletion | **Payload's own job queue** (a scheduled task, run in-process by `autoRun`), not a cron container |

Two details changed while checking the code, both within the approved design:

- Payload's schedule takes a cron and no time zone, so the job runs on **server time** (UTC on
  Hosait): **02:15 UTC**, which is 03:15 or 04:15 in Norway.
- `autoRun` starts with every Payload instance, including the kit's scripts (`kit:import`,
  `kit:export-seed`) and tests, which would then never exit. So **only the web server runs it**
  (`jobs.shouldAutoRun`, see below).

## 1. Forms in the site plan

### Format

A new optional top-level `forms` array in `schema/site-plan.schema.json`:

```json
"forms": [
  {
    "ref": "contact",
    "title": { "no": "Kontakt oss", "en": "Contact us" },
    "fields": [
      { "type": "text", "name": "navn", "label": { "no": "Navn" }, "required": true, "width": 50 },
      { "type": "email", "name": "epost", "label": { "no": "E-post" }, "required": true, "width": 50 },
      { "type": "select", "name": "emne", "label": { "no": "Emne" },
        "options": [ { "value": "pris", "label": { "no": "Pris" } }, { "value": "annet", "label": { "no": "Annet" } } ] },
      { "type": "textarea", "name": "melding", "label": { "no": "Melding" }, "required": true },
      { "type": "message", "text": { "no": "Vi svarer innen to arbeidsdager." } }
    ],
    "submitLabel": { "no": "Send" },
    "confirmation": { "no": "Takk! Vi tar kontakt." },
    "retention": 90
  }
]
```

- `ref`: the plan's usual ref pattern. `title`, `submitLabel`, `confirmation` and every label are
  the plan's `text` (one string per site language), like other plan texts. `confirmation` is
  plain text; the import turns it into rich text as it does for other texts. A redirect after
  submitting is not supported, only a message.
- `fields[].type`: exactly the field types Site Kit's form plugin has switched on: `text`,
  `email`, `textarea`, `number`, `checkbox`, `select`, `country`, `message`. (`payment` and
  `state` are off in `src/plugins/index.ts`.)
- `fields[].name`: `^[a-z][a-z0-9_]{0,63}$`, unique within the form. Not on `message`, which has
  `text` instead of a label.
- `required` (boolean, default false), `width` (25, 33, 50, 66, 75 or 100, default 100).
  `select` needs `options` (at least one, each `value` + `label`). `checkbox` may have
  `default` (boolean).
- `retention`: an integer 1–3650 (days), or `"keep"`. Left out: the site default.
- No e-mail fields (`emails` on the plugin's form stays empty).

### Pointing a page at a form

A Form block uses the existing marker style:

```json
{ "blockType": "formBlock", "form": { "$form": "contact" }, "enableIntro": false }
```

- `refs.ts`: `$form` joins `$media`, `$page`, `$pageLink`, `$person`, `$document`.
  `findMissingRefs` reports `form "x"` for a `$form` the plan does not define, and
  `resolveValue` swaps it for the created form's id.
- `kit:check-plan` (site-kit#3) calls `findMissingRefs`, so it covers `$form` once both are in.

### Validation (schema and plan check)

Refused, with the path, before anything is written:

- an unknown field type, a `select` without options, a field name that breaks the pattern, a
  duplicate field name in one form, a `message` without `text`;
- a `retention` outside 1–3650 that is not `"keep"`;
- a `$form` naming no form; two forms with the same `ref`.

Duplicate names and duplicate refs are not expressible in JSON Schema, so `validateSitePlan`
checks them after the schema passes, and reports them the same way.

### Import (`src/lib/site-plan/import.ts`)

- Forms are created **after media and before pages**, so Form blocks can find them. The id map
  gains `forms`.
- Each plan field maps to the plugin's field block (`blockType` = the plan's `type`; `name`,
  `label`, `required`, `width`, `options`, `defaultValue`; `message` gets rich text). Texts are
  written per locale with the existing `localized()` helper (the plugin's labels, title, button
  and confirmation are localized fields).
- `retention` sets the form's new retention fields (section 2).
- The progress count includes forms. A failed form create stops the import with the form's ref,
  like other collections.

## 2. Retention

### Settings

- **Site default:** `site/config.ts` gains `forms: { retentionDays: 90 }`. `null` means keep.
  `checkSiteConfig` accepts an integer 1–3650 or `null`; anything else is a config error.
- **Per form (admin):** the `forms` collection (through `formOverrides` in
  `src/plugins/index.ts`) gains:
  - `retention`: select, "Use the site's default (N days)" / "Number of days" / "Keep", default
    the site's default;
  - `retentionDays`: integer 1–3650, shown and required only when `retention` is "Number of days".
  - A short admin description says when submissions are deleted (each night, by age).
- The plan's `retention` maps to these: a number → "Number of days" + that number; `"keep"` →
  "Keep"; left out → "Use the site's default".

### Which period applies

One pure function, `retentionDaysFor(form, siteDefault)`: the form's own days, or `null` for
keep, or the site default (which may itself be `null`). Tested on its own.

### The nightly job

- `src/jobs/pruneFormSubmissions.ts`: a Payload task `prune-form-submissions`.
  - For each form with a period, delete submissions whose `createdAt` is older than
    now − period.
  - **At most 1,000 per form per run** (find ids with a limit, then delete those ids), so a large
    backlog is cleared over a few nights, never in one long query.
  - Logs one line per form that had something to delete: form id, title and count. No
    submission content in logs.
  - A form whose deletion fails is logged and skipped; the others still run.
- `payload.config.ts`:
  - `jobs.tasks`: the task, with `schedule: [{ cron: '0 15 2 * * *', queue: 'nightly' }]`
    (02:15:00 UTC every day).
  - `jobs.autoRun: [{ cron: '0 */5 * * * *', queue: 'nightly' }]`: the web server checks the
    queue every 5 minutes, so a scheduled run starts within minutes of 02:15.
  - `jobs.shouldAutoRun`: true only in the running web server: Next's Node runtime
    (`NEXT_RUNTIME === 'nodejs'`) and not during `next build` (`NEXT_PHASE` is
    `phase-production-build` then). Scripts and tests never start the timer.
- Payload starts the timer when it first loads. After a deploy that is the first request (the
  seed-status check or the first visitor), within seconds on a live site.
- A shortened period applies to existing submissions at the next run.

### Migration

One migration (`pnpm payload migrate:create forms-retention`): Payload's jobs table and the two
new form fields. The CI drift check enforces that it exists.

## 3. Docs

- `AGENTS.md` step 5 (write the plan): forms go in `forms` and pages point at them with
  `$form`; ask the intake question for each form's period. The line that lists forms as a gap
  goes; forms with e-mail notification or payment stay gaps.
- `site/questions.json`, question `forms`: it sets `forms` in the plan (not the current
  `cms.forms` / `email.fromAddress` keys). The text asks which forms are needed and how long
  submissions are kept, and says submissions are read in the admin; e-mail is not available yet.
- The hosait-sites skill (Hosait/claude-plugin) does not change: it follows `AGENTS.md`.

## 4. Testing

Written first, each seen failing:

- **Schema and validation** (`tests/unit/site-plan.test.ts`): a minimal valid form; each refusal
  above, with its path.
- **Refs** (`tests/unit/site-plan-refs.test.ts`): `$form` missing is reported; present is
  resolved to the id.
- **Import mapping** (`tests/unit/import-plan.test.ts`, fake Payload as today): a form becomes
  the plugin's field blocks with labels per locale; forms are created before pages; the
  retention fields are set for a number, `"keep"` and nothing.
- **Retention:** `retentionDaysFor` for form days, keep, site default, site default `null`.
- **Pruning** (fake Payload): only submissions older than the form's period are deleted; a
  "keep" form is untouched; at most 1,000 per form per run; one failing form does not stop the
  others.
- **Site config:** `forms.retentionDays` accepts 1–3650 and `null`, refuses 0, 3651, 1.5, "90".
- **`shouldAutoRun`** is false in scripts and tests (no `NEXT_RUNTIME`) and during `next build`,
  true in the running server.
- **One run against a local database** (not in CI): import a plan with a form, submit it twice,
  backdate one submission past its period, run the task, and see that one deleted and the newer
  one kept.

## Out of scope

- E-mail on submission (recipients, an SMTP adapter). Its own work, after platform e-mail.
- A redirect after submitting; payment and state fields.
- Retention for anything other than form submissions (analytics has its own rules).
- A time zone for the schedule (Payload's schedule has none).

## Risks

- **Deleting data is irreversible.** The default only applies where nobody chose a period; the
  admin shows the period per form; the job deletes by age only, never by content, and logs counts.
- **`autoRun` in more than one process.** Site Kit runs one web container on Hosait. Running
  two is outside this design; at worst both would delete the same expired submissions.
