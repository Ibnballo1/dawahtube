import * as React from "react";
import { cn } from "@shared/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// FORM FIELD PRIMITIVES
//
// These are the unstyled primitives. For full form integration with
// React Hook Form, use the FieldWrapper from features/*/components/client.
//
// Accessibility:
//   - All inputs must receive an id prop — use useId() when generating
//   - Pair with <Label htmlFor={id}> always
//   - Error state sets aria-invalid="true" and aria-describedby={errorId}
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared base styles ─────────────────────────────────────────────────────
const inputBase = [
  "w-full font-body text-base text-ink-primary",
  "bg-surface-card border border-border-emphasis",
  "rounded-md px-4",
  "placeholder:text-ink-muted",
  "transition-colors duration-fast",
  "outline-none",
  "focus:border-primary-700 focus:ring-3 focus:ring-primary-700/15",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  "aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/15",
];

// ── Input ──────────────────────────────────────────────────────────────────
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftAddon?: React.ReactNode; // icon or text inside left edge
  rightAddon?: React.ReactNode; // icon or text inside right edge
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftAddon, rightAddon, ...props }, ref) => {
    if (leftAddon || rightAddon) {
      return (
        <div className="relative flex items-center">
          {leftAddon && (
            <span className="absolute left-3 text-ink-muted pointer-events-none [&_svg]:size-4">
              {leftAddon}
            </span>
          )}
          <input
            ref={ref}
            aria-invalid={error}
            className={cn(
              inputBase,
              "h-input",
              leftAddon && "pl-10",
              rightAddon && "pr-10",
              className,
            )}
            {...props}
          />
          {rightAddon && (
            <span className="absolute right-3 text-ink-muted [&_svg]:size-4">
              {rightAddon}
            </span>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        aria-invalid={error}
        className={cn(inputBase, "h-input", className)}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

// ── Textarea ───────────────────────────────────────────────────────────────
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  rows?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={error}
      className={cn(inputBase, "py-3 resize-y min-h-[100px]", className)}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

// ── Select ─────────────────────────────────────────────────────────────────
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={error}
        className={cn(
          inputBase,
          "h-input pr-10 appearance-none cursor-pointer",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {/* Chevron icon */}
      <span
        aria-hidden="true"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>
    </div>
  ),
);
Select.displayName = "Select";

// ── Label ──────────────────────────────────────────────────────────────────
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "block text-sm font-medium text-ink-secondary mb-1.5",
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="text-red-500 ml-1">
          *
        </span>
      )}
    </label>
  ),
);
Label.displayName = "Label";

// ── FieldError ─────────────────────────────────────────────────────────────
interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  id?: string | undefined;
}

function FieldError({ className, children, ...props }: FieldErrorProps) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className={cn(
        "text-sm text-red-600 mt-1.5 flex items-center gap-1",
        className,
      )}
      {...props}
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
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {children}
    </p>
  );
}

// ── FieldHint ──────────────────────────────────────────────────────────────
function FieldHint({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-ink-muted mt-1.5", className)} {...props}>
      {children}
    </p>
  );
}

// ── FieldGroup — wraps label + input + error in correct order ──────────────
interface FieldGroupProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

function FieldGroup({
  label,
  htmlFor,
  required,
  error,
  hint,
  className,
  children,
}: FieldGroupProps) {
  const errorId = error ? `${htmlFor}-error` : undefined;
  const hintId = hint ? `${htmlFor}-hint` : undefined;

  return (
    <div className={cn("flex flex-col", className)}>
      <Label
        htmlFor={htmlFor}
        {...(required !== undefined ? { required } : {})}
      >
        {label}
      </Label>
      {/* Clone child to inject aria-describedby */}
      {React.isValidElement(children)
        ? React.cloneElement(
            children as React.ReactElement<{
              "aria-describedby"?: string;
              error?: boolean;
            }>,
            {
              "aria-describedby": [errorId, hintId].filter(Boolean).join(" "),
              error: !!error,
            },
          )
        : children}
      {hint && !error && <FieldHint id={hintId}>{hint}</FieldHint>}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}

export { Input, Textarea, Select, Label, FieldError, FieldHint, FieldGroup };
