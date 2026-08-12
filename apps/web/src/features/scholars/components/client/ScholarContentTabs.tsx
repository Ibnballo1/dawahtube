"use client";
// src/features/scholars/components/client/ScholarContentTabs.tsx
//
// Tab switching is pure CSS class toggling — no data fetching ever happens
// here. Both panels are in the DOM from the start (rendered server-side by
// ScholarContentPanel). This client component only manages which panel is
// visually active.
//
// Why CSS show/hide instead of conditional rendering?
//   - Both tab panels are in initial HTML → fully SEO indexed
//   - Zero loading state on tab switch → instant feel
//   - Works without JavaScript (aria-selected still readable by screen readers)
//   - Consistent with the original Phase 8 architectural decision

import { useState } from "react";
import { cn } from "@shared/lib/utils";

type TabId = "lectures" | "articles";

interface ScholarContentTabsProps {
  totalLectures: number;
  totalArticles: number;
  children: [React.ReactNode, React.ReactNode]; // [lectures panel, articles panel]
}

export function ScholarContentTabs({
  totalLectures,
  totalArticles,
  children,
}: ScholarContentTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("lectures");

  const tabs: Array<{ id: TabId; label: string; count: number }> = [
    { id: "lectures", label: "Lectures", count: totalLectures },
    { id: "articles", label: "Articles", count: totalArticles },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Scholar content"
        className="flex gap-1 border-b border-border-default"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`tab-panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium",
              "border-b-2 -mb-px transition-colors duration-fast",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2",
              activeTab === tab.id
                ? "border-primary-700 text-primary-700"
                : "border-transparent text-ink-tertiary hover:text-ink-primary hover:border-border-emphasis",
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={cn(
                  "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5",
                  "rounded-full text-xs font-semibold tabular-nums",
                  activeTab === tab.id
                    ? "bg-primary-100 text-primary-700"
                    : "bg-surface-muted text-ink-muted",
                )}
                aria-label={`${tab.count} ${tab.label.toLowerCase()}`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab panels — both in DOM, CSS hides inactive one */}
      <div className={cn(activeTab === "lectures" ? "block" : "hidden")}>
        {children[0]}
      </div>
      <div className={cn(activeTab === "articles" ? "block" : "hidden")}>
        {children[1]}
      </div>
    </div>
  );
}
