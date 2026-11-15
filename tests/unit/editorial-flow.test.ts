/* eslint-disable @typescript-eslint/no-explicit-any -- Payload's local API and REST replies are untyped here */
/**
 * Roles, publishing, approval, comments and the audit log against a real Payload and database
 * (DATABASE_URL, migrated or empty: the schema is pushed when it is empty). The test makes its
 * own users and documents, named wf-test-…, and removes them. Skipped without DATABASE_URL.
 * Payload keeps the database connections open, so `pnpm test:unit` runs with --test-force-exit.
 */
import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'

import { getPayload, handleEndpoints, type Payload, type Where } from 'payload'

import config from '../../src/payload.config'
import { pruneAuditLog } from '../../src/jobs/pruneAuditLog'
import { DEFAULT_LOCALE, DEFAULT_SITE } from '../../src/lib/sites'

const skip = !process.env.DATABASE_URL || !process.env.PAYLOAD_SECRET ? 'needs DATABASE_URL and PAYLOAD_SECRET' : false
const stamp = Date.now().toString(36)
const PASSWORD = 'wf-test-password-123'
const ROLES = ['admin', 'publisher', 'editor', 'reviewer'] as const

let payload: Payload
const users: Record<string, any> = {}
const tokens: Record<string, string> = {}
const mails: { to: string; subject: string; text: string }[] = []
const pageIds: number[] = []

const as = (role: string) => ({ ...users[role], collection: 'users' })
const email = (role: string) => `wf-test-${stamp}-${role}@example.test`
const slug = (n: string) => `wf-test-${stamp}-${n}`

