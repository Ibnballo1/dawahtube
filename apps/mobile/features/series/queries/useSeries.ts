import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { seriesApi } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/queryClient";
import type { PaginationParams } from "@/lib/api/types";

export function useSeriesList(filters: Omit<PaginationParams, "page"> = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.series.list(filters),
    queryFn: ({ pageParam, signal }) =>
      seriesApi.list({ ...filters, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined,
  });
}

export function useSeriesDetail(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.series.detail(slug ?? ""),
    queryFn: ({ signal }) => seriesApi.bySlug(slug as string, signal),
    enabled: Boolean(slug),
  });
}
