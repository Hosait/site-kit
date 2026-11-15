/**
 * E-mail about the approval workflow, through Payload's e-mail adapter: SMTP when SMTP_HOST is
 * set, otherwise the text is written to the console (local development). A failed e-mail never
 * stops the workflow step; the endpoint reports how many were sent.
 */
import type { Payload } from 'payload'

import { belongsToSite } from '@/access/siteAccess'
import { rolesThatReview } from '@/lib/editorial/roles'
import { SINGLE_SITE, SITE_CONFIG } from '@/lib/sites'
import type { User } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

type Target = { collection: string; id: number | string; title: string; site?: string | null }

const nb = SITE_CONFIG.admin.language === 'nb'
const link = (t: Target) => `${getServerSideURL()}/admin/collections/${t.collection}/${t.id}`

async function send(payload: Payload, to: string, subject: string, body: string): Promise<boolean> {
  try {
    await payload.sendEmail({ to, subject, text: body })
    return true
  } catch (err) {
    payload.logger.error({ err, msg: `Godkjenning: kunne ikke sende e-post til ${to}` })
    return false
  }
}

/** Reviewers of the document's site. With none set up, publishers and admins of the site are asked instead. */
export async function reviewersFor(payload: Payload, site: string | null | undefined): Promise<User[]> {
  const { docs } = await payload.find({ collection: 'users', depth: 0, pagination: false, overrideAccess: true })
  const members = docs.filter((u) => belongsToSite(u, site, SINGLE_SITE))
  const reviewers = members.filter((u) => u.role === 'reviewer')
  return reviewers.length ? reviewers : members.filter((u) => rolesThatReview(u.role))
}

/** «Send til godkjenning»: tells the reviewers. Returns the number of e-mails sent. */
export async function emailReviewers(payload: Payload, t: Target, by: User): Promise<{ sent: number; asked: User[] }> {
  const asked = (await reviewersFor(payload, t.site)).filter((u) => u.id !== by.id)
  const who = by.name || by.email
  const subject = nb ? `Til godkjenning: ${t.title}` : `For approval: ${t.title}`
  const body = nb
    ? `${who} ber om godkjenning av «${t.title}».\n\nÅpne i redigering: ${link(t)}`
    : `${who} asks for approval of “${t.title}”.\n\nOpen in the editor: ${link(t)}`
  let sent = 0
  for (const u of asked) if (await send(payload, u.email, subject, body)) sent += 1
  return { sent, asked }
}

/** «Godkjenn» and «Be om endringer»: tells the person who sent the document for approval. */
export async function emailRequester(payload: Payload, t: Target, requester: number | string | null | undefined, approved: boolean, by: User, note?: string): Promise<boolean> {
  if (requester == null || requester === by.id) return false
  const person = await payload.findByID({ collection: 'users', id: requester, depth: 0, overrideAccess: true }).catch(() => null)
  if (!person) return false
  const who = by.name || by.email
  const subject = approved ? (nb ? `Godkjent: ${t.title}` : `Approved: ${t.title}`) : nb ? `Endringer ønskes: ${t.title}` : `Changes requested: ${t.title}`
  const head = approved
    ? nb ? `${who} har godkjent «${t.title}». En utgiver kan nå publisere den.` : `${who} approved “${t.title}”. A publisher can now publish it.`
    : nb ? `${who} ber om endringer i «${t.title}».` : `${who} asks for changes to “${t.title}”.`
  const body = `${head}${note ? `\n\n${note}` : ''}\n\n${nb ? 'Åpne i redigering' : 'Open in the editor'}: ${link(t)}`
  return send(payload, person.email, subject, body)
}
