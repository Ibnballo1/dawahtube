"use client";
// src/features/library/components/client/BookFiltersBar.tsx

import { useCallback, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@shared/components/ui/input";
import { Button } from "@shared/components/ui/button";
import { cn } from "@shared/lib/utils";
import type { BookFilters, BookSortOption } from "../../types/library.types";

interface BookFiltersBarProps {
  categories: Array<{ id: string; slug: string; name: string; count: number }>;
  languages: Array<{ language: string; count: number }>;
  currentFilters: BookFilters;
}

const SORT_OPTIONS: { value: BookSortOption; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "popular", label: "Most downloaded" },
  { value: "title-asc", label: "Title (A–Z)" },
  { value: "pages-asc", label: "Shortest first" },
  { value: "pages-desc", label: "Longest first" },
];

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  ar: "Arabic",
  ha: "Hausa",
  yo: "Yoruba",
  fr: "French",
};

export function BookFiltersBar({
  categories,
  languages,
  currentFilters,
}: BookFiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const buildUrl = useCallback(
    (override: Partial<BookFilters>) => {
      const merged = { ...currentFilters, ...override, page: 1 };
      const params = new URLSearchParams();
      if (merged.query) params.set("q", merged.query);
      if (merged.categoryId) params.set("category", merged.categoryId);
      if (merged.tagSlug) params.set("tag", merged.tagSlug);
      if (merged.freeOnly) params.set("free", "1");
      if (merged.language) params.set("lang", merged.language);
      if (merged.sort && merged.sort !== "newest")
        params.set("sort", merged.sort);
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [currentFilters, pathname],
  );

  const navigate = useCallback(
    (override: Partial<BookFilters>) => {
      startTransition(() => {
        router.push(buildUrl(override));
      });
    },
    [buildUrl, router],
  );

  const hasActiveFilters =
    !!currentFilters.query ||
    !!currentFilters.categoryId ||
    !!currentFilters.tagSlug ||
    !!currentFilters.freeOnly ||
    !!currentFilters.language ||
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
            placeholder="Search books or authors…"
            defaultValue={currentFilters.query ?? ""}
            aria-label="Search books"
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
              if (e.key === "Enter") {
                const query = e.currentTarget.value;
                navigate(query ? { query } : {});
              }
            }}
            onBlur={(e) => {
              const val = e.currentTarget.value || undefined;
              if (val !== currentFilters.query) {
                navigate(val === undefined ? {} : { query: val });
              }
            }}
            className="pl-10"
          />
        </div>

        {/* Language dropdown */}
        {languages.length > 1 && (
          <div className="w-full sm:w-40">
            <label htmlFor="book-lang-select" className="sr-only">
              Filter by language
            </label>
            <select
              id="book-lang-select"
              value={currentFilters.language ?? ""}
              onChange={(e) => navigate({ language: e.target.value })}
              className={cn(
                "w-full h-input rounded-md px-3 pr-10 text-base",
                "border border-border-emphasis bg-surface-card text-ink-primary",
                "focus:border-primary-700 focus:ring-3 focus:ring-primary-700/15 outline-none",
                "appearance-none cursor-pointer transition-colors duration-fast",
              )}
            >
              <option value="">All languages</option>
              {languages.map((l) => (
                <option key={l.language} value={l.language}>
                  {LANGUAGE_LABELS[l.language] ?? l.language} ({l.count})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sort dropdown */}
        <div className="w-full sm:w-48">
          <label htmlFor="book-sort-select" className="sr-only">
            Sort books by
          </label>
          <select
            id="book-sort-select"
            value={currentFilters.sort ?? "newest"}
            onChange={(e) =>
              navigate({ sort: e.target.value as BookSortOption })
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

      <div className="flex flex-wrap items-center gap-2">
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
                categoryId: currentFilters.categoryId === cat.id ? "" : cat.id,
              })
            }
          />
        ))}

        <span className="w-px h-5 bg-border-default mx-1" aria-hidden="true" />

        {/* Free-only toggle */}
        <button
          type="button"
          onClick={() => navigate({ freeOnly: !currentFilters.freeOnly })}
          aria-pressed={!!currentFilters.freeOnly}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
            "border transition-all duration-fast",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700",
            currentFilters.freeOnly
              ? "bg-accent-700 text-white border-accent-700 shadow-xs"
              : "bg-surface-card text-ink-secondary border-border-default hover:border-accent-300 hover:text-accent-700",
          )}
        >
          <DownloadIcon />
          Free downloads only
        </button>
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            navigate({
              query: "",
              categoryId: "",
              tagSlug: "",
              freeOnly: false,
              language: "",
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

function DownloadIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}
