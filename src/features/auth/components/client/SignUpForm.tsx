"use client";
// src/features/auth/components/client/SignUpForm.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@core/auth/client";
import { Button } from "@shared/components/ui/button";
import { Input, FieldGroup } from "@shared/components/ui/input";
import { cn } from "@shared/lib/utils";
import { signUpSchema, type SignUpInput } from "../../schemas/auth.schemas";

type FormStatus = "idle" | "loading" | "success" | "error";

export function SignUpForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const password = watch("password", "");

  async function onSubmit(data: SignUpInput) {
    setServerError(null);
    setStatus("loading");

    const result = await authClient.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    if (result.error) {
      const message = (() => {
        switch (result.error.code) {
          case "USER_ALREADY_EXISTS":
            return "An account with this email address already exists. Try signing in.";
          case "PASSWORD_TOO_SHORT":
            return "Password must be at least 10 characters.";
          case "INVALID_EMAIL":
            return "Please enter a valid email address.";
          default:
            return "Something went wrong creating your account. Please try again.";
        }
      })();
      setServerError(message);
      setStatus("error");
      return;
    }

    setRegisteredEmail(data.email);
    setStatus("success");
  }

  // ── Success state — prompt user to check email ──────────────────────────
  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-5 text-center py-4">
        <div className="size-16 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-700">
          <EmailIcon />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="font-display font-bold text-xl text-ink-primary">
            Check your inbox
          </h2>
          <p className="text-sm text-ink-tertiary leading-relaxed max-w-[34ch] mx-auto">
            We&apos;ve sent a verification link to{" "}
            <span className="font-semibold text-ink-secondary">
              {registeredEmail}
            </span>
            . Click the link to activate your account.
          </p>
        </div>
        <p className="text-xs text-ink-muted">
          Didn&apos;t receive it? Check your spam folder, or{" "}
          <button
            type="button"
            className="text-primary-700 hover:underline"
            onClick={() => {
              setStatus("idle");
              setServerError(null);
            }}
          >
            try again
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
      aria-label="Create account form"
    >
      {/* Server error */}
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
        </div>
      )}

      {/* Full name */}
      <FieldGroup
        label="Full name"
        htmlFor="signup-name"
        required
        error={errors.name?.message ?? ""}
      >
        <Input
          id="signup-name"
          type="text"
          autoComplete="name"
          autoFocus
          placeholder="Your full name"
          error={!!errors.name}
          {...register("name")}
        />
      </FieldGroup>

      {/* Email */}
      <FieldGroup
        label="Email address"
        htmlFor="signup-email"
        required
        error={errors.email?.message ?? ""}
      >
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={!!errors.email}
          {...register("email")}
        />
      </FieldGroup>

      {/* Password */}
      <FieldGroup
        label="Password"
        htmlFor="signup-password"
        required
        error={errors.password?.message ?? ""}
        hint="At least 10 characters, one uppercase letter, one number"
      >
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a strong password"
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

        {/* Password strength meter */}
        {password.length > 0 && <PasswordStrengthMeter password={password} />}
      </FieldGroup>

      {/* Confirm password */}
      <FieldGroup
        label="Confirm password"
        htmlFor="signup-confirm"
        required
        error={errors.confirmPassword?.message ?? ""}
      >
        <Input
          id="signup-confirm"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repeat your password"
          error={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
      </FieldGroup>

      {/* Terms notice */}
      <p className="text-xs text-ink-muted leading-relaxed">
        By creating an account, you agree to our{" "}
        <a href="/terms" className="text-primary-700 hover:underline">
          Terms of Use
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-primary-700 hover:underline">
          Privacy Policy
        </a>
        .
      </p>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting || status === "loading"}
        className="w-full"
      >
        Create account
      </Button>
    </form>
  );
}

// ─── Password strength meter ──────────────────────────────────────────────────

function getPasswordStrength(password: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  colour: string;
} {
  let score = 0;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "Very weak", colour: "bg-red-500" },
    { label: "Weak", colour: "bg-orange-400" },
    { label: "Fair", colour: "bg-yellow-400" },
    { label: "Good", colour: "bg-primary-500" },
    { label: "Strong", colour: "bg-primary-700" },
  ];

  return { score: score as 0 | 1 | 2 | 3 | 4, ...levels[score]! };
}

function PasswordStrengthMeter({ password }: { password: string }) {
  const { score, label, colour } = getPasswordStrength(password);

  return (
    <div
      className="flex flex-col gap-1.5 mt-2"
      role="status"
      aria-live="polite"
      aria-label={`Password strength: ${label}`}
    >
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-normal",
              i < score ? colour : "bg-border-emphasis",
            )}
          />
        ))}
      </div>
      <span className="text-xs text-ink-muted">{label}</span>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

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

function EmailIcon() {
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
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
