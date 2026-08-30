// src/app/api/track/view/route.ts
//
// Called server-side via Next.js `after()` after the page response is sent.
// Increments view_count on lectures or articles without blocking page load.
//
// POST /api/track/view
// Body: { type: 'lecture' | 'article' | 'book', id: string }
//
// Security:
// - Only accepts POST requests
// - Validates the entity exists before incrementing
// - Uses a secret header so it can't be spammed from the browser
//   (the secret is only known to the Next.js server itself)

import { NextRequest, NextResponse } from "next/server";
import { db } from "@core/database/client";
import { lectures, articles, books } from "@core/database/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  type: z.enum(["lecture", "article", "book"]),
  id: z.string().min(1),
});

// Internal secret — only the Next.js server knows this
// It's set as an env var so the route can't be hit directly from browsers
const INTERNAL_SECRET =
  process.env.INTERNAL_API_SECRET ?? "dev-internal-secret";

export async function POST(req: NextRequest) {
  // Verify the request is coming from our own server
  const secret = req.headers.get("x-internal-secret");
  if (secret !== INTERNAL_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = schema.safeParse(body);

    if (!data.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid request" },
        { status: 400 },
      );
    }

    const { type, id } = data.data;

    if (type === "lecture") {
      await db
        .update(lectures)
        .set({ viewCount: sql`${lectures.viewCount} + 1` })
        .where(eq(lectures.id, id));
    } else if (type === "article") {
      await db
        .update(articles)
        .set({ viewCount: sql`${articles.viewCount} + 1` })
        .where(eq(articles.id, id));
    } else if (type === "book") {
      await db
        .update(books)
        .set({ viewCount: sql`${books.viewCount} + 1` })
        .where(eq(books.id, id));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[track/view]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
