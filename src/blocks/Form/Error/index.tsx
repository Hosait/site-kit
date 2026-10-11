'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'

import { useFormStrings } from '../strings'

export const Error = ({ name }: { name: string }) => {
  const {
    formState: { errors },
  } = useFormContext()
  const strings = useFormStrings()
  const type = errors[name]?.type
  return (
    <div className="mt-2 text-sm text-pink" role="alert">
      {(errors[name]?.message as string) || (type === 'pattern' ? strings.invalidEmail : strings.requiredError)}
    </div>
  )
}
