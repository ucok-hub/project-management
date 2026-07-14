CREATE TABLE "presence" (
	"user_id" text PRIMARY KEY NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'online' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "presence" ADD CONSTRAINT "presence_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;