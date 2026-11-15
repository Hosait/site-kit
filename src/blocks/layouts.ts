import type { Block } from 'payload'

import { pageBlocks } from './configs'
import { GlobalSection, Preset } from './reusable'

/** What a global section may hold: every page block except a reference to another global section. */
export const reusableBlocks = pageBlocks.filter((b) => b.slug !== GlobalSection.slug)

/** What the editor of a page can add: the page blocks, plus «Sett inn lagret seksjon». */
export const pageLayoutBlocks: Block[] = [...pageBlocks, Preset]
