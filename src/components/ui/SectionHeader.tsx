import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// SECTION HEADER
//
// Consistent heading block used at the top of every homepage section and
// listing page. Pattern:
//
//   [overline label]          ← "FEATURED LECTURES"
//   [main heading]            ← "Knowledge that guides"
//   [gold rule]               ← 48px gold underline accent
//   [description paragraph]   ← optional supporting copy
//
// align: 'left' for content sections, 'center' for hero-adjacent sections
// ─────────────────────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  overline?: string;
  heading: string;
  description?: string;
  align?: "left" | "center";
  headingAs?: "h1" | "h2" | "h3";
  className?: string;
  action?: React.ReactNode; // "View all" link slot
}

function SectionHeader({
  overline,
  heading,
  description,
  align = "left",
  headingAs: Heading = "h2",
  className,
  action,
}: SectionHeaderProps) {
  const isCentered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        isCentered && "items-center text-center",
        className,
      )}
    >
      {overline && (
        <span className="label-overline" aria-hidden="true">
          {overline}
        </span>
      )}

      <div
        className={cn(
          "flex items-start justify-between gap-4",
          isCentered && "flex-col items-center",
        )}
      >
        <Heading
          className={cn(
            "font-display font-bold text-ink-primary",
            "text-2xl sm:text-3xl tracking-snug leading-tight",
            isCentered && "max-w-[18ch]",
          )}
        >
          {heading}
        </Heading>

        {/* "View all" action — only on left-aligned headers */}
        {action && !isCentered && <div className="shrink-0 mt-1">{action}</div>}
      </div>

      {/* Gold accent rule */}
      <span className="rule-gold" aria-hidden="true" />

      {description && (
        <p
          className={cn(
            "text-ink-tertiary text-base leading-relaxed",
            isCentered ? "max-w-[52ch]" : "max-w-[60ch]",
          )}
        >
          {description}
        </p>
      )}

      {/* Action below description on centered headers */}
      {action && isCentered && <div className="mt-2">{action}</div>}
    </div>
  );
}

export { SectionHeader };
