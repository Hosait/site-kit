import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_workflow" AS ENUM('draft', 'in-review', 'approved', 'changes-requested');
  CREATE TYPE "public"."enum__pages_v_version_workflow" AS ENUM('draft', 'in-review', 'approved', 'changes-requested');
  CREATE TYPE "public"."enum_articles_workflow" AS ENUM('draft', 'in-review', 'approved', 'changes-requested');
  CREATE TYPE "public"."enum__articles_v_version_workflow" AS ENUM('draft', 'in-review', 'approved', 'changes-requested');
  CREATE TYPE "public"."enum_comments_site" AS ENUM('main');
  CREATE TYPE "public"."enum_content_audit_log_operation" AS ENUM('create', 'update', 'publish', 'unpublish', 'delete');
  ALTER TYPE "public"."enum_users_role" ADD VALUE 'publisher' BEFORE 'editor';
  ALTER TYPE "public"."enum_users_role" ADD VALUE 'reviewer';
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'prune-audit-log' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'prune-audit-log' BEFORE 'schedulePublish';
  CREATE TABLE "comments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"block_id" varchar,
  	"author_id" integer,
  	"text" varchar NOT NULL,
  	"parent_id" integer,
  	"resolved" boolean DEFAULT false,
  	"site" "enum_comments_site",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "comments_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"articles_id" integer
  );
  
  CREATE TABLE "content_audit_log" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer,
  	"actor" varchar,
  	"operation" "enum_content_audit_log_operation" NOT NULL,
  	"collection" varchar NOT NULL,
  	"doc_id" varchar NOT NULL,
  	"doc_title" varchar,
  	"site" varchar,
  	"changed_fields" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "pages" ADD COLUMN "workflow" "enum_pages_workflow" DEFAULT 'draft';
  ALTER TABLE "pages" ADD COLUMN "submitted_by_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_workflow" "enum__pages_v_version_workflow" DEFAULT 'draft';
  ALTER TABLE "_pages_v" ADD COLUMN "version_submitted_by_id" integer;
  ALTER TABLE "articles" ADD COLUMN "workflow" "enum_articles_workflow" DEFAULT 'draft';
  ALTER TABLE "articles" ADD COLUMN "submitted_by_id" integer;
  ALTER TABLE "_articles_v" ADD COLUMN "version_workflow" "enum__articles_v_version_workflow" DEFAULT 'draft';
  ALTER TABLE "_articles_v" ADD COLUMN "version_submitted_by_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "comments_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "content_audit_log_id" integer;
  ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "comments_rels" ADD CONSTRAINT "comments_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "comments_rels" ADD CONSTRAINT "comments_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "comments_rels" ADD CONSTRAINT "comments_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_audit_log" ADD CONSTRAINT "content_audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "comments_block_id_idx" ON "comments" USING btree ("block_id");
  CREATE INDEX "comments_author_idx" ON "comments" USING btree ("author_id");
  CREATE INDEX "comments_parent_idx" ON "comments" USING btree ("parent_id");
  CREATE INDEX "comments_site_idx" ON "comments" USING btree ("site");
  CREATE INDEX "comments_updated_at_idx" ON "comments" USING btree ("updated_at");
  CREATE INDEX "comments_created_at_idx" ON "comments" USING btree ("created_at");
  CREATE INDEX "comments_rels_order_idx" ON "comments_rels" USING btree ("order");
  CREATE INDEX "comments_rels_parent_idx" ON "comments_rels" USING btree ("parent_id");
  CREATE INDEX "comments_rels_path_idx" ON "comments_rels" USING btree ("path");
  CREATE INDEX "comments_rels_pages_id_idx" ON "comments_rels" USING btree ("pages_id");
  CREATE INDEX "comments_rels_articles_id_idx" ON "comments_rels" USING btree ("articles_id");
  CREATE INDEX "content_audit_log_user_idx" ON "content_audit_log" USING btree ("user_id");
  CREATE INDEX "content_audit_log_actor_idx" ON "content_audit_log" USING btree ("actor");
  CREATE INDEX "content_audit_log_operation_idx" ON "content_audit_log" USING btree ("operation");
  CREATE INDEX "content_audit_log_collection_idx" ON "content_audit_log" USING btree ("collection");
  CREATE INDEX "content_audit_log_doc_id_idx" ON "content_audit_log" USING btree ("doc_id");
  CREATE INDEX "content_audit_log_updated_at_idx" ON "content_audit_log" USING btree ("updated_at");
  CREATE INDEX "content_audit_log_created_at_idx" ON "content_audit_log" USING btree ("created_at");
  ALTER TABLE "pages" ADD CONSTRAINT "pages_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_comments_fk" FOREIGN KEY ("comments_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_content_audit_log_fk" FOREIGN KEY ("content_audit_log_id") REFERENCES "public"."content_audit_log"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_workflow_idx" ON "pages" USING btree ("workflow");
  CREATE INDEX "pages_submitted_by_idx" ON "pages" USING btree ("submitted_by_id");
  CREATE INDEX "_pages_v_version_version_workflow_idx" ON "_pages_v" USING btree ("version_workflow");
  CREATE INDEX "_pages_v_version_version_submitted_by_idx" ON "_pages_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "articles_workflow_idx" ON "articles" USING btree ("workflow");
  CREATE INDEX "articles_submitted_by_idx" ON "articles" USING btree ("submitted_by_id");
  CREATE INDEX "_articles_v_version_version_workflow_idx" ON "_articles_v" USING btree ("version_workflow");
  CREATE INDEX "_articles_v_version_version_submitted_by_idx" ON "_articles_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "payload_locked_documents_rels_comments_id_idx" ON "payload_locked_documents_rels" USING btree ("comments_id");
  CREATE INDEX "payload_locked_documents_rels_content_audit_log_id_idx" ON "payload_locked_documents_rels" USING btree ("content_audit_log_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "comments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "comments_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "content_audit_log" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "comments" CASCADE;
  DROP TABLE "comments_rels" CASCADE;
  DROP TABLE "content_audit_log" CASCADE;
  ALTER TABLE "pages" DROP CONSTRAINT "pages_submitted_by_id_users_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_submitted_by_id_users_id_fk";
  
  ALTER TABLE "articles" DROP CONSTRAINT "articles_submitted_by_id_users_id_fk";
  
  ALTER TABLE "_articles_v" DROP CONSTRAINT "_articles_v_version_submitted_by_id_users_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_comments_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_content_audit_log_fk";
  
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'editor'::text;
  DROP TYPE "public"."enum_users_role";
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'editor'::"public"."enum_users_role";
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."enum_users_role" USING "role"::"public"."enum_users_role";
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'prune-form-submissions', 'schedulePublish');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'prune-form-submissions', 'schedulePublish');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "pages_workflow_idx";
  DROP INDEX "pages_submitted_by_idx";
  DROP INDEX "_pages_v_version_version_workflow_idx";
  DROP INDEX "_pages_v_version_version_submitted_by_idx";
  DROP INDEX "articles_workflow_idx";
  DROP INDEX "articles_submitted_by_idx";
  DROP INDEX "_articles_v_version_version_workflow_idx";
  DROP INDEX "_articles_v_version_version_submitted_by_idx";
  DROP INDEX "payload_locked_documents_rels_comments_id_idx";
  DROP INDEX "payload_locked_documents_rels_content_audit_log_id_idx";
  ALTER TABLE "pages" DROP COLUMN "workflow";
  ALTER TABLE "pages" DROP COLUMN "submitted_by_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_workflow";
  ALTER TABLE "_pages_v" DROP COLUMN "version_submitted_by_id";
  ALTER TABLE "articles" DROP COLUMN "workflow";
  ALTER TABLE "articles" DROP COLUMN "submitted_by_id";
  ALTER TABLE "_articles_v" DROP COLUMN "version_workflow";
  ALTER TABLE "_articles_v" DROP COLUMN "version_submitted_by_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "comments_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "content_audit_log_id";
  DROP TYPE "public"."enum_pages_workflow";
  DROP TYPE "public"."enum__pages_v_version_workflow";
  DROP TYPE "public"."enum_articles_workflow";
  DROP TYPE "public"."enum__articles_v_version_workflow";
  DROP TYPE "public"."enum_comments_site";
  DROP TYPE "public"."enum_content_audit_log_operation";`)
}
