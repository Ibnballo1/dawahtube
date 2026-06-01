"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

// ─────────────────────────────────────────────────────────────────────────────
// SITE NAVIGATION
//
// Layout:
//   Desktop: Logo | Nav links (centre) | Auth actions (right)
//   Mobile:  Logo + hamburger | Fullscreen drawer
//
// Behaviour:
//   - Frosted glass background on scroll (backdrop-blur)
//   - Border appears after scrolling 20px
//   - Active link has primary colour + underline
//   - Mobile drawer traps focus when open (via dialog semantics)
//   - aria-current="page" on active link for screen readers
//
// The nav height (--nav-height: 64px) is a CSS variable consumed by
// layout components to set scroll padding and content offset.
// ─────────────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Lectures", href: "/lectures" },
  { label: "Articles", href: "/articles" },
  { label: "Library", href: "/library" },
  { label: "Scholars", href: "/scholars" },
];

interface SiteNavProps {
  /** Injected from Server Component — avoids client-side auth waterfall */
  isAuthenticated?: boolean;
  userInitials?: string;
}

export function SiteNav({ isAuthenticated, userInitials }: SiteNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  // Scroll detection for frosted glass border
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  React.useEffect(() => {
    const id = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  // Lock body scroll when mobile menu open
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header
        className={cn(
          "fixed top-0 inset-x-0 z-sticky h-nav",
          "transition-all duration-normal ease-default",
          scrolled
            ? "bg-[var(--nav-bg)] backdrop-blur-[var(--nav-backdrop)] border-b border-[var(--nav-border)] shadow-xs"
            : "bg-transparent",
        )}
        role="banner"
      >
        <div className="container-site h-full flex items-center justify-between">
          {/* ── Logo ──────────────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 rounded-md"
            aria-label="Da'wahTube — Home"
          >
            <LogoMark />
            <span className="font-display font-bold text-lg text-ink-primary leading-none">
              Da&apos;wahTube
            </span>
          </Link>

          {/* ── Desktop navigation ────────────────────────────────────── */}
          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-1"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                active={pathname.startsWith(item.href)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* ── Desktop auth actions ──────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <UserMenu initials={userInitials ?? "?"} />
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Join free</Button>
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ─────────────────────────────────────── */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
            className={cn(
              "md:hidden p-2 rounded-md text-ink-secondary",
              "hover:bg-surface-subtle transition-colors duration-fast",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700",
            )}
          >
            <HamburgerIcon open={open} />
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ──────────────────────────────────────────────── */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
        className={cn(
          "fixed inset-0 z-modal md:hidden",
          "flex flex-col",
          "bg-surface-base",
          "transition-all duration-slow ease-out",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      >
        {/* Drawer header mirrors nav */}
        <div className="h-nav flex items-center justify-between px-6 border-b border-border-default">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark />
            <span className="font-display font-bold text-lg text-ink-primary">
              Da&apos;wahTube
            </span>
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="p-2 rounded-md text-ink-secondary hover:bg-surface-subtle"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Drawer nav links */}
        <nav aria-label="Mobile navigation" className="flex flex-col p-6 gap-1">
          {NAV_ITEMS.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname.startsWith(item.href) ? "page" : undefined}
              className={cn(
                "flex items-center px-4 py-3 rounded-lg",
                "font-body font-medium text-lg",
                "transition-colors duration-fast",
                "animate-fade-in-up",
                pathname.startsWith(item.href)
                  ? "bg-primary-50 text-primary-700"
                  : "text-ink-secondary hover:bg-surface-subtle hover:text-ink-primary",
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile auth */}
        <div className="px-6 pt-4 mt-auto pb-8 border-t border-border-default flex flex-col gap-3">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button variant="secondary" size="lg" className="w-full">
                My Account
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-up">
                <Button size="lg" className="w-full">
                  Join free
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="ghost" size="lg" className="w-full">
                  Sign in
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative px-3 py-2 rounded-md",
        "font-body font-medium text-sm",
        "transition-colors duration-fast",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700",
        active
          ? "text-primary-700"
          : "text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle",
      )}
    >
      {children}
      {/* Active indicator line */}
      {active && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary-700 rounded-full"
        />
      )}
    </Link>
  );
}

function UserMenu({ initials }: { initials: string }) {
  return (
    <div className="flex items-center gap-2">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm">
          Dashboard
        </Button>
      </Link>
      <Link
        href="/account"
        className={cn(
          "size-8 rounded-full flex items-center justify-center",
          "bg-primary-700 text-white text-xs font-bold",
          "hover:bg-primary-800 transition-colors",
        )}
        aria-label="Account settings"
      >
        {initials}
      </Link>
    </div>
  );
}

function LogoMark() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      {/* Simplified Islamic geometric mark — 8-point star form */}
      <rect width="28" height="28" rx="6" fill="#065F46" />
      <path
        d="M14 4L16.2 10.5H23L17.4 14.5L19.6 21L14 17L8.4 21L10.6 14.5L5 10.5H11.8L14 4Z"
        fill="#D4AF37"
        opacity="0.9"
      />
    </svg>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <line x1="4" y1="4" x2="18" y2="18" />
          <line x1="18" y1="4" x2="4" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="19" y2="6" />
          <line x1="3" y1="11" x2="19" y2="11" />
          <line x1="3" y1="16" x2="19" y2="16" />
        </>
      )}
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="4" y1="4" x2="18" y2="18" />
      <line x1="18" y1="4" x2="4" y2="18" />
    </svg>
  );
}
