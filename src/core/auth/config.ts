// src/core/auth/config.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "@core/database/client";
import * as schema from "@core/database/schema";

const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    // schema: {
    //   user: schema.user,
    //   session: schema.session,
    //   account: schema.account,
    //   verification: schema.verification,
    // },
  }),

  session: {
    cookieCache: { enabled: true, maxAge: 60 * 5 }, // 5-min server-side cache
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh if >1 day old
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 10,
  },

  plugins: [
    admin({
      adminRole: "super_admin", // Matches our RBAC role slug
      defaultRole: "reader",
    }),
  ],
});

export default auth;

// src/core/auth/server.ts  — import this in Server Components and Actions
// export const { getSession, signIn, signOut } = auth;
