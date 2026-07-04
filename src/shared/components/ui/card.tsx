import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@shared/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// CARD
//
// Compound component: Card, CardHeader, CardBody, CardFooter, CardMedia
//
// Variants:
//   default     — standard bordered card
//   interactive — adds hover lift + border colour change (clickable cards)
//   featured    — emerald border accent, brand shadow (homepage highlights)
//   flat        — no border, subtle background (inlined/nested content)
//   ghost       — completely transparent, structure only
// ─────────────────────────────────────────────────────────────────────────────

const cardVariants = cva("relative flex flex-col overflow-hidden", {
  variants: {
    variant: {
      default: ["card"],
      interactive: ["card card-interactive cursor-pointer", "hover:shadow-md"],
      featured: ["card card-featured", "ring-1 ring-primary-200"],
      flat: ["bg-surface-subtle border border-border-subtle rounded-xl"],
      ghost: ["bg-transparent border-0 shadow-none rounded-xl"],
    },
    padding: {
      none: "",
      sm: "",
      md: "",
      lg: "",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "none",
  },
});

export interface CardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

// ── Card Media (image/thumbnail area) ─────────────────────────────────────
interface CardMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  aspectRatio?: "16/9" | "4/3" | "1/1" | "3/4";
}

const CardMedia = React.forwardRef<HTMLDivElement, CardMediaProps>(
  ({ className, aspectRatio = "16/9", children, ...props }, ref) => {
    const aspectClass = {
      "16/9": "aspect-video",
      "4/3": "aspect-[4/3]",
      "1/1": "aspect-square",
      "3/4": "aspect-[3/4]",
    }[aspectRatio];

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden bg-surface-muted",
          aspectClass,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CardMedia.displayName = "CardMedia";

// ── Card Header ────────────────────────────────────────────────────────────
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1 px-6 pt-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

// ── Card Title ─────────────────────────────────────────────────────────────
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: "h2" | "h3" | "h4" }
>(({ className, as: Comp = "h3", ...props }, ref) => (
  <Comp
    ref={ref}
    className={cn(
      "font-display font-bold text-lg text-ink-primary",
      "leading-snug tracking-snug",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

// ── Card Description ───────────────────────────────────────────────────────
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-ink-tertiary leading-relaxed line-clamp-2",
      className,
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// ── Card Body ──────────────────────────────────────────────────────────────
const CardBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col flex-1 gap-3 px-6 py-4", className)}
    {...props}
  />
));
CardBody.displayName = "CardBody";

// ── Card Footer ────────────────────────────────────────────────────────────
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center px-6 pb-6 pt-2",
      "border-t border-border-subtle mt-auto",
      className,
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardMedia,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
};
