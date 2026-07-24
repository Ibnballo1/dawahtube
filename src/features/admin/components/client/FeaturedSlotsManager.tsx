"use client";
// src/features/admin/components/client/FeaturedSlotsManager.tsx
//
// Homepage CMS UI. Each slot key has a card showing the current assignment
// with a dropdown to change it. Saves via the setFeaturedSlot Server Action.
// No drag-and-drop — simple positional dropdowns are more reliable across
// devices and screen readers.

import { useState, useTransition } from "react";
import {
  setFeaturedSlot,
  removeFeaturedSlot,
} from "@/features/admin/actions/featured.actions";
import { cn } from "@shared/lib/utils";

interface SlotConfig {
  key: string;
  label: string;
  max: number;
  entityType: "lecture" | "article" | "book" | "scholar" | "reminder";
}

interface CurrentSlot {
  id: string;
  slotKey: string;
  position: number;
  entityType: string;
  entityId: string;
  isActive: boolean;
}

interface Candidate {
  id: string;
  label: string;
}

interface FeaturedSlotsManagerProps {
  slotConfig: SlotConfig[];
  currentSlots: CurrentSlot[];
  candidates: Record<string, Candidate[]>;
}

export function FeaturedSlotsManager({
  slotConfig,
  currentSlots,
  candidates,
}: FeaturedSlotsManagerProps) {
  return (
    <div className="flex flex-col gap-6">
      {slotConfig.map((slot) => (
        <SlotCard
          key={slot.key}
          slot={slot}
          current={currentSlots.filter((s) => s.slotKey === slot.key)}
          options={candidates[slot.entityType] ?? []}
        />
      ))}
    </div>
  );
}

function SlotCard({
  slot,
  current,
  options,
}: {
  slot: SlotConfig;
  current: CurrentSlot[];
  options: Candidate[];
}) {
  const positions = Array.from({ length: slot.max }, (_, i) => i);

  return (
    <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-subtle bg-surface-subtle flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-base text-ink-primary">
            {slot.label}
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            {slot.max === 1 ? "Single slot" : `Up to ${slot.max} items`} ·{" "}
            {slot.entityType}
          </p>
        </div>
        <span className="text-xs text-ink-muted bg-surface-muted px-2.5 py-1 rounded-full">
          {current.filter((s) => s.isActive).length}/{slot.max} filled
        </span>
      </div>

      {/* Position rows */}
      <div className="divide-y divide-border-subtle">
        {positions.map((pos) => {
          const assignment = current.find((s) => s.position === pos);
          return (
            <SlotPositionRow
              key={pos}
              slotKey={slot.key}
              position={pos}
              entityType={slot.entityType}
              assignment={assignment}
              options={options}
              showPosition={slot.max > 1}
            />
          );
        })}
      </div>
    </div>
  );
}

function SlotPositionRow({
  slotKey,
  position,
  entityType,
  assignment,
  options,
  showPosition,
}: {
  slotKey: string;
  position: number;
  entityType: string;
  assignment: CurrentSlot | undefined;
  options: Candidate[];
  showPosition: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [selectedId, setSelectedId] = useState(assignment?.entityId ?? "");

  function handleChange(entityId: string) {
    setSelectedId(entityId);
    setSaved(false);
  }

  function handleSave() {
    if (!selectedId) return;
    startTransition(async () => {
      const result = await setFeaturedSlot({
        slotKey,
        entityType: entityType as "lecture",
        entityId: selectedId,
        position,
      });
      if (result.ok) setSaved(true);
    });
  }

  function handleRemove() {
    if (!assignment?.id) return;
    startTransition(async () => {
      await removeFeaturedSlot(assignment.id);
      setSelectedId("");
      setSaved(false);
    });
  }

  const currentLabel = options.find((o) => o.id === selectedId)?.label;

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-5 py-3",
        isPending && "opacity-60",
      )}
    >
      {/* Position badge */}
      {showPosition && (
        <span className="size-6 rounded-full bg-surface-muted text-ink-muted text-xs font-semibold flex items-center justify-center shrink-0">
          {position + 1}
        </span>
      )}

      {/* Entity selector */}
      <div className="flex-1 min-w-0">
        <select
          value={selectedId}
          onChange={(e) => handleChange(e.target.value)}
          disabled={isPending}
          className={cn(
            "w-full h-9 rounded-lg px-3 pr-8 text-sm",
            "border border-border-emphasis bg-surface-card text-ink-primary",
            "focus:border-primary-700 focus:ring-2 focus:ring-primary-700/15 outline-none",
            "appearance-none cursor-pointer transition-colors",
          )}
          aria-label={`Select ${entityType} for position ${position + 1}`}
        >
          <option value="">— Empty —</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Save / Remove actions */}
      <div className="flex items-center gap-2 shrink-0">
        {selectedId && selectedId !== assignment?.entityId && (
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold",
              "bg-primary-700 text-white hover:bg-primary-800",
              "transition-colors disabled:opacity-40",
            )}
          >
            {isPending ? "…" : "Save"}
          </button>
        )}

        {saved && selectedId === assignment?.entityId && (
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Saved
          </span>
        )}

        {assignment?.entityId && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            aria-label="Remove from slot"
            className="text-ink-muted hover:text-red-600 transition-colors p-1 disabled:opacity-40"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
