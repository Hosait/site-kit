/**
 * What the seed route answers when asked to wait (?wait=1). Hosait runs the seed command once
 * (seed.run, a 15-minute limit) and treats exit code 0 as done, so a failure must never be 200.
 */
import type { PlanSeedProgress } from './seed-plan'

/** How long ?wait=1 waits: under Hosait's 15-minute limit for the seed command. */
export const WAIT_MS = 14 * 60_000

/** True when the promise settled (resolved or rejected) within `ms`. */
export function settlesWithin(promise: Promise<unknown>, ms: number): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const deadline = new Promise<boolean>((resolve) => {
    timer = setTimeout(() => resolve(false), ms)
  })
  const settled = promise.then(
    () => true,
    () => true,
  )
  return Promise.race([settled, deadline]).finally(() => clearTimeout(timer))
}

export function planOutcome(progress: PlanSeedProgress, finished: boolean): { status: number; body: Record<string, unknown> } {
  if (!finished)
    return {
      status: 504,
      body: { ok: false, running: true, error: `The import is still running after ${WAIT_MS / 60_000} minutes; it continues in the background (${progress.done} of ${progress.total} steps).` },
    }
  if (progress.error) return { status: 500, body: { ok: false, error: progress.error } }
  return { status: 200, body: { ok: true, mode: 'plan', result: progress.result } }
}
