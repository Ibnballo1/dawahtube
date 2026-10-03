"use client";
// src/features/newsletter/NewsletterFormLight.tsx
// Light-background newsletter form for the /newsletter page.
// Uses the same /api/newsletter endpoint as the footer form.

import { useState, useTransition } from "react";
import { cn } from "@shared/lib/utils";

const inputCls = [
  "w-full h-11 px-4 rounded-xl text-sm",
  "border border-border-emphasis bg-surface-card text-ink-primary",
  "placeholder:text-ink-muted",
  "focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/15",
  "transition-colors disabled:opacity-50",
].join(" ");

export function NewsletterFormLight() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "success" | "error" | "duplicate"
  >("idle");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("idle");
    setMessage("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            name: name.trim() || undefined,
          }),
        });
        const data = await res.json();

        if (data.ok) {
          if (data.alreadySubscribed) {
            setStatus("duplicate");
            setMessage("You're already subscribed — JazakAllahu Khayran!");
          } else {
            setStatus("success");
            setMessage(
              "Subscribed successfully! Check your inbox for a welcome email.",
            );
            setEmail("");
            setName("");
          }
        } else {
          setStatus("error");
          setMessage(data.error ?? "Something went wrong. Please try again.");
        }
      } catch {
        setStatus("error");
        setMessage("Could not connect. Please try again.");
      }
    });
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="size-14 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <p className="font-display font-semibold text-lg text-ink-primary">
            JazakAllahu Khayran!
          </p>
          <p className="text-ink-muted text-sm mt-1">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {/* Status messages */}
      {(status === "error" || status === "duplicate") && (
        <div
          role="alert"
          className={cn(
            "rounded-lg px-4 py-3 text-sm",
            status === "error"
              ? "bg-red-50 border border-red-200 text-red-800"
              : "bg-green-50 border border-green-200 text-green-800",
          )}
        >
          {message}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="nl-name"
          className="text-xs font-medium text-ink-secondary"
        >
          Your name (optional)
        </label>
        <input
          id="nl-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Abdullahi Musa"
          disabled={isPending}
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="nl-email"
          className="text-xs font-medium text-ink-secondary"
        >
          Email address{" "}
          <span aria-hidden="true" className="text-red-500">
            *
          </span>
        </label>
        <input
          id="nl-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={isPending}
          className={inputCls}
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !email.trim()}
        className={cn(
          "w-full h-11 rounded-xl text-sm font-semibold transition-colors",
          "bg-primary-700 text-white hover:bg-primary-800",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "flex items-center justify-center gap-2",
        )}
      >
        {isPending ? (
          <>
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
            Subscribing…
          </>
        ) : (
          "Subscribe — it's free"
        )}
      </button>
    </form>
  );
}
