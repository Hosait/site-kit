import type { ComponentType } from 'react'

/** Component for each custom block, keyed by its slug. Receives the block plus site and locale. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- block props differ per custom block
export const customComponents: Record<string, ComponentType<any>> = {}
