"use client";
// src/features/scholars/components/client/ScholarFiltersBar.tsx

import { useCallback, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@shared/components/ui/input";
import { Button } from "@shared/components/ui/button";
import { cn } from "@shared/lib/utils";
import type {
  ScholarFilters,
  ScholarSortOption,
} from "../../types/scholar.types";

interface ScholarFiltersBarProps {
  nationalities: Array<{ nationality: string; count: number }>;
  currentFilters: ScholarFilters;
}

const SORT_OPTIONS: { value: ScholarSortOption; label: string }[] = [
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "lectures-desc", label: "Most lectures" },
  { value: "newest", label: "Recently added" },
];

export function ScholarFiltersBar({
  nationalities,
  currentFilters,
}: ScholarFiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  type ScholarFilterOverride = {
    [K in keyof ScholarFilters]?: ScholarFilters[K] | undefined;
  };

  const buildUrl = useCallback(
    (override: ScholarFilterOverride) => {
      const merged = { ...currentFilters, ...override, page: 1 };
      const params = new URLSearchParams();
      if (merged.query) params.set("q", merged.query);
      if (merged.nationality) params.set("nationality", merged.nationality);
      if (merged.sort && merged.sort !== "name-asc")
        params.set("sort", merged.sort);
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [currentFilters, pathname],
  );

  const navigate = useCallback(
    (override: ScholarFilterOverride) => {
      startTransition(() => {
        router.push(buildUrl(override));
      });
    },
    [buildUrl, router],
  );

  const hasActiveFilters =
    !!currentFilters.query ||
    !!currentFilters.nationality ||
    (!!currentFilters.sort && currentFilters.sort !== "name-asc");

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        isPending && "opacity-60 pointer-events-none",
      )}
      aria-busy={isPending}
    >
      {/* Search + sort row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Search scholars…"
            defaultValue={currentFilters.query ?? ""}
            aria-label="Search scholars"
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
                const value = e.currentTarget.value.trim();
                navigate(value ? { query: value } : {});
              }
            }}
            onBlur={(e) => {
              const val = e.currentTarget.value.trim();
              if (val !== currentFilters.query)
                navigate(val ? { query: val } : {});
            }}
            className="pl-10"
          />
        </div>

        <div className="w-full sm:w-48">
          <label htmlFor="scholar-sort" className="sr-only">
            Sort scholars by
          </label>
          <select
            id="scholar-sort"
            value={currentFilters.sort ?? "name-asc"}
            onChange={(e) =>
              navigate({ sort: e.target.value as ScholarSortOption })
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

      {/* Nationality chips */}
      {nationalities.length > 0 && (
        <fieldset>
          <legend className="sr-only">Filter by nationality</legend>
          <div className="flex flex-wrap gap-2" role="group">
            <FilterChip
              label="All nationalities"
              active={!currentFilters.nationality}
              onClick={() => navigate({ nationality: undefined })}
            />
            {nationalities.map((n) => (
              <FilterChip
                key={n.nationality}
                label={n.nationality}
                count={n.count}
                active={currentFilters.nationality === n.nationality}
                onClick={() =>
                  navigate({
                    nationality:
                      currentFilters.nationality === n.nationality
                        ? undefined
                        : n.nationality,
                  })
                }
              />
            ))}
          </div>
        </fieldset>
      )}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            navigate({
              query: undefined,
              nationality: undefined,
              sort: "name-asc",
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
      {count !== undefined && (
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
