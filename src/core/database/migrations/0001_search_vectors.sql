-- ─────────────────────────────────────────────────────────────────────────────
-- 0002_search_and_indexes.sql
--
-- This is a CUSTOM migration — it contains SQL that Drizzle Kit cannot
-- generate from the ORM schema (trigger functions, partial indexes, extensions).
--
-- HOW TO APPLY:
--   This file runs automatically via `npm run db:migrate` because Drizzle Kit
--   applies all files in src/core/database/migrations/ in numeric order.
--   0001 (generated schema) runs first, 0002 runs second.
--
-- TO ADD THIS FILE:
--   After running `npm run db:generate` (which creates 0001_initial_schema.sql),
--   place this file as 0002_search_and_indexes.sql in the same directory.
--   Then run `npm run db:migrate`.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Extensions ───────────────────────────────────────────────────────────────
-- pg_trgm: enables trigram similarity for fuzzy search suggestions.
-- Available on Supabase Postgres by default.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- unaccent: strips accents from text during FTS.
-- Helps Arabic transliterations and accented Latin (Yoruba, Hausa).
CREATE EXTENSION IF NOT EXISTS unaccent;


-- ── Partial unique index on media_assets ─────────────────────────────────────
-- Drizzle cannot generate a WHERE clause on unique indexes.
-- This prevents the same R2 key being inserted twice for active assets,
-- while allowing the same key to be "re-registered" after a soft delete.
DROP INDEX IF EXISTS media_assets_bucket_key_idx;
CREATE UNIQUE INDEX media_assets_bucket_key_active_uidx
  ON media_assets (bucket, key)
  WHERE deleted_at IS NULL;


-- ── Search vector trigger functions ──────────────────────────────────────────
--
-- Title and author fields use 'simple' config (no stemming):
--   Preserves scholar names, Arabic transliterations, and proper nouns.
--   "Ibn Taymiyyah" doesn't get stemmed to "ibn taymiyyah".
--
-- Description and body fields use 'english' config (with stemming):
--   "learning" and "learned" both match a search for "learn".
--
-- Why not one function for all three?
--   Different tables have different text column names and different
--   importance weights. Three small functions are clearer than one
--   complex parameterised function.
-- ─────────────────────────────────────────────────────────────────────────────

-- Lectures
CREATE OR REPLACE FUNCTION update_lecture_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple',  unaccent(coalesce(NEW.title, ''))),       'A') ||
    setweight(to_tsvector('english', unaccent(coalesce(NEW.description, ''))), 'B') ||
    setweight(to_tsvector('english', unaccent(coalesce(NEW.transcript, ''))),  'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lectures_search_vector_update ON lectures;
CREATE TRIGGER lectures_search_vector_update
  BEFORE INSERT OR UPDATE OF title, description, transcript
  ON lectures
  FOR EACH ROW EXECUTE FUNCTION update_lecture_search_vector();

-- Articles
CREATE OR REPLACE FUNCTION update_article_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple',  unaccent(coalesce(NEW.title, ''))),   'A') ||
    setweight(to_tsvector('english', unaccent(coalesce(NEW.excerpt, ''))), 'B') ||
    setweight(to_tsvector('english', unaccent(coalesce(NEW.content, ''))), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS articles_search_vector_update ON articles;
CREATE TRIGGER articles_search_vector_update
  BEFORE INSERT OR UPDATE OF title, excerpt, content
  ON articles
  FOR EACH ROW EXECUTE FUNCTION update_article_search_vector();

-- Books
CREATE OR REPLACE FUNCTION update_book_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple',  unaccent(coalesce(NEW.title, ''))),       'A') ||
    setweight(to_tsvector('simple',  unaccent(coalesce(NEW.author_name, ''))), 'A') ||
    setweight(to_tsvector('english', unaccent(coalesce(NEW.description, ''))), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS books_search_vector_update ON books;
CREATE TRIGGER books_search_vector_update
  BEFORE INSERT OR UPDATE OF title, author_name, description
  ON books
  FOR EACH ROW EXECUTE FUNCTION update_book_search_vector();

-- Scholars
CREATE OR REPLACE FUNCTION update_scholar_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.name, ''))),        'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.arabic_name, ''))), 'A') ||
    setweight(to_tsvector('english', unaccent(coalesce(NEW.biography, ''))),  'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS scholars_search_vector_update ON scholars;
CREATE TRIGGER scholars_search_vector_update
  BEFORE INSERT OR UPDATE OF name, arabic_name, biography
  ON scholars
  FOR EACH ROW EXECUTE FUNCTION update_scholar_search_vector();


-- ── GIN indexes (already defined in Drizzle schema, kept here for reference) ─
-- Drizzle emits these from the schema files. Listed here as documentation.
-- Do not run manually — they will already exist after 0001 migration.
--
-- CREATE INDEX IF NOT EXISTS lectures_search_idx ON lectures USING GIN(search_vector);
-- CREATE INDEX IF NOT EXISTS articles_search_idx ON articles USING GIN(search_vector);
-- CREATE INDEX IF NOT EXISTS books_search_idx    ON books    USING GIN(search_vector);
-- CREATE INDEX IF NOT EXISTS scholars_search_idx ON scholars USING GIN(search_vector);


-- ── Backfill search vectors for any existing rows ─────────────────────────────
-- If running this migration on a DB that already has content, the triggers
-- only fire on INSERT or UPDATE — existing rows have NULL search_vectors.
-- This UPDATE forces the trigger to fire on every existing row.
UPDATE lectures SET title = title WHERE search_vector IS NULL;
UPDATE articles SET title = title WHERE search_vector IS NULL;
UPDATE books    SET title = title WHERE search_vector IS NULL;
UPDATE scholars SET name  = name  WHERE search_vector IS NULL;


-- ── Trigram indexes for fuzzy suggestion queries ──────────────────────────────
-- Used by the suggest() method in PgSearchService.
-- Trigram indexes are large — only create on the most-searched column per table.
CREATE INDEX IF NOT EXISTS lectures_title_trgm_idx ON lectures  USING GIN(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS articles_title_trgm_idx ON articles  USING GIN(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS books_title_trgm_idx    ON books     USING GIN(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS scholars_name_trgm_idx  ON scholars  USING GIN(name  gin_trgm_ops);
CREATE INDEX IF NOT EXISTS tags_label_trgm_idx     ON tags      USING GIN(label gin_trgm_ops);