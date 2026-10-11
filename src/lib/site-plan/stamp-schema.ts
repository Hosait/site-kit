/**
 * The plan schema marks every per-language map with propertyNames.enum and every blockType
 * with $comment: 'blockType'. This puts the site's own locales (and the kit's block types) in,
 * so an agent reading schema/site-plan.schema.json sees exactly what this site accepts.
 */
export function stampSchema(node: unknown, locales: readonly string[], blockTypes?: readonly string[]): unknown {
  if (Array.isArray(node)) return node.map((n) => stampSchema(n, locales, blockTypes))
  if (!node || typeof node !== 'object') return node
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(node)) out[k] = stampSchema(v, locales, blockTypes)
  if ((out.propertyNames as { enum?: unknown } | undefined)?.enum) out.propertyNames = { enum: [...locales] }
  if (blockTypes && out.$comment === 'blockType') out.enum = [...blockTypes]
  return out
}
