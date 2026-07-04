"use client";
// src/features/articles/components/client/TableOfContents.tsx
//
// The heading LIST is server-rendered (passed as props from extractToc()).
// Only the ACTIVE STATE (which heading is currently in view) needs client JS.
// This keeps the TOC content in the initial HTML for SEO/no-JS users,
// while still providing the scroll-spy UX progressive enhancement.

import { useEffect, useState, useRef } from "react";
import { cn } from "@shared/lib/utils";
import type { TocHeading } from "../../types/article.types";

interface TableOfContentsProps {
  headings: TocHeading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(
    headings[0]?.id ?? null,
  );
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Find all heading elements currently in the rendered article
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the entry closest to the top of the viewport that's intersecting
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0 && visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // Trigger when heading crosses the upper third of viewport —
        // feels more natural than triggering at the very top edge
        rootMargin: "0px 0px -70% 0px",
        threshold: 0,
      },
    );

    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [headings]);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;

    // Account for sticky nav height when scrolling to anchor
    const navHeight = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top, behavior: "smooth" });
    // Update URL hash without triggering a jump (replaceState, not href change)
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  }

  if (headings.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider px-3">
        On this page
      </h2>

      <ul
        className="flex flex-col gap-0.5 border-l border-border-default"
        role="list"
      >
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "block py-1.5 -ml-px border-l-2 transition-colors duration-fast",
                  "text-sm leading-snug",
                  heading.level === 3 ? "pl-7" : "pl-3",
                  isActive
                    ? "border-primary-700 text-primary-700 font-medium"
                    : "border-transparent text-ink-tertiary hover:text-ink-primary hover:border-border-emphasis",
                )}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
