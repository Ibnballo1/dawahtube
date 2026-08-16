"use client";
// src/features/admin/components/client/DeleteSeriesButton.tsx

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSeries } from "@features/admin/actions/series.actions";
import { Button } from "@shared/components/ui/button";

export function DeleteSeriesButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [deleted, setDeleted] = useState(false);
  const router = useRouter();

  if (deleted) return null;

  function handleDelete() {
    if (
      !confirm(
        `Delete "${title}"? All lectures in this series will be detached but not deleted.`,
      )
    )
      return;
    startTransition(async () => {
      const result = await deleteSeries(id);
      if (result.ok) {
        setDeleted(true);
        router.refresh();
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleDelete}
      disabled={isPending}
      aria-label={`Delete ${title}`}
      className="text-ink-muted hover:text-red-600 hover:bg-red-50"
    >
      {!isPending && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      )}
    </Button>
  );
}
