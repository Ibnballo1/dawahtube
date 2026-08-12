"use client";
// src/features/search/components/client/SearchTypeFilter.tsx

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@shared/lib/utils";
import type { SearchContentType } from "../../types/search.types";

interface SearchTypeFilterProps {
  currentType: SearchContentType;
  query: string;
  counts: {
    all: number;
    lectures: number;
    articles: number;
    books: number;
    scholars: number;
  };
}

const TABS: Array<{ id: SearchContentType; label: string }> = [
  { id: "all", label: "All" },
  { id: "lectures", label: "Lectures" },
  { id: "articles", label: "Articles" },
  { id: "books", label: "Books" },
  { id: "scholars", label: "Scholars" },
];

export function SearchTypeFilter({
  currentType,
  query,
  counts,
}: SearchTypeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleTabClick(type: SearchContentType) {
    if (type === currentType) return;

    const params = new URLSearchParams(searchParams.toString());

    if (type === "all") {
      params.delete("type");
    } else {
      params.set("type", type);
    }
    params.delete("page");

    startTransition(() => {
      router.push(`/search?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div
      role="tablist"
      aria-label="Filter results by content type"
      className={cn(
        "flex gap-0 border-b border-border-default overflow-x-auto scrollbar-none",
        isPending && "opacity-60 pointer-events-none",
      )}
    >
      {TABS.map((tab) => {
        const count = counts[tab.id];
        const isActive = tab.id === currentType;

        // Hide zero-count tabs (except "All")
        if (tab.id !== "all" && count === 0) return null;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`search-panel-${tab.id}`}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap",
              "border-b-2 -mb-px transition-colors duration-fast",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2",
              isActive
                ? "border-primary-700 text-primary-700"
                : "border-transparent text-ink-tertiary hover:text-ink-primary hover:border-border-emphasis",
            )}
          >
            {tab.label}
            {count > 0 && (
              <span
                className={cn(
                  "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5",
                  "rounded-full text-xs font-semibold tabular-nums",
                  isActive
                    ? "bg-primary-100 text-primary-700"
                    : "bg-surface-muted text-ink-muted",
                )}
              >
                {count > 999 ? "999+" : count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
