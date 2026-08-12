// src/app/(auth)/forgot-password/page.tsx
import type { Metadata } from "next";
import { ForgotPasswordForm } from "@features/auth/components/client/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-display font-bold text-2xl text-ink-primary">
          Forgot your password?
        </h1>
        <p className="text-sm text-ink-tertiary">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="text-center text-sm text-ink-tertiary">
        Remembered it?{" "}
        <a
          href="/sign-in"
          className="font-medium text-primary-700 hover:text-primary-600 transition-colors"
        >
          Back to sign in
        </a>
      </p>
    </div>
  );
}
