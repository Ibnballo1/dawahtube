"use client";
// src/app/error.tsx
// Catches unhandled errors in the (public) layout tree.
// Must be a Client Component (Next.js requirement for error boundaries).

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@shared/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to your error monitoring service here
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-20">
      <div
        aria-hidden="true"
        className="size-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-6"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h1 className="font-display font-bold text-2xl text-ink-primary mb-3">
        Something went wrong
      </h1>

      <p className="text-ink-tertiary max-w-[42ch] leading-relaxed mb-8">
        An unexpected error occurred. Please try again, or return to the
        homepage.
      </p>

      {process.env.NODE_ENV === "development" && error.message && (
        <pre className="mb-6 text-xs text-left bg-red-50 border border-red-200 rounded-lg p-4 max-w-xl overflow-auto text-red-800">
          {error.message}
          {error.digest && `\n\nDigest: ${error.digest}`}
        </pre>
      )}

      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={reset}>Try again</Button>
        <Link href="/">
          <Button variant="secondary">Return home</Button>
        </Link>
      </div>
    </div>
  );
}
