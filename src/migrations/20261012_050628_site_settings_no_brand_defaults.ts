import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "legal_name" DROP DEFAULT;
  ALTER TABLE "site_settings" ALTER COLUMN "address_country" DROP DEFAULT;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "legal_name" SET DEFAULT 'Nordlys Demo AS';
  ALTER TABLE "site_settings" ALTER COLUMN "address_country" SET DEFAULT 'NO';`)
}
