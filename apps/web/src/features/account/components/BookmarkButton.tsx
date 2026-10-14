"use client";
// src/features/account/components/BookmarkButton.tsx
//
// Shown on lecture detail pages.
// Authenticated: toggles bookmark, optimistic UI.
// Guest: redirects to sign-in with return URL.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleBookmark } from "../actions/history-bookmark.actions";
import { cn } from "@shared/lib/utils";

interface BookmarkButtonProps {
  lectureId: string;
  lectureSlug: string;
  initialBookmarked: boolean;
  isAuthenticated: boolean;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function BookmarkButton({
  lectureId,
  lectureSlug,
  initialBookmarked,
  isAuthenticated,
  size = "md",
  showLabel = true,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!isAuthenticated) {
      router.push(`/sign-in?redirect=/lectures/${lectureSlug}`);
      return;
    }

    // Optimistic toggle
    setBookmarked((b) => !b);

    startTransition(async () => {
      const result = await toggleBookmark(lectureId);
      if (!result.ok) {
        // Revert on error
        setBookmarked((b) => !b);
      } else {
        setBookmarked(result.bookmarked);
      }
    });
  }

  const iconSize = size === "sm" ? 14 : 18;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark this lecture"}
      aria-pressed={bookmarked}
      className={cn(
        "flex items-center gap-1.5 rounded-lg font-medium transition-all duration-fast",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm",
        bookmarked
          ? "bg-accent-50 text-accent-700 border border-accent-300 hover:bg-accent-100"
          : "bg-surface-subtle text-ink-muted border border-border-default hover:bg-surface-muted hover:text-ink-secondary",
      )}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={bookmarked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={cn(
          "transition-transform duration-fast",
          isPending && "scale-90",
          bookmarked && !isPending && "scale-110",
        )}
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {showLabel && <span>{bookmarked ? "Bookmarked" : "Bookmark"}</span>}
    </button>
  );
}
