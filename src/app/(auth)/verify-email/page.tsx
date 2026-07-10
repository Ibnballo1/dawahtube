// src/app/(auth)/verify-email/page.tsx
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Verify your email",
};

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string; error?: string }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;

  // BetterAuth handles token verification via its API route.
  // This page is the landing page AFTER the user clicks the email link.
  // The token has already been consumed by the time this page renders —
  // BetterAuth redirects here with ?error= if verification fails.

  if (params.error) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="size-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
          <ErrorIcon />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-display font-bold text-2xl text-ink-primary">
            Verification failed
          </h1>
          <p className="text-sm text-ink-tertiary leading-relaxed max-w-[34ch] mx-auto">
            {params.error === "expired"
              ? "Your verification link has expired. Please request a new one."
              : params.error === "invalid"
                ? "This verification link is invalid or has already been used."
                : "Something went wrong. Please try again."}
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/sign-in"
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Return to sign in
          </Link>
        </div>
      </div>
    );
  }

  // Success — verification was completed
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="size-16 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-700">
        <CheckIcon />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-display font-bold text-2xl text-ink-primary">
          Email verified
        </h1>
        <p className="text-sm text-ink-tertiary leading-relaxed max-w-[34ch] mx-auto">
          Your email address has been verified. You can now sign in to
          Da&apos;wahTube.
        </p>
      </div>
      {/* <Button asChild size="lg" className="w-full"> */}
      <Link
        href="/sign-in"
        className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Sign in to your account
      </Link>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
