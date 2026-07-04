// src/shared/lib/slug.ts
import slugify from "slugify";
import { db } from "@core/database/client";
import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";

// slugify has built-in locale maps for Arabic, but they require explicit
// configuration. We register the Arabic character map manually so that
// Arabic letters get romanised rather than stripped.
// Reference: https://github.com/simov/slugify#options
slugify.extend({
  // Common Arabic letters → Latin equivalents for URL-safe slugs
  ا: "a",
  أ: "a",
  إ: "i",
  آ: "a",
  ب: "b",
  ت: "t",
  ث: "th",
  ج: "j",
  ح: "h",
  خ: "kh",
  د: "d",
  ذ: "dh",
  ر: "r",
  ز: "z",
  س: "s",
  ش: "sh",
  ص: "s",
  ض: "d",
  ط: "t",
  ظ: "dh",
  ع: "",
  غ: "gh",
  ف: "f",
  ق: "q",
  ك: "k",
  ل: "l",
  م: "m",
  ن: "n",
  ه: "h",
  و: "w",
  ي: "y",
  ى: "a",
  ة: "h",
  ء: "",
  // Hausa-specific extended Latin
  ƙ: "k",
  ɗ: "d",
  ƴ: "y",
  Ƙ: "k",
  Ɗ: "d",
  // Yoruba tone-marked vowels
  á: "a",
  à: "a",
  é: "e",
  è: "e",
  í: "i",
  ì: "i",
  ó: "o",
  ò: "o",
  ú: "u",
  ù: "u",
  ẹ: "e",
  ọ: "o",
  ṣ: "s",
  Ọ: "o",
  Ẹ: "e",
});

export function generateSlug(value: string): string {
  const slug = slugify(value, {
    lower: true,
    strict: true,
    trim: true,
    replacement: "-",
  });

  // Fallback: if the entire string was non-Latin and slugify produced
  // an empty string (e.g. a purely Arabic title with no romanised output),
  // generate a stable short hash rather than an empty slug.
  if (!slug || slug === "-") {
    // Use first 8 chars of a nanoid — short enough for URLs, unique enough
    // for MVP content volumes. The admin can manually set a better slug.
    return `content-${nanoid(8)}`;
  }

  return slug;
}

interface SlugOptions {
  table: "lectures" | "articles" | "books" | "scholars" | "series";
  value: string;
  excludeId?: string;
}

export async function generateUniqueSlug(opts: SlugOptions): Promise<string> {
  const base = generateSlug(opts.value);

  const rows = await db.execute(sql`
    SELECT slug FROM ${sql.identifier(opts.table)}
    WHERE (slug = ${base} OR slug ~ ${`^${base}-[0-9]+$`})
    ${opts.excludeId ? sql`AND id != ${opts.excludeId}` : sql``}
    AND deleted_at IS NULL
  `);

  if (rows.length === 0) return base;

  // db.execute returns a generic RowList type; cast via unknown to the specific
  // shape we expect to satisfy TypeScript safely.
  const suffixes = (rows as unknown as Array<{ slug: string }>).map((r) => {
    const match = r.slug.match(new RegExp(`^${base}-(\\d+)$`));
    return match ? parseInt(match[1]!, 10) : 0;
  });

  return `${base}-${Math.max(...suffixes, 0) + 1}`;
}

// Locale-prefixed slug helpers for future multilingual routes
// Current:  /lectures/tawheed-fundamentals
// Future:   /ar/lectures/usul-at-tawheed
//           /ha/lectures/asali-tauhidi
export function buildLocalePath(
  locale: string,
  segment: string,
  slug: string,
): string {
  if (locale === "en") return `/${segment}/${slug}`;
  return `/${locale}/${segment}/${slug}`;
}
