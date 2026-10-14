"use client";
// src/features/account/components/UpdatePasswordForm.tsx

import { useState, useTransition } from "react";
import { authClient } from "@core/auth/client";

const inputCls = [
  "w-full h-11 px-4 rounded-xl text-sm",
  "border border-border-emphasis bg-surface-card text-ink-primary",
  "placeholder:text-ink-muted",
  "focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/15",
  "transition-colors disabled:opacity-50",
].join(" ");

export function UpdatePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const mismatch = next && confirm && next !== confirm;
  const weak = next && next.length < 8;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mismatch || weak) return;

    setStatus("idle");
    setMessage("");

    startTransition(async () => {
      try {
        const result = await authClient.changePassword({
          currentPassword: current,
          newPassword: next,
          revokeOtherSessions: true, // sign out other devices on password change
        });

        if (result.error) {
          setStatus("error");
          setMessage(
            result.error.message?.includes("incorrect")
              ? "Current password is incorrect."
              : (result.error.message ?? "Failed to change password."),
          );
          return;
        }

        setStatus("success");
        setMessage(
          "Password changed successfully. Other sessions have been signed out.",
        );
        setCurrent("");
        setNext("");
        setConfirm("");
      } catch {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {status === "success" && (
        <div
          role="status"
          className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 flex items-center gap-2"
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
          {message}
        </div>
      )}
      {status === "error" && (
        <div
          role="alert"
          className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800"
        >
          {message}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="current-password"
          className="text-xs font-medium text-ink-secondary"
        >
          Current password
        </label>
        <input
          id="current-password"
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
          autoComplete="current-password"
          disabled={isPending}
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="new-password"
          className="text-xs font-medium text-ink-secondary"
        >
          New password
        </label>
        <input
          id="new-password"
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          required
          autoComplete="new-password"
          minLength={8}
          disabled={isPending}
          className={inputCls}
        />
        {weak && (
          <p className="text-xs text-amber-700">
            Password must be at least 8 characters.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="confirm-password"
          className="text-xs font-medium text-ink-secondary"
        >
          Confirm new password
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          disabled={isPending}
          className={inputCls}
        />
        {mismatch && (
          <p className="text-xs text-red-600">Passwords do not match.</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={
            isPending || !current || !next || !confirm || !!mismatch || !!weak
          }
          className="px-6 py-2.5 rounded-xl bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
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
          Change password
        </button>
      </div>
    </form>
  );
}
