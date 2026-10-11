'use client'

import { createContext, useContext } from 'react'

import { DEFAULT_LOCALE, isLocale } from '@/lib/sites'
import type { STRING_LOCALES } from '@/lib/string-locales'

/** Faste tekster i skjemaet på sidens språk (settes av FormBlock fra RenderBlocks). */
export type FormStrings = { required: string; requiredError: string; invalidEmail: string; sending: string; error: string }

const STRINGS: Record<(typeof STRING_LOCALES)[number], FormStrings> = {
  no: {
    required: '(må fylles ut)',
    requiredError: 'Dette feltet må fylles ut.',
    invalidEmail: 'Skriv en gyldig e-postadresse.',
    sending: 'Sender …',
    error: 'Noe gikk galt. Prøv igjen, eller send oss en e-post.',
  },
  en: {
    required: '(required)',
    requiredError: 'This field is required.',
    invalidEmail: 'Please enter a valid email address.',
    sending: 'Sending …',
    error: 'Something went wrong. Please try again, or send us an email.',
  },
}

export const formStrings = (locale: string | undefined) => STRINGS[isLocale(locale) ? locale : DEFAULT_LOCALE]
export const FormStringsContext = createContext<FormStrings>(STRINGS[DEFAULT_LOCALE])
export const useFormStrings = () => useContext(FormStringsContext)

export function RequiredText() {
  return <span className="sr-only">{useFormStrings().required}</span>
}
