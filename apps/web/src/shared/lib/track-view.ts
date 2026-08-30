// src/shared/lib/track-view.ts
//
// Call this from any detail page (lecture, article, book) to increment
// view_count after the page response is sent to the user.
//
// Uses Next.js 15 `after()` — runs the callback AFTER the response is
// sent, so it never blocks or slows down page load.
//
// Usage in a page:
//   import { trackView } from '@shared/lib/track-view'
//   trackView('lecture', lecture.id)   // fire-and-forget, no await needed
//
// The view is only counted once per page render (server-side),
// so refreshing the page does count as a new view — this is the
// standard approach for Islamic content sites where sessions aren't tracked.

import { after } from "next/server";
import { headers } from "next/headers";

type ContentType = "lecture" | "article" | "book";

export function trackView(type: ContentType, id: string): void {
  // `after()` runs after the response is flushed — never blocks the user
  after(async () => {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const secret = process.env.INTERNAL_API_SECRET ?? "dev-internal-secret";

      await fetch(`${baseUrl}/api/track/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": secret,
        },
        body: JSON.stringify({ type, id }),
      });
    } catch (err) {
      // Silently fail — view tracking should never crash a page
      console.error("[trackView]", err);
    }
  });
}
