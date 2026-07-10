// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans, DM_Mono } from "next/font/google";
import { SiteNav } from "@shared/components/layout/SiteNav";
import { SiteFooter } from "@shared/components/layout/SiteFooter";
import auth from "@core/auth/config";
import { headers } from "next/headers";
import "@shared/styles/globals.css";

// ─── Font loading ─────────────────────────────────────────────────────────────
const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display-loaded",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-body-loaded",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-loaded",
  display: "swap",
});

// ─── Root metadata ────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://dawahtube.com",
  ),
  title: {
    default: "Da'wahTube — Authentic Islamic Knowledge",
    template: "%s | Da'wahTube",
  },
  description:
    "Authentic Islamic knowledge upon the Qur'an and Sunnah according to the understanding of the Salaf-us-Saalih. Lectures, articles, books, and daily reminders from trusted Nigerian scholars.",
  keywords: [
    "Islamic lectures",
    "Salafi",
    "Qur'an",
    "Sunnah",
    "Salaf",
    "Nigeria",
    "Islamic knowledge",
    "Islamic scholars",
    "Tawheed",
    "Aqeedah",
  ],
  authors: [{ name: "Da'wahTube" }],
  creator: "Da'wahTube",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Da'wahTube",
    title: "Da'wahTube — Authentic Islamic Knowledge",
    description:
      "Lectures, articles, books and daily reminders upon the Qur'an and Sunnah.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Da'wahTube",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#065f46",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// ─── Root layout ──────────────────────────────────────────────────────────────
export default async function RootLayout({
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
    <html
      lang="en"
      dir="ltr"
      data-theme="light"
      className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Amiri (Arabic) — loaded via CSS @import in globals.css */}
        {/* Preconnect for Google Fonts performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-surface-base text-ink-secondary antialiased">
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
      </body>
    </html>
  );
}
