// src/app/articles/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { ArticleListing } from "@/features/articles/components/server/ArticleListing";
import { ArticleFiltersBar } from "@/features/articles/components/client/ArticleFiltersBar";
import { getArticleFilterOptions } from "@features/articles/queries/article.queries";
import { ArticleCardSkeleton } from "@shared/components/ui/skeleton";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import type {
  ArticleFilters,
  ArticleSortOption,
} from "@features/articles/types/article.types";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Read articles and written explanations from trusted Nigerian scholars upon the Qur'an and Sunnah.",
};

export const dynamic = "force-dynamic";

interface ArticlesPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    scholar?: string;
    tag?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ArticlesPage({
  searchParams,
}: ArticlesPageProps) {
  const params = await searchParams;

  const filters: ArticleFilters = {
    ...(params.q ? { query: params.q } : {}),
    ...(params.category ? { categoryId: params.category } : {}),
    ...(params.scholar ? { scholarId: params.scholar } : {}),
    ...(params.tag ? { tagSlug: params.tag } : {}),
    sort: (params.sort as ArticleSortOption) || "newest",
    page: params.page ? Math.max(1, parseInt(params.page, 10)) : 1,
  };

  const filterOptions = await getArticleFilterOptions();

  return (
    <div className="min-h-screen bg-surface-base">
      <div className="bg-surface-subtle border-b border-border-default">
        <div className="container-site py-10">
          <SectionHeader
            overline="Written Knowledge"
            heading="Articles"
            description="Read, reflect and benefit — written insights from scholars upon the Qur'an and Sunnah."
            headingAs="h1"
          />
        </div>
      </div>

      <div className="container-site py-8">
        <ArticleFiltersBar
          categories={filterOptions.categories}
          scholars={filterOptions.scholars}
          currentFilters={filters}
        />

        <Suspense
          key={JSON.stringify(filters)}
          fallback={
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <ArticleCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <ArticleListing filters={filters} />
        </Suspense>
      </div>
    </div>
  );
}
