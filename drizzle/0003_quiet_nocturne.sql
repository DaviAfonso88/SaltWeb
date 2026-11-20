CREATE TYPE "public"."visitor_status" AS ENUM('new', 'contacted', 'archived');--> statement-breakpoint
CREATE TABLE "visitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"whatsapp" text NOT NULL,
	"age_group" text NOT NULL,
	"neighborhood" text,
	"how_found" text,
	"invited_by" text,
	"interests" text[] DEFAULT '{}'::text[] NOT NULL,
	"contact_consent" boolean DEFAULT false NOT NULL,
	"status" "visitor_status" DEFAULT 'new' NOT NULL,
	"contacted_at" timestamp with time zone,
	"contacted_by" uuid,
	"contacted_by_label" text,
	"email_sent_at" timestamp with time zone,
	"email_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_contacted_by_users_id_fk" FOREIGN KEY ("contacted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "visitors_status_idx" ON "visitors" USING btree ("status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "visitors_age_group_idx" ON "visitors" USING btree ("age_group","created_at" DESC NULLS LAST);--> statement-breakpoint
-- O papel Administrador não é editável no painel e o db:seed não altera papéis que já existem:
-- as permissões novas de visitantes entram aqui.
UPDATE "roles" SET "permissions" = ARRAY(SELECT DISTINCT unnest("permissions" || ARRAY['visitantes.ver', 'visitantes.gerenciar']::text[])) WHERE "name" = 'Administrador' AND "is_system" = true;
