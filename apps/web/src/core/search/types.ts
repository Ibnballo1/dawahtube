// src/core/search/types.ts
export interface SearchQuery {
  query: string;
  entities: SearchableEntity[];
  limit?: number;
  offset?: number;
  filters?: SearchFilters;
}

export interface SearchFilters {
  categoryId?: string;
  scholarId?: string;
  language?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export type SearchableEntity = "lecture" | "article" | "book" | "scholar";

export interface SearchResult<T = unknown> {
  entity: SearchableEntity;
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  rank: number;
  data: T;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}

// The contract — swap implementations without changing callers
export interface ISearchService {
  search(query: SearchQuery): Promise<SearchResponse>;
  suggest(query: string, entity?: SearchableEntity): Promise<string[]>;
}
