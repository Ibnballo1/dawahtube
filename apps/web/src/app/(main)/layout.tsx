// src/app/(main)/layout.tsx

import { SiteNav } from "@shared/components/layout/SiteNav";
import { SiteFooter } from "@shared/components/layout/SiteFooter";
import auth from "@core/auth/config";
import { headers } from "next/headers";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get session server-side to pass auth state to nav
  // without a client-side auth waterfall.
  const session = await auth.api
    .getSession({
      headers: await headers(),
    })
    .catch(() => null);

  const isAuthenticated = !!session?.user;

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .slice(0, 2)
        .map((word: string) => word[0]?.toUpperCase() ?? "")
        .join("")
    : undefined;

  return (
    <>
      <SiteNav
        isAuthenticated={isAuthenticated}
        {...(initials !== undefined ? { userInitials: initials } : {})}
      />

      <main id="main-content" className="pt-nav" tabIndex={-1}>
        {children}
      </main>

      <SiteFooter />
    </>
  );
}
