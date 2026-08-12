"use client";

import * as React from "react";
import { cn } from "@shared/lib/utils";

// ── Field Context ─────────────────────────────────────────────────────────
interface FieldGroupContextValue {
  errorId?: string;
  hintId?: string;
  hasError?: boolean;
}

const FieldGroupContext = React.createContext<FieldGroupContextValue>({});

const useFieldGroup = () => React.useContext(FieldGroupContext);

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
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftAddon, rightAddon, ...props }, ref) => {
    const fieldGroup = useFieldGroup();
    const isInvalid = error ?? fieldGroup.hasError;
    const describedBy =
      (props["aria-describedby"] ??
        [fieldGroup.errorId, fieldGroup.hintId].filter(Boolean).join(" ")) ||
      undefined;

    if (leftAddon || rightAddon) {
      return (
        <div className="relative flex items-center w-full">
          {leftAddon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-ink-muted">
              {leftAddon}
            </div>
          )}
          <input
            ref={ref}
            aria-invalid={isInvalid ? "true" : undefined}
            aria-describedby={describedBy}
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
            <div className="absolute right-3 flex items-center text-ink-muted">
              {rightAddon}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        aria-invalid={isInvalid ? "true" : undefined}
        aria-describedby={describedBy}
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
  ({ className, error, rows = 4, ...props }, ref) => {
    const fieldGroup = useFieldGroup();
    const isInvalid = error ?? fieldGroup.hasError;
    const describedBy =
      (props["aria-describedby"] ??
        [fieldGroup.errorId, fieldGroup.hintId].filter(Boolean).join(" ")) ||
      undefined;

    return (
      <textarea
        ref={ref}
        rows={rows}
        aria-invalid={isInvalid ? "true" : undefined}
        aria-describedby={describedBy}
        className={cn(inputBase, "py-3 resize-y min-h-[100px]", className)}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

// ── Select ─────────────────────────────────────────────────────────────────
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    const fieldGroup = useFieldGroup();
    const isInvalid = error ?? fieldGroup.hasError;
    const describedBy =
      (props["aria-describedby"] ??
        [fieldGroup.errorId, fieldGroup.hintId].filter(Boolean).join(" ")) ||
      undefined;

    return (
      <div className="relative w-full">
        <select
          ref={ref}
          aria-invalid={isInvalid ? "true" : undefined}
          aria-describedby={describedBy}
          className={cn(
            inputBase,
            "h-input pr-10 appearance-none cursor-pointer",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-muted">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    );
  },
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
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  ),
);
Label.displayName = "Label";

// ── FieldError ─────────────────────────────────────────────────────────────
interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  id?: string;
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
    <FieldGroupContext.Provider
      value={{
        ...(errorId !== undefined && { errorId }),
        ...(hintId !== undefined && { hintId }),
        ...(error && { hasError: true }),
      }}
    >
      <div className={cn("flex flex-col", className)}>
        <Label
          htmlFor={htmlFor}
          {...(required !== undefined ? { required } : {})}
        >
          {label}
        </Label>
        {children}
        {hint && !error && (
          <FieldHint {...(hintId && { id: hintId })}>{hint}</FieldHint>
        )}
        {error && (
          <FieldError {...(errorId && { id: errorId })}>{error}</FieldError>
        )}
      </div>
    </FieldGroupContext.Provider>
  );
}

export { Input, Textarea, Select, Label, FieldError, FieldHint, FieldGroup };
