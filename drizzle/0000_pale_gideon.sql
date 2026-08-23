CREATE TABLE "daily_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"topic" text NOT NULL,
	"summary_academic" text,
	"summary_casual" text,
	"source_papers" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "daily_articles_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "daily_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"article_tokens" integer DEFAULT 0,
	"chat_tokens" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "daily_stats_date_unique" UNIQUE("date")
);
