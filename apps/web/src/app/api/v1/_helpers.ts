// src/app/api/v1/_helpers.ts
//
// Shared utilities for all /api/v1/ route handlers.
// Keeps individual route files concise.

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import auth from "@core/auth/config";

// ─── Standard response shapes ─────────────────────────────────────────────────

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function paginated<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
) {
  return NextResponse.json({
    ok: true,
    data: items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

// ─── CORS headers ─────────────────────────────────────────────────────────────
// Mobile app runs on a different origin — allow it.

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Session-Token",
};

export function withCors(response: NextResponse): NextResponse {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => response.headers.set(k, v));
  return response;
}

// ─── OPTIONS handler (preflight) ──────────────────────────────────────────────

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ─── Parse pagination params ──────────────────────────────────────────────────

export function parsePagination(
  searchParams: URLSearchParams,
  defaultLimit = 20,
  maxLimit = 50,
) {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    maxLimit,
    Math.max(
      1,
      parseInt(searchParams.get("limit") ?? String(defaultLimit), 10),
    ),
  );
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// ─── Get current session from request ────────────────────────────────────────
// Mobile app sends session token in Authorization header as:
//   Authorization: Bearer <token>
// or in X-Session-Token header.

export async function getSessionFromRequest(
  req: NextRequest,
): Promise<{ userId: string; role: string } | null> {
  try {
    // Try Authorization header first (mobile app)
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.headers.get("x-session-token");

    if (token) {
      // BetterAuth validates the token via its API
      const session = await auth.api
        .getSession({
          headers: new Headers({
            cookie: `better-auth.session_token=${token}`,
          }),
        })
        .catch(() => null);

      if (session?.user) {
        return {
          userId: session.user.id,
          role: (session.user as { role?: string }).role ?? "reader",
        };
      }
    }

    // Fallback: try cookie-based session (web requests)
    const session = await auth.api
      .getSession({ headers: await headers() })
      .catch(() => null);

    if (session?.user) {
      return {
        userId: session.user.id,
        role: (session.user as { role?: string }).role ?? "reader",
      };
    }

    return null;
  } catch {
    return null;
  }
}

// ─── Require authentication ───────────────────────────────────────────────────

export async function requireAuth(
  req: NextRequest,
): Promise<{ userId: string; role: string } | NextResponse> {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return err("Authentication required", 401);
  }
  return session;
}
