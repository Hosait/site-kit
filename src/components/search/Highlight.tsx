/** Merkene rundt treff i utdrag fra søket (samme som HL_START/HL_END i src/lib/search/query.ts). */
const START = '⟦'
const END = '⟧'

/** Viser et utdrag med treffene uthevet (<mark>), uten å tolke innholdet som HTML. */
export function Highlight({ text }: { text: string }) {
  const parts: { text: string; hit: boolean }[] = []
  for (const chunk of text.split(START)) {
    const [hit, rest] = chunk.includes(END) ? chunk.split(END, 2) : [null, chunk]
    if (hit) parts.push({ text: hit, hit: true })
    if (rest) parts.push({ text: rest, hit: false })
  }
  return (
    <>
      {parts.map((p, i) =>
        p.hit ? (
          <mark key={i} className="rounded-sm bg-tint px-0.5 text-ink">
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  )
}
