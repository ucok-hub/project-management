CREATE TABLE "changelogs" (
	"id" text PRIMARY KEY NOT NULL,
	"version" text,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"published_by_id" text NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_hidden" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_seen_changelog_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "changelogs" ADD CONSTRAINT "changelogs_published_by_id_users_id_fk" FOREIGN KEY ("published_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;