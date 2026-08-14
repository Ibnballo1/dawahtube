"use client";
// src/features/admin/components/client/CategoryManager.tsx
//
// All-in-one category management UI.
// Shows a list of existing categories with edit/delete/toggle actions,
// plus an inline form to create new ones.
// Used by all three category pages (lecture, article, book).

import { useState, useTransition } from "react";
import { cn } from "@shared/lib/utils";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
} from "@features/admin/actions/category.actions";
import type { CategoryInput } from "@features/admin/actions/category.actions";

type CategoryType = "lecture" | "article" | "book";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
  isActive: boolean;
}

interface CategoryManagerProps {
  type: CategoryType;
  initial: Category[];
  typeLabel: string; // e.g. "Lecture", "Article", "Book"
}

const inputCls = [
  "w-full rounded-lg px-3 py-2 text-sm",
  "border border-border-emphasis bg-surface-card text-ink-primary",
  "placeholder:text-ink-muted",
  "focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700/15",
  "transition-colors",
].join(" ");

export function CategoryManager({
  type,
  initial,
  typeLabel,
}: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // ── Create ──────────────────────────────────────────────────────────────────
  async function handleCreate(input: CategoryInput) {
    setError(null);
    startTransition(async () => {
      const result = await createCategory(type, input);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      // Optimistically add to list
      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setCategories((prev) => [
        ...prev,
        {
          id: result.data!.id,
          name: input.name,
          slug,
          description: input.description ?? null,
          position: input.position ?? 0,
          isActive: input.isActive ?? true,
        },
      ]);
      setShowNew(false);
    });
  }

  // ── Update ──────────────────────────────────────────────────────────────────
  async function handleUpdate(id: string, input: Partial<CategoryInput>) {
    setError(null);
    startTransition(async () => {
      const result = await updateCategory(type, { id, ...input });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setCategories((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                ...input,
                description:
                  input.description !== undefined
                    ? input.description
                    : c.description,
              }
            : c,
        ),
      );
      setEditingId(null);
    });
  }

  // ── Toggle active ───────────────────────────────────────────────────────────
  async function handleToggle(id: string, isActive: boolean) {
    startTransition(async () => {
      const result = await toggleCategoryActive(type, id, isActive);
      if (!result.ok) return;
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive } : c)),
      );
    });
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function handleDelete(id: string, name: string) {
    if (
      !confirm(
        `Delete category "${name}"? Content using this category will be uncategorised.`,
      )
    )
      return;
    startTransition(async () => {
      const result = await deleteCategory(type, id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
    });
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        isPending && "opacity-70 pointer-events-none",
      )}
    >
      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {/* Category list */}
      <div className="bg-surface-card border border-border-default rounded-xl overflow-hidden">
        {categories.length === 0 && !showNew ? (
          <div className="flex flex-col items-center py-12 gap-3 text-center">
            <p className="text-ink-muted text-sm">
              No {typeLabel.toLowerCase()} categories yet.
            </p>
            <button
              type="button"
              onClick={() => setShowNew(true)}
              className="text-sm text-primary-700 hover:text-primary-800 font-medium transition-colors"
            >
              Create the first one
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-subtle">
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider hidden sm:table-cell">
                  Slug
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider hidden md:table-cell">
                  Description
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {categories
                .sort(
                  (a, b) =>
                    a.position - b.position || a.name.localeCompare(b.name),
                )
                .map((cat) =>
                  editingId === cat.id ? (
                    <CategoryEditRow
                      key={cat.id}
                      category={cat}
                      onSave={(input) => handleUpdate(cat.id, input)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <tr
                      key={cat.id}
                      className="hover:bg-surface-subtle transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-ink-primary">
                        {cat.name}
                      </td>
                      <td className="px-4 py-3 text-ink-muted font-mono text-xs hidden sm:table-cell">
                        {cat.slug}
                      </td>
                      <td className="px-4 py-3 text-ink-tertiary text-xs hidden md:table-cell max-w-xs truncate">
                        {cat.description ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggle(cat.id, !cat.isActive)}
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors",
                            cat.isActive
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : "bg-surface-muted text-ink-muted hover:bg-surface-subtle",
                          )}
                        >
                          {cat.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingId(cat.id)}
                            className="p-1.5 rounded-md text-ink-muted hover:text-ink-primary hover:bg-surface-subtle transition-colors"
                            aria-label={`Edit ${cat.name}`}
                          >
                            <EditIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat.id, cat.name)}
                            className="p-1.5 rounded-md text-ink-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label={`Delete ${cat.name}`}
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}

              {/* New category inline form */}
              {showNew && (
                <CategoryEditRow
                  onSave={handleCreate}
                  onCancel={() => setShowNew(false)}
                  isNew
                />
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add button */}
      {!showNew && categories.length > 0 && (
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 text-sm text-primary-700 hover:text-primary-800 font-medium transition-colors w-fit"
        >
          <PlusIcon />
          Add {typeLabel.toLowerCase()} category
        </button>
      )}
    </div>
  );
}

// ─── Inline edit/create row ───────────────────────────────────────────────────

interface CategoryEditRowProps {
  category?: {
    name: string;
    description: string | null;
    position: number;
    isActive: boolean;
  };
  onSave: (input: CategoryInput) => void;
  onCancel: () => void;
  isNew?: boolean;
}

function CategoryEditRow({
  category,
  onSave,
  onCancel,
  isNew,
}: CategoryEditRowProps) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [position, setPosition] = useState(String(category?.position ?? "0"));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      position: parseInt(position, 10) || 0,
      isActive: category?.isActive ?? true,
    });
  }

  return (
    <tr className="bg-primary-50/50 border-l-2 border-primary-700">
      <td className="px-4 py-3" colSpan={5}>
        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap items-end gap-3"
        >
          <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
            <label className="text-xs font-medium text-ink-secondary">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aqeedah"
              required
              autoFocus
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
            <label className="text-xs font-medium text-ink-secondary">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1 w-20">
            <label className="text-xs font-medium text-ink-secondary">
              Position
            </label>
            <input
              type="number"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              min={0}
              className={inputCls}
            />
          </div>
          <div className="flex gap-2 pb-0.5">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary-700 text-white hover:bg-primary-800 transition-colors"
            >
              {isNew ? "Create" : "Save"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm text-ink-muted hover:text-ink-primary border border-border-default hover:border-border-emphasis transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function EditIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
