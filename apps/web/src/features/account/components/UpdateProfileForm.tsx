"use client";
// src/features/account/components/UpdateProfileForm.tsx

import { useState, useTransition } from "react";
import { authClient } from "@core/auth/client";

const inputCls = [
  "w-full h-11 px-4 rounded-xl text-sm",
  "border border-border-emphasis bg-surface-card text-ink-primary",
  "placeholder:text-ink-muted",
  "focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/15",
  "transition-colors disabled:opacity-50",
].join(" ");

interface Props {
  currentName: string;
  currentEmail: string;
}

export function UpdateProfileForm({ currentName, currentEmail }: Props) {
  const [name, setName] = useState(currentName);
  const [email, setEmail] = useState(currentEmail);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name === currentName && email === currentEmail) return;

    setStatus("idle");
    setMessage("");

    startTransition(async () => {
      try {
        if (name !== currentName) {
          const result = await authClient.updateUser({
            name: name.trim() || undefined,
          });

          if (result.error) {
            setStatus("error");
            setMessage(result.error.message ?? "Failed to update profile.");
            return;
          }
        }

        if (email.trim() !== currentEmail) {
          const result = await authClient.changeEmail({
            newEmail: email.trim(),
          });

          if (result.error) {
            setStatus("error");
            setMessage(result.error.message ?? "Failed to update profile.");
            return;
          }
        }

        setStatus("success");
        setMessage(
          email !== currentEmail
            ? "Profile updated. Check your new email address for a verification link."
            : "Profile updated successfully.",
        );

        // Reload to reflect name change in the header
        if (name !== currentName) {
          setTimeout(() => window.location.reload(), 1500);
        }
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
          htmlFor="name"
          className="text-xs font-medium text-ink-secondary"
        >
          Full name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isPending}
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-xs font-medium text-ink-secondary"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isPending}
          className={inputCls}
        />
        {email !== currentEmail && (
          <p className="text-xs text-amber-700">
            You will need to verify your new email address.
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={
            isPending || (name === currentName && email === currentEmail)
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
          Save changes
        </button>
      </div>
    </form>
  );
}
