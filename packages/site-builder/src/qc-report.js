// qc.md (for the customer and the hand-off) and qc.html (old | new | difference, worst first).
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const pct = (x) => (typeof x === 'number' ? `${Math.floor(x * 1000) / 10} %` : '–')

/** The lowest score a page has (content and pixels): pages sort worst first by it. */
function worst(p) {
  const vals = [...Object.values(p.scores ?? {}), ...Object.values(p.visual ?? {}).map((v) => v.similarity)].filter((v) => typeof v === 'number')
  if (p.problems.some((x) => x.kind === 'missing')) return -1
  return vals.length ? Math.min(...vals) : 1
}

const line = (x) => `${x.kind}: ${x.detail}${x.accepted ? ` (accepted: ${x.accepted})` : ''}`

export function qcMarkdown(r) {
  const failing = r.pages.filter((p) => !p.pass).sort((a, b) => worst(a) - worst(b))
  const accepted = r.pages.flatMap((p) => p.problems.filter((x) => x.accepted).map((x) => ({ ...x, page: p.path }))).concat(r.site.problems.filter((x) => x.accepted).map((x) => ({ ...x, page: '*' })))
  const out = [
    `# Quality check against ${r.newBase}`,
    '',
    r.pass ? '**Passed.** The new site matches the old one within the agreed thresholds.' : `**Not passed.**${r.complete ? '' : ' The check is incomplete (see notes).'}`,
    '',
    `${r.summary.pages} pages checked, ${r.summary.passing} pass. ${r.summary.screenshotted} pages compared pixel by pixel on desktop and mobile.`,
    '',
    `Thresholds: text ${pct(r.thresholds.text)}, headings ${pct(r.thresholds.headings)}, images ${pct(r.thresholds.images)}, links ${pct(r.thresholds.links)}, look ${pct(r.thresholds.visual)}.`,
    '',
    '## Whole site',
    '',
    `- Pages: old ${r.site.counts.pages.old}, new ${r.site.counts.pages.new ?? '?'}`,
    `- Documents: old ${r.site.counts.documents.old}, new ${r.site.counts.documents.new ?? '?'}`,
    `- Images (for information): old ${r.site.counts.images.old}, new ${r.site.counts.images.new ?? '?'}`,
    r.site.nav ? `- Menu: ${pct(r.site.nav.score)} of the items found` : '- Menu: not checked',
    r.site.footer ? `- Footer: ${pct(r.site.footer.score)} of the links found` : '- Footer: not checked',
    ...r.site.problems.map((x) => `- ${x.accepted ? 'Accepted' : 'Problem'}: ${line(x)}`),
    '',
  ]
  if (failing.length) {
    out.push('## Pages that do not pass', '')
    for (const p of failing) {
      out.push(`### ${p.path}`, '')
      for (const x of p.problems.filter((y) => !y.accepted)) out.push(`- ${line(x)}`)
      out.push('')
    }
  }
  if (accepted.length) out.push('## Accepted differences', '', ...accepted.map((x) => `- ${x.page} ${line(x)}`), '')
  out.push('Old, new and the difference side by side: [qc.html](qc.html)', '')
  if (r.notes.length) out.push('## Notes', '', ...r.notes.map((n) => `- ${n}`), '')
  return out.join('\n')
}

export function qcHtml(r) {
  const groups = new Map()
  for (const p of [...r.pages].sort((a, b) => worst(a) - worst(b))) groups.set(p.template ?? 'other', [...(groups.get(p.template ?? 'other') ?? []), p])
  const fig = (label, file) => (file ? `<figure><figcaption>${label}</figcaption><a href="${esc(file)}"><img loading="lazy" src="${esc(file)}" alt="${label}"></a></figure>` : '')
  const card = (p) => `<section class="${p.pass ? 'ok' : 'bad'}">
<h3>${esc(p.path)} <span>${p.pass ? 'passes' : 'does not pass'}</span></h3>
<p class="scores">${p.scores ? `text ${pct(p.scores.text)} · headings ${pct(p.scores.headings)} · images ${pct(p.scores.images)} · links ${pct(p.scores.links)}` : ''}${Object.entries(p.visual ?? {}).map(([vp, v]) => ` · ${vp} ${pct(v.similarity)}`).join('')}</p>
${p.problems.length ? `<ul>${p.problems.map((x) => `<li class="${x.accepted ? 'acc' : ''}">${esc(line(x))}</li>`).join('')}</ul>` : ''}
${Object.entries(p.visual ?? {}).map(([vp, v]) => `<h4>${esc(vp)}</h4><div class="trio">${fig('Old', v.old)}${fig('New', v.new)}${fig('Difference', v.diff)}</div>`).join('\n')}
</section>`
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Quality check: ${esc(r.newBase)}</title>
<style>
body{font:14px/1.45 system-ui,sans-serif;margin:24px;color:#1d2433;background:#fff}
h1{margin:0 0 4px}.verdict{font-weight:600}.verdict.pass{color:#166534}.verdict.fail{color:#b42318}
section{border:1px solid #d9dce3;border-radius:8px;padding:12px 16px;margin:0 0 16px}
section.bad{border-color:#f0b4ae}h3 span{font-weight:400;font-size:13px;color:#555}
.scores{color:#444}li.acc{color:#666;text-decoration:line-through}
.trio{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;align-items:start}
@media (max-width:48rem){.trio{grid-template-columns:1fr}}
figure{margin:0}figcaption{color:#555;margin:0 0 4px}img{max-width:100%;border:1px solid #ccc}
</style></head><body>
<h1>Quality check: ${esc(r.newBase)}</h1>
<p class="verdict ${r.pass ? 'pass' : 'fail'}">${r.pass ? 'Passed' : `Not passed${r.complete ? '' : ' (incomplete)'}`}: ${r.summary.passing} of ${r.summary.pages} pages pass; ${r.summary.screenshotted} compared pixel by pixel.</p>
${r.site.problems.length ? `<ul>${r.site.problems.map((x) => `<li class="${x.accepted ? 'acc' : ''}">${esc(line(x))}</li>`).join('')}</ul>` : ''}
${[...groups].map(([tpl, list]) => `<h2>Template ${esc(String(tpl).slice(0, 12))} (${list.length})</h2>\n${list.map(card).join('\n')}`).join('\n')}
${r.notes.length ? `<h2>Notes</h2><ul>${r.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
</body></html>
`
}
