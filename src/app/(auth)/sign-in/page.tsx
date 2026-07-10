// src/app/(auth)/sign-in/page.tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { getSession } from "@core/auth/config";
import { SignInForm } from "@features/auth/components/client/SignInForm";

export const metadata: Metadata = { title: "Sign in" };

interface SignInPageProps {
  searchParams: Promise<{ redirect?: string; error?: string; reset?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await getSession({ headers: await headers() }).catch(
    () => null,
  );
  if (session?.user) redirect("/");

  const params = await searchParams;
  const redirectTo = params.redirect ?? "/";
  const errorMessage =
    params.error === "unverified"
      ? "Please verify your email address before signing in."
      : params.error === "expired"
        ? "Your session expired. Please sign in again."
        : null;
  const successMessage =
    params.reset === "1"
      ? "Password updated successfully. Please sign in with your new password."
      : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-display font-bold text-2xl text-ink-primary">
          Welcome back
        </h1>
        <p className="text-sm text-ink-tertiary">
          Sign in to your Da&apos;wahTube account
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800"
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="rounded-lg bg-primary-50 border border-primary-200 px-4 py-3 text-sm text-primary-800"
        >
          {successMessage}
        </div>
      )}

      <SignInForm redirectTo={redirectTo} />

      <div className="flex flex-col items-center gap-2 text-sm text-ink-tertiary">
        <a
          href="/forgot-password"
          className="hover:text-primary-700 transition-colors"
        >
          Forgot your password?
        </a>
        <span>
          Don&apos;t have an account?{" "}
          <a
            href="/sign-up"
            className="font-medium text-primary-700 hover:text-primary-600 transition-colors"
          >
            Sign up
          </a>
        </span>
      </div>
    </div>
  );
}
