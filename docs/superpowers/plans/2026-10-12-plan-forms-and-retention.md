# Forms in the Site Plan, and Submission Retention: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A site plan can create forms that pages point at with `$form`, each form keeps its submissions for a set period (its own, or the site default of 90 days), and a nightly Payload job deletes older submissions.

**Architecture:** The plan format gains a `forms` section, validated by the plan schema plus a small cross-check, and imported before pages so `$form` markers resolve to form ids. Retention is two fields on the form-builder plugin's `forms` collection plus `forms.retentionDays` in `site/config.ts`; one pure function decides the period. A Payload task scheduled at 02:15 UTC deletes expired submissions in batches; `autoRun` runs it inside the web server only.

**Tech Stack:** Next.js 16.3.3, Payload 3.90.2 (`@payloadcms/plugin-form-builder`, jobs queue), Postgres, Ajv, `node:test` via `tsx --test`, pnpm.

**Spec:** `docs/superpowers/specs/2026-10-12-plan-forms-and-retention-design.md`

## Global Constraints

- Branch `feat/plan-forms` (based on `feat/phase2a-site-builder`, site-kit#2). Work in `/private/tmp/claude-501/-Users-steinar-claude-hosait/9cfd3a31-25b1-4e0f-89bc-9751aaf5628a/scratchpad/sk-forms`.
- No new dependencies. Payload 3.90.2 and its form-builder plugin as installed.
- Field types in a plan: exactly `text`, `email`, `textarea`, `number`, `checkbox`, `select`, `country`, `message`.
- Field `name`: `^[a-z][a-z0-9_]{0,63}$`, unique within a form. `width`: 25, 33, 50, 66, 75 or 100.
- Retention: an integer 1–3650 days, or `"keep"`; left out = the site default. Site default: `forms.retentionDays` in `site/config.ts`, 90 in the template, `null` = keep.
- No e-mail on submission: the form's `emails` stays empty.
- Nightly job: schedule cron `0 15 2 * * *` (02:15:00 UTC), queue `nightly`; `autoRun` cron `0 */5 * * * *`; at most 1,000 deletions per form per run.
- `autoRun` only in the running web server: `NEXT_RUNTIME === 'nodejs'` and `NEXT_PHASE !== 'phase-production-build'`.
- Logs name form id, form title and counts, never submission content.
- Migrations are frozen SQL: no imports from `src/lib` or `@/` (`tests/unit/migrations.test.ts`).
- Admin labels in the forms collection follow the existing Norwegian ones ("Skjema", "Innsendinger").
- TypeScript files stay under 500 lines.
- Every commit ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **A form set to "Number of days" with no valid number** (edited through the API, not the admin). Expected: the site default applies, not "delete everything" and not a crash. Test in Task 2.
2. **A submission exactly at the cutoff.** Expected: kept (strictly older is deleted). Test in Task 6.
3. **A plan text missing the default language** (a form whose title or labels exist only in `en` on a `no`-first site). Expected: the import does not fail; the title falls back to the first language given. Test in Task 4.
4. **Confirmation or info text containing `<`, `>`, `&` or quotes.** Expected: shown as text, never as markup. Test in Task 4.
5. **Kit scripts and tests importing the Payload config.** Expected: they exit; no job timer keeps them alive. Tests in Task 7, and the end-to-end script in Task 9 must exit by itself.

## Rulings made while planning (deviations from the spec's wording)

- **`confirmation` is required in a form.** A form with no message after sending leaves the visitor unsure it worked. Cost if wrong: a plan author must add one line per form.
- **The intake question sets `cms.forms` and `forms.retentionDays`.** `src/lib/questions.ts` only accepts config paths, `report.*` or `cms.*`, so "sets `forms` in the plan" is expressed this way. Cost if wrong: none at runtime; only the question's metadata.
- **The form's `title` is not localized in the plugin.** The default language's title is used (falling back to the first language given); labels, button, confirmation and info texts are written per language onto the same field rows.

---

### Task 1: Site default in `site/config.ts`

**Files:**
- Modify: `src/lib/site-config.ts` (type `SiteConfigInput`, `checkSiteConfig`)
- Modify: `site/config.ts` (add `forms`)
- Modify: `src/lib/sites.ts` (export `FORMS`)
- Test: `tests/unit/site-config.test.ts`

**Interfaces:**
- Produces: `SiteConfigInput['forms']` = `{ retentionDays: number | null }`; `FORMS: SiteConfigInput['forms']` exported from `src/lib/sites.ts`.

- [ ] **Step 1: Write the failing test** (append to `tests/unit/site-config.test.ts`)

```ts
test('forms.retentionDays is a whole number of days from 1 to 3650, or null to keep', () => {
  for (const ok of [1, 90, 3650, null]) {
    const c = clone()
    c.forms = { retentionDays: ok }
    assert.deepEqual(checkSiteConfig(c, ['no', 'en']), [], String(ok))
  }
  for (const bad of [0, 3651, 1.5, '90', undefined]) {
    const c = clone()
    c.forms = { retentionDays: bad as never }
    assert.ok(checkSiteConfig(c, ['no', 'en']).some((p) => p.startsWith('forms.retentionDays')), String(bad))
  }
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec tsx --test tests/unit/site-config.test.ts`
Expected: FAIL in the new test (type error on `c.forms` is fine for tsx; the assertion fails because no problem is reported for 0).

- [ ] **Step 3: Implement**

In `src/lib/site-config.ts`, add to `SiteConfigInput` after `features`:

```ts
  /** Form submissions are deleted after this many days unless a form sets its own; null keeps them. */
  forms: { retentionDays: number | null }
```

In `checkSiteConfig`, before `return problems`:

```ts
  const days = c.forms?.retentionDays
  if (days !== null && !(Number.isInteger(days) && (days as number) >= 1 && (days as number) <= 3650))
    problems.push('forms.retentionDays must be a whole number of days from 1 to 3650, or null to keep submissions')
```

In `site/config.ts`, after `features`:

```ts
  // How long form submissions are kept, in days; a form can set its own period or "keep".
  // null keeps them. Hosait Sites sets it from the intake answer.
  forms: { retentionDays: 90 },
```

In `src/lib/sites.ts`, after the `FEATURES` export:

```ts
/** Form defaults, widened so code can compare whatever site/config.ts sets. */
export const FORMS: SiteConfigInput['forms'] = siteConfig.forms
```

- [ ] **Step 4: Run tests**

Run: `pnpm exec tsx --test tests/unit/site-config.test.ts tests/unit/questions.test.ts`
Expected: PASS (all, including "the shipped config passes").

- [ ] **Step 5: Commit**

```bash
git add src/lib/site-config.ts site/config.ts src/lib/sites.ts tests/unit/site-config.test.ts
git commit -m "Site config: forms.retentionDays, the default period for form submissions (90 days)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Which period applies

**Files:**
- Create: `src/lib/forms/retention.ts`
- Test: `tests/unit/forms-retention.test.ts`

**Interfaces:**
- Produces:
  - `type RetentionChoice = 'default' | 'days' | 'keep'`
  - `type FormRetention = { retention?: RetentionChoice | null; retentionDays?: number | null }`
  - `const RETENTION_MAX_DAYS = 3650`
  - `retentionDaysFor(form: FormRetention, siteDefault: number | null): number | null`
  - `retentionFromPlan(r: number | 'keep' | undefined): { retention: RetentionChoice; retentionDays: number | null }`

- [ ] **Step 1: Write the failing test** (`tests/unit/forms-retention.test.ts`)

```ts
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { retentionDaysFor, retentionFromPlan } from '../../src/lib/forms/retention'

test('a form keeps its own number of days, keeps everything, or follows the site', () => {
  assert.equal(retentionDaysFor({ retention: 'days', retentionDays: 30 }, 90), 30)
  assert.equal(retentionDaysFor({ retention: 'keep' }, 90), null)
  assert.equal(retentionDaysFor({ retention: 'default' }, 90), 90)
  assert.equal(retentionDaysFor({}, 90), 90)
  assert.equal(retentionDaysFor({ retention: 'default' }, null), null)
})

test('"Number of days" without a valid number follows the site default (review focus 1)', () => {
  for (const retentionDays of [null, undefined, 0, -5, 2.5]) assert.equal(retentionDaysFor({ retention: 'days', retentionDays }, 90), 90, String(retentionDays))
  assert.equal(retentionDaysFor({ retention: 'days', retentionDays: null }, null), null)
})

test("the plan's retention becomes the form's admin fields", () => {
  assert.deepEqual(retentionFromPlan(30), { retention: 'days', retentionDays: 30 })
  assert.deepEqual(retentionFromPlan('keep'), { retention: 'keep', retentionDays: null })
  assert.deepEqual(retentionFromPlan(undefined), { retention: 'default', retentionDays: null })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec tsx --test tests/unit/forms-retention.test.ts`
Expected: FAIL, cannot find module `src/lib/forms/retention`.

- [ ] **Step 3: Implement** (`src/lib/forms/retention.ts`)

```ts
/**
 * How long a form's submissions are kept. A form chooses the site's default
 * (site/config.ts forms.retentionDays), its own number of days, or to keep them.
 */
export type RetentionChoice = 'default' | 'days' | 'keep'
export type FormRetention = { retention?: RetentionChoice | null; retentionDays?: number | null }

export const RETENTION_MAX_DAYS = 3650

/** Days this form's submissions are kept; null keeps them. A "days" choice without a valid number follows the site. */
export function retentionDaysFor(form: FormRetention, siteDefault: number | null): number | null {
  if (form.retention === 'keep') return null
  const days = form.retentionDays
  if (form.retention === 'days' && Number.isInteger(days) && (days as number) >= 1) return days as number
  return siteDefault
}

/** The plan's `retention` (days, "keep", or left out) as the form's admin fields. */
export function retentionFromPlan(r: number | 'keep' | undefined): { retention: RetentionChoice; retentionDays: number | null } {
  if (r === 'keep') return { retention: 'keep', retentionDays: null }
  if (typeof r === 'number') return { retention: 'days', retentionDays: r }
  return { retention: 'default', retentionDays: null }
}
```

- [ ] **Step 4: Run tests**

Run: `pnpm exec tsx --test tests/unit/forms-retention.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/forms/retention.ts tests/unit/forms-retention.test.ts
git commit -m "Forms: which retention period applies (form, site default, keep)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: `forms` in the plan format, and `$form`

**Files:**
- Modify: `schema/site-plan.schema.json` (`properties.forms`, `definitions.formField`), then `pnpm kit:schema` stamps it
- Modify: `src/lib/site-plan/types.ts` (`PlanForm`, `PlanFormField`, `SitePlan.forms`)
- Modify: `src/lib/site-plan/validate.ts` (cross-checks after the schema)
- Modify: `src/lib/site-plan/refs.ts` (`$form` in `walk`, `findMissingRefs`, `resolveValue`, `Ids`)
- Test: `tests/unit/site-plan.test.ts`, `tests/unit/site-plan-refs.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `type PlanFormField = { type: 'text' | 'email' | 'textarea' | 'number' | 'checkbox' | 'select' | 'country' | 'message'; name?: string; label?: Localized<string>; required?: boolean; width?: 25 | 33 | 50 | 66 | 75 | 100; default?: boolean; options?: { value: string; label: Localized<string> }[]; text?: Localized<string> }`
  - `type PlanForm = { ref: string; title: Localized<string>; fields: PlanFormField[]; submitLabel?: Localized<string>; confirmation: Localized<string>; retention?: number | 'keep' }`
  - `SitePlan.forms?: PlanForm[]`
  - `Ids.forms?: Map<string, number>`; `resolveValue` turns `{ $form: ref }` into `ids.forms.get(ref)`; `findMissingRefs` reports `form "x"`.

- [ ] **Step 1: Write the failing tests**

Append to `tests/unit/site-plan.test.ts`:

```ts
const withForm = () => {
  const p = minimal()
  p.forms = [
    {
      ref: 'contact',
      title: { no: 'Kontakt' },
      fields: [
        { type: 'text', name: 'navn', label: { no: 'Navn' }, required: true, width: 50 },
        { type: 'select', name: 'emne', label: { no: 'Emne' }, options: [{ value: 'pris', label: { no: 'Pris' } }] },
        { type: 'message', text: { no: 'Vi svarer snart.' } },
      ],
      submitLabel: { no: 'Send' },
      confirmation: { no: 'Takk!' },
      retention: 30,
    },
  ]
  p.pages[0].layout.no.push({ blockType: 'formBlock', form: { $form: 'contact' } })
  return p
}

test('a plan with a form is valid', () => {
  const r = validateSitePlan(withForm())
  assert.equal(r.ok, true, JSON.stringify(r))
  const keep = withForm()
  keep.forms[0].retention = 'keep'
  assert.equal(validateSitePlan(keep).ok, true)
  const dflt = withForm()
  delete dflt.forms[0].retention
  assert.equal(validateSitePlan(dflt).ok, true)
})

test('a broken form is refused with its path', () => {
  const cases: [string, (p: any) => void, string][] = [
    ['unknown field type', (p) => (p.forms[0].fields[0].type = 'radio'), '/forms/0/fields/0/type'],
    ['select without options', (p) => delete p.forms[0].fields[1].options, '/forms/0/fields/1'],
    ['field name with capitals', (p) => (p.forms[0].fields[0].name = 'Navn'), '/forms/0/fields/0/name'],
    ['field without a label', (p) => delete p.forms[0].fields[0].label, '/forms/0/fields/0'],
    ['info text without text', (p) => delete p.forms[0].fields[2].text, '/forms/0/fields/2'],
    ['width 40', (p) => (p.forms[0].fields[0].width = 40), '/forms/0/fields/0/width'],
    ['retention 0', (p) => (p.forms[0].retention = 0), '/forms/0/retention'],
    ['retention 3651', (p) => (p.forms[0].retention = 3651), '/forms/0/retention'],
    ['retention forever', (p) => (p.forms[0].retention = 'forever'), '/forms/0/retention'],
    ['no confirmation', (p) => delete p.forms[0].confirmation, '/forms/0'],
    ['duplicate field name', (p) => (p.forms[0].fields[1].name = 'navn'), '/forms/0/fields/1/name'],
    ['duplicate form ref', (p) => p.forms.push(structuredClone(p.forms[0])), '/forms/1/ref'],
  ]
  for (const [what, change, path] of cases) {
    const p = withForm()
    change(p)
    const r = validateSitePlan(p)
    assert.equal(r.ok, false, what)
    assert.ok(!r.ok && r.errors.some((e) => e.startsWith(path)), `${what}: ${JSON.stringify(r)}`)
  }
})
```

Append to `tests/unit/site-plan-refs.test.ts`:

```ts
test('a form block points at a form with $form, checked and resolved like the other refs', async () => {
  const p = plan()
  p.forms = [{ ref: 'contact', title: { no: 'Kontakt' }, fields: [{ type: 'email', name: 'epost', label: { no: 'E-post' } }], confirmation: { no: 'Takk!' } }]
  p.pages[0].layout.no.push({ blockType: 'formBlock', form: { $form: 'contact' } }, { blockType: 'formBlock', form: { $form: 'ghost' } })
  assert.deepEqual(findMissingRefs(p), ['form "ghost"'])
  const ids = { media: new Map(), pages: new Map(), forms: new Map([['contact', 12]]) }
  assert.deepEqual(await resolveValue({ blockType: 'formBlock', form: { $form: 'contact' } }, ids, async () => null), { blockType: 'formBlock', form: 12 })
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm exec tsx --test tests/unit/site-plan.test.ts tests/unit/site-plan-refs.test.ts`
Expected: FAIL. "a plan with a form is valid" fails (`must NOT have additional properties` for `forms`); the refs test reports `page "ghost"`/`page "contact"` instead of `form "ghost"`.

- [ ] **Step 3: Extend the plan schema**

In `schema/site-plan.schema.json`, add under `properties` (after `documents`):

```json
"forms": {
  "type": "array",
  "items": {
    "type": "object",
    "additionalProperties": false,
    "required": ["ref", "title", "fields", "confirmation"],
    "properties": {
      "ref": { "$ref": "#/definitions/ref" },
      "title": { "$ref": "#/definitions/text" },
      "fields": { "type": "array", "minItems": 1, "items": { "$ref": "#/definitions/formField" } },
      "submitLabel": { "$ref": "#/definitions/text" },
      "confirmation": { "$ref": "#/definitions/text" },
      "retention": { "oneOf": [{ "type": "integer", "minimum": 1, "maximum": 3650 }, { "const": "keep" }] }
    }
  }
},
```

and under `definitions`:

```json
"formField": {
  "type": "object",
  "additionalProperties": false,
  "required": ["type"],
  "properties": {
    "type": { "enum": ["text", "email", "textarea", "number", "checkbox", "select", "country", "message"] },
    "name": { "type": "string", "pattern": "^[a-z][a-z0-9_]{0,63}$" },
    "label": { "$ref": "#/definitions/text" },
    "required": { "type": "boolean" },
    "width": { "enum": [25, 33, 50, 66, 75, 100] },
    "default": { "type": "boolean" },
    "options": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["value", "label"],
        "properties": { "value": { "type": "string", "minLength": 1, "maxLength": 200 }, "label": { "$ref": "#/definitions/text" } }
      }
    },
    "text": { "$ref": "#/definitions/text" }
  },
  "allOf": [
    { "if": { "properties": { "type": { "const": "message" } } }, "then": { "required": ["text"] }, "else": { "required": ["name", "label"] } },
    { "if": { "properties": { "type": { "const": "select" } } }, "then": { "required": ["options"] } }
  ]
}
```

Then run `pnpm kit:schema` so the file is stamped and formatted as CI expects.

- [ ] **Step 4: Types, cross-checks and refs**

`src/lib/site-plan/types.ts`: update the `PlanValue` comment's marker list to include `{ $form: ref } → form id`, and add before `SitePlan`:

```ts
export type PlanFormField = {
  type: 'text' | 'email' | 'textarea' | 'number' | 'checkbox' | 'select' | 'country' | 'message'
  name?: string
  label?: Localized<string>
  required?: boolean
  width?: 25 | 33 | 50 | 66 | 75 | 100
  default?: boolean
  options?: { value: string; label: Localized<string> }[]
  /** Only on `message`: the info text. */
  text?: Localized<string>
}
export type PlanForm = {
  ref: string
  title: Localized<string>
  fields: PlanFormField[]
  submitLabel?: Localized<string>
  confirmation: Localized<string>
  /** Days, "keep", or left out for the site default (site/config.ts forms.retentionDays). */
  retention?: number | 'keep'
}
```

and in `SitePlan`, after `documents?`: `forms?: PlanForm[]`.

`src/lib/site-plan/validate.ts`: replace `validateSitePlan` with:

```ts
/** What JSON Schema cannot say: refs and field names must be unique. Paths as Ajv writes them. */
function crossCheck(plan: SitePlan): string[] {
  const errors: string[] = []
  const refs = new Set<string>()
  ;(plan.forms ?? []).forEach((form, i) => {
    if (refs.has(form.ref)) errors.push(`/forms/${i}/ref duplicate form "${form.ref}"`)
    refs.add(form.ref)
    const names = new Set<string>()
    form.fields.forEach((field, j) => {
      if (!field.name) return
      if (names.has(field.name)) errors.push(`/forms/${i}/fields/${j}/name duplicate field "${field.name}"`)
      names.add(field.name)
    })
  })
  return errors
}

export function validateSitePlan(input: unknown): { ok: true; plan: SitePlan } | { ok: false; errors: string[] } {
  if (!check(input)) return { ok: false, errors: (check.errors ?? []).map(fmt) }
  const errors = crossCheck(input as SitePlan)
  return errors.length ? { ok: false, errors } : { ok: true, plan: input as SitePlan }
}
```

`src/lib/site-plan/refs.ts`:
- `type Ids` gains `forms?: Map<string, number>`.
- In `walk`, the marker list becomes `['$media', '$page', '$pageLink', '$person', '$document', '$form']`.
- In `findMissingRefs`, add `const forms = new Set((plan.forms ?? []).map((f) => f.ref))` and, in the `walk` callback before the final `else needPage(ref)`:

```ts
    else if (marker === '$form') void (!forms.has(ref) && missing.add(`form "${ref}"`))
```

- In `resolveValue`, after the `$document` line:

```ts
    if (typeof o.$form === 'string') return ids.forms?.get(o.$form)
```

- [ ] **Step 5: Run tests**

Run: `pnpm exec tsx --test tests/unit/site-plan.test.ts tests/unit/site-plan-refs.test.ts tests/unit/import-plan.test.ts`
Expected: PASS (new and existing). Then `pnpm kit:schema && git diff --stat schema/` shows only `site-plan.schema.json` changed.

- [ ] **Step 6: Commit**

```bash
git add schema/site-plan.schema.json src/lib/site-plan/types.ts src/lib/site-plan/validate.ts src/lib/site-plan/refs.ts tests/unit/site-plan.test.ts tests/unit/site-plan-refs.test.ts
git commit -m "Site plan: a forms section, and \$form for the Form block

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Import forms before pages

**Files:**
- Create: `src/lib/site-plan/forms.ts`
- Modify: `src/lib/site-plan/import.ts` (`CONTENT_COLLECTIONS`, forms loop, progress total, `ids.forms`)
- Test: `tests/unit/import-plan.test.ts`

**Interfaces:**
- Consumes: `PlanForm`, `PlanFormField` (Task 3); `retentionFromPlan` (Task 2); `resolveValue` handling `$form` (Task 3).
- Produces:
  - `textToHtml(text: string): string`
  - `formData(form: PlanForm, locale: Locale, html: (h: string) => Promise<unknown>, rows?: FormRow[]): Promise<{ fields: unknown[]; submitButtonLabel?: string; confirmationType: 'message'; confirmationMessage?: unknown }>`
  - `type FormRow = { id?: string; options?: { id?: string }[] }`
  - `hasLocale(form: PlanForm, locale: Locale): boolean`
  - `CONTENT_COLLECTIONS` = `['redirects', 'articles', 'pages', 'form-submissions', 'forms', 'people', 'documents', 'media', 'site-settings']`

- [ ] **Step 1: Write the failing tests**

In `tests/unit/import-plan.test.ts`, replace the `Call` type and `fakePayload` with this version (it records ids and gives created forms row ids, as Payload does):

```ts
type Call = { op: string; collection: string; data?: unknown; filePath?: string; file?: unknown; locale?: string; id?: number }
function fakePayload(existing = 0) {
  const calls: Call[] = []
  let id = 0
  const withRowIds = (data: any) => ({
    fields: (data?.fields ?? []).map((f: any, i: number) => ({ ...f, id: `row${i}`, options: f.options?.map((o: any, j: number) => ({ ...o, id: `opt${i}-${j}` })) })),
  })
  const payload = {
    calls,
    count: async () => ({ totalDocs: existing }),
    delete: async ({ collection }: { collection: string }) => { calls.push({ op: 'delete', collection }); return {} },
    create: async (a: { collection: string; data: unknown; filePath?: string; file?: unknown; locale?: string }) => {
      const doc = { id: ++id, ...(a.collection === 'forms' ? withRowIds(a.data) : {}) }
      calls.push({ op: 'create', ...a, id: doc.id })
      return doc
    },
    update: async (a: { collection: string; data: unknown; locale?: string }) => { calls.push({ op: 'update', ...a }); return { id: 1 } },
    config: {},
  }
  return payload as unknown as Payload & { calls: Call[] }
}
```

Append:

```ts
const contactForm = () => ({
  ref: 'contact',
  title: { no: 'Kontakt', en: 'Contact' },
  fields: [
    { type: 'text', name: 'navn', label: { no: 'Navn', en: 'Name' }, required: true, width: 50 },
    { type: 'select', name: 'emne', label: { no: 'Emne', en: 'Topic' }, options: [{ value: 'pris', label: { no: 'Pris', en: 'Price' } }] },
    { type: 'checkbox', name: 'samtykke', label: { no: 'Ja', en: 'Yes' }, default: false },
    { type: 'message', text: { no: 'Hei <du> & "deg"', en: 'Hi' } },
  ],
  submitLabel: { no: 'Send', en: 'Send' },
  confirmation: { no: 'Takk!', en: 'Thanks!' },
  retention: 30,
})

test('forms are created before pages as the plugin stores them, and the form block gets its id', async () => {
  const p = plan()
  p.forms = [contactForm()]
  p.pages[0].layout.no.push({ blockType: 'formBlock', form: { $form: 'contact' } })
  const payload = fakePayload()
  await importPlan(payload, p, { baseDir: 'tests/fixtures', toLexical })
  const creates = payload.calls.filter((c) => c.op === 'create').map((c) => c.collection)
  assert.ok(creates.indexOf('forms') < creates.indexOf('pages'))
  const form = payload.calls.find((c) => c.op === 'create' && c.collection === 'forms')!
  const data = form.data as any
  assert.equal(form.locale, 'no')
  assert.equal(data.title, 'Kontakt')
  assert.deepEqual(data.fields[0], { id: undefined, blockType: 'text', name: 'navn', label: 'Navn', required: true, width: 50 })
  assert.deepEqual(data.fields[1].options, [{ id: undefined, value: 'pris', label: 'Pris' }])
  assert.equal(data.fields[2].defaultValue, false)
  assert.deepEqual(data.fields[3], { id: undefined, blockType: 'message', message: { html: '<p>Hei &lt;du&gt; &amp; &quot;deg&quot;</p>' } })
  assert.equal(data.submitButtonLabel, 'Send')
  assert.equal(data.confirmationType, 'message')
  assert.deepEqual(data.confirmationMessage, { html: '<p>Takk!</p>' })
  assert.deepEqual([data.retention, data.retentionDays], ['days', 30])
  assert.deepEqual(data.emails, [])
  const layout = payload.calls.find((c) => c.op === 'update' && c.collection === 'pages' && c.locale === 'no')!.data as any
  assert.equal(layout.layout.at(-1).form, form.id)
})

test('the second language fills the same field rows, so the first language is kept', async () => {
  const p = plan()
  p.forms = [contactForm()]
  const payload = fakePayload()
  await importPlan(payload, p, { baseDir: 'tests/fixtures', toLexical })
  const en = payload.calls.find((c) => c.op === 'update' && c.collection === 'forms' && c.locale === 'en')!.data as any
  assert.deepEqual(en.fields.map((f: any) => f.id), ['row0', 'row1', 'row2', 'row3'])
  assert.equal(en.fields[1].options[0].id, 'opt1-0')
  assert.equal(en.fields[0].label, 'Name')
  assert.equal(en.submitButtonLabel, 'Send')
  assert.equal(en.title, undefined, 'the plugin does not localize the title')
})

test('a form written only in the second language still imports (review focus 3)', async () => {
  const p = plan()
  const f = contactForm()
  f.title = { en: 'Contact' } as never
  f.fields[0].label = { en: 'Name' } as never
  p.forms = [f]
  const payload = fakePayload()
  await importPlan(payload, p, { baseDir: 'tests/fixtures', toLexical })
  const data = payload.calls.find((c) => c.op === 'create' && c.collection === 'forms')!.data as any
  assert.equal(data.title, 'Contact')
})

test('a form left without retention follows the site, and "keep" keeps', async () => {
  for (const [retention, expected] of [[undefined, ['default', null]], ['keep', ['keep', null]]] as const) {
    const p = plan()
    p.forms = [{ ...contactForm(), retention }]
    const payload = fakePayload()
    await importPlan(payload, p, { baseDir: 'tests/fixtures', toLexical })
    const data = payload.calls.find((c) => c.op === 'create' && c.collection === 'forms')!.data as any
    assert.deepEqual([data.retention, data.retentionDays], expected)
  }
})

test('a form the database refuses stops the import, naming the form', async () => {
  const p = plan()
  p.forms = [contactForm()]
  const payload = fakePayload()
  const create = payload.create.bind(payload)
  ;(payload as any).create = async (a: any) => {
    if (a.collection === 'forms') throw new Error('The following field is invalid: fields.0.name')
    return create(a)
  }
  await assert.rejects(importPlan(payload, p, { baseDir: 'tests/fixtures', toLexical }), /form "contact": The following field is invalid/)
})

test('reset clears submissions and forms after the pages that use them', () => {
  const c: string[] = [...CONTENT_COLLECTIONS]
  assert.ok(c.indexOf('pages') < c.indexOf('form-submissions') && c.indexOf('form-submissions') < c.indexOf('forms'))
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm exec tsx --test tests/unit/import-plan.test.ts`
Expected: the new tests FAIL (no `forms` create call; `CONTENT_COLLECTIONS` has no `forms`); the six existing tests still PASS with the new fake.

- [ ] **Step 3: Implement the mapping** (`src/lib/site-plan/forms.ts`)

```ts
/**
 * A plan form as the form-builder plugin stores it. Labels, the button, the confirmation and
 * info texts are localized in the plugin; the field rows are not, so a second language must
 * fill the rows the first one created (by id), or it would replace them.
 */
import type { Locale } from '../sites'
import type { PlanForm, PlanFormField } from './types'

export type FormRow = { id?: string; options?: { id?: string }[] }

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ESC[c])

/** Plain text as HTML: a paragraph per blank-line-separated part, line breaks kept. Never markup. */
export const textToHtml = (text: string) =>
  text.split(/\n{2,}/).map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('')

async function field(f: PlanFormField, locale: Locale, html: (h: string) => Promise<unknown>, row?: FormRow) {
  if (f.type === 'message') {
    const t = f.text?.[locale]
    return { id: row?.id, blockType: 'message', message: t === undefined ? undefined : await html(textToHtml(t)) }
  }
  return {
    id: row?.id,
    blockType: f.type,
    name: f.name,
    label: f.label?.[locale],
    required: f.required ?? false,
    width: f.width ?? 100,
    ...(f.type === 'checkbox' && f.default !== undefined ? { defaultValue: f.default } : {}),
    ...(f.options ? { options: f.options.map((o, j) => ({ id: row?.options?.[j]?.id, value: o.value, label: o.label[locale] })) } : {}),
  }
}

/** The form's localized data for one locale. `rows` are the created form's fields (ids kept). */
export async function formData(form: PlanForm, locale: Locale, html: (h: string) => Promise<unknown>, rows?: FormRow[]) {
  const confirmation = form.confirmation[locale]
  return {
    fields: await Promise.all(form.fields.map((f, i) => field(f, locale, html, rows?.[i]))),
    submitButtonLabel: form.submitLabel?.[locale],
    confirmationType: 'message' as const,
    confirmationMessage: confirmation === undefined ? undefined : await html(textToHtml(confirmation)),
  }
}

/** Whether the plan has any text for this form in this locale. */
export function hasLocale(form: PlanForm, locale: Locale): boolean {
  const texts = [form.submitLabel, form.confirmation, ...form.fields.flatMap((f) => [f.label, f.text, ...(f.options ?? []).map((o) => o.label)])]
  return texts.some((t) => t?.[locale] !== undefined)
}
```

- [ ] **Step 4: Wire it into the import** (`src/lib/site-plan/import.ts`)

- Imports: add `import { formData, hasLocale, type FormRow } from './forms'` and `import { retentionFromPlan } from '../forms/retention'`.
- `CONTENT_COLLECTIONS` becomes:

```ts
export const CONTENT_COLLECTIONS = ['redirects', 'articles', 'pages', 'form-submissions', 'forms', 'people', 'documents', 'media', 'site-settings'] as const
```

- `total` gains `+ (plan.forms?.length ?? 0)`.
- `ids` gains `forms: new Map<string, number>()`.
- After the documents loop and before `// Pages link to each other`:

```ts
  for (const f of plan.forms ?? []) {
    // The plugin does not localize the title: the default language's, else the first given.
    const title = f.title[DEFAULT_LOCALE] ?? Object.values(f.title)[0]
    const data = { title, ...(await formData(f, DEFAULT_LOCALE, html)), ...retentionFromPlan(f.retention), emails: [] }
    let doc: { id: number; fields?: FormRow[] }
    try {
      doc = (await payload.create({ collection: 'forms', data: data as never, locale: DEFAULT_LOCALE, context: ctx })) as typeof doc
    } catch (e) {
      // Name the form: the plan's author must be able to find it.
      throw new Error(`form "${f.ref}": ${e instanceof Error ? e.message : String(e)}`)
    }
    ids.forms.set(f.ref, doc.id)
    for (const l of others)
      if (hasLocale(f, l)) await payload.update({ collection: 'forms', id: doc.id, locale: l, data: (await formData(f, l, html, doc.fields)) as never, context: ctx })
    tick()
  }
```

- [ ] **Step 5: Run tests**

Run: `pnpm exec tsx --test tests/unit/import-plan.test.ts tests/unit/site-plan.test.ts tests/unit/site-plan-refs.test.ts`
Expected: PASS, all.

- [ ] **Step 6: Commit**

```bash
git add src/lib/site-plan/forms.ts src/lib/site-plan/import.ts tests/unit/import-plan.test.ts
git commit -m "Plan import: forms before pages, per-language labels on the same field rows

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Retention fields on the forms collection

**Files:**
- Create: `src/collections/formRetentionFields.ts`
- Modify: `src/plugins/index.ts` (`formOverrides.fields`)
- Test: `tests/unit/form-retention-fields.test.ts`

**Interfaces:**
- Consumes: `RETENTION_MAX_DAYS` (Task 2); `FORMS` (Task 1).
- Produces: `formRetentionFields(siteDefault: number | null): Field[]` with fields named `retention` (select: `default`, `days`, `keep`; default `default`) and `retentionDays` (number).

- [ ] **Step 1: Write the failing test** (`tests/unit/form-retention-fields.test.ts`)

```ts
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { formRetentionFields } from '../../src/collections/formRetentionFields'

test('the admin offers the site default (named), a number of days, or keep', () => {
  const [choice] = formRetentionFields(90) as any[]
  assert.equal(choice.name, 'retention')
  assert.equal(choice.defaultValue, 'default')
  assert.deepEqual(choice.options.map((o: any) => o.value), ['default', 'days', 'keep'])
  assert.match(choice.options[0].label, /90/)
  assert.match((formRetentionFields(null) as any[])[0].options[0].label, /behold/i)
})

test('days are required and checked only when "Number of days" is chosen', () => {
  const days = (formRetentionFields(90) as any[])[1]
  const v = (value: unknown, retention: string) => days.validate(value, { siblingData: { retention } })
  assert.equal(v(undefined, 'default'), true)
  assert.equal(v(undefined, 'keep'), true)
  assert.equal(v(30, 'days'), true)
  for (const bad of [undefined, 0, 3651, 2.5]) assert.equal(typeof v(bad, 'days'), 'string', String(bad))
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec tsx --test tests/unit/form-retention-fields.test.ts`
Expected: FAIL, cannot find module `formRetentionFields`.

- [ ] **Step 3: Implement** (`src/collections/formRetentionFields.ts`)

```ts
import type { Field } from 'payload'

import { RETENTION_MAX_DAYS } from '@/lib/forms/retention'

/** "Behold innsendinger" on a form: the site's default, a number of days, or keep. Read by the nightly job. */
export function formRetentionFields(siteDefault: number | null): Field[] {
  const site = siteDefault === null ? 'behold' : `${siteDefault} dager`
  return [
    {
      name: 'retention',
      type: 'select',
      label: 'Behold innsendinger',
      required: true,
      defaultValue: 'default',
      options: [
        { label: `Nettstedets standard (${site})`, value: 'default' },
        { label: 'Antall dager', value: 'days' },
        { label: 'Behold', value: 'keep' },
      ],
      admin: { position: 'sidebar', description: 'Innsendinger som er eldre, slettes hver natt.' },
    },
    {
      name: 'retentionDays',
      type: 'number',
      label: 'Dager',
      min: 1,
      max: RETENTION_MAX_DAYS,
      admin: { position: 'sidebar', step: 1, condition: (_, sibling) => sibling?.retention === 'days' },
      validate: (value: unknown, { siblingData }: { siblingData: unknown }) =>
        (siblingData as { retention?: string } | undefined)?.retention !== 'days' ||
        (Number.isInteger(value) && (value as number) >= 1 && (value as number) <= RETENTION_MAX_DAYS) ||
        `Et helt antall dager fra 1 til ${RETENTION_MAX_DAYS}`,
    },
  ]
}
```

In `src/plugins/index.ts`: add `FORMS` to the existing `import { DEFAULT_LOCALE, ... } from '@/lib/sites'` line, add `import { formRetentionFields } from '@/collections/formRetentionFields'`, and replace the `fields:` entry of `formOverrides` with:

```ts
      fields: ({ defaultFields }) => [
        ...defaultFields.map((field) =>
          'name' in field && field.name === 'confirmationMessage'
            ? {
                ...field,
                editor: lexicalEditor({
                  features: ({ rootFeatures }) => [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
                  ],
                }),
              }
            : field,
        ),
        ...formRetentionFields(FORMS.retentionDays),
      ],
```

- [ ] **Step 4: Run tests and typecheck**

Run: `pnpm exec tsx --test tests/unit/form-retention-fields.test.ts && pnpm typecheck`
Expected: PASS; typecheck clean. If the `validate` signature does not match Payload's `NumberFieldValidation` type, type it as `NumberFieldSingleValidation` from `payload` and keep the same logic.

- [ ] **Step 5: Commit**

```bash
git add src/collections/formRetentionFields.ts src/plugins/index.ts tests/unit/form-retention-fields.test.ts
git commit -m "Forms: how long submissions are kept, per form in the admin

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Deleting expired submissions

**Files:**
- Create: `src/jobs/pruneFormSubmissions.ts`
- Test: `tests/unit/prune-form-submissions.test.ts`

**Interfaces:**
- Consumes: `retentionDaysFor`, `FormRetention` (Task 2).
- Produces: `PRUNE_BATCH = 1000`; `pruneFormSubmissions(payload: Payload, opts: { siteDefault: number | null; now?: Date; batch?: number }): Promise<{ form: number | string; deleted: number; error?: string }[]>`

- [ ] **Step 1: Write the failing test** (`tests/unit/prune-form-submissions.test.ts`)

```ts
import assert from 'node:assert/strict'
import { test } from 'node:test'

import type { Payload } from 'payload'

import { pruneFormSubmissions } from '../../src/jobs/pruneFormSubmissions'

const NOW = new Date('2026-10-12T02:15:00.000Z')
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString()

type Sub = { id: number; form: number; createdAt: string; submissionData?: unknown }
function fake(forms: object[], subs: Sub[], failFor?: number) {
  const deleted: number[] = []
  const logs: string[] = []
  const payload = {
    logger: { info: (m: string) => logs.push(m), error: (m: string) => logs.push(`ERROR ${m}`) },
    find: async ({ collection, where, limit }: any) => {
      if (collection === 'forms') return { docs: forms }
      const formId = where.and[0].form.equals
      const cutoff = where.and[1].createdAt.less_than
      if (formId === failFor) throw new Error('database unavailable')
      return { docs: subs.filter((s) => s.form === formId && s.createdAt < cutoff && !deleted.includes(s.id)).slice(0, limit) }
    },
    delete: async ({ collection, where }: any) => {
      assert.equal(collection, 'form-submissions')
      deleted.push(...where.id.in)
      return {}
    },
  }
  return { payload: payload as unknown as Payload, deleted, logs }
}

test("each form's period decides what goes; keep keeps; the site default covers the rest", async () => {
  const forms = [
    { id: 1, title: 'Kontakt', retention: 'days', retentionDays: 30 },
    { id: 2, title: 'Jobb', retention: 'keep' },
    { id: 3, title: 'Nyhetsbrev', retention: 'default' },
  ]
  const subs = [
    { id: 11, form: 1, createdAt: daysAgo(31) },
    { id: 12, form: 1, createdAt: daysAgo(29) },
    { id: 21, form: 2, createdAt: daysAgo(4000) },
    { id: 31, form: 3, createdAt: daysAgo(91) },
    { id: 32, form: 3, createdAt: daysAgo(89) },
  ]
  const f = fake(forms, subs)
  const r = await pruneFormSubmissions(f.payload, { siteDefault: 90, now: NOW })
  assert.deepEqual(f.deleted.sort(), [11, 31])
  assert.deepEqual(r, [{ form: 1, deleted: 1 }, { form: 3, deleted: 1 }])
})

test('a site default of null keeps the forms that follow it', async () => {
  const f = fake([{ id: 3, title: 'Nyhetsbrev', retention: 'default' }], [{ id: 31, form: 3, createdAt: daysAgo(4000) }])
  assert.deepEqual(await pruneFormSubmissions(f.payload, { siteDefault: null, now: NOW }), [])
  assert.deepEqual(f.deleted, [])
})

test('a submission exactly at the cutoff is kept (review focus 2)', async () => {
  const f = fake([{ id: 1, title: 'Kontakt', retention: 'days', retentionDays: 30 }], [{ id: 11, form: 1, createdAt: daysAgo(30) }])
  await pruneFormSubmissions(f.payload, { siteDefault: 90, now: NOW })
  assert.deepEqual(f.deleted, [])
})

test('at most one batch per form per run, so a backlog clears over a few nights', async () => {
  const subs = Array.from({ length: 2505 }, (_, i) => ({ id: i + 1, form: 1, createdAt: daysAgo(100) }))
  const f = fake([{ id: 1, title: 'Kontakt', retention: 'default' }], subs)
  assert.deepEqual(await pruneFormSubmissions(f.payload, { siteDefault: 90, now: NOW, batch: 1000 }), [{ form: 1, deleted: 1000 }])
  assert.equal(f.deleted.length, 1000)
})

test('one failing form is logged and the others still run', async () => {
  const forms = [{ id: 1, title: 'A', retention: 'default' }, { id: 2, title: 'B', retention: 'default' }]
  const f = fake(forms, [{ id: 21, form: 2, createdAt: daysAgo(100) }], 1)
  const r = await pruneFormSubmissions(f.payload, { siteDefault: 90, now: NOW })
  assert.deepEqual(r, [{ form: 1, deleted: 0, error: 'database unavailable' }, { form: 2, deleted: 1 }])
  assert.ok(f.logs.some((l) => l.startsWith('ERROR') && l.includes('form 1')))
})

test('logs give the form and the count, never what was submitted', async () => {
  const f = fake([{ id: 1, title: 'Kontakt', retention: 'default' }], [{ id: 11, form: 1, createdAt: daysAgo(100), submissionData: [{ field: 'navn', value: 'Kari Nordmann' }] }])
  await pruneFormSubmissions(f.payload, { siteDefault: 90, now: NOW })
  assert.ok(f.logs.some((l) => l.includes('form 1') && l.includes('Kontakt') && l.includes('1')))
  assert.ok(f.logs.every((l) => !l.includes('Kari')))
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec tsx --test tests/unit/prune-form-submissions.test.ts`
Expected: FAIL, cannot find module `src/jobs/pruneFormSubmissions`.

- [ ] **Step 3: Implement** (`src/jobs/pruneFormSubmissions.ts`)

```ts
/**
 * Deletes form submissions older than their form's retention period (see
 * src/lib/forms/retention.ts). Run each night by the prune-form-submissions task.
 */
import type { Payload } from 'payload'

import { retentionDaysFor, type FormRetention } from '../lib/forms/retention'

export const PRUNE_BATCH = 1000
const DAY = 86_400_000

type FormDoc = { id: number | string; title?: string } & FormRetention

export async function pruneFormSubmissions(
  payload: Payload,
  { siteDefault, now = new Date(), batch = PRUNE_BATCH }: { siteDefault: number | null; now?: Date; batch?: number },
): Promise<{ form: number | string; deleted: number; error?: string }[]> {
  const out: { form: number | string; deleted: number; error?: string }[] = []
  const forms = await payload.find({ collection: 'forms', pagination: false, depth: 0 })
  for (const form of forms.docs as unknown as FormDoc[]) {
    const days = retentionDaysFor(form, siteDefault)
    if (days === null) continue
    const cutoff = new Date(now.getTime() - days * DAY).toISOString()
    try {
      // At most one batch per form per run: a large backlog clears over a few nights.
      const old = await payload.find({
        collection: 'form-submissions',
        where: { and: [{ form: { equals: form.id } }, { createdAt: { less_than: cutoff } }] },
        limit: batch,
        depth: 0,
      })
      const ids = old.docs.map((d) => d.id)
      if (ids.length) {
        await payload.delete({ collection: 'form-submissions', where: { id: { in: ids } } })
        payload.logger.info(`form submissions: deleted ${ids.length} older than ${days} days from form ${form.id} (${form.title ?? ''})`)
      }
      out.push({ form: form.id, deleted: ids.length })
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e)
      payload.logger.error(`form submissions: could not prune form ${form.id} (${form.title ?? ''}): ${error}`)
      out.push({ form: form.id, deleted: 0, error })
    }
  }
  return out
}
```

- [ ] **Step 4: Run tests**

Run: `pnpm exec tsx --test tests/unit/prune-form-submissions.test.ts`
Expected: PASS, 6 tests. (The first test expects only forms with something to consider in the result; form 2 is "keep" and is skipped, so it is absent.)

- [ ] **Step 5: Commit**

```bash
git add src/jobs/pruneFormSubmissions.ts tests/unit/prune-form-submissions.test.ts
git commit -m "Forms: delete submissions older than their form's period, a batch per form per run

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: The nightly job, the migration and generated files

**Files:**
- Create: `src/jobs/index.ts`
- Modify: `src/payload.config.ts` (`jobs`)
- Create: `src/migrations/<timestamp>_forms_retention.ts` and `.json` (generated), `src/migrations/index.ts` (generated)
- Modify (generated): `src/payload-types.ts`, `schema/blocks.schema.json`
- Test: `tests/unit/jobs.test.ts`

**Interfaces:**
- Consumes: `pruneFormSubmissions` (Task 6); `FORMS` (Task 1); `formRetentionFields` wired in (Task 5).
- Produces: `PRUNE_TASK = 'prune-form-submissions'`; `shouldRunJobs(env?): boolean`; `jobs` (Payload `JobsConfig`).

- [ ] **Step 1: Write the failing test** (`tests/unit/jobs.test.ts`)

```ts
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { jobs, PRUNE_TASK, shouldRunJobs } from '../../src/jobs'

test('jobs run only in the running web server, never in scripts, tests or next build (review focus 5)', () => {
  assert.equal(shouldRunJobs({}), false)
  assert.equal(shouldRunJobs({ NEXT_RUNTIME: 'edge' }), false)
  assert.equal(shouldRunJobs({ NEXT_RUNTIME: 'nodejs', NEXT_PHASE: 'phase-production-build' }), false)
  assert.equal(shouldRunJobs({ NEXT_RUNTIME: 'nodejs' }), true)
  assert.equal(shouldRunJobs(), false, 'this test process is not the web server')
})

test('the prune task runs at 02:15 UTC each night, and the web server checks the queue every 5 minutes', () => {
  const task = jobs.tasks?.find((t) => t.slug === PRUNE_TASK)
  assert.ok(task)
  assert.deepEqual(task.schedule, [{ cron: '0 15 2 * * *', queue: 'nightly' }])
  assert.deepEqual(jobs.autoRun, [{ cron: '0 */5 * * * *', queue: 'nightly' }])
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec tsx --test tests/unit/jobs.test.ts`
Expected: FAIL, cannot find module `src/jobs`.

- [ ] **Step 3: Implement** (`src/jobs/index.ts`)

```ts
/**
 * Payload jobs. Payload's autoRun starts a timer wherever Payload loads, so it is limited to
 * the running web server: kit scripts (kit:import) and tests would otherwise never exit, and
 * next build would start it too.
 */
import type { Config } from 'payload'

import { FORMS } from '../lib/sites'
import { pruneFormSubmissions } from './pruneFormSubmissions'

export const PRUNE_TASK = 'prune-form-submissions'

export function shouldRunJobs(env: Record<string, string | undefined> = process.env): boolean {
  return env.NEXT_RUNTIME === 'nodejs' && env.NEXT_PHASE !== 'phase-production-build'
}

export const jobs: NonNullable<Config['jobs']> = {
  tasks: [
    {
      slug: PRUNE_TASK,
      // Server time: UTC on Hosait, so 03:15 or 04:15 in Norway.
      schedule: [{ cron: '0 15 2 * * *', queue: 'nightly' }],
      outputSchema: [{ name: 'deleted', type: 'number' }],
      handler: async ({ req }) => {
        const result = await pruneFormSubmissions(req.payload, { siteDefault: FORMS.retentionDays })
        return { output: { deleted: result.reduce((n, r) => n + r.deleted, 0) } }
      },
    },
  ],
  autoRun: [{ cron: '0 */5 * * * *', queue: 'nightly' }],
  shouldAutoRun: () => shouldRunJobs(),
}
```

In `src/payload.config.ts`: add `import { jobs } from './jobs'` with the other local imports, and `jobs,` in `buildConfig` after `plugins,`.

- [ ] **Step 4: Run tests and typecheck**

Run: `pnpm exec tsx --test tests/unit/jobs.test.ts && pnpm typecheck`
Expected: PASS. If typecheck rejects the task's `slug` or `handler` types before `payload-types.ts` knows the task, continue to Step 5 (generate types) and typecheck again; only add a cast if it still fails after that.

- [ ] **Step 5: Generate the migration, types and block schema**

A real dependency install is needed (the worktree's `node_modules` symlink works for tsx but not for Next/Payload's own resolution): `rm -f node_modules && pnpm install --frozen-lockfile --prefer-offline`. Copy the local env (not committed): `cp ~/claude/site-kit/.env .env`.

```bash
docker exec site-kit-postgres-1 createdb -U sitekit sitekit_forms_mig
export DATABASE_URL=postgres://sitekit:sitekit@127.0.0.1:5433/sitekit_forms_mig
NODE_ENV=production pnpm payload migrate
pnpm payload migrate:create forms_retention
pnpm generate:types
pnpm kit:schema
```

Expected:
- `src/migrations/<timestamp>_forms_retention.ts` creates the jobs table(s) (`payload_jobs` and its log table) and adds `retention` / `retention_days` to `forms`; `src/migrations/index.ts` lists it.
- `src/payload-types.ts` and `schema/blocks.schema.json` (the `forms` definition) change; `schema/site-plan.schema.json` does not.
- Read the migration: no imports from `src/lib` or `@/`.

Then check that nothing is left over:

```bash
NODE_ENV=production pnpm payload migrate
pnpm payload migrate:create drift-check --skip-empty
git status --porcelain src/migrations
```

Expected: the second migrate applies `forms_retention`; `drift-check` creates nothing (no new file in `git status`).

- [ ] **Step 6: Run the whole unit suite and typecheck**

Run: `pnpm typecheck && pnpm test:unit`
Expected: all PASS (the migrations test included).

- [ ] **Step 7: Commit**

```bash
git add src/jobs/index.ts src/payload.config.ts src/migrations src/payload-types.ts schema/blocks.schema.json tests/unit/jobs.test.ts
git commit -m "Forms: a nightly job deletes expired submissions (02:15 UTC, web server only)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: The builder's guide and the intake question

**Files:**
- Modify: `AGENTS.md` (step 5)
- Modify: `site/questions.json` (question `forms`)
- Test: `tests/unit/agent-guide.test.ts`, `tests/unit/questions.test.ts` (existing; must stay green)

**Interfaces:**
- Consumes: `forms.retentionDays` in `site/config.ts` (Task 1), the plan format (Task 3).

- [ ] **Step 1: Update `AGENTS.md` step 5**

Replace the paragraph that starts "Write `seed/site-plan.json`" with:

```markdown
Write `seed/site-plan.json` against `schema/site-plan.schema.json`; the blocks and their fields
are in `schema/blocks.schema.json`. Map each template once, then fill every page of it. Put
images and PDFs in `seed/media/` (or use public https URLs). Link with `$media`, `$page`,
`$pageLink`, `$person`, `$document`, `$form`; rich text is `$html`. Forms go in `forms`: their
fields, the button text, the message shown after sending, and `retention` (days, or `"keep"`)
from the intake answer; left out, the site default in `site/config.ts` applies. A `formBlock`
points at one with `{ "$form": "<ref>" }`. Submissions are read in the admin and deleted each
night once older than the period. Add `redirects` for every old URL that moves, and `gaps` for
anything no block matches (a form that must send e-mail or take payment is still a gap). Check
it locally:
```

- [ ] **Step 2: Update the intake question** in `site/questions.json`, replacing the `forms` entry with:

```json
{ "id": "forms", "text": "Which forms do you need (their fields, and the message shown after sending), and for how many days should each form's submissions be kept? Submissions are read in the admin; e-mail on submission is not available yet.", "type": "text", "sets": ["cms.forms", "forms.retentionDays"] }
```

(match the file's existing formatting: one entry per line or as the file has it).

- [ ] **Step 3: Run tests**

Run: `pnpm exec tsx --test tests/unit/agent-guide.test.ts tests/unit/questions.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add AGENTS.md site/questions.json
git commit -m "Builder's guide and intake: forms in the plan, and how long submissions are kept

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: End to end against a local database, and the CI checks

**Files:**
- Create (not committed): `scripts/tmp-forms-e2e.ts`, `/tmp`-style plan file in the scratchpad
- No product code changes unless a step fails (then fix with a failing test first, in the task that owns the code).

- [ ] **Step 1: A plan with a form, imported**

Write `../forms-e2e/plan.json` (outside the repo): `tests/fixtures/plan-minimal.json` plus `contactForm()` from Task 4 with `"retention": 30`, plus `{ "blockType": "formBlock", "form": { "$form": "contact" } }` in the home page's `no` layout; copy `tests/fixtures/media/hero.jpg` to `../forms-e2e/media/hero.jpg`.

```bash
export DATABASE_URL=postgres://sitekit:sitekit@127.0.0.1:5433/sitekit_forms_mig
pnpm kit:import ../forms-e2e/plan.json --reset
```

Expected: the import finishes and the process exits by itself (review focus 5).

- [ ] **Step 2: Submit, backdate, run the task**

`scripts/tmp-forms-e2e.ts`:

```ts
import 'dotenv/config'
import { sql } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'

import config from '../src/payload.config'

const payload = await getPayload({ config })
const form = (await payload.find({ collection: 'forms', limit: 1, depth: 0 })).docs[0]
const submit = () => payload.create({ collection: 'form-submissions', data: { form: form.id, submissionData: [{ field: 'navn', value: 'Test' }] } as never })
const old = await submit()
const fresh = await submit()
await payload.db.drizzle.execute(sql`update form_submissions set created_at = now() - interval '40 days' where id = ${old.id}`)
await payload.jobs.queue({ task: 'prune-form-submissions', queue: 'nightly', input: {} } as never)
await payload.jobs.run({ queue: 'nightly' })
const left = (await payload.find({ collection: 'form-submissions', depth: 0, limit: 10 })).docs.map((d) => d.id)
console.log(JSON.stringify({ form: form.id, retention: [form.retention, form.retentionDays], old: old.id, fresh: fresh.id, left }))
process.exit(0)
```

Run: `pnpm exec tsx scripts/tmp-forms-e2e.ts`
Expected: `retention` is `["days",30]`, `left` equals `[fresh]`, the log shows `deleted 1 older than 30 days from form <id> (Kontakt)`. Then delete the script.

- [ ] **Step 3: The form in the admin and on the page**

Run `pnpm dev` (port 3100) with the same `DATABASE_URL`; open `/admin/collections/forms/<id>`: "Behold innsendinger" shows "Antall dager" and 30; switching to "Nettstedets standard (90 dager)" hides the days field. Open the home page `/no`: the form renders with Navn/Emne fields, and submitting shows "Takk!". Stop the server.

- [ ] **Step 4: Every CI step locally**

```bash
pnpm typecheck && pnpm lint && pnpm test:unit
npm test --prefix packages/site-builder
pnpm kit:theme-check
pnpm kit:schema && git diff --exit-code schema/
pnpm payload migrate:create drift-check --skip-empty && test -z "$(git status --porcelain src/migrations)"
```

Expected: all pass; lint shows no new warnings.

- [ ] **Step 5: Clean up**

`docker exec site-kit-postgres-1 dropdb -U sitekit sitekit_forms_mig`; remove `.env`, `scripts/tmp-forms-e2e.ts` and `../forms-e2e`; `git status` shows nothing untracked from this task.
