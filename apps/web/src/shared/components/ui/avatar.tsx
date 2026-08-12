import * as React from "react";
import Image from "next/image";
import { cn } from "@shared/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// AVATAR
//
// Displays a scholar or user avatar. Falls back to initials when image
// fails to load or is not provided. Initials are generated from name.
//
// Sizes: xs(24) sm(32) md(40) lg(56) xl(80) 2xl(120)
// ─────────────────────────────────────────────────────────────────────────────

const SIZES = {
  xs: { px: 24, text: "text-xs", ring: "ring-1" },
  sm: { px: 32, text: "text-xs", ring: "ring-1" },
  md: { px: 40, text: "text-sm", ring: "ring-2" },
  lg: { px: 56, text: "text-base", ring: "ring-2" },
  xl: { px: 80, text: "text-xl", ring: "ring-2" },
  "2xl": { px: 120, text: "text-3xl", ring: "ring-4" },
} as const;

type AvatarSize = keyof typeof SIZES;

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// Deterministic colour from name — consistent per scholar
function getAvatarColour(name: string): string {
  const colours = [
    "bg-primary-700  text-white",
    "bg-secondary-700 text-white",
    "bg-accent-700   text-white",
    "bg-slate-700    text-white",
    "bg-teal-700     text-white",
    "bg-emerald-800  text-white",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return colours[Math.abs(hash) % colours.length]!;
}

interface AvatarProps {
  src?: string | null;
  alt: string;
  name: string;
  size?: AvatarSize;
  className?: string;
  ring?: boolean; // show brand ring (for featured scholars)
}

function Avatar({
  src,
  alt,
  name,
  size = "md",
  className,
  ring = false,
}: AvatarProps) {
  const [error, setError] = React.useState(false);
  const config = SIZES[size];
  const initials = getInitials(name);
  const colour = getAvatarColour(name);
  const showImage = src && !error;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        "rounded-full overflow-hidden select-none",
        ring && `ring-[var(--color-primary-700)] ${config.ring} ring-offset-2`,
        !showImage && colour,
        className,
      )}
      style={{ width: config.px, height: config.px }}
      aria-label={alt}
      role="img"
    >
      {showImage ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={`${config.px}px`}
          onError={() => setError(true)}
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn("font-display font-bold leading-none", config.text)}
        >
          {initials}
        </span>
      )}
    </span>
  );
}

// ── AvatarGroup — stacked avatars (e.g. "N scholars teaching this topic") ──
interface AvatarGroupProps {
  avatars: Array<{ src: string | null; name: string }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

function AvatarGroup({
  avatars,
  max = 4,
  size = "sm",
  className,
}: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;

  return (
    <div className={cn("flex items-center", className)}>
      {visible.map((avatar, i) => (
        <Avatar
          key={avatar.name + i}
          src={avatar.src}
          alt={avatar.name}
          name={avatar.name}
          size={size}
          className={cn("ring-2 ring-surface-card", i > 0 && "-ml-2")}
        />
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            "-ml-2 inline-flex shrink-0 items-center justify-center",
            "rounded-full bg-surface-muted ring-2 ring-surface-card",
            "text-xs font-medium text-ink-tertiary",
          )}
          style={{
            width: SIZES[size].px,
            height: SIZES[size].px,
          }}
          aria-label={`${overflow} more`}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}

export { Avatar, AvatarGroup };
export type { AvatarSize };
