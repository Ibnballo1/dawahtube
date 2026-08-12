// // src/proxy.ts

// import { NextRequest, NextResponse } from "next/server";
// import { hasSession } from "@core/auth/edge"; // IMPORT THE NEW EDGE UTILITY HERE

// const PROTECTED_PREFIXES = ["/dashboard", "/account", "/bookmarks"];
// const ADMIN_PREFIXES = ["/admin"];
// const PUBLIC_PREFIXES = [
//   "/_next/static",
//   "/_next/image",
//   "/api/analytics",
//   "/api/cron",
//   "/favicon.ico",
//   "/robots.txt",
//   "/sitemap.xml",
//   "/icons",
// ];

// export async function proxy(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
//     return NextResponse.next();
//   }

//   const isAuthProtected = PROTECTED_PREFIXES.some((p) =>
//     pathname.startsWith(p),
//   );
//   const isAdminProtected = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));

//   // ── Unified Edge Session Check ───────────────────────────────────────────
//   if (isAuthProtected || isAdminProtected) {
//     if (!hasSession(req)) {
//       const url = req.nextUrl.clone();
//       url.pathname = "/sign-in";
//       url.searchParams.set("redirect", pathname);
//       return NextResponse.redirect(url, 302);
//     }

//     // For admin paths, we let the request pass to the Server Component layer
//     // where deep RBAC verification (role validation) can safely happen.
//     return NextResponse.next();
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icons/|images/).*)",
//   ],
// };

// src/middleware.ts
//
// Edge middleware — runs before every request.
// Responsibilities (in order):
//   1. Skip static assets and public API routes
//   2. Protect /admin/* — requires authentication + admin role
//   3. Protect /dashboard/* — requires authentication
//   4. Redirect authenticated users away from auth pages
//   5. Canonical slug redirect for renamed content

import { NextRequest, NextResponse } from "next/server";
import auth from "@core/auth/config";

// Always pass through — no auth check needed
const PUBLIC_PREFIXES = [
  "/_next",
  "/api/auth", // BetterAuth's own routes
  "/api/analytics",
  "/api/cron",
  "/favicon",
  "/robots",
  "/sitemap",
  "/icons",
  "/images",
];

// Requires valid session + admin/editor role
const ADMIN_PREFIXES = ["/admin"];

// Requires valid session (any role)
const PROTECTED_PREFIXES = ["/dashboard", "/account", "/bookmarks"];

// Auth pages — redirect away if already signed in
const AUTH_PAGES = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── 1. Always pass through public routes ──────────────────────────────────
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // ── 2. Admin route protection ─────────────────────────────────────────────
  if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p))) {
    const session = await auth.api
      .getSession({ headers: req.headers })
      .catch(() => null);

    if (!session?.user) {
      const url = req.nextUrl.clone();
      url.pathname = "/sign-in";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url, 302);
    }

    const role = session.user.role ?? "";
    const isAdmin = ["super_admin", "admin", "editor"].includes(role);

    if (!isAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = "/403";
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  // ── 3. Protected route — authenticated users only ─────────────────────────
  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const session = await auth.api
      .getSession({ headers: req.headers })
      .catch(() => null);

    if (!session?.user) {
      const url = req.nextUrl.clone();
      url.pathname = "/sign-in";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url, 302);
    }

    return NextResponse.next();
  }

  // ── 4. Redirect authenticated users away from auth pages ──────────────────
  if (AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    // Only check session if on an auth page — avoids unnecessary DB calls
    // on every public page load
    const session = await auth.api
      .getSession({ headers: req.headers })
      .catch(() => null);

    if (session?.user) {
      const redirectTo = req.nextUrl.searchParams.get("redirect") ?? "/";
      const url = req.nextUrl.clone();
      url.pathname = redirectTo;
      url.search = "";
      return NextResponse.redirect(url, 302);
    }

    return NextResponse.next();
  }

  // ── 5. Canonical slug redirect ────────────────────────────────────────────
  const SLUG_PATTERNS = [
    { prefix: "/lectures/" },
    { prefix: "/articles/" },
    { prefix: "/library/" },
    { prefix: "/scholars/" },
  ];

  const isContentPath = SLUG_PATTERNS.some((p) =>
    pathname.startsWith(p.prefix),
  );

  if (isContentPath) {
    // x-canonical-slug is set by the page when it detects a renamed slug.
    // We issue a 301 to the current slug to preserve SEO equity.
    const canonical = req.headers.get("x-canonical-slug");
    if (canonical) {
      const segment = SLUG_PATTERNS.find((p) =>
        pathname.startsWith(p.prefix),
      )!.prefix;
      const url = req.nextUrl.clone();
      url.pathname = `${segment}${canonical}`;
      return NextResponse.redirect(url, 301);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|icons/|images/).*)",
  ],
};
