// src/app/api/newsletter/route.ts
//
// Newsletter signup endpoint.
//
// Required env vars:
//   RESEND_API_KEY      — your Resend API key
//   RESEND_AUDIENCE_ID  — create at resend.com → Audiences → Create audience
//   EMAIL_FROM_DOMAIN   — your verified sending domain (e.g. dawahtube.com)
//
// If RESEND_AUDIENCE_ID is missing, the endpoint logs to console (dev fallback).

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { ok: false, error: "Invalid request body" },
        { status: 400 },
      );
    }

    const data = schema.safeParse(body);
    if (!data.success) {
      return NextResponse.json(
        { ok: false, error: data.error.issues[0]?.message ?? "Invalid email" },
        { status: 400 },
      );
    }

    const { email, name } = data.data;

    // ── Dev / missing config fallback ─────────────────────────────────────────
    if (!process.env.RESEND_API_KEY) {
      console.log(`[newsletter] No RESEND_API_KEY — would subscribe: ${email}`);
      return NextResponse.json({ ok: true });
    }

    if (!process.env.RESEND_AUDIENCE_ID) {
      console.log(
        `[newsletter] No RESEND_AUDIENCE_ID — would subscribe: ${email}`,
      );
      console.log(
        "[newsletter] Create an audience at resend.com → Audiences → Create audience",
      );
      return NextResponse.json({ ok: true });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    const domain = process.env.EMAIL_FROM_DOMAIN ?? "dawahtube.com";

    // ── Add contact to Resend audience ────────────────────────────────────────
    const nameParts = name?.trim().split(" ") ?? [];
    const firstName = nameParts[0] ?? undefined;
    const lastName = nameParts.slice(1).join(" ") || undefined;

    const contactResult = await resend.contacts.create({
      audienceId,
      email,
      unsubscribed: false,
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
    });

    // Handle already-subscribed gracefully
    if (contactResult.error) {
      const errMsg = contactResult.error.message?.toLowerCase() ?? "";

      if (
        errMsg.includes("already exists") ||
        errMsg.includes("already subscribed") ||
        errMsg.includes("duplicate")
      ) {
        return NextResponse.json({ ok: true, alreadySubscribed: true });
      }

      console.error(
        "[newsletter] Resend contacts.create error:",
        contactResult.error,
      );
      return NextResponse.json(
        { ok: false, error: "Failed to subscribe. Please try again later." },
        { status: 500 },
      );
    }

    // ── Send welcome email (non-blocking) ─────────────────────────────────────
    resend.emails
      .send({
        from: `Da'wahTube <noreply@${domain}>`,
        to: [email],
        subject: "Welcome to Da'wahTube — Jazakallahu Khayran",
        html: welcomeEmailHtml({
          ...(firstName !== undefined ? { name: firstName } : {}),
          domain,
        }),
      })
      .catch((err: unknown) => {
        // Don't fail the subscription if welcome email fails
        console.error("[newsletter] Welcome email send error:", err);
      });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[newsletter] Unexpected error:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

// ─── Welcome email HTML ───────────────────────────────────────────────────────

function welcomeEmailHtml({
  name,
  domain,
}: {
  name?: string;
  domain: string;
}): string {
  const greeting = name ? `Assalamu alaikum, ${name}` : "Assalamu alaikum";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Da'wahTube</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:system-ui,-apple-system,sans-serif;color:#0f172a">
  <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">

    <!-- Header -->
    <div style="background:#065f46;padding:32px 40px;text-align:center">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.02em">
        Da&apos;wahTube
      </h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:13px">
        Authentic Islamic Knowledge
      </p>
    </div>

    <!-- Body -->
    <div style="padding:40px">
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#0f172a">
        Jazakallahu Khayran! 🎉
      </h2>
      <p style="margin:0 0 12px;color:#64748b;font-size:15px;line-height:1.7">
        ${greeting}.
      </p>
      <p style="margin:0 0 20px;color:#64748b;font-size:15px;line-height:1.7">
        You are now subscribed to Da&apos;wahTube. You will receive updates when new
        lectures, articles, and books are published from trusted Nigerian scholars
        upon the Qur&apos;an and Sunnah.
      </p>

      <!-- Arabic reminder -->
      <div style="background:#f0fdf4;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px">
        <p style="margin:0;font-size:22px;color:#065f46;direction:rtl;font-family:serif;line-height:1.8">
          طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ
        </p>
        <p style="margin:8px 0 0;font-size:12px;color:#94a3b8;font-style:italic">
          &ldquo;Seeking knowledge is an obligation upon every Muslim.&rdquo; — Ibn Majah
        </p>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:24px">
        <a
          href="https://${domain}/lectures"
          style="display:inline-block;background:#065f46;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600"
        >
          Browse lectures →
        </a>
      </div>

      <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6">
        You can unsubscribe at any time by clicking the unsubscribe link in any email
        we send. We will never share your email address with anyone.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:20px 40px;border-top:1px solid #f1f5f9;background:#f8fafc;text-align:center">
      <p style="margin:0;color:#94a3b8;font-size:12px">
        &copy; ${new Date().getFullYear()} Da&apos;wahTube &middot;
        <a href="https://${domain}/privacy" style="color:#94a3b8">Privacy Policy</a> &middot;
        <a href="https://${domain}/terms" style="color:#94a3b8">Terms</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}
