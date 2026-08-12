import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL_UNPOOLED;

if (!connectionString) {
  throw new Error("DATABASE_URL_UNPOOLED is missing in .env");
}

async function run() {
  console.log("⏳ Running migrations...");

  const sql = postgres(connectionString!, {
    max: 1,
    ssl: "require",
    connect_timeout: 30,
  });

  const db = drizzle(sql);

  try {
    await migrate(db, { migrationsFolder: "./src/core/database/migrations" });
    console.log("✅ Migrations applied successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
