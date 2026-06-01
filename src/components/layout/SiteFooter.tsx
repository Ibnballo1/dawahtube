import Link from "next/link";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// SITE FOOTER
//
// Four-column layout on desktop, stacked on mobile:
//   1. Brand column — logo, mission tagline, social links
//   2. Content — Lectures, Articles, Library, Scholars
//   3. Platform — About, Contact, Donate
//   4. Legal — Privacy, Terms, Cookie policy
//
// Islamic authenticity note at the bottom (manhaj statement).
// ─────────────────────────────────────────────────────────────────────────────

const FOOTER_LINKS = {
  content: [
    { label: "Lectures", href: "/lectures" },
    { label: "Articles", href: "/articles" },
    { label: "Library", href: "/library" },
    { label: "Scholars", href: "/scholars" },
    { label: "Reminders", href: "/reminders" },
  ],
  platform: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Donate", href: "/donate" },
    { label: "Newsletter", href: "/newsletter" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer role="contentinfo" className="bg-primary-950 text-white">
      {/* ── Main footer grid ─────────────────────────────────────────── */}
      <div className="container-site py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            <Link
              href="/"
              className="flex items-center gap-2.5 w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 rounded-sm"
            >
              <FooterLogoMark />
              <span className="font-display font-bold text-lg text-white leading-none">
                Da&apos;wahTube
              </span>
            </Link>

            <p className="text-sm text-white/60 leading-relaxed max-w-[26ch]">
              Authentic Islamic knowledge upon the Qur&apos;an and Sunnah
              according to the understanding of the Salaf.
            </p>

            {/* Arabic Bismillah */}
            <p
              className="font-arabic text-arabic-base text-accent-400 leading-relaxed"
              dir="rtl"
              lang="ar"
              aria-label="Bismillah ar-Rahman ar-Raheem"
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>

          {/* Content links */}
          <FooterColumn title="Content">
            {FOOTER_LINKS.content.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          {/* Platform links */}
          <FooterColumn title="Platform">
            {FOOTER_LINKS.platform.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          {/* Legal links */}
          <FooterColumn title="Legal">
            {FOOTER_LINKS.legal.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>
      </div>

      {/* ── Manhaj statement + copyright ─────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="container-site py-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-white/40 leading-relaxed max-w-[60ch]">
            All content on Da&apos;wahTube is based upon the Qur&apos;an and
            authentic Sunnah, in accordance with the understanding of the
            Salaf-us-Saalih. May Allah guide us all to the straight path.
          </p>
          <p className="text-xs text-white/40 shrink-0">
            © {year} Da&apos;wahTube. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-white uppercase tracking-widest">
        {title}
      </h3>
      <ul className="flex flex-col gap-2.5" role="list">
        {children}
      </ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "text-sm text-white/60",
          "hover:text-white transition-colors duration-fast",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-400 rounded-sm",
        )}
      >
        {children}
      </Link>
    </li>
  );
}

function FooterLogoMark() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      <rect width="28" height="28" rx="6" fill="#065F46" />
      <path
        d="M14 4L16.2 10.5H23L17.4 14.5L19.6 21L14 17L8.4 21L10.6 14.5L5 10.5H11.8L14 4Z"
        fill="#D4AF37"
        opacity="0.9"
      />
    </svg>
  );
}
