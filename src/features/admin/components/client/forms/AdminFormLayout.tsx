// src/features/admin/components/client/forms/AdminFormLayout.tsx
//
// Shared two-column layout used by every admin create/edit form.
// Left column: main fields (title, content, etc.)
// Right column: metadata sidebar (status, category, scholar, etc.)
//
// Also exports FormSection, FormRow, and SubmitRow helpers to keep
// individual form files concise.

"use client";

import Link from "next/link";
import { cn } from "@shared/lib/utils";

interface AdminFormLayoutProps {
  title: string; // e.g. "New lecture" or "Edit lecture"
  backHref: string; // e.g. "/admin/lectures"
  backLabel: string; // e.g. "Back to lectures"
  children: React.ReactNode; // [main column content, sidebar content]
  isEdit?: boolean;
}

export function AdminFormLayout({
  title,
  backHref,
  backLabel,
  children,
}: AdminFormLayoutProps) {
  const [main, sidebar] = Array.isArray(children) ? children : [children, null];

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={backHref}
          className="text-ink-muted hover:text-ink-primary transition-colors flex items-center gap-1.5 text-sm"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          {backLabel}
        </Link>
        <span className="text-border-default" aria-hidden="true">
          /
        </span>
        <h1 className="font-display font-bold text-xl text-ink-primary">
          {title}
        </h1>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        {/* Main column */}
        <div className="flex flex-col gap-5">{main}</div>

        {/* Sidebar */}
        {sidebar && (
          <div className="flex flex-col gap-5 lg:sticky lg:top-24">
            {sidebar}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FormCard ──────────────────────────────────────────────────────────────────
// White card wrapper for a group of related fields

export function FormCard({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-surface-card border border-border-default rounded-xl overflow-hidden",
        className,
      )}
    >
      {title && (
        <div className="px-5 py-4 border-b border-border-subtle bg-surface-subtle">
          <h2 className="font-display font-semibold text-sm text-ink-primary">
            {title}
          </h2>
        </div>
      )}
      <div className="p-5 flex flex-col gap-4">{children}</div>
    </div>
  );
}

// ─── FormField ─────────────────────────────────────────────────────────────────
// Label + input wrapper with optional error message

export function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-ink-secondary"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink-muted">{hint}</p>}
      {error && (
        <p
          className="text-xs text-red-600 flex items-center gap-1"
          role="alert"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Shared input classnames ───────────────────────────────────────────────────

export const inputCls = [
  "w-full rounded-lg px-3 py-2 text-sm",
  "border border-border-emphasis bg-surface-card text-ink-primary",
  "placeholder:text-ink-muted",
  "focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/15",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  "transition-colors",
].join(" ");

export const textareaCls = [inputCls, "resize-y min-h-[120px]"].join(" ");

// ─── ServerErrorBanner ─────────────────────────────────────────────────────────

export function ServerErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800"
    >
      {message}
    </div>
  );
}

// ─── SuccessBanner ────────────────────────────────────────────────────────────

export function SuccessBanner({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 flex items-center gap-2"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {message}
    </div>
  );
}

// ─── SubmitRow ─────────────────────────────────────────────────────────────────

export function SubmitRow({
  isSubmitting,
  submitLabel = "Save",
  cancelHref,
  onDelete,
  isDeleting,
}: {
  isSubmitting: boolean;
  submitLabel?: string;
  cancelHref: string;
  onDelete?: () => void;
  isDeleting?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 pt-2">
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors disabled:opacity-40"
        >
          {isDeleting ? "Deleting…" : "Delete"}
        </button>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-3">
        <Link
          href={cancelHref}
          className="text-sm text-ink-muted hover:text-ink-primary transition-colors px-3 py-2"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "px-5 py-2 rounded-lg text-sm font-semibold",
            "bg-primary-700 text-white hover:bg-primary-800",
            "transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center gap-2",
          )}
        >
          {isSubmitting && (
            <svg
              className="animate-spin"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeOpacity="0.25"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          )}
          {isSubmitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </div>
  );
}
