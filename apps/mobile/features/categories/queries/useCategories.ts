import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api/endpoints";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"] as const,
    queryFn: ({ signal }) => categoriesApi.list(signal),
    staleTime: 10 * 60_000, // categories change rarely
  });
}
