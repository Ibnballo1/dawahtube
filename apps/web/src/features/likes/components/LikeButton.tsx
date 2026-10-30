"use client";
// src/features/likes/components/LikeButton.tsx
//
// Interactive like button with optimistic UI.
// Shows current like count and toggles liked state on click.
// Works for both anonymous (session cookie) and authenticated users.
//
// Usage:
//   <LikeButton
//     entityType="lecture"
//     entityId={lecture.id}
//     initialLiked={likeState.liked}
//     initialCount={likeState.likeCount}
//   />

import { useState, useTransition } from "react";
import { toggleLike } from "../actions/like.actions";
import { cn } from "@shared/lib/utils";
import { formatCount } from "@shared/lib/format";

type EntityType = "lecture" | "article" | "book" | "reminder";

interface LikeButtonProps {
  entityType: EntityType;
  entityId: string;
  initialLiked: boolean;
  initialCount: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

export function LikeButton({
  entityType,
  entityId,
  initialLiked,
  initialCount,
  size = "md",
  showCount = true,
  className,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    // Optimistic update — instant feedback before server response
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((c) => (nextLiked ? c + 1 : Math.max(0, c - 1)));

    startTransition(async () => {
      const result = await toggleLike(entityType, entityId);

      if (!result.ok) {
        // Revert optimistic update on error
        setLiked(liked);
        setLikeCount(likeCount);
        return;
      }

      // Sync with server response
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    });
  }

  const iconSize = size === "sm" ? 14 : size === "lg" ? 22 : 18;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={liked ? "Unlike" : "Like"}
      aria-pressed={liked}
      className={cn(
        "flex items-center gap-1.5 rounded-lg font-medium transition-all duration-fast",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        size === "sm" && "px-2.5 py-1.5 text-xs",
        size === "md" && "px-3 py-2 text-sm",
        size === "lg" && "px-4 py-2.5 text-base",
        liked
          ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
          : "bg-surface-subtle text-ink-muted hover:bg-surface-muted hover:text-ink-secondary border border-border-default",
        className,
      )}
    >
      {/* Heart icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={cn(
          "transition-transform duration-fast",
          isPending && "scale-90",
          liked && !isPending && "scale-110",
        )}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>

      {/* Count */}
      {showCount && likeCount > 0 && (
        <span className="tabular-nums">{formatCount(likeCount)}</span>
      )}

      {/* Screen-reader label */}
      {showCount && likeCount === 0 && (
        <span className="tabular-nums">{liked ? "1" : "0"}</span>
      )}
    </button>
  );
}
