// src/app/search/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { SectionHeader } from "@shared/components/ui/SectionHeader";
import { SearchResults } from "@features/search/components/server/SearchResults";
import { SearchTypeFilter } from "@features/search/components/client/SearchTypeFilter";
import { SearchInput } from "@features/search/components/client/SearchInput";
import { Skeleton } from "@shared/components/ui/skeleton";
import type { SearchContentType } from "@features/search/types/search.types";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: "${q}"` : "Search",
    description: q
      ? `Search results for "${q}" across lectures, articles, books and scholars.`
      : "Search across all Islamic knowledge on Da'wahTube.",
    robots: { index: false }, // don't index search result pages
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const type = (params.type ?? "all") as SearchContentType;
  const page = params.page ? Math.max(1, parseInt(params.page, 10)) : 1;

  return (
    <div className="min-h-screen bg-surface-base">
      {/* ── Search header ─────────────────────────────────────────── */}
      <div className="bg-surface-subtle border-b border-border-default">
        <div className="container-site py-8 flex flex-col gap-5">
          <SectionHeader
            overline="Search"
            heading="Find what you need"
            headingAs="h1"
          />

          {/* Prominent search input */}
          <SearchInput initialQuery={query} />
        </div>
      </div>

      {/* ── Results ───────────────────────────────────────────────── */}
      <div className="container-site py-8">
        {query ? (
          <Suspense
            key={`${query}-${type}-${page}`}
            fallback={<SearchSkeleton />}
          >
            <SearchResults query={query} type={type} page={page} />
          </Suspense>
        ) : (
          <SearchEmptyPrompt />
        )}
      </div>
    </div>
  );
}

// ─── Skeletons + empty states ──────────────────────────────────────────────────

function SearchSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      {/* Tab bar skeleton */}
      <div className="flex gap-2 border-b border-border-default pb-1">
        {[80, 72, 68, 60, 72].map((w, i) => (
          <div
            key={i}
            className="skeleton rounded-full"
            style={{ width: w, height: 32 }}
          />
        ))}
      </div>
      {/* Result rows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="w-24 h-16 rounded-lg shrink-0" />
          <div className="flex flex-col gap-2 flex-1 py-1">
            <Skeleton className="w-3/4 h-4 rounded" />
            <Skeleton className="w-1/2 h-3 rounded" />
            <Skeleton className="w-1/3 h-3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchEmptyPrompt() {
  return (
    <div className="flex flex-col items-center py-20 gap-4 text-center">
      <div className="size-16 rounded-2xl bg-surface-subtle flex items-center justify-center text-ink-muted">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>
      <div>
        <h2 className="font-display font-semibold text-xl text-ink-primary">
          Search all content
        </h2>
        <p className="text-ink-muted text-sm mt-2 max-w-[44ch]">
          Search across lectures, articles, books and scholars. Try a
          scholar&apos;s name, a topic like &ldquo;tawheed&rdquo;, or a book
          title.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center mt-2">
        {["Tawheed", "Aqeedah", "Salah", "Zakah", "Fiqh", "Arabic"].map(
          (term) => (
            <a
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="px-3 py-1.5 rounded-full text-sm border border-border-default text-ink-secondary hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-all duration-fast"
            >
              {term}
            </a>
          ),
        )}
      </div>
    </div>
  );
}
