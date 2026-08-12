import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@shared/lib/utils";
import type { ContentStatus } from "@core/database/types";

// ─────────────────────────────────────────────────────────────────────────────
// BADGE
//
// Used for:
//   - Content status labels (draft, published, etc.)
//   - Category chips on listing pages
//   - Tag chips on content detail pages
//   - View/download counts
//   - Scholar nationality
// ─────────────────────────────────────────────────────────────────────────────

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5",
    "font-body font-medium whitespace-nowrap",
    "border transition-colors duration-fast",
  ],
  {
    variants: {
      variant: {
        default: ["bg-surface-subtle text-ink-secondary border-border-default"],
        primary: ["bg-primary-100 text-primary-800 border-primary-200"],
        gold: ["bg-accent-200 text-accent-800 border-accent-300"],
        success: ["bg-green-50 text-green-800 border-green-200"],
        warning: ["bg-yellow-50 text-yellow-800 border-yellow-200"],
        error: ["bg-red-50 text-red-800 border-red-200"],
        info: ["bg-blue-50 text-blue-800 border-blue-200"],
        // Content lifecycle statuses
        draft: ["badge-draft     border-transparent"],
        review: ["badge-review    border-transparent"],
        scheduled: ["badge-scheduled border-transparent"],
        published: ["badge-published border-transparent"],
        archived: ["badge-archived  border-transparent"],
        // Outline only
        outline: ["bg-transparent text-ink-secondary border-border-emphasis"],
      },
      size: {
        sm: "px-2 py-0.5 text-xs rounded-sm [&_svg]:size-3",
        md: "px-3 py-1   text-sm rounded-full [&_svg]:size-3",
        lg: "px-4 py-1.5 text-sm rounded-full [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean; // Show coloured dot indicator
  icon?: React.ReactNode;
}

function Badge({
  className,
  variant,
  size,
  dot,
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 rounded-full shrink-0",
            variant === "published" && "bg-green-600",
            variant === "draft" && "bg-slate-400",
            variant === "review" && "bg-yellow-500",
            variant === "scheduled" && "bg-blue-500",
            variant === "archived" && "bg-slate-300",
          )}
        />
      )}
      {icon && !dot && icon}
      {children}
    </span>
  );
}

// ── Convenience wrapper for content status ─────────────────────────────────
const STATUS_LABELS: Record<ContentStatus, string> = {
  draft: "Draft",
  review: "In Review",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

interface StatusBadgeProps {
  status: ContentStatus;
  size?: BadgeProps["size"];
  className?: string;
}

function StatusBadge({ status, size = "sm", className }: StatusBadgeProps) {
  return (
    <Badge variant={status} size={size} dot className={className}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export { Badge, badgeVariants, StatusBadge };
