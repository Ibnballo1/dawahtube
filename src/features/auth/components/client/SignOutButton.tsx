"use client";
// src/features/auth/components/client/SignOutButton.tsx
//
// Reusable sign-out button. Accepts children so it can be used as:
//   <SignOutButton>Sign out</SignOutButton>
//   <SignOutButton className="..."><CustomIcon />Logout</SignOutButton>

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@core/auth/client";
import { cn } from "@shared/lib/utils";

interface SignOutButtonProps {
  children?: React.ReactNode;
  className?: string;
  redirectTo?: string;
}

export function SignOutButton({
  children = "Sign out",
  className,
  redirectTo = "/",
}: SignOutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await authClient.signOut();
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
    >
      {loading ? (
        <svg
          className="animate-spin"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeOpacity="0.25"
          />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
