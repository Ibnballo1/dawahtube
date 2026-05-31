// src/core/content/mdx-components.tsx  — custom MDX component registry
import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  // Islamic content components
  ArabicVerse: ({
    reference,
    text,
    translation,
  }: {
    reference: string;
    text: string;
    translation?: string;
  }) => (
    <div className="my-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5">
      <p className="text-right font-arabic text-2xl leading-loose" dir="rtl">
        {text}
      </p>
      {translation && (
        <p className="mt-2 text-sm text-slate-600 italic">{translation}</p>
      )}
      <p className="mt-1 text-xs text-slate-400">{reference}</p>
    </div>
  ),

  Hadith: ({
    narrator,
    text,
    grade,
  }: {
    narrator: string;
    text: string;
    grade?: string;
  }) => (
    <blockquote className="my-6 border-l-4 border-amber-400 pl-4">
      <p className="text-slate-700">{text}</p>
      <footer className="mt-2 text-sm text-slate-500">
        — {narrator}{" "}
        {grade && <span className="text-amber-600">({grade})</span>}
      </footer>
    </blockquote>
  ),

  ScholarNote: ({
    scholar,
    children,
  }: {
    scholar: string;
    children: React.ReactNode;
  }) => (
    <aside className="my-4 rounded-md bg-slate-50 p-4 text-sm">
      <strong className="text-slate-700">{scholar}:</strong> {children}
    </aside>
  ),
};
