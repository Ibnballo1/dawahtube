// src/app/(auth)/sign-up/page.tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import auth from "@core/auth/config";
import { SignUpForm } from "@features/auth/components/client/SignUpForm";

export const metadata: Metadata = {
  title: "Create an account",
};

export default async function SignUpPage() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);
  if (session?.user) redirect("/");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-display font-bold text-2xl text-ink-primary">
          Create your account
        </h1>
        <p className="text-sm text-ink-tertiary">
          Join Da&apos;wahTube and access the full library of Islamic knowledge
        </p>
      </div>

      <SignUpForm />

      <p className="text-center text-sm text-ink-tertiary">
        Already have an account?{" "}
        <a
          href="/sign-in"
          className="font-medium text-primary-700 hover:text-primary-600 transition-colors"
        >
          Sign in
        </a>
      </p>
    </div>
  );
}
