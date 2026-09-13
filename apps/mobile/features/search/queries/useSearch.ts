import { useQuery } from "@tanstack/react-query";
import { searchApi, type SearchParams } from "@/lib/api/endpoints";

export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: ["search", params] as const,
    queryFn: ({ signal }) => searchApi.query(params, signal),
    enabled: params.q.trim().length > 1,
  });
}
