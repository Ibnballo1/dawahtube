// src/app/not-found.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@shared/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-20">
      {/* Arabic "404" — playful but on-brand */}
      <p
        className="font-arabic text-[8rem] leading-none text-primary-100 select-none mb-6"
        aria-hidden="true"
        dir="rtl"
        lang="ar"
      >
        ٤٠٤
      </p>

      <h1 className="font-display font-bold text-3xl text-ink-primary mb-3">
        Page not found
      </h1>

      <p className="text-ink-tertiary text-md max-w-[42ch] leading-relaxed mb-8">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved. Use the links below to find what you need.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/">
          <Button>Return home</Button>
        </Link>
        <Link href="/lectures">
          <Button variant="secondary">Browse lectures</Button>
        </Link>
      </div>

      {/* Quick nav */}
      <nav
        className="mt-12 flex flex-wrap gap-x-6 gap-y-2 justify-center text-sm text-ink-muted"
        aria-label="Quick navigation"
      >
        {[
          { label: "Lectures", href: "/lectures" },
          { label: "Articles", href: "/articles" },
          { label: "Library", href: "/library" },
          { label: "Scholars", href: "/scholars" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hover:text-primary-700 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
