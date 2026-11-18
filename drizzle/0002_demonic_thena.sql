CREATE TYPE "public"."programacao_kind" AS ENUM('semanal', 'mensal', 'personalizada');--> statement-breakpoint
CREATE TABLE "programacoes" (
	"slug" text PRIMARY KEY NOT NULL,
	"kind" "programacao_kind" NOT NULL,
	"weekday" integer DEFAULT 5 NOT NULL,
	"nth" integer DEFAULT 1 NOT NULL,
	"time" text,
	"custom_day" text,
	"custom_time" text,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
