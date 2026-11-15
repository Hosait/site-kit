import { useId } from 'react'

import type { TableBlock } from '@/payload-types'

import { fitRow } from './interaction'
import { Section } from './Section'

/**
 * A data table with a caption and a header row. On a narrow screen the table scrolls sideways inside a
 * keyboard-focusable region named by the caption, so the page itself never scrolls sideways.
 */
export function TableComponent({ block }: { block: TableBlock }) {
  const captionId = useId()
  const header = block.header ?? []
  if (!header.length) return null
  const rows = (block.rows ?? []).map((r) => fitRow(r.cells, header.length))
  return (
    <Section background={block.background}>
      <div className="wrap">
        <div role="region" aria-labelledby={captionId} tabIndex={0} className="overflow-x-auto rounded-lg bg-white text-ink ring-1 ring-ink/10">
          <table className="w-full min-w-[32rem] border-collapse text-left">
            <caption id={captionId} className="px-4 py-3 text-left text-lg font-bold">
              {block.caption}
            </caption>
            <thead>
              <tr>
                {header.map((h, i) => (
                  <th key={h.id ?? i} scope="col" className="border-y-2 border-ink/20 bg-muted px-4 py-3 font-bold">
                    {h.text}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((cells, r) => (
                <tr key={block.rows?.[r]?.id ?? r} className="border-b border-ink/10 last:border-b-0">
                  {cells.map((text, c) =>
                    block.rowHeaders && c === 0 ? (
                      <th key={c} scope="row" className="px-4 py-3 text-left font-semibold">
                        {text}
                      </th>
                    ) : (
                      <td key={c} className="px-4 py-3">
                        {text}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  )
}
