ALTER TABLE "todos" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "todos" CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");