// src/core/config/env.ts
//
// Single source of truth for all environment variables.
// Validated at startup — the app crashes immediately with a clear error
// if a required variable is missing, rather than failing silently at runtime.
//
// Pattern: import { env } from '@core/config/env'
// Never use process.env directly outside this file.

import { z } from "zod";

const envSchema = z.object({
  // ── Runtime ──────────────────────────────────────────────────────────────
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // ── App ───────────────────────────────────────────────────────────────────
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().default("Da'wahTube"),

  // ── Database ──────────────────────────────────────────────────────────────
  // Pooled: used by all Server Actions and Route Handlers (via PgBouncer)
  DATABASE_URL: z.string().min(1),
  // Direct: used by drizzle-kit only — bypasses PgBouncer for migrations
  DATABASE_URL_UNPOOLED: z.string().min(1),

  // ── Authentication ────────────────────────────────────────────────────────
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),

  // ── Cloudflare R2 ─────────────────────────────────────────────────────────
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_MEDIA: z.string().default("dawahtube-media"),
  R2_BUCKET_UPLOADS: z.string().default("dawahtube-uploads"),
  R2_BUCKET_BOOKS: z.string().default("dawahtube-books"),
  R2_PUBLIC_URL: z.string().url(), // CDN domain for public bucket

  // ── Search ────────────────────────────────────────────────────────────────
  SEARCH_PROVIDER: z.enum(["postgres"]).default("postgres"),
  DEFAULT_SEARCH_LANGUAGE: z
    .enum(["en", "ar", "ha", "yo", "fr", "simple"])
    .default("en"),

  // ── Cron security ─────────────────────────────────────────────────────────
  // Vercel sets this automatically; include here for local testing
  CRON_SECRET: z.string().min(16).optional(),
});

// Parse and validate — throws ZodError with field-level messages if invalid
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const missing = parsed.error.issues
    .map((i) => `  ${i.path.join(".")}: ${i.message}`)
    .join("\n");

  throw new Error(
    `\n❌ Invalid environment variables:\n${missing}\n\nCheck .env.local against .env.example\n`,
  );
}

export const env = parsed.data;

// Type export for use in other files
export type Env = typeof env;
