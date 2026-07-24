// src/core/auth/server.ts
//
// Convenience wrappers for accessing auth state in Server Components
// and Server Actions. Always import from here, not directly from config,
// so we have a single point to extend with caching or logging later.

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import auth from "./config";
import type { Session, User } from "./config";

// ─── getSession ───────────────────────────────────────────────────────────────
// Use in Server Components and layouts.
// Returns null if not authenticated (never throws).

export async function getSession(): Promise<Session | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session;
  } catch {
    return null;
  }
}

// ─── getCurrentUser ───────────────────────────────────────────────────────────
// Returns just the user object, or null.

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}

// ─── requireAuth ─────────────────────────────────────────────────────────────
// Use in Server Actions and protected Server Components.
// Redirects to sign-in if not authenticated.

export async function requireAuth(redirectTo?: string): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    const params = redirectTo
      ? `?redirect=${encodeURIComponent(redirectTo)}`
      : "";
    redirect(`/sign-in${params}`);
  }

  return user;
}

// ─── requireEmailVerified ─────────────────────────────────────────────────────
// Use where email verification is mandatory before proceeding.

export async function requireEmailVerified(): Promise<User> {
  const user = await requireAuth();

  if (!user.emailVerified) {
    redirect("/sign-in?error=unverified");
  }

  return user;
}

// ─── isAdmin ──────────────────────────────────────────────────────────────────
// Quick role check — for full permission checks use guard.ts

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  const role = user.role ?? "";
  return ["super_admin", "admin", "editor"].includes(role);
}
