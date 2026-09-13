// apps/mobile/features/scholars/queries/useScholars.ts

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { scholarsApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/queryClient";
import type { PaginationParams } from "@/lib/api/types";

export function useScholars(filters: Omit<PaginationParams, "page"> = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.scholars.list(filters),
    queryFn: ({ pageParam, signal }) =>
      scholarsApi.list({ ...filters, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined,
  });
}

export function useScholar(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.scholars.detail(slug ?? ""),
    queryFn: ({ signal }) => scholarsApi.bySlug(slug as string, signal),
    enabled: Boolean(slug),
  });
}

export function useScholarLectures(
  slug: string | undefined,
  filters: Omit<PaginationParams, "page"> = {},
) {
  return useInfiniteQuery({
    queryKey: queryKeys.scholars.lectures(slug ?? "", filters),
    queryFn: ({ pageParam, signal }) =>
      scholarsApi.lectures(
        slug as string,
        { ...filters, page: pageParam },
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined,
    enabled: Boolean(slug),
  });
}
