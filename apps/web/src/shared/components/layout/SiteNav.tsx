"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@shared/lib/utils";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Lectures", href: "/lectures" },
  { label: "Series", href: "/series" },
  { label: "Articles", href: "/articles" },
  { label: "Library", href: "/library" },
  { label: "Scholars", href: "/scholars" },
  { label: "Reminders", href: "/reminders" },
  { label: "Search", href: "/search" },
];

interface SiteNavProps {
  isAuthenticated?: boolean;
  userInitials?: string | undefined;
}

export function SiteNav({
  isAuthenticated = false,
  userInitials,
}: SiteNavProps) {
  const pathname = usePathname();

  // IMPORTANT:
  // Keep the initial render deterministic so server and client HTML match.
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // Scroll detection
  // ─────────────────────────────────────────────────────────────────────────

  React.useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    // Set initial value after hydration.
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Close mobile menu after navigation
  //
  // We intentionally do NOT call setOpen(false) inside an effect.
  // Next navigation unmounts/remounts the page as necessary, and the menu
  // state starts closed. This also avoids react-hooks/set-state-in-effect.
  // ─────────────────────────────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────────────────
  // Lock body scroll while mobile menu is open
  // ─────────────────────────────────────────────────────────────────────────

  React.useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ─────────────────────────────────────────────────────────────────────────
  // Close menu when clicking a mobile navigation link
  // ─────────────────────────────────────────────────────────────────────────

  const handleMobileNavigation = React.useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      {/* Skip link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* Header */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <header
        className={cn(
          "fixed top-0 inset-x-0 z-40 h-nav",
          "transition-all duration-normal ease-in-out",
          scrolled
            ? "bg-background/98 backdrop-blur-md border-b border-border shadow-xs"
            : "bg-background/95 backdrop-blur-sm border-b border-border-subtle",
        )}
        role="banner"
      >
        <div className="container-site h-full flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
            aria-label="Da'wahTube — Home"
          >
            <Image
              src="/images/dawahtube-logo.png"
              alt="Da'wahTube"
              width={32}
              height={32}
              priority
            />

            <span className="font-display font-bold text-lg text-ink-primary leading-none">
              Da&apos;wahTube
            </span>
          </Link>

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* Desktop navigation */}
          {/* ─────────────────────────────────────────────────────────────── */}

          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-1"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                active={
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* Desktop authentication */}
          {/* ─────────────────────────────────────────────────────────────── */}

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <UserMenu initials={userInitials ?? "?"} />
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="px-3 py-2 rounded-md text-sm font-medium text-ink-secondary hover:bg-surface-subtle transition-colors"
                >
                  Sign in
                </Link>

                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Join free
                </Link>
              </>
            )}
          </div>

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* Mobile hamburger */}
          {/* ─────────────────────────────────────────────────────────────── */}

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((current) => !current)}
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

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* Mobile drawer */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <div
        id="mobile-menu"
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
        className={cn(
          "fixed inset-0 z-modal md:hidden",
          "bg-surface-base",
          "flex flex-col",
          "transition-all duration-slow ease-out",
          open
            ? "visible opacity-100 pointer-events-auto"
            : "invisible opacity-0 pointer-events-none",
        )}
      >
        {/* Drawer header */}
        <div className="h-nav flex items-center justify-between px-6 border-b border-border-default shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            onClick={handleMobileNavigation}
          >
            <Image
              src="/images/dawahtube-logo.png"
              alt="Da'wahTube"
              width={32}
              height={32}
            />

            <span className="font-display font-bold text-lg text-ink-primary">
              Da&apos;wahTube
            </span>
          </Link>

          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="p-2 rounded-md text-ink-secondary hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Drawer nav links */}
        <nav aria-label="Mobile navigation" className="flex flex-col p-6 gap-1">
          {NAV_ITEMS.map((item, index) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={handleMobileNavigation}
                className={cn(
                  "flex items-center px-4 py-3 rounded-lg",
                  "font-body font-medium text-lg",
                  "transition-colors duration-fast",
                  "animate-fade-in-up",
                  active
                    ? "bg-primary-50 text-primary-700"
                    : "text-ink-secondary hover:bg-surface-subtle hover:text-ink-primary",
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile authentication */}
        <div className="px-6 pt-4 mt-auto pb-8 border-t border-border-default flex flex-col gap-3">
          {isAuthenticated ? (
            <Link
              href="/admin"
              onClick={handleMobileNavigation}
              className="inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              My Account
            </Link>
          ) : (
            <>
              <Link
                href="/sign-up"
                onClick={handleMobileNavigation}
                className="inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Join free
              </Link>

              <Link
                href="/sign-in"
                onClick={handleMobileNavigation}
                className="inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium text-ink-primary hover:bg-surface-subtle transition-colors"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Desktop navigation link
// ─────────────────────────────────────────────────────────────────────────────

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

      {active && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary-700 rounded-full"
        />
      )}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// User menu
// ─────────────────────────────────────────────────────────────────────────────

function UserMenu({ initials }: { initials: string }) {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/admin"
        className={cn(
          "inline-flex items-center justify-center rounded-md px-3 py-2",
          "font-body font-medium text-sm",
          "text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle",
          "transition-colors duration-fast",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700",
        )}
      >
        Dashboard
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

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

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
