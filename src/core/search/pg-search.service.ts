// src/core/search/pg-search.service.ts
import { db } from "@core/database/client";
import { sql } from "drizzle-orm";
import type { ISearchService, SearchQuery, SearchResponse } from "./types";

// Postgres built-in text search configurations.
// Run `SELECT cfgname FROM pg_ts_config;` to see all available on your instance.
// Supabase Postgres ships with these by default:
const PG_TS_CONFIGS = {
  en: "english",
  ar: "arabic", // requires pg_catalog.arabic — available on PG 14+
  fr: "french",
  simple: "simple", // no stemming — good for proper nouns (scholar names)
} as const;

type TsLanguage = keyof typeof PG_TS_CONFIGS;

function getTsConfig(lang?: string): string {
  if (!lang)
    return (
      PG_TS_CONFIGS[
        (process.env.DEFAULT_SEARCH_LANGUAGE as TsLanguage | undefined) ?? "en"
      ] ?? "english"
    );

  return PG_TS_CONFIGS[lang as TsLanguage] ?? "english";
}

function buildTsQuery(query: string): string {
  return query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `${w}:*`)
    .join(" & ");
}

export class PgSearchService implements ISearchService {
  async search(query: SearchQuery): Promise<SearchResponse> {
    const tsConfig = getTsConfig(query.filters?.language);
    const tsQuery = buildTsQuery(query.query);
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;

    // tsConfig is derived from a closed enum — safe to interpolate as
    // a SQL identifier. Never interpolate user input directly.
    const results = await db.execute(sql`
      SELECT
        'lecture'     AS entity,
        l.id, l.slug, l.title,
        ts_rank(l.search_vector, to_tsquery(${tsConfig}, ${tsQuery}))  AS rank,
        ts_headline(
          ${tsConfig},
          l.description,
          to_tsquery(${tsConfig}, ${tsQuery}),
          'MaxWords=30, MinWords=15'
        ) AS excerpt
      FROM lectures l
      WHERE l.search_vector @@ to_tsquery(${tsConfig}, ${tsQuery})
        AND l.deleted_at IS NULL
        AND l.status = 'published'

      UNION ALL

      SELECT
        'article'     AS entity,
        a.id, a.slug, a.title,
        ts_rank(a.search_vector, to_tsquery(${tsConfig}, ${tsQuery}))  AS rank,
        ts_headline(
          ${tsConfig},
          a.excerpt,
          to_tsquery(${tsConfig}, ${tsQuery}),
          'MaxWords=30, MinWords=15'
        ) AS excerpt
      FROM articles a
      WHERE a.search_vector @@ to_tsquery(${tsConfig}, ${tsQuery})
        AND a.deleted_at IS NULL
        AND a.status = 'published'

      UNION ALL

      SELECT
        'book'        AS entity,
        b.id, b.slug, b.title,
        ts_rank(b.search_vector, to_tsquery(${tsConfig}, ${tsQuery}))  AS rank,
        ts_headline(
          ${tsConfig},
          b.description,
          to_tsquery(${tsConfig}, ${tsQuery}),
          'MaxWords=30, MinWords=15'
        ) AS excerpt
      FROM books b
      WHERE b.search_vector @@ to_tsquery(${tsConfig}, ${tsQuery})
        AND b.deleted_at IS NULL
        AND b.status = 'published'

      ORDER BY rank DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    return {
      results: results.rows as never,
      total: results.rows.length,
      query: query.query,
    };
  }

  async suggest(query: string, lang?: string): Promise<string[]> {
    const tsConfig = getTsConfig(lang);

    const results = await db.execute(sql`
      SELECT word
      FROM ts_stat(
        'SELECT search_vector FROM lectures WHERE deleted_at IS NULL AND status = ''published'''
      )
      WHERE similarity(word, ${query}) > 0.3
      ORDER BY ndoc DESC
      LIMIT 5
    `);

    return (results.rows as Array<{ word: string }>).map((r) => r.word);
  }
}

export const searchService: ISearchService = new PgSearchService();
