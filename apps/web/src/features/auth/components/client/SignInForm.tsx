"use client";
// src/features/auth/components/client/SignInForm.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { authClient } from "@core/auth/client";
import { Button } from "@shared/components/ui/button";
import { Input, FieldGroup } from "@shared/components/ui/input";
import { signInSchema, type SignInInput } from "../../schemas/auth.schemas";

interface SignInFormProps {
  redirectTo: string;
}

export function SignInForm({ redirectTo }: SignInFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  async function onSubmit(data: SignInInput) {
    setServerError(null);
    const result = await authClient.signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: redirectTo,
    });
    if (result.error) {
      const message =
        result.error.code === "INVALID_EMAIL_OR_PASSWORD"
          ? "Incorrect email or password. Please try again."
          : result.error.code === "EMAIL_NOT_VERIFIED"
            ? "Please verify your email before signing in."
            : result.error.code === "TOO_MANY_REQUESTS"
              ? "Too many attempts. Please wait a few minutes."
              : "Something went wrong. Please try again.";
      setServerError(message);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
      aria-label="Sign in form"
    >
      {serverError && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800"
        >
          {serverError}
        </div>
      )}
      <FieldGroup
        label="Email address"
        htmlFor="signin-email"
        required
        {...(errors.email?.message ? { error: errors.email.message } : {})}
      >
        <Input
          id="signin-email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="you@example.com"
          error={!!errors.email}
          {...register("email")}
        />
      </FieldGroup>
      <FieldGroup
        label="Password"
        htmlFor="signin-password"
        required
        {...(errors.password?.message
          ? { error: errors.password.message }
          : {})}
      >
        <div className="relative">
          <Input
            id="signin-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Your password"
            error={!!errors.password}
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </FieldGroup>
      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full mt-1"
      >
        Sign in
      </Button>
    </form>
  );
}
