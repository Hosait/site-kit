import { APIError, type CollectionBeforeChangeHook, type CollectionBeforeValidateHook } from 'payload'

import { clientAddress } from '@/lib/forms/client-address'
import { ipLimited, limitText, PER_FORM_PER_DAY, tooLarge } from '@/lib/forms/limits'

/**
 * A new submission is dated by the server. Payload keeps a createdAt the request sends, so a
 * visitor could otherwise date a submission in the future, and it would never be old enough
 * for the nightly deletion (src/jobs/pruneFormSubmissions.ts).
 */
export const ignoreClientCreatedAt: CollectionBeforeChangeHook = ({ operation, data }) =>
  operation === 'create' ? { ...data, createdAt: new Date().toISOString() } : data

/**
 * A visitor's new submission: not too large, at most PER_IP per address, and at most
 * PER_FORM_PER_DAY per form (src/lib/forms/limits.ts). The seed and import (local API) and
 * signed-in editors are not limited. The message is shown in the form, in the visitor's language.
 */
export const limitSubmissions: CollectionBeforeValidateHook = async ({ operation, data, req }) => {
  if (operation !== 'create' || !data || req.payloadAPI === 'local' || req.user) return data
  const locale = data.locale
  if (tooLarge(data)) throw new APIError(limitText('tooLarge', locale), 413)
  const ip = clientAddress(req.headers?.get('x-forwarded-for'))
  if (ipLimited(ip, Date.now())) throw new APIError(limitText('tooMany', locale), 429)
  const form = data.form
  if (typeof form === 'number' || typeof form === 'string') {
    const since = new Date(Date.now() - 86_400_000).toISOString()
    const { totalDocs } = await req.payload.count({
      collection: 'form-submissions',
      where: { and: [{ form: { equals: form } }, { createdAt: { greater_than: since } }] },
      req,
    })
    if (totalDocs >= PER_FORM_PER_DAY) {
      req.payload.logger.warn(`form submissions: form ${form} has had ${totalDocs} in 24 hours, the limit is ${PER_FORM_PER_DAY}; new ones are refused`)
      throw new APIError(limitText('formFull', locale), 429)
    }
  }
  return data
}
