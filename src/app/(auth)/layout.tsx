// src/app/(auth)/layout.tsx
//
// Shared layout for all authentication pages.
// Routes: /sign-in, /sign-up, /forgot-password, /reset-password, /verify-email
//
// Uses a route group (auth) so these pages share the centered shell
// layout without affecting the URL structure — /sign-in not /(auth)/sign-in.

import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-subtle flex flex-col">
      {/* Minimal header — no full SiteNav during auth flows */}
      <header className="h-16 flex items-center px-6 border-b border-border-subtle bg-surface-base">
        <Link
          href="/"
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 rounded-md"
          aria-label="Da'wahTube — Return to home"
        >
          {/* Logo mark */}
          <div className="size-7 rounded-md bg-primary-700 flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 28 28"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M14 4L16.2 10.5H23L17.4 14.5L19.6 21L14 17L8.4 21L10.6 14.5L5 10.5H11.8L14 4Z"
                fill="#D4AF37"
              />
            </svg>
          </div>
          <span className="font-display font-bold text-base text-ink-primary leading-none">
            Da&apos;wahTube
          </span>
        </Link>
      </header>

      {/* Centered content area */}
      <main
        id="main-content"
        className="flex-1 flex items-center justify-center px-4 py-12"
      >
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Minimal footer */}
      <footer className="py-4 text-center text-xs text-ink-muted border-t border-border-subtle">
        © {new Date().getFullYear()} Da&apos;wahTube · All rights reserved
      </footer>
    </div>
  );
}
