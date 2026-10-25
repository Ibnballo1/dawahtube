import { type NextRequest, type NextResponse } from "next/server";
import { requireAuth, withCors } from "../_helpers";
import { rateLimit } from "@/core/ratelimit/client";
import { NextResponse as NR } from "next/server";

export type AuthResult =
  { ok: true; userId: string } | { ok: false; response: NextResponse };

export async function authedUser(req: NextRequest): Promise<AuthResult> {
  try {
    const rl = await rateLimit("api", req);
    if (!rl.ok) return { ok: false, response: rl.response! };
  } catch (e) {
    console.warn("[RateLimit] skipped:", e);
  }
  const session = await requireAuth(req);
  if (session instanceof NR) return { ok: false, response: withCors(session) };
  return { ok: true, userId: session.userId };
}

/** Client clocks drift; never accept a timestamp from the future. */
export function clientDate(iso: string | undefined): Date {
  const now = new Date();
  if (!iso) return now;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) || d > now ? now : d;
}
