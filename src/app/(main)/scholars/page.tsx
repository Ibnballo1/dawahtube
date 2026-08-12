// src/app/scholars/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { ScholarDirectory } from "@features/scholars/components/server/ScholarDirectory";
import { ScholarFiltersBar } from "@features/scholars/components/client/ScholarFiltersBar";
import { getScholarFilterOptions } from "@features/scholars/queries/scholar.queries";
import { ScholarCardSkeleton } from "@shared/components/ui/skeleton";
import { SectionHeader } from "@shared/components/ui/SectionHeader";
import type {
  ScholarFilters,
  ScholarSortOption,
} from "@features/scholars/types/scholar.types";

export const metadata: Metadata = {
  title: "Scholars",
  description:
    "Trusted Nigerian scholars upon the Qur'an and Sunnah — browse their lectures, articles and biographies.",
};

export const dynamic = "force-dynamic";

interface ScholarsPageProps {
  searchParams: Promise<{
    q?: string;
    nationality?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ScholarsPage({
  searchParams,
}: ScholarsPageProps) {
  const params = await searchParams;

  const filters: ScholarFilters = {
    ...(params.q ? { query: params.q } : {}),
    ...(params.nationality ? { nationality: params.nationality } : {}),
    sort: (params.sort as ScholarSortOption) || "name-asc",
    page: params.page ? Math.max(1, parseInt(params.page, 10)) : 1,
  };

  const filterOptions = await getScholarFilterOptions();

  return (
    <div className="min-h-screen bg-surface-base">
      <div className="bg-surface-subtle border-b border-border-default">
        <div className="container-site py-10">
          <SectionHeader
            overline="Our Scholars"
            heading="Scholars"
            description="Verified scholars upon the Salafi manhaj — browse their biographies, lectures and articles."
            headingAs="h1"
          />
        </div>
      </div>

      <div className="container-site py-8">
        <ScholarFiltersBar
          nationalities={filterOptions}
          currentFilters={filters}
        />

        <Suspense
          key={JSON.stringify(filters)}
          fallback={
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {Array.from({ length: 16 }).map((_, i) => (
                <ScholarCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <ScholarDirectory filters={filters} />
        </Suspense>
      </div>
    </div>
  );
}
