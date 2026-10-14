import { useQuery } from "@tanstack/react-query";
import { featuredApi } from "@/lib/api/endpoints";

export function useFeatured() {
  return useQuery({
    queryKey: ["featured"] as const,
    queryFn: ({ signal }) => featuredApi.all(signal),
    staleTime: 2 * 60_000, // curated content changes rarely within a session
  });
}
