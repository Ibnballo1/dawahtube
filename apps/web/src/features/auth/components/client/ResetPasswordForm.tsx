"use client";
// src/features/auth/components/client/ResetPasswordForm.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { authClient } from "@core/auth/client";
import { Button } from "@shared/components/ui/button";
import { Input, FieldGroup } from "@shared/components/ui/input";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "../../schemas/auth.schemas";

interface ResetPasswordFormProps {
  token: string;
}

type FormStatus = "idle" | "loading" | "success" | "error";

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<FormStatus>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(data: ResetPasswordInput) {
    setServerError(null);
    setStatus("loading");

    const result = await authClient.resetPassword({
      newPassword: data.password,
      token,
    });

    if (result.error) {
      const message =
        result.error.code === "INVALID_TOKEN" ||
        result.error.code === "TOKEN_EXPIRED"
          ? "This reset link is invalid or has expired. Please request a new one."
          : "Something went wrong. Please try again.";
      setServerError(message);
      setStatus("error");
      return;
    }

    setStatus("success");
    // Brief pause so user sees the success message, then redirect
    setTimeout(() => router.push("/sign-in?reset=1"), 2000);
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-5 text-center py-4">
        <div className="size-16 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-700">
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
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="font-display font-bold text-xl text-ink-primary">
            Password updated
          </h2>
          <p className="text-sm text-ink-tertiary">
            Your password has been changed. Redirecting you to sign in…
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
      aria-label="Set new password form"
    >
      {serverError && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 flex items-start gap-2"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0 mt-0.5"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {serverError}
          {serverError.includes("expired") && (
            <a
              href="/forgot-password"
              className="ml-auto text-primary-700 hover:underline font-medium shrink-0"
            >
              Get new link
            </a>
          )}
        </div>
      )}

      <FieldGroup
        label="New password"
        htmlFor="reset-password"
        required
        hint="At least 10 characters, one uppercase letter, one number"
        {...(errors.password?.message
          ? { error: errors.password.message }
          : {})}
      >
        <div className="relative">
          <Input
            id="reset-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            autoFocus
            placeholder="Your new password"
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
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </FieldGroup>

      <FieldGroup
        label="Confirm new password"
        htmlFor="reset-confirm"
        required
        {...(errors.confirmPassword?.message
          ? { error: errors.confirmPassword.message }
          : {})}
      >
        <Input
          id="reset-confirm"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repeat your new password"
          error={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
      </FieldGroup>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting || status === "loading"}
        className="w-full"
      >
        Update password
      </Button>
    </form>
  );
}

function EyeIcon() {
  return (
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
  );
}

function EyeOffIcon() {
  return (
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
  );
}
