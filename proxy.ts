// // src/middleware.ts  (project root — Next.js reads it from here)
// //
// // Runs on the edge before every request.
// // Responsibilities:
// //   1. Redirect canonical slug changes (301 SEO-safe redirects)
// //   2. Protect /admin/* routes — require authentication + role
// //   3. Protect /dashboard/* routes — require authentication
// //   4. Allow everything else through (public routes need no auth)

// import { NextRequest, NextResponse } from "next/server";
// import auth from "@core/auth/config";

// // Routes that require authentication
// const PROTECTED_PREFIXES = ["/dashboard", "/account", "/bookmarks"];

// // Routes that require admin role (checked against cached user.roleSlugs)
// const ADMIN_PREFIXES = ["/admin"];

// // Public routes — always pass through (no auth check even if session exists)
// const PUBLIC_PREFIXES = [
//   "/_next",
//   "/api/analytics",
//   "/api/cron",
//   "/favicon",
//   "/robots",
//   "/sitemap",
//   "/icons",
// ];

// export async function proxy(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   // ── Skip public and static assets ─────────────────────────────────────────
//   if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
//     return NextResponse.next();
//   }

//   // ── Admin route protection ─────────────────────────────────────────────────
//   if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p))) {
//     const session = await auth.api
//       .getSession({ headers: req.headers })
//       .catch(() => null);

//     if (!session?.user) {
//       const url = req.nextUrl.clone();
//       url.pathname = "/sign-in";
//       url.searchParams.set("redirect", pathname);
//       return NextResponse.redirect(url, 302);
//     }

//     const role = session.user.role as string | undefined;
//     const isAdmin =
//       role === "super_admin" || role === "admin" || role === "editor";

//     if (!isAdmin) {
//       const url = req.nextUrl.clone();
//       url.pathname = "/403";
//       return NextResponse.rewrite(url);
//     }

//     return NextResponse.next();
//   }

//   // ── User dashboard protection ──────────────────────────────────────────────
//   if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
//     const session = await auth.api
//       .getSession({ headers: req.headers })
//       .catch(() => null);

//     if (!session?.user) {
//       const url = req.nextUrl.clone();
//       url.pathname = "/sign-in";
//       url.searchParams.set("redirect", pathname);
//       return NextResponse.redirect(url, 302);
//     }

//     return NextResponse.next();
//   }

//   // ── Canonical slug redirect ────────────────────────────────────────────────
//   // Check if this looks like a content slug path
//   const SLUG_PATTERNS = [
//     { prefix: "/lectures/", table: "lectures" },
//     { prefix: "/articles/", table: "articles" },
//     { prefix: "/library/", table: "books" },
//     { prefix: "/scholars/", table: "scholars" },
//   ];

//   const match = SLUG_PATTERNS.find((p) => pathname.startsWith(p.prefix));
//   if (match) {
//     const slug = pathname.replace(match.prefix, "").split("/")[0];
//     const canonical = req.headers.get("x-canonical-slug");

//     // x-canonical-slug header is set by the page itself when it detects
//     // the requested slug matches a historical canonical_slug but not the
//     // current slug. The page rewrites to itself with the header set.
//     // The middleware then issues a 301 to the current slug.
//     if (canonical && canonical !== slug) {
//       const url = req.nextUrl.clone();
//       url.pathname = `${match.prefix}${canonical}`;
//       return NextResponse.redirect(url, 301);
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   // Run on all routes except static files
//   matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/|images/).*)"],
// };

import { NextRequest, NextResponse } from "next/server";
import { hasSession } from "@core/auth/edge"; // IMPORT THE NEW EDGE UTILITY HERE

const PROTECTED_PREFIXES = ["/dashboard", "/account", "/bookmarks"];
const ADMIN_PREFIXES = ["/admin"];
const PUBLIC_PREFIXES = [
  "/_next/static",
  "/_next/image",
  "/api/analytics",
  "/api/cron",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/icons",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isAuthProtected = PROTECTED_PREFIXES.some((p) =>
    pathname.startsWith(p),
  );
  const isAdminProtected = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));

  // ── Unified Edge Session Check ───────────────────────────────────────────
  if (isAuthProtected || isAdminProtected) {
    if (!hasSession(req)) {
      const url = req.nextUrl.clone();
      url.pathname = "/sign-in";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url, 302);
    }

    // For admin paths, we let the request pass to the Server Component layer
    // where deep RBAC verification (role validation) can safely happen.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icons/|images/).*)",
  ],
};
