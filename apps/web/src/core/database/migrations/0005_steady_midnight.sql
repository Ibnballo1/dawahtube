ALTER TABLE "lectures" ADD COLUMN "like_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "like_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "like_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "reminders" ADD COLUMN "like_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "likes_user_entity_uidx" ON "likes" USING btree ("entity_type","entity_id","user_id") WHERE user_id IS NOT NULL;--> statement-breakpoint
CREATE INDEX "likes_session_entity_uidx" ON "likes" USING btree ("entity_type","entity_id","session_id") WHERE user_id IS NULL;