"use client";
// src/features/admin/components/client/AssignRoleButton.tsx

import { useState, useTransition } from "react";
import { assignUserRole } from "@/features/admin/actions/user.actions";
import { cn } from "@shared/lib/utils";

const ROLES = [
  { value: "reader", label: "Reader" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
] as const;

type Role = (typeof ROLES)[number]["value"];

interface AssignRoleButtonProps {
  userId: string;
  currentRole: Role;
}

export function AssignRoleButton({
  userId,
  currentRole,
}: AssignRoleButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState<Role>(currentRole);
  const [saved, setSaved] = useState(false);

  function handleChange(newRole: Role) {
    setRole(newRole);
    setSaved(false);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await assignUserRole({ userId, role });
      if (result.ok) setSaved(true);
    });
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <select
        value={role}
        onChange={(e) => handleChange(e.target.value as Role)}
        disabled={isPending}
        className={cn(
          "h-8 rounded-md px-2 pr-7 text-xs",
          "border border-border-emphasis bg-surface-card text-ink-primary",
          "focus:border-primary-700 outline-none appearance-none cursor-pointer",
          "transition-colors",
        )}
        aria-label="Change user role"
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      {role !== currentRole && (
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-primary-700 text-white hover:bg-primary-800 transition-colors disabled:opacity-40"
        >
          {isPending ? "…" : "Save"}
        </button>
      )}

      {saved && role === currentRole && (
        <span className="text-xs text-green-600 font-medium">Saved</span>
      )}
    </div>
  );
}
