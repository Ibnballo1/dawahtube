// drizzle.config.ts  (root — only used by CLI, never bundled)
import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// Load environment variables from .env into process.env for the CLI
dotenv.config();

export default defineConfig({
  schema: "./src/core/database/schema/index.ts",
  out: "./src/core/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED!, // Direct connection bypasses PgBouncer
  },
  verbose: true,
  strict: true,
});
