/**
 * The plan schema marks every per-language map with propertyNames.enum, every blockType with
 * $comment: 'blockType', and every value Payload stores as a select with $comment naming the
 * choice (articleKind, documentType, documentLanguage). This puts the site's own locales, the
 * kit's block types and the site's choices in, so an agent reading schema/site-plan.schema.json
 * sees exactly what this site accepts.
 */
export function stampSchema(node: unknown, locales: readonly string[], blockTypes?: readonly string[], choices?: Readonly<Record<string, readonly string[]>>): unknown {
  if (Array.isArray(node)) return node.map((n) => stampSchema(n, locales, blockTypes, choices))
  if (!node || typeof node !== 'object') return node
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(node)) out[k] = stampSchema(v, locales, blockTypes, choices)
  if ((out.propertyNames as { enum?: unknown } | undefined)?.enum) out.propertyNames = { enum: [...locales] }
  if (blockTypes && out.$comment === 'blockType') out.enum = [...blockTypes]
  const values = typeof out.$comment === 'string' ? choices?.[out.$comment] : undefined
  if (values) out.enum = [...values]
  return out
}
