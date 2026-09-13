import { QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/errors";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.warn(`Query failed [${JSON.stringify(query.queryKey)}]:`, error);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && !error.isRetryable) return false;
        return failureCount < 2;
      },
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

/** Stable query key roots — prevents typo'd keys fragmenting the cache. */
export const queryKeys = {
  lectures: {
    all: ["lectures"] as const,
    list: (filters: Record<string, unknown>) =>
      ["lectures", "list", filters] as const,
    detail: (id: string) => ["lectures", "detail", id] as const,
    streamUrl: (id: string) => ["lectures", "stream-url", id] as const,
  },
  scholars: {
    all: ["scholars"] as const,
    list: (filters: Record<string, unknown>) =>
      ["scholars", "list", filters] as const,
    detail: (slug: string) => ["scholars", "detail", slug] as const,
    lectures: (slug: string, filters: Record<string, unknown>) =>
      ["scholars", slug, "lectures", filters] as const,
  },
  series: {
    all: ["series"] as const,
    list: (filters: Record<string, unknown>) =>
      ["series", "list", filters] as const,
    detail: (slug: string) => ["series", "detail", slug] as const,
  },
} as const;
