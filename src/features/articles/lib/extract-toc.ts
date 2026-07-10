// src/features/articles/lib/extract-toc.ts
//
// Extracts a table of contents from raw MDX source BEFORE compilation.
// This runs as a lightweight regex pass — much cheaper than waiting on
// the full compileMDX() output just to know what headings exist.
//
// The id generation here MUST exactly match what rehype-slug produces
// during the actual MDX compile, or TOC links won't scroll to the right
// anchor. rehype-slug uses github-slugger under the hood, which:
//   1. Lowercases
//   2. Strips non-word characters except hyphens and spaces
//   3. Replaces spaces with hyphens
//   4. Appends -1, -2, etc. on duplicate slugs
//
// We replicate that exact algorithm here for consistency.

import type { TocHeading } from "../types/article.types";

// Tracks duplicate heading text within one extraction call —
// mirrors github-slugger's per-document duplicate counter.
function createSlugger() {
  const seen = new Map<string, number>();

  return function slug(text: string): string {
    const base = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\u0600-\u06FF\- ]+/g, "") // keep word chars, Arabic range, hyphens, spaces
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);

    return count === 0 ? base : `${base}-${count}`;
  };
}

/**
 * Extract h2 and h3 headings from raw MDX source for table-of-contents
 * generation. h1 is excluded (reserved for the article title). h4+ are
 * excluded as too granular for a TOC.
 *
 * Only matches headings at the start of a line (standard Markdown syntax),
 * not headings inside code blocks. Code block exclusion is a simple state
 * machine — sufficient for the structured content our editors produce.
 */
export function extractToc(mdxSource: string): TocHeading[] {
  const lines = mdxSource.split("\n");
  const headings: TocHeading[] = [];
  const slugger = createSlugger();

  let insideCodeBlock = false;

  for (const line of lines) {
    // Track fenced code blocks (```) so we don't pick up "## comments" in code
    if (line.trim().startsWith("```")) {
      insideCodeBlock = !insideCodeBlock;
      continue;
    }
    if (insideCodeBlock) continue;

    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (!match) continue;

    const level = match[1]!.length as 2 | 3;
    // Strip any inline markdown emphasis/links for clean TOC text
    const text = match[2]!
      .replace(/\*\*(.+?)\*\*/g, "$1") // bold
      .replace(/\*(.+?)\*/g, "$1") // italic
      .replace(/\[(.+?)\]\(.+?\)/g, "$1") // links
      .replace(/`(.+?)`/g, "$1") // inline code
      .trim();

    if (!text) continue;

    headings.push({
      id: slugger(text),
      text,
      level,
    });
  }

  return headings;
}
