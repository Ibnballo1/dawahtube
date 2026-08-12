"use client";
// src/features/auth/components/client/ForgotPasswordForm.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@core/auth/client";
import { Button } from "@shared/components/ui/button";
import { Input, FieldGroup } from "@shared/components/ui/input";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "../../schemas/auth.schemas";

type FormStatus = "idle" | "loading" | "success" | "error";

export function ForgotPasswordForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setServerError(null);
    setStatus("loading");

    const result = await authClient.requestPasswordReset({
      email: data.email,
      redirectTo: "/reset-password",
    });

    if (result.error) {
      setServerError("Something went wrong. Please try again.");
      setStatus("error");
      return;
    }

    // Always show success — never reveal whether an email exists (security)
    setSentTo(data.email);
    setStatus("success");
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
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="font-display font-bold text-xl text-ink-primary">
            Check your inbox
          </h2>
          <p className="text-sm text-ink-tertiary leading-relaxed max-w-[34ch] mx-auto">
            If{" "}
            <span className="font-semibold text-ink-secondary">{sentTo}</span>{" "}
            is registered, you&apos;ll receive a password reset link shortly.
          </p>
          <p className="text-xs text-ink-muted mt-1">
            Check your spam folder if it doesn&apos;t arrive within a few
            minutes.
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
      aria-label="Password reset form"
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
        htmlFor="forgot-email"
        required
        error={errors.email?.message ?? ""}
      >
        <Input
          id="forgot-email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="you@example.com"
          error={!!errors.email}
          {...register("email")}
        />
      </FieldGroup>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting || status === "loading"}
        className="w-full"
      >
        {isSubmitting || status === "loading"
          ? "Sending..."
          : "Send reset link"}
      </Button>
    </form>
  );
}
