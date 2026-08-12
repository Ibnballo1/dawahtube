// src/core/auth/edge.ts
import { NextRequest } from "next/server";

/**
 * Optimistically checks for a valid session token cookie at the edge
 * without initializing the heavy database or ORM frameworks.
 */
export function hasSession(req: NextRequest): boolean {
  return (
    req.cookies.has("better-auth.session_token") ||
    req.cookies.has("__Secure-better-auth.session_token")
  );
}
