"use client";
// src/features/search/components/client/SearchInput.tsx
//
// Updates ?q= in the URL as the user types (with 300ms debounce).
// Submitting the form also navigates immediately.
// All results rendering stays in the Server Component — this is
// the only client island on the search page.

import { useRef, useEffect, useCallback, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@shared/lib/utils";

interface SearchInputProps {
  initialQuery: string;
  placeholder?: string;
}

export function SearchInput({
  initialQuery,
  placeholder = "Search lectures, articles, books, scholars…",
}: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep input focused on hydration
  useEffect(() => {
    if (initialQuery && inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, []);

  const navigate = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }

      // Reset to page 1 on new search
      params.delete("page");

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [router, pathname, searchParams],
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate(value), 350);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const value = inputRef.current?.value ?? "";
    navigate(value);
  }

  function handleClear() {
    if (inputRef.current) inputRef.current.value = "";
    if (debounceRef.current) clearTimeout(debounceRef.current);
    navigate("");
    inputRef.current?.focus();
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search Da'wahTube"
      className="relative w-full max-w-2xl"
    >
      {/* Search icon */}
      <span
        aria-hidden="true"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </span>

      <input
        ref={inputRef}
        type="search"
        name="q"
        defaultValue={initialQuery}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label="Search query"
        autoComplete="off"
        spellCheck={false}
        className={cn(
          "w-full h-12 pl-12 pr-12 rounded-xl text-base",
          "border border-border-emphasis bg-surface-card text-ink-primary",
          "placeholder:text-ink-muted",
          "focus:outline-none focus:border-primary-700 focus:ring-3 focus:ring-primary-700/15",
          "transition-colors",
          isPending && "opacity-80",
        )}
      />

      {/* Clear button */}
      {initialQuery && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}

      {/* Loading indicator */}
      {isPending && !initialQuery && (
        <span
          aria-hidden="true"
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          <svg
            className="animate-spin"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeOpacity="0.25"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </span>
      )}

      {/* Hidden submit for keyboard "Enter" */}
      <button type="submit" className="sr-only">
        Search
      </button>
    </form>
  );
}
