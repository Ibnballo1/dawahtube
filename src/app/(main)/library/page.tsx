// src/app/library/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { BookListing } from "@features/library/components/server/BookListing";
import { BookFiltersBar } from "@features/library/components/client/BookFiltersBar";
import { getBookFilterOptions } from "@features/library/queries/library.queries";
import { BookCardSkeleton } from "@shared/components/ui/skeleton";
import { SectionHeader } from "@shared/components/ui/SectionHeader";
import type {
  BookFilters,
  BookSortOption,
} from "@features/library/types/library.types";

export const metadata: Metadata = {
  title: "Library",
  description:
    "Classical and contemporary Islamic books, free to read and download — upon the Qur'an and Sunnah.",
};

export const dynamic = "force-dynamic";

interface LibraryPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    free?: string;
    lang?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const params = await searchParams;

  const filters: BookFilters = {
    ...(params.q ? { query: params.q } : {}),
    ...(params.category ? { categoryId: params.category } : {}),
    ...(params.tag ? { tagSlug: params.tag } : {}),
    freeOnly: params.free === "1",
    ...(params.lang ? { language: params.lang } : {}),
    sort: (params.sort as BookSortOption) || "newest",
    page: params.page ? Math.max(1, parseInt(params.page, 10)) : 1,
  };

  const filterOptions = await getBookFilterOptions();

  return (
    <div className="min-h-screen bg-surface-base">
      <div className="bg-surface-subtle border-b border-border-default">
        <div className="container-site py-10">
          <SectionHeader
            overline="The Library"
            heading="Books"
            description="Classical and contemporary Islamic texts — free to read and download, for the serious student of knowledge."
            headingAs="h1"
          />
        </div>
      </div>

      <div className="container-site py-8">
        <BookFiltersBar
          categories={filterOptions.categories}
          languages={filterOptions.languages}
          currentFilters={filters}
        />

        <Suspense
          key={JSON.stringify(filters)}
          fallback={
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 16 }).map((_, i) => (
                <BookCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <BookListing filters={filters} />
        </Suspense>
      </div>
    </div>
  );
}
