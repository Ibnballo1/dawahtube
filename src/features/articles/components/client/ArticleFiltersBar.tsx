"use client";
// src/features/articles/components/client/ArticleFiltersBar.tsx

import { useCallback, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@shared/components/ui/input";
import { Button } from "@shared/components/ui/button";
import { cn } from "@shared/lib/utils";
import type {
  ArticleFilters,
  ArticleSortOption,
} from "../../types/article.types";

interface ArticleFiltersBarProps {
  categories: Array<{ id: string; slug: string; name: string; count: number }>;
  scholars: Array<{
    id: string;
    slug: string;
    name: string;
    honorifics: string | null;
    count: number;
  }>;
  currentFilters: ArticleFilters;
}

const SORT_OPTIONS: { value: ArticleSortOption; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "popular", label: "Most popular" },
  { value: "reading-time-asc", label: "Quickest reads" },
  { value: "reading-time-desc", label: "Longest reads" },
];

export function ArticleFiltersBar({
  categories,
  scholars,
  currentFilters,
}: ArticleFiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const buildUrl = useCallback(
    (override: Partial<ArticleFilters>) => {
      const merged = { ...currentFilters, ...override, page: 1 };
      const params = new URLSearchParams();
      if (merged.query) params.set("q", merged.query);
      if (merged.categoryId) params.set("category", merged.categoryId);
      if (merged.scholarId) params.set("scholar", merged.scholarId);
      if (merged.tagSlug) params.set("tag", merged.tagSlug);
      if (merged.sort && merged.sort !== "newest")
        params.set("sort", merged.sort);
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [currentFilters, pathname],
  );

  const navigate = useCallback(
    (override: Partial<ArticleFilters>) => {
      startTransition(() => {
        router.push(buildUrl(override));
      });
    },
    [buildUrl, router],
  );

  const hasActiveFilters =
    !!currentFilters.query ||
    !!currentFilters.categoryId ||
    !!currentFilters.scholarId ||
    !!currentFilters.tagSlug ||
    (!!currentFilters.sort && currentFilters.sort !== "newest");

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        isPending &&
          "opacity-60 pointer-events-none transition-opacity duration-fast",
      )}
      aria-busy={isPending}
    >
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Search articles…"
            defaultValue={currentFilters.query ?? ""}
            aria-label="Search articles"
            leftAddon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate({ query: e.currentTarget.value });
            }}
            onBlur={(e) => {
              const val = e.currentTarget.value;
              if (val !== currentFilters.query) navigate({ query: val });
            }}
            className="pl-10"
          />
        </div>

        <div className="w-full sm:w-48">
          <label htmlFor="article-sort-select" className="sr-only">
            Sort articles by
          </label>
          <select
            id="article-sort-select"
            value={currentFilters.sort ?? "newest"}
            onChange={(e) =>
              navigate({ sort: e.target.value as ArticleSortOption })
            }
            className={cn(
              "w-full h-input rounded-md px-3 pr-10 text-base",
              "border border-border-emphasis bg-surface-card text-ink-primary",
              "focus:border-primary-700 focus:ring-3 focus:ring-primary-700/15 outline-none",
              "appearance-none cursor-pointer transition-colors duration-fast",
            )}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {categories.length > 0 && (
          <div className="flex-1">
            <fieldset>
              <legend className="sr-only">Filter by category</legend>
              <div className="flex flex-wrap gap-2" role="group">
                <FilterChip
                  label="All categories"
                  active={!currentFilters.categoryId}
                  onClick={() => navigate({ categoryId: "" })}
                />
                {categories.map((cat) => (
                  <FilterChip
                    key={cat.id}
                    label={cat.name}
                    count={cat.count}
                    active={currentFilters.categoryId === cat.id}
                    onClick={() =>
                      navigate({
                        categoryId:
                          currentFilters.categoryId === cat.id ? "" : cat.id,
                      })
                    }
                  />
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {scholars.length > 0 && (
          <div className="w-full sm:w-56 shrink-0">
            <label htmlFor="article-scholar-select" className="sr-only">
              Filter by scholar
            </label>
            <select
              id="article-scholar-select"
              value={currentFilters.scholarId ?? ""}
              onChange={(e) => navigate({ scholarId: e.target.value })}
              className={cn(
                "w-full h-input rounded-md px-3 pr-10 text-base",
                "border border-border-emphasis bg-surface-card text-ink-primary",
                "focus:border-primary-700 focus:ring-3 focus:ring-primary-700/15 outline-none",
                "appearance-none cursor-pointer transition-colors duration-fast",
              )}
            >
              <option value="">All scholars</option>
              {scholars.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.honorifics ? `${s.honorifics} ${s.name}` : s.name}
                  {s.count > 0 ? ` (${s.count})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            navigate({
              query: "",
              categoryId: "",
              scholarId: "",
              tagSlug: "",
              sort: "newest",
            })
          }
          className="w-fit text-ink-muted hover:text-ink-primary"
          aria-label="Clear all filters"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          Clear filters
        </Button>
      )}
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
        "border transition-all duration-fast",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700",
        active
          ? "bg-primary-700 text-white border-primary-700 shadow-xs"
          : "bg-surface-card text-ink-secondary border-border-default hover:border-primary-300 hover:text-primary-700",
      )}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            "text-xs tabular-nums",
            active ? "text-white/70" : "text-ink-muted",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
