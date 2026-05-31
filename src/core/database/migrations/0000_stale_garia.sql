CREATE TYPE "public"."audit_action" AS ENUM('create', 'update', 'delete', 'publish', 'unpublish', 'restore', 'login', 'logout', 'permission_change', 'featured_update');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'review', 'scheduled', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."featured_entity_type" AS ENUM('lecture', 'article', 'book', 'scholar', 'reminder');--> statement-breakpoint
CREATE TYPE "public"."language_code" AS ENUM('en', 'ar', 'ha', 'yo', 'fr');--> statement-breakpoint
CREATE TYPE "public"."media_asset_status" AS ENUM('pending', 'uploaded', 'processing', 'ready', 'failed');--> statement-breakpoint
CREATE TYPE "public"."media_asset_type" AS ENUM('audio', 'video', 'image', 'pdf', 'thumbnail', 'avatar', 'cover', 'og_image');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" text NOT NULL,
	"permission" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_pk" PRIMARY KEY("role_id","permission")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" varchar(64) NOT NULL,
	"label" varchar(128) NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role_slug" text DEFAULT 'reader' NOT NULL,
	"deleted_at" timestamp,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" text NOT NULL,
	"role_id" text NOT NULL,
	"assigned_by" varchar(26),
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"uploader_user_id" text,
	"bucket" varchar(32) NOT NULL,
	"key" text NOT NULL,
	"public_url" text,
	"asset_type" "media_asset_type" NOT NULL,
	"status" "media_asset_status" DEFAULT 'pending' NOT NULL,
	"mime_type" varchar(128) NOT NULL,
	"size_bytes" bigint DEFAULT 0 NOT NULL,
	"checksum" varchar(64),
	"original_filename" text NOT NULL,
	"duration_secs" integer,
	"width" integer,
	"height" integer,
	"alt_text" varchar(500),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"attached_entity_type" varchar(50),
	"attached_entity_id" text,
	"download_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"arabic_name" varchar(255),
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"meta_title" varchar(60),
	"meta_description" varchar(160),
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "scholar_translations" (
	"id" text PRIMARY KEY NOT NULL,
	"scholar_id" text NOT NULL,
	"language_code" "language_code" NOT NULL,
	"slug" varchar(255),
	"name" varchar(255),
	"arabic_name" varchar(255),
	"biography" text,
	"meta_title" varchar(60),
	"meta_description" varchar(160),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scholars" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"canonical_slug" varchar(255),
	"name" varchar(255) NOT NULL,
	"arabic_name" varchar(255),
	"honorifics" varchar(128),
	"nationality" varchar(64),
	"location" varchar(128),
	"biography" text,
	"known_for" varchar(255),
	"avatar_asset_id" text,
	"banner_asset_id" text,
	"social_links" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"website_url" text,
	"twitter_handle" varchar(64),
	"user_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"featured_order" integer,
	"default_language" varchar(10) DEFAULT 'en' NOT NULL,
	"meta_title" varchar(60),
	"meta_description" varchar(160),
	"search_vector" "tsvector",
	"lecture_count" integer DEFAULT 0 NOT NULL,
	"article_count" integer DEFAULT 0 NOT NULL,
	"series_count" integer DEFAULT 0 NOT NULL,
	"birth_year" integer,
	"death_year" integer,
	"country_code" varchar(2),
	"scholar_type" varchar(32) DEFAULT 'scholar' NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lecture_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"parent_id" text,
	"icon_name" varchar(50),
	"position" smallint DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lecture_tags" (
	"lecture_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lecture_tags_lecture_id_tag_id_pk" PRIMARY KEY("lecture_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "lecture_translations" (
	"id" text PRIMARY KEY NOT NULL,
	"lecture_id" text NOT NULL,
	"language_code" "language_code" NOT NULL,
	"title" varchar(255),
	"description" text,
	"transcript" text,
	"meta_title" varchar(60),
	"meta_description" varchar(160),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lectures" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"canonical_slug" varchar(255),
	"title" varchar(255) NOT NULL,
	"description" text,
	"transcript" text,
	"featured_order" smallint,
	"speaker_name" varchar(255),
	"search_keywords" text,
	"scholar_id" text,
	"category_id" text,
	"audio_asset_id" text,
	"video_asset_id" text,
	"thumbnail_asset_id" text,
	"duration_secs" integer,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"scheduled_at" timestamp with time zone,
	"is_featured" boolean DEFAULT false NOT NULL,
	"allow_download" boolean DEFAULT true NOT NULL,
	"default_language" varchar(10) DEFAULT 'en' NOT NULL,
	"meta_title" varchar(60),
	"meta_description" varchar(160),
	"search_vector" "tsvector",
	"lecture_type" varchar(32) DEFAULT 'lecture' NOT NULL,
	"original_language" varchar(10) DEFAULT 'en' NOT NULL,
	"transcript_status" varchar(32) DEFAULT 'none' NOT NULL,
	"download_count" bigint DEFAULT 0 NOT NULL,
	"view_count" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "series" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"canonical_slug" varchar(255),
	"title" varchar(255) NOT NULL,
	"description" text,
	"scholar_id" text,
	"featured_order" smallint,
	"cover_asset_id" text,
	"cover_alt_text" varchar(500),
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"scheduled_at" timestamp with time zone,
	"is_featured" boolean DEFAULT false NOT NULL,
	"default_language" varchar(10) DEFAULT 'en' NOT NULL,
	"meta_title" varchar(60),
	"meta_description" varchar(160),
	"item_count" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "series_items" (
	"id" text PRIMARY KEY NOT NULL,
	"series_id" text NOT NULL,
	"lecture_id" text NOT NULL,
	"position" smallint DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "series_tags" (
	"series_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "series_tags_series_id_tag_id_pk" PRIMARY KEY("series_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "article_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"parent_id" varchar(26),
	"position" smallint DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_tags" (
	"article_id" varchar(26) NOT NULL,
	"tag_id" varchar(26) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "article_tags_article_id_tag_id_pk" PRIMARY KEY("article_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "article_translations" (
	"id" text PRIMARY KEY NOT NULL,
	"article_id" varchar(26) NOT NULL,
	"language_code" "language_code" NOT NULL,
	"title" varchar(255),
	"excerpt" text,
	"content" text,
	"meta_title" varchar(60),
	"meta_description" varchar(160),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"canonical_slug" varchar(255),
	"title" varchar(255) NOT NULL,
	"excerpt" text,
	"content" text,
	"scholar_id" varchar(26),
	"category_id" varchar(26),
	"author_id" varchar(26),
	"cover_asset_id" varchar(26),
	"reading_time_mins" smallint DEFAULT 1 NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"scheduled_at" timestamp with time zone,
	"is_featured" boolean DEFAULT false NOT NULL,
	"default_language" varchar(10) DEFAULT 'en' NOT NULL,
	"meta_title" varchar(60),
	"meta_description" varchar(160),
	"search_vector" "tsvector",
	"view_count" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "book_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"parent_id" varchar(26),
	"position" smallint DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_tags" (
	"book_id" varchar(26) NOT NULL,
	"tag_id" varchar(26) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "book_tags_book_id_tag_id_pk" PRIMARY KEY("book_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "book_translations" (
	"id" text PRIMARY KEY NOT NULL,
	"book_id" varchar(26) NOT NULL,
	"language_code" "language_code" NOT NULL,
	"title" varchar(255),
	"description" text,
	"meta_title" varchar(60),
	"meta_description" varchar(160),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"canonical_slug" varchar(255),
	"title" varchar(255) NOT NULL,
	"description" text,
	"author_name" varchar(255),
	"translator" varchar(255),
	"publish_year" smallint,
	"category_id" varchar(26),
	"pdf_asset_id" varchar(26),
	"preview_asset_id" varchar(26),
	"cover_asset_id" varchar(26),
	"page_count" integer,
	"language" varchar(10) DEFAULT 'en' NOT NULL,
	"allow_free_download" boolean DEFAULT true NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"scheduled_at" timestamp with time zone,
	"is_featured" boolean DEFAULT false NOT NULL,
	"default_language" varchar(10) DEFAULT 'en' NOT NULL,
	"meta_title" varchar(60),
	"meta_description" varchar(160),
	"search_vector" "tsvector",
	"view_count" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "reminders" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"source" varchar(512),
	"scholar_id" text,
	"image_asset_id" text,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"scheduled_at" timestamp with time zone,
	"default_language" varchar(10) DEFAULT 'en' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "featured_slots" (
	"id" text PRIMARY KEY NOT NULL,
	"slot_key" varchar(64) NOT NULL,
	"position" smallint DEFAULT 0 NOT NULL,
	"entity_type" "featured_entity_type" NOT NULL,
	"entity_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"valid_from" timestamp with time zone DEFAULT now() NOT NULL,
	"valid_until" timestamp with time zone,
	"set_by" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_views" (
	"id" text PRIMARY KEY NOT NULL,
	"article_id" text,
	"session_id" text NOT NULL,
	"user_id" text,
	"referrer" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_downloads" (
	"id" text PRIMARY KEY NOT NULL,
	"book_id" text,
	"user_id" text,
	"session_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_reminder_views" (
	"id" text PRIMARY KEY NOT NULL,
	"reminder_id" text,
	"session_id" text NOT NULL,
	"user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lecture_views" (
	"id" text PRIMARY KEY NOT NULL,
	"lecture_id" text,
	"session_id" text NOT NULL,
	"user_id" text,
	"duration_secs" integer,
	"referrer" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"action" "audit_action" NOT NULL,
	"entity" varchar(64) NOT NULL,
	"entity_id" text NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploader_user_id_user_id_fk" FOREIGN KEY ("uploader_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scholar_translations" ADD CONSTRAINT "scholar_translations_scholar_id_scholars_id_fk" FOREIGN KEY ("scholar_id") REFERENCES "public"."scholars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scholars" ADD CONSTRAINT "scholars_avatar_asset_id_media_assets_id_fk" FOREIGN KEY ("avatar_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scholars" ADD CONSTRAINT "scholars_banner_asset_id_media_assets_id_fk" FOREIGN KEY ("banner_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scholars" ADD CONSTRAINT "scholars_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lecture_categories" ADD CONSTRAINT "lecture_categories_parent_id_lecture_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lecture_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lecture_tags" ADD CONSTRAINT "lecture_tags_lecture_id_lectures_id_fk" FOREIGN KEY ("lecture_id") REFERENCES "public"."lectures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lecture_tags" ADD CONSTRAINT "lecture_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lecture_translations" ADD CONSTRAINT "lecture_translations_lecture_id_lectures_id_fk" FOREIGN KEY ("lecture_id") REFERENCES "public"."lectures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lectures" ADD CONSTRAINT "lectures_scholar_id_scholars_id_fk" FOREIGN KEY ("scholar_id") REFERENCES "public"."scholars"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lectures" ADD CONSTRAINT "lectures_category_id_lecture_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."lecture_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lectures" ADD CONSTRAINT "lectures_audio_asset_id_media_assets_id_fk" FOREIGN KEY ("audio_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lectures" ADD CONSTRAINT "lectures_video_asset_id_media_assets_id_fk" FOREIGN KEY ("video_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lectures" ADD CONSTRAINT "lectures_thumbnail_asset_id_media_assets_id_fk" FOREIGN KEY ("thumbnail_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series" ADD CONSTRAINT "series_scholar_id_scholars_id_fk" FOREIGN KEY ("scholar_id") REFERENCES "public"."scholars"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series" ADD CONSTRAINT "series_cover_asset_id_media_assets_id_fk" FOREIGN KEY ("cover_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_items" ADD CONSTRAINT "series_items_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_items" ADD CONSTRAINT "series_items_lecture_id_lectures_id_fk" FOREIGN KEY ("lecture_id") REFERENCES "public"."lectures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_tags" ADD CONSTRAINT "series_tags_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_tags" ADD CONSTRAINT "series_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_categories" ADD CONSTRAINT "article_categories_parent_id_article_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."article_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_translations" ADD CONSTRAINT "article_translations_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_scholar_id_scholars_id_fk" FOREIGN KEY ("scholar_id") REFERENCES "public"."scholars"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_article_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."article_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_cover_asset_id_media_assets_id_fk" FOREIGN KEY ("cover_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_categories" ADD CONSTRAINT "book_categories_parent_id_book_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."book_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_tags" ADD CONSTRAINT "book_tags_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_tags" ADD CONSTRAINT "book_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_translations" ADD CONSTRAINT "book_translations_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_category_id_book_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."book_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_pdf_asset_id_media_assets_id_fk" FOREIGN KEY ("pdf_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_preview_asset_id_media_assets_id_fk" FOREIGN KEY ("preview_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_cover_asset_id_media_assets_id_fk" FOREIGN KEY ("cover_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_scholar_id_scholars_id_fk" FOREIGN KEY ("scholar_id") REFERENCES "public"."scholars"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_image_asset_id_media_assets_id_fk" FOREIGN KEY ("image_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "featured_slots" ADD CONSTRAINT "featured_slots_set_by_user_id_fk" FOREIGN KEY ("set_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_views" ADD CONSTRAINT "article_views_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_views" ADD CONSTRAINT "article_views_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_downloads" ADD CONSTRAINT "book_downloads_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_downloads" ADD CONSTRAINT "book_downloads_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_reminder_views" ADD CONSTRAINT "daily_reminder_views_reminder_id_reminders_id_fk" FOREIGN KEY ("reminder_id") REFERENCES "public"."reminders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_reminder_views" ADD CONSTRAINT "daily_reminder_views_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lecture_views" ADD CONSTRAINT "lecture_views_lecture_id_lectures_id_fk" FOREIGN KEY ("lecture_id") REFERENCES "public"."lectures"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lecture_views" ADD CONSTRAINT "lecture_views_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "role_permissions_permission_idx" ON "role_permissions" USING btree ("permission");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_slug_uidx" ON "roles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "user" USING btree ("role_slug");--> statement-breakpoint
CREATE INDEX "user_deleted_at_idx" ON "user" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "user_roles_role_id_idx" ON "user_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "media_assets_bucket_key_idx" ON "media_assets" USING btree ("bucket","key");--> statement-breakpoint
CREATE INDEX "media_assets_type_status_idx" ON "media_assets" USING btree ("asset_type","status");--> statement-breakpoint
CREATE INDEX "media_assets_uploader_idx" ON "media_assets" USING btree ("uploader_user_id");--> statement-breakpoint
CREATE INDEX "media_assets_deleted_at_idx" ON "media_assets" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "media_assets_checksum_idx" ON "media_assets" USING btree ("checksum");--> statement-breakpoint
CREATE INDEX "media_assets_status_idx" ON "media_assets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "media_assets_asset_type_idx" ON "media_assets" USING btree ("asset_type");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_slug_uidx" ON "tags" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tags_name_idx" ON "tags" USING btree ("name");--> statement-breakpoint
CREATE INDEX "tags_usage_count_idx" ON "tags" USING btree ("usage_count");--> statement-breakpoint
CREATE INDEX "tags_is_featured_idx" ON "tags" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "tags_deleted_at_idx" ON "tags" USING btree ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "scholar_translations_scholar_lang_uidx" ON "scholar_translations" USING btree ("scholar_id","language_code");--> statement-breakpoint
CREATE INDEX "scholar_translations_scholar_id_idx" ON "scholar_translations" USING btree ("scholar_id");--> statement-breakpoint
CREATE UNIQUE INDEX "scholars_slug_uidx" ON "scholars" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "scholars_name_idx" ON "scholars" USING btree ("name");--> statement-breakpoint
CREATE INDEX "scholars_is_active_idx" ON "scholars" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "scholars_is_featured_idx" ON "scholars" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "scholars_deleted_at_idx" ON "scholars" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "scholars_search_idx" ON "scholars" USING gin ("search_vector");--> statement-breakpoint
CREATE UNIQUE INDEX "lecture_categories_slug_uidx" ON "lecture_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "lecture_categories_parent_id_idx" ON "lecture_categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "lecture_tags_tag_id_idx" ON "lecture_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lecture_translations_lecture_lang_uidx" ON "lecture_translations" USING btree ("lecture_id","language_code");--> statement-breakpoint
CREATE INDEX "lecture_translations_lecture_id_idx" ON "lecture_translations" USING btree ("lecture_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lectures_slug_uidx" ON "lectures" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "lectures_scholar_id_idx" ON "lectures" USING btree ("scholar_id");--> statement-breakpoint
CREATE INDEX "lectures_category_id_idx" ON "lectures" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "lectures_status_idx" ON "lectures" USING btree ("status");--> statement-breakpoint
CREATE INDEX "lectures_status_published_at_idx" ON "lectures" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "lectures_is_featured_idx" ON "lectures" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "lectures_scheduled_at_idx" ON "lectures" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "lectures_deleted_at_idx" ON "lectures" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "lectures_search_idx" ON "lectures" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "lectures_duration_idx" ON "lectures" USING btree ("duration_secs");--> statement-breakpoint
CREATE UNIQUE INDEX "series_slug_uidx" ON "series" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "series_scholar_id_idx" ON "series" USING btree ("scholar_id");--> statement-breakpoint
CREATE INDEX "series_status_idx" ON "series" USING btree ("status");--> statement-breakpoint
CREATE INDEX "series_deleted_at_idx" ON "series" USING btree ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "series_items_series_lecture_uidx" ON "series_items" USING btree ("series_id","lecture_id");--> statement-breakpoint
CREATE INDEX "series_items_series_position_idx" ON "series_items" USING btree ("series_id","position");--> statement-breakpoint
CREATE INDEX "series_items_lecture_id_idx" ON "series_items" USING btree ("lecture_id");--> statement-breakpoint
CREATE UNIQUE INDEX "article_categories_slug_uidx" ON "article_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "article_categories_parent_id_idx" ON "article_categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "article_tags_tag_id_idx" ON "article_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "article_translations_article_lang_uidx" ON "article_translations" USING btree ("article_id","language_code");--> statement-breakpoint
CREATE INDEX "article_translations_article_id_idx" ON "article_translations" USING btree ("article_id");--> statement-breakpoint
CREATE UNIQUE INDEX "articles_slug_uidx" ON "articles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "articles_scholar_id_idx" ON "articles" USING btree ("scholar_id");--> statement-breakpoint
CREATE INDEX "articles_category_id_idx" ON "articles" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "articles_author_id_idx" ON "articles" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "articles_status_published_at_idx" ON "articles" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "articles_is_featured_idx" ON "articles" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "articles_scheduled_at_idx" ON "articles" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "articles_deleted_at_idx" ON "articles" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "articles_search_idx" ON "articles" USING gin ("search_vector");--> statement-breakpoint
CREATE UNIQUE INDEX "book_categories_slug_uidx" ON "book_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "book_categories_parent_id_idx" ON "book_categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "book_tags_tag_id_idx" ON "book_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "book_translations_book_lang_uidx" ON "book_translations" USING btree ("book_id","language_code");--> statement-breakpoint
CREATE INDEX "book_translations_book_id_idx" ON "book_translations" USING btree ("book_id");--> statement-breakpoint
CREATE UNIQUE INDEX "books_slug_uidx" ON "books" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "books_category_id_idx" ON "books" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "books_author_name_idx" ON "books" USING btree ("author_name");--> statement-breakpoint
CREATE INDEX "books_status_published_at_idx" ON "books" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "books_is_featured_idx" ON "books" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "books_allow_free_download_idx" ON "books" USING btree ("allow_free_download");--> statement-breakpoint
CREATE INDEX "books_deleted_at_idx" ON "books" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "books_search_idx" ON "books" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "reminders_status_idx" ON "reminders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reminders_published_at_idx" ON "reminders" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "reminders_scholar_id_idx" ON "reminders" USING btree ("scholar_id");--> statement-breakpoint
CREATE INDEX "reminders_deleted_at_idx" ON "reminders" USING btree ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "featured_slots_key_position_uidx" ON "featured_slots" USING btree ("slot_key","position");--> statement-breakpoint
CREATE INDEX "featured_slots_key_active_idx" ON "featured_slots" USING btree ("slot_key","is_active");--> statement-breakpoint
CREATE INDEX "featured_slots_entity_idx" ON "featured_slots" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "article_views_article_session_uidx" ON "article_views" USING btree ("article_id","session_id");--> statement-breakpoint
CREATE INDEX "article_views_article_id_idx" ON "article_views" USING btree ("article_id");--> statement-breakpoint
CREATE INDEX "article_views_user_id_idx" ON "article_views" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "article_views_created_at_idx" ON "article_views" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "book_downloads_book_id_idx" ON "book_downloads" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "book_downloads_user_id_idx" ON "book_downloads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "book_downloads_created_at_idx" ON "book_downloads" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "reminder_views_reminder_session_uidx" ON "daily_reminder_views" USING btree ("reminder_id","session_id");--> statement-breakpoint
CREATE INDEX "reminder_views_reminder_id_idx" ON "daily_reminder_views" USING btree ("reminder_id");--> statement-breakpoint
CREATE INDEX "reminder_views_created_at_idx" ON "daily_reminder_views" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "lecture_views_lecture_session_uidx" ON "lecture_views" USING btree ("lecture_id","session_id");--> statement-breakpoint
CREATE INDEX "lecture_views_lecture_id_idx" ON "lecture_views" USING btree ("lecture_id");--> statement-breakpoint
CREATE INDEX "lecture_views_user_id_idx" ON "lecture_views" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "lecture_views_created_at_idx" ON "lecture_views" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_created_at_idx" ON "audit_logs" USING btree ("entity","entity_id","created_at");