"use client";
// src/features/homepage/components/client/HeroPlayButton.tsx
// Isolated client island — the only interactive part of the hero.
// Everything else in HeroSection renders as a Server Component.

import Link from "next/link";
import { cn } from "@shared/lib/utils";

interface HeroPlayButtonProps {
  lectureSlug: string;
}

export function HeroPlayButton({ lectureSlug }: HeroPlayButtonProps) {
  return (
    <Link
      href={`/lectures/${lectureSlug}`}
      className={cn(
        "absolute inset-0 flex items-center justify-center",
        "group focus-visible:outline-none",
      )}
      aria-label="Play this lecture"
    >
      {/* Backdrop scrim on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-normal"
      />

      {/* Play button ring */}
      <span
        aria-hidden="true"
        className={cn(
          "relative size-16 rounded-full",
          "bg-white/10 backdrop-blur-sm",
          "border-2 border-white/40",
          "flex items-center justify-center",
          "opacity-0 group-hover:opacity-100",
          "scale-75 group-hover:scale-100",
          "transition-all duration-normal ease-spring",
        )}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="white"
          className="ml-1"
          aria-hidden="true"
        >
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </span>
    </Link>
  );
}
