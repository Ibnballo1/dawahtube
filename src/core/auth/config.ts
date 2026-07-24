// src/core/auth/config.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "@core/database/client";
import * as schema from "@core/database/schema";
import { Resend } from "resend";

// ─── Resend client ─────────────────────────────────────────────────────────────
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_ADDRESS = `Da'wahTube ${process.env.EMAIL_FROM_DOMAIN ?? "dawahtube.com"}>`;
const APP_NAME = "Da'wahTube";
const APP_URL =
  process.env.BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

// ─── Email sender ──────────────────────────────────────────────────────────────
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.log("\n" + "─".repeat(60));
    console.log(`[DEV EMAIL] To: ${to}`);
    console.log(`[DEV EMAIL] Subject: ${subject}`);
    const urlMatch = html.match(/href="([^"]+)"/);
    if (urlMatch?.[1]) console.log(`[DEV EMAIL] Link: ${urlMatch[1]}`);
    console.log("─".repeat(60) + "\n");
    return;
  }
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
  });
  if (error) console.error("[Resend] Failed to send email:", error);
}

// ─── Email templates ───────────────────────────────────────────────────────────
function emailShell(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,sans-serif;color:#0f172a">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
    <div style="background:#065f46;padding:28px 40px;text-align:center">
      <span style="color:#fff;font-size:20px;font-weight:700">${APP_NAME}</span>
    </div>
    <div style="padding:40px">${body}</div>
    <div style="padding:20px 40px;border-top:1px solid #f1f5f9;background:#f8fafc">
      <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center">
        &copy; ${new Date().getFullYear()} ${APP_NAME} &middot; Authentic Islamic Knowledge
      </p>
    </div>
  </div>
</body></html>`;
}

function verificationEmailHtml(name: string, url: string): string {
  return emailShell(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a">Verify your email address</h1>
    <p style="margin:0 0 8px;color:#64748b;font-size:15px;line-height:1.6">Assalamu alaikum, <strong>${name}</strong>.</p>
    <p style="margin:0 0 28px;color:#64748b;font-size:15px;line-height:1.6">
      Thank you for registering on ${APP_NAME}. Click the button below to verify your email address and activate your account.
    </p>
    <a href="${url}" style="display:inline-block;background:#065f46;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600">
      Verify email address
    </a>
    <p style="margin:28px 0 0;color:#94a3b8;font-size:13px;line-height:1.6">
      This link expires in <strong>24 hours</strong>.
    </p>
  `);
}

function resetPasswordEmailHtml(name: string, url: string): string {
  return emailShell(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a">Reset your password</h1>
    <p style="margin:0 0 8px;color:#64748b;font-size:15px;line-height:1.6">Assalamu alaikum, <strong>${name}</strong>.</p>
    <p style="margin:0 0 28px;color:#64748b;font-size:15px;line-height:1.6">
      We received a request to reset your ${APP_NAME} password. Click below to choose a new password.
    </p>
    <a href="${url}" style="display:inline-block;background:#065f46;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600">
      Reset password
    </a>
    <p style="margin:28px 0 0;color:#94a3b8;font-size:13px;line-height:1.6">
      This link expires in <strong>1 hour</strong>. If you did not request this, ignore this email.
    </p>
  `);
}

const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  baseURL: APP_URL,
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-secret",

  session: {
    cookieCache: { enabled: true, maxAge: 60 * 5 }, // 5-min server-side cache
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh if >1 day old
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,

    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        // to:      user.email,
        to: "dawah2be@gmail.com",
        subject: `Reset your ${APP_NAME} password`,
        html: resetPasswordEmailHtml(user.name ?? user.email, url),
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    expiresIn: 60 * 60 * 24,

    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: `Verify your ${APP_NAME} email address`,
        html: verificationEmailHtml(user.name ?? user.email, url),
      });
    },
  },

  // user: {
  //   additionalFields: {
  //     roleSlug: {
  //       type: "string",
  //       required: false,
  //       defaultValue: "reader",
  //       // Maps to the role_slug column in the user table
  //       fieldName: "roleSlug",
  //     },
  //   },
  // },

  plugins: [
    admin({
      adminRole: "super_admin", // Matches our RBAC role slug
      defaultRole: "reader",
    }),
  ],
});

export default auth;

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

// // src/core/auth/server.ts  — import this in Server Components and Actions
// export const { getSession, signInEmail, signOut } = auth.api;
