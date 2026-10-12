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
