// src/app/403/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@shared/components/ui/button";

export const metadata: Metadata = {
  title: "403 — Access denied",
  robots: { index: false },
};

export default function ForbiddenPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-20">
      <p
        className="font-arabic text-[8rem] leading-none text-primary-100 select-none mb-6"
        aria-hidden="true"
        dir="rtl"
        lang="ar"
      >
        ٤٠٣
      </p>

      <h1 className="font-display font-bold text-3xl text-ink-primary mb-3">
        Access denied
      </h1>

      <p className="text-ink-tertiary text-md max-w-[42ch] leading-relaxed mb-8">
        You don&apos;t have permission to view this page. If you believe this is
        a mistake, contact your administrator.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/">
          <Button>Return home</Button>
        </Link>
        <Link href="/account">
          <Button variant="secondary">My account</Button>
        </Link>
      </div>
    </div>
  );
}
