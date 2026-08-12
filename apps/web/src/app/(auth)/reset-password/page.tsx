// src/app/(auth)/reset-password/page.tsx
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@features/auth/components/client/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set new password",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string; error?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;

  // If no token, redirect to forgot-password to start over
  if (!params.token) {
    redirect("/forgot-password");
  }

  if (params.error === "expired") {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="size-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
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
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-display font-bold text-2xl text-ink-primary">
            Link expired
          </h1>
          <p className="text-sm text-ink-tertiary max-w-[34ch] mx-auto">
            This password reset link has expired. Please request a new one.
          </p>
        </div>
        <a
          href="/forgot-password"
          className="text-primary-700 hover:text-primary-600 font-medium text-sm transition-colors"
        >
          Request new reset link
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-display font-bold text-2xl text-ink-primary">
          Set new password
        </h1>
        <p className="text-sm text-ink-tertiary">
          Choose a strong password for your account
        </p>
      </div>

      <ResetPasswordForm token={params.token} />
    </div>
  );
}
