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
