// src/core/content/mdx-components.tsx
//
// Custom MDX component registry.
// Used by compileMDX in DailyReminder and article pages.
// Components are designed to work on both light (articles) and
// dark (reminder section) backgrounds using CSS variables.

import React from "react";

interface ArabicVerseProps extends Record<string, unknown> {
  reference?: string;
  text?: string;
  translation?: string;
}

interface HadithProps extends Record<string, unknown> {
  narrator?: string;
  text?: string;
  grade?: string;
  source?: string;
}

interface ScholarNoteProps extends Record<string, unknown> {
  scholar?: string;
  children?: React.ReactNode;
}

interface BenefitBoxProps extends Record<string, unknown> {
  title?: string;
  children?: React.ReactNode;
}

export const mdxComponents = {
  // ── Arabic verse block ──────────────────────────────────────────────────────
  // Used for Qur'anic ayat with Arabic text, translation, and reference.
  ArabicVerse: ({
    reference = "",
    text = "",
    translation,
  }: ArabicVerseProps) => (
    <div className="my-6 rounded-xl border border-primary-700/30 bg-primary-900/40 p-5 space-y-3">
      {/* Arabic text — right-aligned, large */}
      <p
        className="text-right font-arabic text-2xl leading-loose text-white/90"
        dir="rtl"
        lang="ar"
      >
        {text}
      </p>

      {/* Translation */}
      {translation && (
        <p className="text-sm text-white/70 italic leading-relaxed border-t border-white/10 pt-3">
          {translation}
        </p>
      )}

      {/* Reference */}
      {reference && (
        <p className="text-xs text-accent-500 font-medium text-right">
          {reference}
        </p>
      )}
    </div>
  ),

  // ── Hadith block ────────────────────────────────────────────────────────────
  Hadith: ({ narrator = "", text = "", grade, source }: HadithProps) => (
    <blockquote className="my-6 border-l-4 border-accent-700 pl-5 space-y-2">
      <p className="text-white/85 leading-relaxed italic">
        &ldquo;{text}&rdquo;
      </p>
      <footer className="text-sm text-white/50">
        {narrator && <span>Narrated by {narrator}</span>}
        {source && <span className="ml-1 text-white/40">— {source}</span>}
        {grade && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-primary-800 text-accent-500 text-xs font-medium">
            {grade}
          </span>
        )}
      </footer>
    </blockquote>
  ),

  // ── Scholar note ────────────────────────────────────────────────────────────
  ScholarNote: ({ scholar = "", children }: ScholarNoteProps) => (
    <aside className="my-4 rounded-lg bg-white/5 border border-white/10 p-4 text-sm">
      {scholar && (
        <strong className="block text-white/80 font-semibold mb-1.5">
          {scholar}:
        </strong>
      )}
      <div className="text-white/70 leading-relaxed">{children}</div>
    </aside>
  ),

  // ── Benefit box ─────────────────────────────────────────────────────────────
  // Highlighted takeaway or benefit of the reminder.
  BenefitBox: ({ title, children }: BenefitBoxProps) => (
    <div className="my-6 rounded-xl bg-primary-800/60 border-l-4 border-primary-400 px-5 py-4 space-y-2">
      {title && (
        <p className="text-sm font-display font-semibold text-primary-300 uppercase tracking-wide">
          {title}
        </p>
      )}
      <div className="text-white/80 text-sm leading-relaxed">{children}</div>
    </div>
  ),

  // ── Standard prose overrides ─────────────────────────────────────────────────
  // Override default HTML elements so they look good on dark background.

  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-white/75 leading-relaxed mb-4 last:mb-0">{children}</p>
  ),

  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="text-white font-semibold">{children}</strong>
  ),

  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="text-white/80 italic">{children}</em>
  ),

  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      className="text-accent-400 hover:text-accent-300 underline underline-offset-2 transition-colors"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),

  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="my-4 space-y-2 list-none pl-0">{children}</ul>
  ),

  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="flex items-start gap-2 text-white/75">
      <span className="text-accent-500 mt-1 shrink-0" aria-hidden="true">
        ◆
      </span>
      <span>{children}</span>
    </li>
  ),

  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-6 border-l-4 border-accent-700 pl-5 text-white/70 italic">
      {children}
    </blockquote>
  ),
};

// ─── Article MDX components (light background variants) ──────────────────────
// Used by article pages — same components with light-mode styling.

export const articleMdxComponents = {
  ArabicVerse: ({
    reference = "",
    text = "",
    translation,
  }: ArabicVerseProps) => (
    <div className="my-6 rounded-xl border border-primary-200 bg-primary-50 p-5 space-y-3">
      <p
        className="text-right font-arabic text-2xl leading-loose text-primary-900"
        dir="rtl"
        lang="ar"
      >
        {text}
      </p>
      {translation && (
        <p className="text-sm text-ink-secondary italic leading-relaxed border-t border-primary-100 pt-3">
          {translation}
        </p>
      )}
      {reference && (
        <p className="text-xs text-primary-700 font-medium text-right">
          {reference}
        </p>
      )}
    </div>
  ),

  Hadith: ({ narrator = "", text = "", grade, source }: HadithProps) => (
    <blockquote className="my-6 border-l-4 border-accent-700 pl-5 space-y-2">
      <p className="text-ink-secondary leading-relaxed italic">
        &ldquo;{text}&rdquo;
      </p>
      <footer className="text-sm text-ink-muted">
        {narrator && <span>Narrated by {narrator}</span>}
        {source && <span className="ml-1">&mdash; {source}</span>}
        {grade && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
            {grade}
          </span>
        )}
      </footer>
    </blockquote>
  ),

  ScholarNote: ({ scholar = "", children }: ScholarNoteProps) => (
    <aside className="my-4 rounded-lg bg-surface-subtle border border-border-default p-4 text-sm">
      {scholar && (
        <strong className="block text-ink-primary font-semibold mb-1.5">
          {scholar}:
        </strong>
      )}
      <div className="text-ink-secondary leading-relaxed">{children}</div>
    </aside>
  ),

  BenefitBox: ({ title, children }: BenefitBoxProps) => (
    <div className="my-6 rounded-xl bg-primary-50 border-l-4 border-primary-700 px-5 py-4 space-y-2">
      {title && (
        <p className="text-sm font-display font-semibold text-primary-700 uppercase tracking-wide">
          {title}
        </p>
      )}
      <div className="text-ink-secondary text-sm leading-relaxed">
        {children}
      </div>
    </div>
  ),
};
