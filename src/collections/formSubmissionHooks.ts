import type { CollectionBeforeChangeHook } from 'payload'

/**
 * A new submission is dated by the server. Payload keeps a createdAt the request sends, so a
 * visitor could otherwise date a submission in the future, and it would never be old enough
 * for the nightly deletion (src/jobs/pruneFormSubmissions.ts).
 */
export const ignoreClientCreatedAt: CollectionBeforeChangeHook = ({ operation, data }) =>
  operation === 'create' ? { ...data, createdAt: new Date().toISOString() } : data
