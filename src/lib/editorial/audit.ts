/**
 * What the content audit log records (src/collections/ContentAuditLog.ts): who, what, when, the
 * operation and the names of the changed fields, never their values. Pure helpers, no Payload.
 */
export const AUDIT_RETENTION_DAYS = 730

export type AuditOperation = 'create' | 'update' | 'publish' | 'unpublish' | 'delete'

/** Bookkeeping that changes on every save and says nothing about what an editor did. */
const NOISE = new Set([
  'id', 'createdAt', 'updatedAt', 'path',
  // Login state and credentials of a user are never written to the log, not even as a name.
  'password', 'hash', 'salt', 'resetPasswordToken', 'resetPasswordExpiration', 'loginAttempts', 'lockUntil', 'sessions',
])

const blank = (v: unknown): unknown => (v === undefined || v === '' || (Array.isArray(v) && v.length === 0) ? null : v)
const same = (a: unknown, b: unknown): boolean => JSON.stringify(blank(a)) === JSON.stringify(blank(b))

/** Names of the top-level fields whose value differs between two versions of a document. */
export function changedFieldNames(before: Record<string, unknown> | null | undefined, after: Record<string, unknown> | null | undefined): string[] {
  const a = before ?? {}
  const b = after ?? {}
  return [...new Set([...Object.keys(a), ...Object.keys(b)])]
    .filter((key) => !NOISE.has(key) && !same(a[key], b[key]))
    .sort()
}

/** `publish`/`unpublish` when the live document turns published or stops being, else the plain operation. */
export function auditOperation(operation: 'create' | 'update', wasLive: boolean, isLive: boolean): AuditOperation {
  if (isLive && !wasLive) return 'publish'
  if (wasLive && !isLive && operation === 'update') return 'unpublish'
  return operation
}

/** A readable name for the row: title, name, file name or e-mail, else the id. */
export function docLabel(doc: Record<string, unknown> | null | undefined): string {
  for (const key of ['title', 'name', 'filename', 'email']) {
    const value = doc?.[key]
    if (typeof value === 'string' && value.trim()) return value.trim().slice(0, 200)
  }
  return doc?.id === undefined ? '' : String(doc.id)
}

export const cutoffFor = (now: Date, days: number): string => new Date(now.getTime() - days * 86_400_000).toISOString()
