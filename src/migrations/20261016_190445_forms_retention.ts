import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_forms_retention" AS ENUM('default', 'days', 'keep');
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'prune-form-submissions' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'prune-form-submissions' BEFORE 'schedulePublish';
  CREATE TABLE "payload_jobs_stats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"stats" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "forms" ADD COLUMN "retention" "enum_forms_retention" DEFAULT 'default' NOT NULL;
  ALTER TABLE "forms" ADD COLUMN "retention_days" numeric;
  ALTER TABLE "payload_jobs" ADD COLUMN "meta" jsonb;`)
  // Skjemaer som finnes fra før, beholder alle innsendinger til eieren endrer det (Bjørns beslutning);
  // nye skjemaer får nettstedets standard fra kolonnens default.
  await db.execute(sql`UPDATE "forms" SET "retention" = 'keep';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload_jobs_stats" CASCADE;
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  ALTER TABLE "forms" DROP COLUMN "retention";
  ALTER TABLE "forms" DROP COLUMN "retention_days";
  ALTER TABLE "payload_jobs" DROP COLUMN "meta";
  DROP TYPE "public"."enum_forms_retention";`)
}
