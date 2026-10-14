// src/features/account/components/RemoveBookmarkButton.tsx
"use client";
import { useTransition, useState } from "react";
import { removeBookmark } from "../actions/history-bookmark.actions";

export function RemoveBookmarkButton({ lectureId }: { lectureId: string }) {
  const [removed, setRemoved] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (removed) return null;

  function handleRemove() {
    startTransition(async () => {
      const result = await removeBookmark(lectureId);
      if (result.ok) setRemoved(true);
    });
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={isPending}
      aria-label="Remove bookmark"
      className="size-8 rounded-full border border-border-default flex items-center justify-center text-ink-muted hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-fast disabled:opacity-40"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
      </svg>
    </button>
  );
}
