'use client'

import { createContext, useContext } from 'react'

/** Faste tekster i skjemaet på sidens språk (settes av FormBlock fra RenderBlocks). */
export type FormStrings = { required: string; requiredError: string; invalidEmail: string; sending: string; error: string }

const STRINGS: Record<'no' | 'en', FormStrings> = {
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

export const formStrings = (locale: string | undefined) => STRINGS[locale === 'en' ? 'en' : 'no']
export const FormStringsContext = createContext<FormStrings>(STRINGS.no)
export const useFormStrings = () => useContext(FormStringsContext)

export function RequiredText() {
  return <span className="sr-only">{useFormStrings().required}</span>
}
