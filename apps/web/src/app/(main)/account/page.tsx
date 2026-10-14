// src/app/(main)/account/page.tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import auth from "@core/auth/config";
import { UpdateProfileForm } from "@features/account/components/UpdateProfileForm";
import { UpdatePasswordForm } from "@features/account/components/UpdatePasswordForm";
import { DangerZone } from "@features/account/components/DangerZone";

export const metadata: Metadata = { title: "My Account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);

  if (!session?.user) redirect("/sign-in?redirect=/account");

  const user = session.user as {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date | string;
    role?: string;
  };

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <div className="bg-surface-subtle border-b border-border-default">
        <div className="container-site py-10 max-w-2xl">
          <span className="label-overline">Settings</span>
          <h1 className="font-display font-bold text-3xl text-ink-primary mt-3">
            My Account
          </h1>
          <p className="text-ink-muted text-sm mt-2">
            Member since {memberSince}
            {user.emailVerified && (
              <span className="ml-2 inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Verified
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="container-site py-10 max-w-2xl flex flex-col gap-8">
        {/* Profile info card */}
        <div className="card p-6 flex items-center gap-4">
          {/* Avatar */}
          <div className="size-14 rounded-full bg-primary-700 flex items-center justify-center shrink-0">
            <span className="font-display font-bold text-xl text-white">
              {user.name
                ?.split(" ")
                .map((w: string) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="font-display font-bold text-lg text-ink-primary">
              {user.name}
            </p>
            <p className="text-sm text-ink-muted">{user.email}</p>
            {user.role && user.role !== "reader" && (
              <span className="text-xs text-primary-700 font-medium capitalize">
                {user.role.replace("_", " ")}
              </span>
            )}
          </div>
        </div>

        {/* Update profile */}
        <section>
          <h2 className="font-display font-semibold text-lg text-ink-primary mb-4">
            Profile information
          </h2>
          <div className="card p-6">
            <UpdateProfileForm
              currentName={user.name}
              currentEmail={user.email}
            />
          </div>
        </section>

        {/* Change password */}
        <section>
          <h2 className="font-display font-semibold text-lg text-ink-primary mb-4">
            Change password
          </h2>
          <div className="card p-6">
            <UpdatePasswordForm />
          </div>
        </section>

        {/* Danger zone */}
        <section>
          <h2 className="font-display font-semibold text-lg text-red-600 mb-4">
            Danger zone
          </h2>
          <div className="card p-6 border-red-200">
            <DangerZone userId={user.id} userEmail={user.email} />
          </div>
        </section>
      </div>
    </div>
  );
}
