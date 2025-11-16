CREATE TYPE "public"."bookmark_status" AS ENUM('pending', 'processed', 'failed');--> statement-breakpoint
CREATE TABLE "bookmark_contents" (
	"bookmark_id" uuid PRIMARY KEY NOT NULL,
	"raw_content" text,
	"content_hash" text,
	"summary_short" text,
	"summary_long" text,
	"language" text,
	"llm_model" text,
	"llm_version" text,
	"meta" jsonb,
	"search_vector" "tsvector",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookmark_tags" (
	"bookmark_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "bookmark_tags_bookmark_id_tag_id_pk" PRIMARY KEY("bookmark_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"url" text NOT NULL,
	"normalized_url" text NOT NULL,
	"title" text,
	"description" text,
	"source_type" text,
	"favicon_url" text,
	"status" "bookmark_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bookmark_contents" ADD CONSTRAINT "bookmark_contents_bookmark_id_bookmarks_id_fk" FOREIGN KEY ("bookmark_id") REFERENCES "public"."bookmarks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmark_tags" ADD CONSTRAINT "bookmark_tags_bookmark_id_bookmarks_id_fk" FOREIGN KEY ("bookmark_id") REFERENCES "public"."bookmarks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmark_tags" ADD CONSTRAINT "bookmark_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_bookmark_tags_bookmark" ON "bookmark_tags" USING btree ("bookmark_id");--> statement-breakpoint
CREATE INDEX "idx_bookmark_tags_tag" ON "bookmark_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_bookmarks_user_url" ON "bookmarks" USING btree ("user_id","normalized_url");--> statement-breakpoint
CREATE INDEX "idx_bookmarks_user_id" ON "bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_bookmarks_status" ON "bookmarks" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_tags_user_name" ON "tags" USING btree ("user_id",lower("name"));--> statement-breakpoint
CREATE INDEX "idx_tags_user_id" ON "tags" USING btree ("user_id");