// src/app/lectures/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { LectureListing } from "@/features/lectures/components/server/LectureListing";
import { LectureFiltersBar } from "@/features/lectures/components/client/LectureFiltersBar";
import { getLectureFilterOptions } from "@/features/lectures/queries/lecture.queries";
import { LectureCardSkeleton } from "@shared/components/ui/skeleton";
import { SectionHeader } from "@shared/components/ui/SectionHeader";
import type {
  LectureFilters,
  LectureSortOption,
} from "@features/lectures/types/lecture.types";

export const metadata: Metadata = {
  title: "Lectures",
  description:
    "Browse hundreds of Islamic lectures from trusted Nigerian scholars upon the Qur'an and Sunnah.",
};

// Listing pages are dynamic — searchParams drive the query
export const dynamic = "force-dynamic";

interface LecturesPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    scholar?: string;
    tag?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function LecturesPage({
  searchParams,
}: LecturesPageProps) {
  const params = await searchParams;

  // Parse searchParams into typed filters
  const filters: LectureFilters = {
    query: params.q ?? "",
    categoryId: params.category ?? "",
    scholarId: params.scholar ?? "",
    tagSlug: params.tag ?? "",
    sort: (params.sort as LectureSortOption) || "newest",
    page: params.page ? Math.max(1, parseInt(params.page, 10)) : 1,
  };

  // Filter options are cached — fetch in parallel with listing
  const filterOptions = await getLectureFilterOptions();

  return (
    <div className="min-h-screen bg-surface-base">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="bg-surface-subtle border-b border-border-default">
        <div className="container-site py-10">
          <SectionHeader
            overline="Knowledge Library"
            heading="Lectures"
            description="Lessons from trusted scholars, upon the Qur'an and Sunnah according to the understanding of the Salaf."
            headingAs="h1"
          />
        </div>
      </div>

      <div className="container-site py-8">
        {/* ── Filter bar — client component ────────────────────────── */}
        <LectureFiltersBar
          categories={filterOptions.categories}
          scholars={filterOptions.scholars}
          currentFilters={filters}
        />

        {/* ── Results — server component ────────────────────────────── */}
        <Suspense
          key={JSON.stringify(filters)}
          fallback={
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <LectureCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <LectureListing filters={filters} />
        </Suspense>
      </div>
    </div>
  );
}
