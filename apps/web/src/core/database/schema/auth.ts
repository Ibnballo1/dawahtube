import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
  primaryKey,
  varchar,
} from "drizzle-orm/pg-core";
import { idColumn, auditTimestamps, softDelete } from "./helpers";

// ─────────────────────────────────────────────────────────────────────────────
// USERS
// BetterAuth manages this table. The columns here must match BetterAuth's
// expected schema exactly. Additional columns (role cache, preferences) are
// additive and safe.
//
// Why role_slug as a cache column?
// BetterAuth serialises the user object into the session cookie. Having a
// single role string in the session avoids a DB query for 90% of permission
// checks (simple role-gate middleware). Full permission checks still query
// user_roles + role_permissions.
// ─────────────────────────────────────────────────────────────────────────────

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    role: text("role").notNull().default("reader"),
    deletedAt: timestamp("deleted_at"),
    banned: boolean("banned").default(false),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires"),
  },
  (table) => [
    index("user_role_idx").on(table.role),
    index("user_deleted_at_idx").on(table.deletedAt),
  ],
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// ─────────────────────────────────────────────────────────────────────────────
// ROLES
// Named collections of permissions. Seeded via db:seed, not migrations.
// slug: machine-readable identifier ('super_admin', 'editor', etc.)
// label: human-readable display name ('Super Admin', 'Editor')
// isSystem: system roles cannot be deleted from the admin UI
// ─────────────────────────────────────────────────────────────────────────────
export const roles = pgTable(
  "roles",
  {
    id: text("id").primaryKey(),
    slug: varchar("slug", { length: 64 }).notNull(),
    label: varchar("label", { length: 128 }).notNull(),
    description: text("description"),
    isSystem: boolean("is_system").notNull().default(false),
    ...auditTimestamps(),
  },
  (t) => [uniqueIndex("roles_slug_uidx").on(t.slug)],
);

// ─────────────────────────────────────────────────────────────────────────────
// ROLE_PERMISSIONS
// Each row = one role has one permission.
// Permissions are stored as strings matching the PERMISSIONS enum in
// src/core/auth/permissions.ts — the TypeScript enum is the schema.
// ─────────────────────────────────────────────────────────────────────────────
export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id!, { onDelete: "cascade" }),
    permission: text("permission").notNull(),
    ...auditTimestamps(),
  },
  (t) => [
    primaryKey({ columns: [t.roleId, t.permission] }),
    index("role_permissions_permission_idx").on(t.permission),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// USER_ROLES
// A user can hold multiple roles simultaneously.
// assignedBy: the admin user who assigned this role (audit trail)
// ─────────────────────────────────────────────────────────────────────────────
export const userRoles = pgTable(
  "user_roles",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "restrict" }),
    assignedBy: varchar("assigned_by", { length: 26 }).references(
      () => user.id,
      { onDelete: "set null" },
    ),
    assignedAt: timestamp("assigned_at", { withTimezone: true, mode: "date" })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.roleId] }),
    index("user_roles_role_id_idx").on(t.roleId),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// RELATIONS (Drizzle query builder)
// ─────────────────────────────────────────────────────────────────────────────
export const usersRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  userRoles: many(userRoles),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  permissions: many(rolePermissions),
  userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(user, { fields: [userRoles.userId], references: [user.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
  assignedBy: one(user, {
    fields: [userRoles.assignedBy],
    references: [user.id],
  }),
}));

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
  }),
);
