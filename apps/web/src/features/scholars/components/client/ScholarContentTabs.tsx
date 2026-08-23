"use client";
// src/features/scholars/components/client/ScholarContentTabs.tsx
//
// Tab switching — CSS class toggle only, no data fetching.
// All three panels (lectures, articles, series) are in the DOM from the start.
// This keeps all content SEO-indexed with zero JS required.

import { useState } from "react";
import { cn } from "@shared/lib/utils";

type TabId = "lectures" | "articles" | "series";

interface ScholarContentTabsProps {
  totalLectures: number;
  totalArticles: number;
  totalSeries: number;
  // Three children: [lectures panel, articles panel, series panel]
  children: [React.ReactNode, React.ReactNode, React.ReactNode];
}

export function ScholarContentTabs({
  totalLectures,
  totalArticles,
  totalSeries,
  children,
}: ScholarContentTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("lectures");

  const tabs: Array<{ id: TabId; label: string; count: number }> = [
    { id: "lectures", label: "Lectures", count: totalLectures },
    { id: "articles", label: "Articles", count: totalArticles },
    { id: "series", label: "Series", count: totalSeries },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Scholar content"
        className="flex gap-1 border-b border-border-default"
      >
        {tabs.map((tab) => {
          // Hide tabs with zero content
          if (tab.count === 0) return null;

          return (
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
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab panels — all in DOM, CSS controls visibility */}
      <div className={activeTab === "lectures" ? "block" : "hidden"}>
        {children[0]}
      </div>
      <div className={activeTab === "articles" ? "block" : "hidden"}>
        {children[1]}
      </div>
      <div className={activeTab === "series" ? "block" : "hidden"}>
        {children[2]}
      </div>
    </div>
  );
}
