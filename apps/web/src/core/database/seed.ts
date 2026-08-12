// src/core/database/seed.ts
// Run with: npx tsx src/core/database/seed.ts
//
// Seeds:
//   1. All system roles with their permission sets
//   2. A super admin user (credentials from env)
//
// Safe to re-run — uses upsert on all inserts.
// Never run against production without reviewing the env vars first.

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { nanoid } from "nanoid";
import * as schema from "./schema";
import { eq } from "drizzle-orm";
import { DEFAULT_ROLES } from "@core/auth/permissions";
import type { Permission } from "@core/auth/permissions";

const client = postgres(process.env.DATABASE_URL_UNPOOLED!, { max: 1 });
const db = drizzle(client, { schema });

async function seed() {
  console.log("🌱 Seeding database...\n");

  // ── 1. Roles ───────────────────────────────────────────────────────────────
  console.log("  Seeding roles and permissions...");

  for (const [slug, config] of Object.entries(DEFAULT_ROLES)) {
    // Upsert role
    const [role] = await db
      .insert(schema.roles)
      .values({
        id: `rol_${nanoid(16)}`,
        slug,
        label: config.label,
        isSystem: true,
      })
      .onConflictDoUpdate({
        target: schema.roles.slug,
        set: { label: config.label, updatedAt: new Date() },
      })
      .returning();

    if (!role) throw new Error(`Failed to upsert role: ${slug}`);

    // Delete existing permissions for this role (clean re-seed)
    await db
      .delete(schema.rolePermissions)
      .where(eq(schema.rolePermissions.roleId, role.id));

    // Insert fresh permissions
    if (config.permissions.length > 0) {
      await db.insert(schema.rolePermissions).values(
        config.permissions.map((permission: Permission) => ({
          roleId: role.id,
          permission,
        })),
      );
    }

    console.log(
      `    ✓ ${config.label} (${config.permissions.length} permissions)`,
    );
  }

  // ── 2. Lecture categories ──────────────────────────────────────────────────
  console.log("\n  Seeding lecture categories...");

  const lectureCategories = [
    { slug: "aqeedah", name: "Aqeedah (Islamic Creed)" },
    { slug: "fiqh", name: "Fiqh (Islamic Jurisprudence)" },
    { slug: "tafseer", name: "Tafseer (Qur'an Explanation)" },
    { slug: "hadith", name: "Hadith Sciences" },
    { slug: "seerah", name: "Seerah (Prophetic Biography)" },
    { slug: "manhaj", name: "Manhaj (Methodology)" },
    { slug: "arabic", name: "Arabic Language" },
    { slug: "tarbiyyah", name: "Tarbiyyah (Islamic Upbringing)" },
  ];

  for (const [i, cat] of lectureCategories.entries()) {
    await db
      .insert(schema.lectureCategories)
      .values({
        id: `lct_${nanoid(16)}`,
        slug: cat.slug,
        name: cat.name,
        position: i,
      })
      .onConflictDoNothing({ target: schema.lectureCategories.slug });

    console.log(`    ✓ ${cat.name}`);
  }

  // ── 3. Article categories ──────────────────────────────────────────────────
  console.log("\n  Seeding article categories...");

  const articleCategories = [
    { slug: "belief", name: "Belief & Creed" },
    { slug: "worship", name: "Acts of Worship" },
    { slug: "character", name: "Character & Manners" },
    { slug: "family", name: "Family & Society" },
    { slug: "contemporary", name: "Contemporary Issues" },
    { slug: "biography", name: "Biographies" },
  ];

  for (const [i, cat] of articleCategories.entries()) {
    await db
      .insert(schema.articleCategories)
      .values({
        id: `act_${nanoid(16)}`,
        slug: cat.slug,
        name: cat.name,
        position: i,
      })
      .onConflictDoNothing({ target: schema.articleCategories.slug });

    console.log(`    ✓ ${cat.name}`);
  }

  // ── 4. Book categories ─────────────────────────────────────────────────────
  console.log("\n  Seeding book categories...");

  const bookCategories = [
    { slug: "tawheed", name: "Tawheed" },
    { slug: "hadith-books", name: "Hadith Collections" },
    { slug: "fiqh-books", name: "Fiqh & Fatawa" },
    { slug: "tafseer-books", name: "Tafseer" },
    { slug: "arabic-books", name: "Arabic Language" },
    { slug: "seerah-books", name: "Seerah & History" },
  ];

  for (const [i, cat] of bookCategories.entries()) {
    await db
      .insert(schema.bookCategories)
      .values({
        id: `bct_${nanoid(16)}`,
        slug: cat.slug,
        name: cat.name,
        position: i,
      })
      .onConflictDoNothing({ target: schema.bookCategories.slug });

    console.log(`    ✓ ${cat.name}`);
  }

  // ── 5. Tags ────────────────────────────────────────────────────────────────
  console.log("\n  Seeding tags...");

  const tags = [
    { slug: "tawheed", name: "Tawheed" },
    { slug: "salaf", name: "Salaf" },
    { slug: "sunnah", name: "Sunnah" },
    { slug: "quran", name: "Qur'an" },
    { slug: "prayer", name: "Prayer" },
    { slug: "fasting", name: "Fasting" },
    { slug: "zakat", name: "Zakat" },
    { slug: "hajj", name: "Hajj" },
    { slug: "ramadan", name: "Ramadan" },
    { slug: "beginners", name: "Beginners" },
  ];

  for (const tag of tags) {
    await db
      .insert(schema.tags)
      .values({
        id: `tag_${nanoid(16)}`,
        slug: tag.slug,
        name: tag.name,
      })
      .onConflictDoNothing({ target: schema.tags.slug });

    console.log(`    ✓ ${tag.name}`);
  }

  console.log("\n✅ Seed complete.\n");
  await client.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
