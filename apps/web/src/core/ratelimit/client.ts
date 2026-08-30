// src/core/ratelimit/client.ts
//
// Rate limiting via Upstash Redis (free tier — 10k requests/day).
// Falls back gracefully when env vars are not set (local dev works without Redis).
//
// Install: pnpm add @upstash/ratelimit @upstash/redis
// Env vars: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
//
// Usage in a route:
//   const rl = await rateLimit('api', req)
//   if (!rl.ok) return rl.response!

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

function createRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = createRedis();

const limiters = redis
  ? {
      // Public API — 60 requests/min per IP
      api: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        analytics: true,
        prefix: "rl:api",
      }),
      // Search — 20 requests/min per IP (more expensive query)
      search: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "1 m"),
        analytics: true,
        prefix: "rl:search",
      }),
      // Stream URL — 30 requests/min per IP (generates presigned URLs)
      stream: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, "1 m"),
        analytics: true,
        prefix: "rl:stream",
      }),
      // Auth — 10 requests/min per IP (brute force protection)
      auth: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        analytics: true,
        prefix: "rl:auth",
      }),
    }
  : null;

type LimiterKey = keyof NonNullable<typeof limiters>;

interface RateLimitResult {
  ok: boolean;
  response?: NextResponse;
  remaining?: number;
}

export async function rateLimit(
  key: LimiterKey,
  req: NextRequest,
): Promise<RateLimitResult> {
  // No Redis configured — allow all (local dev)
  if (!limiters) return { ok: true };

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1";

  const limiter = limiters[key];
  const { success, limit, remaining, reset } = await limiter.limit(ip);

  if (!success) {
    const retryAfterSecs = Math.ceil((reset - Date.now()) / 1000);
    return {
      ok: false,
      response: NextResponse.json(
        {
          ok: false,
          error: "Too many requests. Please slow down.",
          retryAfter: retryAfterSecs,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(reset),
            "Retry-After": String(retryAfterSecs),
            "Access-Control-Allow-Origin": "*",
          },
        },
      ),
    };
  }

  return { ok: true, remaining };
}
