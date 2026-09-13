import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { lecturesApi, type LectureListParams } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/queryClient";

export function useLectures(filters: Omit<LectureListParams, "page"> = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.lectures.list(filters),
    queryFn: ({ pageParam, signal }) =>
      lecturesApi.list({ ...filters, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined,
  });
}

export function useLecture(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.lectures.detail(slug ?? ""),
    queryFn: ({ signal }) => lecturesApi.byId(slug as string, signal),
    enabled: Boolean(slug),
  });
}

export function useLectureStreamUrl(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.lectures.streamUrl(slug ?? ""),
    queryFn: ({ signal }) => lecturesApi.streamUrl(slug as string, signal),
    enabled: Boolean(slug),
    staleTime: 0,
    gcTime: 0,
  });
}
