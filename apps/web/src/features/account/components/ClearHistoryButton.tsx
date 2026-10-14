"use client";

// src/features/account/components/ClearHistoryButton.tsx

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { clearListeningHistory } from "../actions/history-bookmark.actions";

export function ClearHistoryButton() {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="px-4 py-2 rounded-xl text-sm font-medium border border-border-default text-ink-muted hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors"
      >
        Clear history
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-ink-muted">Are you sure?</span>
      <button
        type="button"
        onClick={() => {
          startTransition(async () => {
            await clearListeningHistory();
            router.refresh();
            setConfirming(false);
          });
        }}
        disabled={isPending}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-40"
      >
        {isPending ? "Clearing…" : "Yes, clear"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="px-3 py-1.5 rounded-lg text-xs font-medium text-ink-muted border border-border-default hover:text-ink-primary transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