/** A REST request as the given role, through Payload's own request handler. */
async function rest(role: string, method: string, path: string, body?: unknown) {
  // The admin always sends the locale; without it Payload has none for the request.
  const url = `/api${path}${path.includes('?') ? '&' : '?'}locale=${DEFAULT_LOCALE}`
  const res = await handleEndpoints({
    config,
    request: new Request(`http://localhost${url}`, {
      method,
      headers: { Authorization: `JWT ${tokens[role]}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  })
  return { status: res.status, body: (await res.json().catch(() => ({}))) as any }
}

const newPage = async (name: string, status: 'draft' | 'published' = 'published') => {
  const page = await payload.create({ collection: 'pages', data: { title: slug(name), slug: slug(name), site: DEFAULT_SITE, _status: status } as never, draft: status === 'draft', overrideAccess: true })
  pageIds.push(page.id)
  return page
}
const live = async (id: number) => payload.findByID({ collection: 'pages', id, draft: false, depth: 0, overrideAccess: true })
const latest = async (id: number) => payload.findByID({ collection: 'pages', id, draft: true, depth: 0, overrideAccess: true })
const auditRows = async (where: Where) => (await payload.find({ collection: 'content-audit-log', where, sort: 'createdAt', limit: 100, depth: 0, overrideAccess: true })).docs as any[]
const refused = async (promise: Promise<unknown>) => {
  await assert.rejects(promise, (e: any) => /not allowed|ikke|Forbidden/i.test(String(e?.message)) || e?.status === 403)
}

before(async () => {
  if (skip) return
  payload = await getPayload({ config })
  payload.sendEmail = (async (m: any) => void mails.push(m)) as never
  // The admin goes first: in an empty database the first user is made admin whatever the role says.
  for (const role of ROLES) {
    users[role] = await payload.create({ collection: 'users', data: { email: email(role), password: PASSWORD, name: `WF ${role}`, role } as never, overrideAccess: true })
    tokens[role] = (await payload.login({ collection: 'users', data: { email: email(role), password: PASSWORD } })).token as string
  }
}, { timeout: 120_000 })

after(async () => {
  if (skip || !payload) return
  const ids = Object.values(users).map((u) => u.id)
  await payload.delete({ collection: 'comments', where: { author: { in: ids } } }).catch(() => null)
  for (const id of pageIds) await payload.delete({ collection: 'pages', id }).catch(() => null)
  // Pages made through REST are not in pageIds.
  await payload.delete({ collection: 'pages', where: { title: { like: `wf-test-${stamp}` } } }).catch(() => null)
  await payload.delete({ collection: 'globalSections', where: { title: { like: `wf-test-${stamp}` } } }).catch(() => null)
  await payload.delete({ collection: 'content-audit-log', where: { or: [{ actor: { like: `wf-test-${stamp}` } }, { docTitle: { like: `wf-test-${stamp}` } }] } }).catch(() => null)
  await payload.delete({ collection: 'users', where: { id: { in: ids } } }).catch(() => null)
}, { timeout: 120_000 })

test('an editor creates a draft, and publishing through the local API is refused', { skip }, async () => {
  const draft = await payload.create({ collection: 'pages', data: { title: slug('a'), slug: slug('a'), site: DEFAULT_SITE } as never, draft: true, user: as('editor'), overrideAccess: false })
  pageIds.push(draft.id)
  assert.equal(draft._status, 'draft')
  assert.equal(draft.workflow, 'draft')
  await refused(payload.create({ collection: 'pages', data: { title: slug('b'), slug: slug('b'), site: DEFAULT_SITE, _status: 'published' } as never, user: as('editor'), overrideAccess: false }))
  await refused(payload.update({ collection: 'pages', id: draft.id, data: { _status: 'published' } as never, user: as('editor'), overrideAccess: false }))
  assert.equal((await latest(draft.id))._status, 'draft')
})

test('an editor cannot change what is live: no status, restore and REST all refused, drafts allowed', { skip }, async () => {
  const page = await newPage('live')
  // A save that does not say «draft» on a published page would publish the new text.
  await refused(payload.update({ collection: 'pages', id: page.id, data: { summary: 'sneaky' }, user: as('editor'), overrideAccess: false }))
  assert.notEqual((await live(page.id)).summary, 'sneaky')
  assert.equal((await rest('editor', 'PATCH', `/pages/${page.id}`, { summary: 'sneaky rest' })).status, 403)
  assert.notEqual((await live(page.id)).summary, 'sneaky rest')

  const draft = await payload.update({ collection: 'pages', id: page.id, data: { summary: 'draft text' }, draft: true, user: as('editor'), overrideAccess: false })
  assert.equal(draft._status, 'draft')
  assert.notEqual((await live(page.id)).summary, 'draft text', 'a draft save leaves the live page alone')

  const published = (await payload.findVersions({ collection: 'pages', where: { parent: { equals: page.id }, 'version._status': { equals: 'published' } }, limit: 1, depth: 0 })).docs[0]
  await refused(payload.restoreVersion({ collection: 'pages', id: published.id, user: as('editor'), overrideAccess: false }))

  assert.equal((await rest('editor', 'PATCH', `/pages/${page.id}`, { _status: 'published' })).status, 403)
  // With a draft pending, a save that is not a draft save would write «draft» over the live page and take it off the site.
  assert.equal((await rest('editor', 'PATCH', `/pages/${page.id}`, { summary: 'sneaky rest' })).status, 403)
  assert.equal((await rest('editor', 'PATCH', `/pages/${page.id}`, { _status: 'draft' })).status, 403, 'Avpubliser')
  assert.equal((await live(page.id))._status, 'published')
  assert.equal((await rest('publisher', 'PATCH', `/pages/${page.id}`, { _status: 'draft' })).status, 200, 'a publisher may unpublish')
  assert.equal((await rest('publisher', 'PATCH', `/pages/${page.id}`, { _status: 'published' })).status, 200)
  assert.equal((await rest('editor', 'PATCH', `/pages/${page.id}?draft=true`, { summary: 'rest draft', _status: 'draft' })).status, 200)
  assert.equal((await rest('editor', 'POST', `/pages?draft=true`, { title: slug('rest-new'), slug: slug('rest-new'), site: DEFAULT_SITE })).status, 201)
  assert.equal((await rest('editor', 'POST', `/pages`, { title: slug('rest-pub'), slug: slug('rest-pub'), site: DEFAULT_SITE, _status: 'published' })).status, 403)
})

test('a publisher and an admin publish, through the local API and REST', { skip }, async () => {
  const page = await newPage('p', 'draft')
  const viaApi = await payload.update({ collection: 'pages', id: page.id, data: { _status: 'published' } as never, user: as('publisher'), overrideAccess: false })
  assert.equal(viaApi._status, 'published')
  const second = await newPage('p2', 'draft')
  const viaRest = await rest('publisher', 'PATCH', `/pages/${second.id}`, { _status: 'published' })
  assert.equal(viaRest.status, 200)
  assert.equal((await live(second.id))._status, 'published')
  const third = await newPage('p3', 'draft')
  assert.equal((await rest('admin', 'PATCH', `/pages/${third.id}`, { _status: 'published' })).status, 200)
})

test('shared sections have drafts too: an editor saves drafts, only a publisher publishes', { skip }, async () => {
  const made = await rest('editor', 'POST', '/globalSections?draft=true', { title: slug('shared'), site: DEFAULT_SITE })
  assert.equal(made.status, 201)
  const id = made.body.doc.id
  try {
    assert.equal((await rest('editor', 'PATCH', `/globalSections/${id}`, { _status: 'published' })).status, 403)
    assert.equal((await rest('reviewer', 'PATCH', `/globalSections/${id}?draft=true`, { title: slug('shared3'), _status: 'draft' })).status, 403)
    assert.equal((await rest('publisher', 'PATCH', `/globalSections/${id}`, { _status: 'published' })).status, 200)
    assert.equal((await rest('editor', 'PATCH', `/globalSections/${id}`, { title: slug('shared2') })).status, 403, 'a save that is not a draft save would change the live section')
    assert.equal((await rest('editor', 'PATCH', `/globalSections/${id}?draft=true`, { title: slug('shared2'), _status: 'draft' })).status, 200)
    assert.equal((await rest('editor', 'DELETE', `/globalSections/${id}`)).status, 403, 'published, so not the editor\'s to delete')
  } finally {
    await payload.delete({ collection: 'globalSections', id }).catch(() => null)
  }
})

test('a reviewer reads but cannot create, change or delete content', { skip }, async () => {
  const page = await newPage('r')
  assert.equal((await rest('reviewer', 'GET', `/pages/${page.id}?draft=true`)).status, 200)
  assert.equal((await rest('reviewer', 'POST', `/pages?draft=true`, { title: slug('r2'), slug: slug('r2'), site: DEFAULT_SITE })).status, 403)
  assert.equal((await rest('reviewer', 'PATCH', `/pages/${page.id}?draft=true`, { summary: 'x', _status: 'draft' })).status, 403)
  assert.equal((await rest('reviewer', 'DELETE', `/pages/${page.id}`)).status, 403)
})

test('an editor deletes only what was never published', { skip }, async () => {
  const draft = await newPage('d', 'draft')
  const published = await newPage('e')
  assert.equal((await rest('editor', 'DELETE', `/pages/${published.id}`)).status, 403)
  assert.equal((await live(published.id))._status, 'published')
  assert.equal((await rest('editor', 'DELETE', `/pages/${draft.id}`)).status, 200)
  assert.equal((await rest('publisher', 'DELETE', `/pages/${published.id}`)).status, 200)
})

test('approval: submit, approve, edit sends it back, and a publisher publishes the approved page', { skip }, async () => {
  const page = await newPage('w', 'draft')
  mails.length = 0
  const field = await rest('editor', 'PATCH', `/pages/${page.id}?draft=true`, { workflow: 'approved', _status: 'draft' })
  assert.equal((await latest(page.id)).workflow, 'draft', 'the field cannot be set by a save, only by the actions')
  assert.ok(field.status === 200 || field.status === 400)

  assert.equal((await rest('editor', 'POST', `/pages/${page.id}/workflow`, { action: 'approve' })).status, 403, 'an editor cannot approve')
  assert.equal((await rest('reviewer', 'POST', `/pages/${page.id}/workflow`, { action: 'approve' })).status, 409, 'a reviewer cannot approve what is not in review')
  const submit = await rest('editor', 'POST', `/pages/${page.id}/workflow`, { action: 'submit' })
  assert.equal(submit.status, 200)
  assert.equal(submit.body.workflow, 'in-review')
  assert.equal((await latest(page.id)).workflow, 'in-review')
  assert.ok(mails.some((m) => m.to === email('reviewer')), 'the reviewer is told')
  assert.ok(mails.every((m) => m.to !== email('editor')), 'the one who asks is not told')
  assert.match(mails[0].subject, /Til godkjenning|For approval/)
  assert.equal((await rest('editor', 'POST', `/pages/${page.id}/workflow`, { action: 'submit' })).status, 409, 'already in review')

  const approve = await rest('reviewer', 'POST', `/pages/${page.id}/workflow`, { action: 'approve', message: 'Ser bra ut' })
  assert.equal(approve.status, 200)
  assert.equal((await latest(page.id)).workflow, 'approved')
  assert.equal(mails.at(-1)?.to, email('editor'), 'the editor who asked is told')
  const comments = (await payload.find({ collection: 'comments', where: { doc: { equals: { relationTo: 'pages', value: page.id } } }, depth: 0 })).docs
  assert.deepEqual(comments.map((c) => c.text), ['Ser bra ut'])

  assert.equal((await rest('editor', 'PATCH', `/pages/${page.id}`, { _status: 'published' })).status, 403, 'approved is not the editor\'s to publish')
  await rest('editor', 'PATCH', `/pages/${page.id}?draft=true`, { summary: 'changed after approval', _status: 'draft' })
  assert.equal((await latest(page.id)).workflow, 'draft', 'editing withdraws the approval')

  await rest('editor', 'POST', `/pages/${page.id}/workflow`, { action: 'submit' })
  await rest('reviewer', 'POST', `/pages/${page.id}/workflow`, { action: 'approve' })
  const published = await rest('publisher', 'PATCH', `/pages/${page.id}`, { _status: 'published' })
  assert.equal(published.status, 200)
  const after = await live(page.id)
  assert.equal(after._status, 'published')
  assert.equal(after.workflow, 'approved', 'publishing keeps the approval it acted on')
  assert.equal(after.slug, slug('w'), 'the actions leave the address alone')

  const changes = await newPage('w2', 'draft')
  await rest('editor', 'POST', `/pages/${changes.id}/workflow`, { action: 'submit' })
  assert.equal((await rest('reviewer', 'POST', `/pages/${changes.id}/workflow`, { action: 'request-changes', message: 'Mer om priser' })).status, 200)
  assert.equal((await latest(changes.id)).workflow, 'changes-requested')
  assert.match(mails.at(-1)?.text ?? '', /Mer om priser/)
})

test('comments: author and site come from the server, one level of replies, only the author rewords', { skip }, async () => {
  const page = await newPage('c')
  const doc = { relationTo: 'pages', value: page.id }
  const first = await rest('reviewer', 'POST', '/comments', { doc, text: 'Hva med bildet?', blockId: 'abc', author: users.admin.id })
  assert.equal(first.status, 201)
  assert.equal(first.body.doc.author.id, users.reviewer.id, 'the author cannot be forged')
  assert.equal(first.body.doc.site, DEFAULT_SITE)
  const reply = await rest('editor', 'POST', '/comments', { doc, text: 'Byttet', parent: first.body.doc.id })
  const reply2 = await rest('reviewer', 'POST', '/comments', { doc, text: 'Takk', parent: reply.body.doc.id })
  assert.equal(reply2.body.doc.parent.id ?? reply2.body.doc.parent, first.body.doc.id, 'a reply to a reply stays in the thread')

  const other = await newPage('c2')
  const crossed = await rest('editor', 'POST', '/comments', { doc: { relationTo: 'pages', value: other.id }, text: 'x', parent: first.body.doc.id })
  assert.equal(crossed.status, 400)

  const patched = await rest('editor', 'PATCH', `/comments/${first.body.doc.id}`, { text: 'overwritten', resolved: true })
  assert.equal(patched.status, 200, JSON.stringify(patched.body).slice(0, 300))
  const after = (await payload.findByID({ collection: 'comments', id: first.body.doc.id, depth: 0 })) as any
  assert.equal(after.text, 'Hva med bildet?', 'someone else cannot reword')
  assert.equal(after.resolved, true, 'anyone resolves')
  assert.equal((await rest('editor', 'DELETE', `/comments/${first.body.doc.id}`)).status, 403, 'only the author deletes')
  assert.equal((await rest('reviewer', 'DELETE', `/comments/${reply2.body.doc.id}`)).status, 200)

  await payload.delete({ collection: 'pages', id: page.id })
  const left = await payload.count({ collection: 'comments', where: { doc: { equals: { relationTo: 'pages', value: page.id } } } })
  assert.equal(left.totalDocs, 0, 'comments go with their page')
})

test('the audit log: rows for create, change, publish and delete with field names, no values; autosave is not logged', { skip }, async () => {
  const title = slug('audit')
  const page = await payload.create({ collection: 'pages', data: { title, slug: title, site: DEFAULT_SITE, summary: 'SECRET-SUMMARY-VALUE' } as never, draft: true, user: as('editor'), overrideAccess: false })
  pageIds.push(page.id)
  await payload.update({ collection: 'pages', id: page.id, data: { summary: 'SECRET-CHANGED-VALUE' }, draft: true, user: as('editor'), overrideAccess: false })
  assert.equal((await rest('editor', 'PATCH', `/pages/${page.id}?draft=true&autosave=true`, { summary: 'typing…', _status: 'draft' })).status, 200)
  await payload.update({ collection: 'pages', id: page.id, data: { _status: 'published' } as never, user: as('publisher'), overrideAccess: false })
  await payload.delete({ collection: 'pages', id: page.id, user: as('publisher'), overrideAccess: false })

  const rows = await auditRows({ and: [{ collection: { equals: 'pages' } }, { docId: { equals: String(page.id) } }] })
  assert.deepEqual(rows.map((r) => r.operation), ['create', 'update', 'publish', 'delete'], JSON.stringify(rows.map((r) => [r.operation, r.changedFields])))
  assert.deepEqual(rows.map((r) => r.actor), [email('editor'), email('editor'), email('publisher'), email('publisher')])
  assert.equal(rows[0].docTitle, title)
  assert.ok(rows[0].changedFields.includes('summary') && rows[0].changedFields.includes('title'))
  assert.deepEqual(rows[1].changedFields, ['summary'])
  assert.ok(rows[2].changedFields.includes('_status'))
  assert.ok(rows.every((r) => !JSON.stringify(r).includes('SECRET')), 'no values are stored')
  assert.ok(rows.every((r) => r.createdAt), 'when')
})

test('the audit log tells a draft over a live page from an unpublication', { skip }, async () => {
  const page = await newPage('u')
  await rest('editor', 'POST', `/pages/${page.id}/workflow`, { action: 'submit' })
  await rest('publisher', 'PATCH', `/pages/${page.id}`, { _status: 'draft' })
  const rows = await auditRows({ and: [{ collection: { equals: 'pages' } }, { docId: { equals: String(page.id) } }] })
  assert.deepEqual(rows.map((r) => r.operation), ['publish', 'update', 'unpublish'], JSON.stringify(rows.map((r) => [r.operation, r.changedFields])))
})

test('the audit log cannot be added to, edited or deleted from, by anyone', { skip }, async () => {
  const row = (await payload.create({ collection: 'content-audit-log', data: { operation: 'update', collection: 'pages', docId: 'x', actor: email('admin') + '-fixed' } as never })) as any
  for (const role of ROLES) {
    await refused(payload.update({ collection: 'content-audit-log', id: row.id, data: { docTitle: 'rewritten' }, user: as(role), overrideAccess: false }))
    await refused(payload.delete({ collection: 'content-audit-log', id: row.id, user: as(role), overrideAccess: false }))
    await refused(payload.create({ collection: 'content-audit-log', data: { operation: 'update', collection: 'pages', docId: 'y' } as never, user: as(role), overrideAccess: false }))
    assert.equal((await rest(role, 'PATCH', `/content-audit-log/${row.id}`, { docTitle: 'rewritten' })).status, 403)
    assert.equal((await rest(role, 'DELETE', `/content-audit-log/${row.id}`)).status, 403)
  }
  assert.equal((await rest('admin', 'GET', `/content-audit-log/${row.id}`)).status, 200, 'admins read')
  assert.equal((await rest('editor', 'GET', `/content-audit-log/${row.id}`)).status, 403, 'others do not')
  assert.equal(((await payload.findByID({ collection: 'content-audit-log', id: row.id, depth: 0 })) as any).docTitle ?? null, null)
})

test('the retention job is the one thing that deletes audit rows, and only old ones', { skip }, async () => {
  const old = (await payload.create({ collection: 'content-audit-log', data: { operation: 'update', collection: 'pages', docId: 'old', actor: `wf-test-${stamp}-old`, createdAt: new Date(Date.now() - 800 * 86_400_000).toISOString() } as never })) as any
  const recent = (await payload.create({ collection: 'content-audit-log', data: { operation: 'update', collection: 'pages', docId: 'recent', actor: `wf-test-${stamp}-recent` } as never })) as any
  assert.ok(new Date(old.createdAt).getTime() < Date.now() - 700 * 86_400_000, 'the test row is backdated')
  const result = await pruneAuditLog(payload)
  assert.ok(result.deleted >= 1)
  assert.equal((await auditRows({ id: { equals: old.id } })).length, 0)
  assert.equal((await auditRows({ id: { equals: recent.id } })).length, 1)
})
