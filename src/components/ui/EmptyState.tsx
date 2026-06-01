import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
//
// Shown when a listing page, search result, or filtered view has no content.
// Every empty state must tell the user: what is missing, why, and what to do.
// ─────────────────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?:
    | {
        label: string;
        onClick?: () => void;
        href?: string;
      }
    | undefined;
  secondaryAction?:
    | {
        label: string;
        onClick?: () => void;
        href?: string;
      }
    | undefined;
  className?: string;
  size?: "sm" | "md" | "lg";
}

function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = "md",
}: EmptyStateProps) {
  const sizeClasses = {
    sm: "py-10 gap-3",
    md: "py-16 gap-4",
    lg: "py-24 gap-5",
  };

  const iconSizeClasses = {
    sm: "size-10",
    md: "size-14",
    lg: "size-16",
  };

  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizeClasses[size],
        className,
      )}
    >
      {icon && (
        <div
          aria-hidden="true"
          className={cn(
            "flex items-center justify-center rounded-2xl",
            "bg-surface-subtle text-ink-muted mb-1",
            iconSizeClasses[size],
            size === "sm" && "rounded-xl",
          )}
        >
          {icon}
        </div>
      )}

      {/* Default Islamic geometric icon when none provided */}
      {!icon && (
        <div
          aria-hidden="true"
          className={cn(
            "flex items-center justify-center rounded-2xl mb-1",
            "bg-primary-50 text-primary-300",
            iconSizeClasses[size],
          )}
        >
          <svg
            width={size === "sm" ? 20 : 28}
            height={size === "sm" ? 20 : 28}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
      )}

      <h3
        className={cn(
          "font-display font-semibold text-ink-primary",
          size === "sm" ? "text-base" : "text-lg",
        )}
      >
        {title}
      </h3>

      {description && (
        <p
          className={cn(
            "text-ink-tertiary max-w-[36ch]",
            size === "sm" ? "text-sm" : "text-base",
          )}
        >
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          {action && (
            <Button
              size={size === "sm" ? "sm" : "lg"}
              onClick={action.onClick}
              {...(action.href ? { asChild: true } : {})}
            >
              {action.href ? (
                <a href={action.href}>{action.label}</a>
              ) : (
                action.label
              )}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              size={size === "sm" ? "sm" : "lg"}
              onClick={secondaryAction.onClick}
              {...(secondaryAction.href ? { asChild: true } : {})}
            >
              {secondaryAction.href ? (
                <a href={secondaryAction.href}>{secondaryAction.label}</a>
              ) : (
                secondaryAction.label
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Pre-configured empty states for common contexts ────────────────────────
function NoLecturesFound({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      title="No lectures found"
      description="Try adjusting your search or filters to find what you're looking for."
      action={
        onClear ? { label: "Clear filters", onClick: onClear } : undefined
      }
    />
  );
}

function NoArticlesFound({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      title="No articles found"
      description="No articles match your current search. Try different keywords."
      action={
        onClear ? { label: "Clear filters", onClick: onClear } : undefined
      }
    />
  );
}

function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      title={`No results for "${query}"`}
      description="Try a different search term, or browse by category."
      size="lg"
    />
  );
}

export { EmptyState, NoLecturesFound, NoArticlesFound, NoSearchResults };
