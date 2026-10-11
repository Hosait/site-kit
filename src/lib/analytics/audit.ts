import type { Payload } from 'payload'

/** Skriver en administrativ handling til revisjonsloggen. Feil stopper aldri handlingen. */
export async function audit(payload: Payload, user: unknown, action: string, details?: Record<string, unknown>) {
  try {
    const id = (user as { id?: number } | null)?.id
    await payload.create({
      collection: 'audit-log',
      data: { user: typeof id === 'number' ? id : null, action, details: details ?? null },
      overrideAccess: true,
    })
  } catch (err) {
    payload.logger.error({ err, msg: `Revisjonslogg: kunne ikke lagre «${action}»` })
  }
}
