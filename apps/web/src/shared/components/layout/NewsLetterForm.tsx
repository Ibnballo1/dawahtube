"use client";
// src/shared/components/layout/NewsletterForm.tsx

import { useState, useTransition } from "react";
import { cn } from "@shared/lib/utils";

export function NewsletterForm() {
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
          body: JSON.stringify({ email: email.trim() }),
        });
        const data = await res.json();

        if (data.ok) {
          if (data.alreadySubscribed) {
            setStatus("duplicate");
            setMessage("You're already subscribed — JazakAllahu Khayran!");
          } else {
            setStatus("success");
            setMessage("Subscribed! Check your inbox for a welcome email.");
            setEmail("");
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

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-white">
        Get notified of new lectures
      </p>
      <p className="text-xs text-white/60 leading-relaxed">
        New lectures and articles from trusted scholars, delivered to your
        inbox. No spam — unsubscribe anytime.
      </p>

      {status === "success" ? (
        <div className="flex items-center gap-2 text-sm text-green-400">
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
      ) : (
        <>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={isPending}
              className={cn(
                "flex-1 h-10 px-3 rounded-lg text-sm",
                "bg-white/10 text-white placeholder:text-white/40",
                "border border-white/20 focus:border-white/50",
                "focus:outline-none focus:ring-2 focus:ring-white/20",
                "transition-colors disabled:opacity-50",
              )}
            />
            <button
              type="submit"
              disabled={isPending || !email.trim()}
              className="h-10 px-4 rounded-lg text-sm font-semibold shrink-0 bg-accent-700 text-primary-950 hover:bg-accent-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? "…" : "Subscribe"}
            </button>
          </form>
          {(status === "error" || status === "duplicate") && (
            <p
              className={`text-xs ${status === "error" ? "text-red-400" : "text-green-400"}`}
            >
              {message}
            </p>
          )}
        </>
      )}
    </div>
  );
}
