// drizzle.config.ts  (root — only used by CLI, never bundled)
import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// Load environment variables from .env into process.env for the CLI
dotenv.config();

if (!process.env.DATABASE_URL_UNPOOLED) {
  throw new Error(
    "DATABASE_URL_UNPOOLED is required for drizzle-kit. Check .env.local",
  );
}

export default defineConfig({
  schema: "./src/core/database/schema/index.ts",
  out: "./src/core/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED!, // Direct connection bypasses PgBouncer
  },
  verbose: true,
  strict: true,

  // Include custom SQL migration files (like 0002_search_and_indexes.sql)
  // drizzle-kit applies all .sql files in the migrations directory in order
  migrations: {
    table: "__drizzle_migrations", // tracking table name
    schema: "public",
  },
});
