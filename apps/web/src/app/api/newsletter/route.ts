// src/app/api/newsletter/route.ts
//
// Handles newsletter signups — saves to Resend Audience.
// Requires: RESEND_API_KEY, RESEND_AUDIENCE_ID, EMAIL_FROM_DOMAIN

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID ?? "";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.safeParse(body);

    if (!data.success) {
      return NextResponse.json(
        { ok: false, error: data.error.issues[0]?.message ?? "Invalid email" },
        { status: 400 },
      );
    }

    const { email, name } = data.data;

    if (!resend || !AUDIENCE_ID) {
      console.log(`[newsletter] Dev mode — would subscribe: ${email}`);
      return NextResponse.json({ ok: true });
    }

    const firstName = name?.trim().split(/\s+/)[0];
    const lastName = name?.trim().split(/\s+/).slice(1).join(" ") || undefined;

    const result = await resend.contacts.create({
      email,
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      unsubscribed: false,
    });

    if (result.error) {
      console.error("[newsletter] Resend error:", result.error);
      if (result.error.message?.toLowerCase().includes("already")) {
        return NextResponse.json({ ok: true, alreadySubscribed: true });
      }
      return NextResponse.json(
        { ok: false, error: "Failed to subscribe. Please try again." },
        { status: 500 },
      );
    }

    // Send welcome email (non-blocking)
    resend.emails
      .send({
        from: `Da'wahTube <noreply@${process.env.EMAIL_FROM_DOMAIN ?? "dawahtube.com"}>`,
        to: email,
        subject: "Welcome to Da'wahTube — Jazakallahu Khayran",
        html: welcomeEmailHtml(name),
      })
      .catch((err) => console.error("[newsletter] Welcome email failed:", err));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[newsletter] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

function welcomeEmailHtml(name?: string): string {
  const greeting = name
    ? `Assalamu alaikum, ${name.split(" ")[0]}`
    : "Assalamu alaikum";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,sans-serif;color:#0f172a">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
    <div style="background:#065f46;padding:28px 40px;text-align:center">
      <span style="color:#fff;font-size:20px;font-weight:700">Da'wahTube</span>
    </div>
    <div style="padding:40px">
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:700">Jazakallahu Khayran! 🎉</h1>
      <p style="margin:0 0 12px;color:#64748b;font-size:15px;line-height:1.6">${greeting}.</p>
      <p style="margin:0 0 28px;color:#64748b;font-size:15px;line-height:1.6">
        You're now subscribed to Da'wahTube. You'll receive updates when new lectures,
        articles, and books are published from trusted Nigerian scholars.
      </p>
      <a href="https://${process.env.EMAIL_FROM_DOMAIN ?? "dawahtube.com"}/lectures"
         style="display:inline-block;background:#065f46;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600">
        Browse lectures
      </a>
      <p style="margin:28px 0 0;color:#94a3b8;font-size:12px;line-height:1.6">
        You can unsubscribe at any time. We will never share your email address.
      </p>
    </div>
    <div style="padding:20px 40px;border-top:1px solid #f1f5f9;background:#f8fafc">
      <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center">
        &copy; ${new Date().getFullYear()} Da'wahTube &middot; Authentic Islamic Knowledge
      </p>
    </div>
  </div>
</body>
</html>`;
}
