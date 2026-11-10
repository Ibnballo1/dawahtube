"use client";
// src/features/admin/components/client/ApproveRecordingButton.tsx

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveRecording,
  rejectRecording,
} from "@features/admin/actions/recording.actions";

// ─── Approve button ────────────────────────────────────────────────────────────

interface ApproveProps {
  recordingId: string;
  defaultTitle: string;
  scholarName: string | null;
}

export function ApproveRecordingButton({
  recordingId,
  defaultTitle,
  scholarName,
}: ApproveProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(defaultTitle);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  function handleApprove() {
    if (!title.trim()) {
      setError("Please enter a title for the lecture.");
      return;
    }
    setError("");

    startTransition(async () => {
      const result = await approveRecording(recordingId, title.trim());
      if (!result.ok) {
        setError(result.error ?? "Failed to approve");
        return;
      }

      // Redirect to the new draft lecture for editing
      router.push(`/admin/lectures/${result.data!.lectureId}`);
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Approve &amp; create lecture
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-card border border-border-default rounded-2xl shadow-lg w-full max-w-md p-6 flex flex-col gap-5">
        <div>
          <h2 className="font-display font-bold text-lg text-ink-primary">
            Approve recording
          </h2>
          <p className="text-sm text-ink-muted mt-1">
            This will create a draft lecture
            {scholarName && (
              <>
                {" "}
                for <strong>{scholarName}</strong>
              </>
            )}
            . You can edit all details before publishing.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="lecture-title"
            className="text-xs font-medium text-ink-secondary"
          >
            Lecture title <span className="text-red-500">*</span>
          </label>
          <input
            id="lecture-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter the lecture title…"
            autoFocus
            className="w-full h-11 px-4 rounded-xl text-sm border border-border-emphasis bg-surface-card text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/15 transition-colors"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setError("");
            }}
            disabled={isPending}
            className="px-4 py-2 rounded-xl text-sm font-medium text-ink-muted border border-border-default hover:text-ink-primary hover:border-border-emphasis transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={isPending || !title.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors disabled:opacity-40"
          >
            {isPending && (
              <svg
                className="animate-spin"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
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
            )}
            Approve &amp; create draft
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reject button ────────────────────────────────────────────────────────────

export function RejectRecordingButton({
  recordingId,
}: {
  recordingId: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleReject() {
    startTransition(async () => {
      await rejectRecording(recordingId, reason.trim());
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border-default text-ink-muted hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors"
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
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        Reject
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-card border border-border-default rounded-2xl shadow-lg w-full max-w-md p-6 flex flex-col gap-5">
        <div>
          <h2 className="font-display font-bold text-lg text-ink-primary">
            Reject recording
          </h2>
          <p className="text-sm text-ink-muted mt-1">
            Optionally provide a reason. The recorder will not be notified
            automatically.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="reject-reason"
            className="text-xs font-medium text-ink-secondary"
          >
            Reason (optional)
          </label>
          <textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="e.g. Poor audio quality, wrong scholar, duplicate…"
            className="w-full px-4 py-3 rounded-xl text-sm border border-border-emphasis bg-surface-card text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/15 transition-colors resize-none"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="px-4 py-2 rounded-xl text-sm font-medium text-ink-muted border border-border-default hover:text-ink-primary hover:border-border-emphasis transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-40"
          >
            {isPending && (
              <svg
                className="animate-spin"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
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
            )}
            Reject recording
          </button>
        </div>
      </div>
    </div>
  );
}
