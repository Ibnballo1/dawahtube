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
  // Get session server-side to pass auth state to nav without client waterfall
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .slice(0, 2)
        .map((w: string) => w[0]?.toUpperCase() ?? "")
        .join("")
    : undefined;

  return (
    <>
      <SiteNav isAuthenticated={!!session?.user} userInitials={initials} />

      {/* Main content — offset by nav height */}
      <main
        id="main-content"
        className="pt-nav"
        tabIndex={-1} /* Receives focus from skip link */
      >
        {children}
      </main>

      <SiteFooter />
    </>
  );
}
