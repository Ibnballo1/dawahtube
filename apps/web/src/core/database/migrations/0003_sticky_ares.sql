CREATE TABLE "timestamp_bookmarks" (
	"id" text NOT NULL,
	"user_id" text NOT NULL,
	"lecture_id" text NOT NULL,
	"timestamp_secs" integer NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "timestamp_bookmarks_user_id_id_pk" PRIMARY KEY("user_id","id")
);
--> statement-breakpoint
ALTER TABLE "timestamp_bookmarks" ADD CONSTRAINT "timestamp_bookmarks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timestamp_bookmarks" ADD CONSTRAINT "timestamp_bookmarks_lecture_id_lectures_id_fk" FOREIGN KEY ("lecture_id") REFERENCES "public"."lectures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "timestamp_bookmarks_user_lecture_idx" ON "timestamp_bookmarks" USING btree ("user_id","lecture_id");--> statement-breakpoint
CREATE INDEX "listening_history_user_played_idx" ON "listening_history" USING btree ("user_id","played_at");