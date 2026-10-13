// pnpm kit:schema: writes schema/blocks.schema.json from the Payload config, so the site
// plan and the AI map step always match the blocks this kit (plus site/blocks/custom) has.
import 'dotenv/config'
import { readFileSync, writeFileSync } from 'node:fs'
import { configToJSONSchema } from 'payload'

import { pageBlocks } from '../../src/blocks/configs'
import { stampSchema } from '../../src/lib/site-plan/stamp-schema'
import { PLAN_CHOICES } from '../../src/lib/site-plan/choices'
import { LOCALES } from '../../src/lib/sites'
import configPromise from '../../src/payload.config'

const config = await configPromise
type Definitions = Record<string, { properties?: Record<string, { items?: unknown }> }>
const full = configToJSONSchema(config, 'number') as unknown as { definitions: Definitions }
const layout = full.definitions.pages?.properties?.layout
if (!layout?.items) throw new Error('pages.layout not found in the generated schema')
// blockTypes is what the plan validator checks against. definitions and block carry each
// block's fields for the AI map step (Phase 2), which needs to know what a block can hold.
const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'blocks.schema.json',
  blockTypes: pageBlocks.map((b) => b.slug),
  block: layout.items,
  definitions: full.definitions,
}
writeFileSync('schema/blocks.schema.json', JSON.stringify(schema, null, 2) + '\n')
console.log(`schema/blocks.schema.json: ${schema.blockTypes.length} blocks`)
// The plan schema shows this site's locales, this kit's block types and the site's choices (article
// kinds, document types and languages), so an agent writing a plan from the file alone gets them
// right. Regenerated whenever blocks, locales or choices change.
const planFile = 'schema/site-plan.schema.json'
const plan = stampSchema(JSON.parse(readFileSync(planFile, 'utf8')), LOCALES, schema.blockTypes, PLAN_CHOICES)
writeFileSync(planFile, JSON.stringify(plan, null, 2) + '\n')
console.log(`${planFile}: locales ${LOCALES.join(', ')}`)
process.exit(0)
