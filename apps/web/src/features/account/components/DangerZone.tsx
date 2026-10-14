"use client";
// src/features/account/components/DangerZone.tsx

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@core/auth/client";

interface Props {
  userId: string;
  userEmail: string;
}

export function DangerZone({ userId, userEmail }: Props) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // ── Sign out all other sessions ───────────────────────────────────────────

  function handleSignOutAll() {
    startTransition(async () => {
      await authClient.revokeOtherSessions();
      setError("");
    });
  }

  // ── Sign out everywhere including this session ─────────────────────────────

  function handleSignOutEverywhere() {
    startTransition(async () => {
      await authClient.signOut();
      router.push("/");
      router.refresh();
    });
  }

  // ── Delete account ────────────────────────────────────────────────────────

  function handleDeleteAccount() {
    if (confirmEmail !== userEmail) {
      setError("Email does not match. Please type your email address exactly.");
      return;
    }
    setError("");

    startTransition(async () => {
      try {
        const result = await authClient.deleteUser();
        if (result.error) {
          setError(result.error.message ?? "Failed to delete account.");
          return;
        }
        router.push("/?deleted=1");
        router.refresh();
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Sign out other sessions */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink-primary">
            Sign out other sessions
          </p>
          <p className="text-xs text-ink-muted mt-0.5">
            Revoke access from all other devices and browsers. This session will
            remain active.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOutAll}
          disabled={isPending}
          className="shrink-0 px-4 py-2 rounded-xl text-sm font-medium border border-border-default text-ink-secondary hover:border-border-emphasis hover:text-ink-primary transition-colors disabled:opacity-40"
        >
          Sign out others
        </button>
      </div>

      {/* Sign out everywhere */}
      <div className="flex items-start justify-between gap-4 pt-4 border-t border-border-subtle">
        <div>
          <p className="text-sm font-medium text-ink-primary">
            Sign out everywhere
          </p>
          <p className="text-xs text-ink-muted mt-0.5">
            Sign out from all devices including this one.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOutEverywhere}
          disabled={isPending}
          className="shrink-0 px-4 py-2 rounded-xl text-sm font-medium border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-40"
        >
          Sign out all
        </button>
      </div>

      {/* Delete account */}
      <div className="pt-4 border-t border-border-subtle">
        {!showDeleteConfirm ? (
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-red-600">Delete account</p>
              <p className="text-xs text-ink-muted mt-0.5">
                Permanently delete your account and all associated data. This
                cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="shrink-0 px-4 py-2 rounded-xl text-sm font-medium border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete account
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 bg-red-50 border border-red-200 rounded-xl p-5">
            <div>
              <p className="text-sm font-semibold text-red-800">
                Are you absolutely sure?
              </p>
              <p className="text-xs text-red-700 mt-1 leading-relaxed">
                This will permanently delete your account, bookmarks, and
                listening history. This action cannot be undone.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirm-email"
                className="text-xs font-medium text-red-800"
              >
                Type your email address to confirm: <strong>{userEmail}</strong>
              </label>
              <input
                id="confirm-email"
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder={userEmail}
                disabled={isPending}
                className="w-full h-10 px-3 rounded-lg text-sm border border-red-300 bg-white text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/15 transition-colors disabled:opacity-50"
              />
            </div>

            {error && <p className="text-xs text-red-700">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isPending || confirmEmail !== userEmail}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
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
                Yes, delete my account
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setConfirmEmail("");
                  setError("");
                }}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-sm font-medium text-ink-muted border border-border-default hover:text-ink-primary hover:border-border-emphasis transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
