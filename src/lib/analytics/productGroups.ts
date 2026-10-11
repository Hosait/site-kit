/**
 * Produktgrupper. Verdiene er systemkodene i Spilka360 (PdmSystemCodes), slik at analysedata
 * kan kobles til Spilka360 uten oversettelse. Fixade har ingen egen kode der og bruker FixedFrame.
 */
export const PRODUCT_GROUPS = [
  { value: 'Classic', label: 'Spilka Classic' },
  { value: 'Opus', label: 'Spilka Opus' },
  { value: 'Swing', label: 'Spilka Swing' },
  { value: 'SideHinged', label: 'Sidehengt' },
  { value: 'TopHinged', label: 'Topphengt' },
  { value: 'Tango', label: 'Tango' },
  { value: 'BalconyDoor', label: 'Balkongdør' },
  { value: 'FixedFrame', label: 'Fixade / fastkarm' },
] as const

export type ProductGroup = (typeof PRODUCT_GROUPS)[number]['value']
export const isProductGroup = (v: unknown): v is ProductGroup => PRODUCT_GROUPS.some((g) => g.value === v)
export const productGroupLabel = (v: string | null | undefined) => PRODUCT_GROUPS.find((g) => g.value === v)?.label ?? v ?? ''

/** Felt for sider og dokumenter. Tomt på en side = arves fra nærmeste overordnede side. */
export const productGroupField = {
  name: 'productGroup',
  type: 'select' as const,
  label: 'Produktgruppe',
  options: PRODUCT_GROUPS.map((g) => ({ label: g.label, value: g.value })),
  admin: {
    position: 'sidebar' as const,
    description: 'Brukes i besøksanalysen (koder fra Spilka360). Tomt på en side = arves fra overordnet side.',
  },
}
