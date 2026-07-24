ALTER TABLE "user" RENAME COLUMN "role_slug" TO "role";--> statement-breakpoint
DROP INDEX "user_role_idx";--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "user" USING btree ("role");