"use client";
// src/features/admin/components/client/ContentRowActions.tsx
//
// Publish and delete action buttons for content table rows.
// Uses useTransition for pending state — row remains interactive while
// the Server Action runs. Optimistic removal on delete so the row
// disappears immediately without waiting for the server round-trip.

import { useTransition, useState } from "react";
import { Button } from "@shared/components/ui/button";
import { cn } from "@shared/lib/utils";
import type { ActionResult } from "../../types/admin.types";

// ─── Publish button ───────────────────────────────────────────────────────────

interface PublishButtonProps {
  id: string;
  status: string;
  onPublish: (id: string) => Promise<ActionResult>;
  onUnpublish?: (id: string) => Promise<ActionResult>;
}

export function PublishButton({
  id,
  status,
  onPublish,
  onUnpublish,
}: PublishButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState(status);

  const isPublished = localStatus === "published";

  function handleClick() {
    startTransition(async () => {
      if (isPublished && onUnpublish) {
        const result = await onUnpublish(id);
        if (result.ok) setLocalStatus("draft");
      } else {
        const result = await onPublish(id);
        if (result.ok) setLocalStatus("published");
      }
    });
  }

  if (localStatus === "archived") return null;

  return (
    <Button
      variant={isPublished ? "ghost" : "secondary"}
      size="icon-sm"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isPublished ? "Unpublish" : "Publish"}
      className={cn(
        !isPublished &&
          "text-primary-700 border-primary-200 hover:bg-primary-50",
        isPublished && "text-ink-muted",
      )}
    >
      {!isPending && (isPublished ? <UnpublishIcon /> : <PublishIcon />)}
    </Button>
  );
}

// ─── Delete button ────────────────────────────────────────────────────────────

interface DeleteButtonProps {
  id: string;
  title: string;
  onDelete: (id: string) => Promise<ActionResult>;
}

export function DeleteButton({ id, title, onDelete }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [deleted, setDeleted] = useState(false);

  if (deleted) return null;

  function handleClick() {
    if (
      !confirm(
        `Delete "${title}"? This action can be undone by restoring the item.`,
      )
    )
      return;

    startTransition(async () => {
      const result = await onDelete(id);
      if (result.ok) setDeleted(true);
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleClick}
      disabled={isPending}
      aria-label={`Delete ${title}`}
      className="text-ink-muted hover:text-red-600 hover:bg-red-50"
    >
      {!isPending && <DeleteIcon />}
    </Button>
  );
}

// ─── Status change button (for moving to review, scheduling, etc.) ────────────

interface StatusButtonProps {
  id: string;
  newStatus: string;
  label: string;
  onAction: (id: string, status: string) => Promise<ActionResult>;
}

export function StatusButton({
  id,
  newStatus,
  label,
  onAction,
}: StatusButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() =>
        startTransition(async () => {
          await onAction(id, newStatus);
        })
      }
      //   loading={isPending}
      disabled={isPending}
      className="text-xs text-ink-tertiary hover:text-ink-primary"
    >
      {label}
    </Button>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PublishIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function UnpublishIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  );
}

function DeleteIcon() {
  return (
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
  );
}
