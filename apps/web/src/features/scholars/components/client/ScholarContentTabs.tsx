"use client";
// src/features/scholars/components/client/ScholarContentTabs.tsx

import { useState } from "react";
import { cn } from "@shared/lib/utils";

type TabId = "lectures" | "articles" | "series";

interface ScholarContentTabsProps {
  totalLectures: number;
  totalArticles: number;
  totalSeries: number;
  children: [React.ReactNode, React.ReactNode, React.ReactNode];
}

export function ScholarContentTabs({
  totalLectures,
  totalArticles,
  totalSeries,
  children,
}: ScholarContentTabsProps) {
  const tabs: Array<{ id: TabId; label: string; count: number }> = [
    { id: "lectures", label: "Lectures", count: totalLectures },
    { id: "articles", label: "Articles", count: totalArticles },
    { id: "series", label: "Series", count: totalSeries },
  ];

  // Pick the first tab with content (> 0) as default, falling back to 'lectures'
  const firstAvailableTab = tabs.find((tab) => tab.count > 0)?.id ?? "lectures";
  const [activeTab, setActiveTab] = useState<TabId>(firstAvailableTab);

  return (
    <div className="flex flex-col">
      <div
        role="tablist"
        aria-label="Scholar content"
        className="flex gap-1 border-b border-border-default"
      >
        {tabs.map((tab) => {
          // Check if tab.count is valid before rendering
          if (!tab.count || tab.count === 0) return null;

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
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
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
