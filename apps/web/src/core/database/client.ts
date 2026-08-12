// src/core/database/client.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../config/env";
import * as schema from "./schema";

// Pooled client — used by all Server Actions and Route Handlers
const pooledClient = postgres(env.DATABASE_URL, {
  max: 10, // PgBouncer handles pooling; keep app pool small
  idle_timeout: 20,
  connect_timeout: 10,
});

// Direct client — used ONLY by drizzle-kit (not imported by app code)
// Defined in drizzle.config.ts, not here.

export const db = drizzle(pooledClient, {
  schema,
  logger: env.NODE_ENV === "development",
});
export type Database = typeof db;
