// src/features/likes/components/ContentStats.tsx
//
// Server component wrapper that fetches the like state server-side
// and passes it to the client LikeButton.
// Also shows view count alongside the like button.
//
// Usage on a lecture detail page:
//   <ContentStats
//     entityType="lecture"
//     entityId={lecture.id}
//     viewCount={lecture.viewCount}
//   />

import { getLikeState } from "../actions/like.actions";
import { LikeButton } from "./LikeButton";
import { formatCount } from "@shared/lib/format";

type EntityType = "lecture" | "article" | "book" | "reminder";

interface ContentStatsProps {
  entityType: EntityType;
  entityId: string;
  viewCount?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export async function ContentStats({
  entityType,
  entityId,
  viewCount = 0,
  size = "md",
  className,
}: ContentStatsProps) {
  // Fetch like state server-side so button renders with correct initial state
  // (avoids hydration flash where button shows 0 then jumps to real count)
  const likeState = await getLikeState(entityType, entityId);

  const iconSize = size === "sm" ? 14 : size === "lg" ? 20 : 16;

  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      {/* View count */}
      {viewCount > 0 && (
        <div className="flex items-center gap-1.5 text-ink-muted">
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span
            className={`tabular-nums ${
              size === "sm"
                ? "text-xs"
                : size === "lg"
                  ? "text-base"
                  : "text-sm"
            }`}
            aria-label={`${formatCount(viewCount)} views`}
          >
            {formatCount(viewCount)}
          </span>
        </div>
      )}

      {/* Divider */}
      {viewCount > 0 && (
        <span className="text-border-emphasis text-xs" aria-hidden="true">
          ·
        </span>
      )}

      {/* Like button */}
      <LikeButton
        entityType={entityType}
        entityId={entityId}
        initialLiked={likeState.liked}
        initialCount={likeState.likeCount}
        size={size}
      />
    </div>
  );
}
