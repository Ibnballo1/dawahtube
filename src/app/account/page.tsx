// src/app/account/page.tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { getSession } from "@core/auth/config";
import { SignOutButton } from "@/features/auth/components/client/SignOutButton";
import { formatDate } from "@shared/lib/format";
import { Badge } from "@shared/components/ui/badge";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false },
};

export default async function AccountPage() {
  const session = await getSession({ headers: await headers() }).catch(
    () => null,
  );

  if (!session?.user) redirect("/sign-in?redirect=/account");

  const { user } = session;
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="min-h-screen bg-surface-subtle">
      <div className="container-site py-12 max-w-2xl mx-auto">
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="font-display font-bold text-2xl text-ink-primary">
            My Account
          </h1>
          <p className="text-ink-tertiary text-sm">
            Manage your Da&apos;wahTube account
          </p>
        </div>

        <div className="bg-surface-card border border-border-default rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-primary-700 flex items-center justify-center shrink-0">
              <span className="font-display font-bold text-xl text-white">
                {initials}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-display font-bold text-lg text-ink-primary">
                {user.name}
              </p>
              <p className="text-sm text-ink-tertiary">{user.email}</p>
              <div className="flex items-center gap-2">
                {user.emailVerified ? (
                  <Badge variant="success" size="sm">
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm">
                    Unverified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <hr className="border-border-subtle" />

          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between py-1.5 border-b border-border-subtle">
              <dt className="text-ink-muted">Member since</dt>
              <dd className="font-medium text-ink-secondary">
                {formatDate(new Date(user.createdAt))}
              </dd>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <dt className="text-ink-muted">Role</dt>
              <dd className="font-medium text-ink-secondary capitalize">
                {(user.role as string | undefined) ?? "reader"}
              </dd>
            </div>
          </dl>

          <hr className="border-border-subtle" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink-primary">Sign out</p>
              <p className="text-xs text-ink-muted">
                You will be signed out of this session.
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
