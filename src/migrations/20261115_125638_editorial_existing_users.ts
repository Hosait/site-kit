import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Until now every «editor» could publish. From now on an editor saves drafts only, so existing
// editors become publishers and keep exactly what they could do. This is a separate migration
// because Postgres cannot use an enum value in the transaction that adds it (the previous one).
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`UPDATE "users" SET "role" = 'publisher' WHERE "role" = 'editor';`)
}

// The old enum has no «publisher» or «reviewer», so both go back to «editor» (which could publish).
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`UPDATE "users" SET "role" = 'editor' WHERE "role" IN ('publisher', 'reviewer');`)
}
