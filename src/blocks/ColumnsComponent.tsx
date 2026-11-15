import type { ColumnsBlock } from '@/payload-types'
import { cn } from '@/utilities/ui'

import { columnGrid, VERTICAL_ALIGN } from './columnLayouts'
import { Section } from './Section'

/** One block inside a column (the leaf blocks; never columns or a form). */
export type NestedBlock = NonNullable<NonNullable<NonNullable<ColumnsBlock['columns']>[number]['blocks']>[number]>

/**
 * Columns side by side from `md` up and stacked on mobile, in the order the editor gave them.
 * `renderNested` is RenderBlocks' own switch, so a column draws its blocks exactly as the page does.
 */
export function ColumnsComponent({ block, renderNested }: { block: ColumnsBlock; renderNested: (block: NestedBlock, index: number) => React.ReactNode }) {
  const cols = (block.columns ?? []).slice(0, 4)
  if (!cols.length) return null
  const valign = VERTICAL_ALIGN[block.verticalAlign as keyof typeof VERTICAL_ALIGN] ?? VERTICAL_ALIGN.top
  return (
    <Section background={block.background}>
      <div className="wrap-wide">
        <div className={cn('grid grid-cols-1 gap-8 md:gap-10', columnGrid(block.layout, cols.length), valign)}>
          {cols.map((col, i) => (
            <div key={col.id ?? i} className="col-cell flex min-w-0 flex-col gap-8">
              {(col.blocks ?? []).map((b, bi) => renderNested(b, bi))}
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
