// src/features/contact/actions/contact.action.ts
"use server";

import { Resend } from "resend";
import { z } from "zod";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(2).max(100),
  message: z.string().min(10).max(5000),
});

interface ContactResult {
  ok: boolean;
  error?: string;
}

export async function sendContactEmail(
  input: z.infer<typeof schema>,
): Promise<ContactResult> {
  const data = schema.safeParse(input);
  if (!data.success) {
    return {
      ok: false,
      error: data.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { name, email, subject, message } = data.data;

  // Dev fallback — log to console
  if (!resend) {
    console.log("[contact] Dev mode — would send:", {
      name,
      email,
      subject,
      message,
    });
    return { ok: true };
  }

  const domain = process.env.EMAIL_FROM_DOMAIN ?? "dawahtube.com";

  try {
    // Send to the Da'wahTube team
    await resend.emails.send({
      from: `Da'wahTube Contact <noreply@${domain}>`,
      to: [`info@${domain}`],
      replyTo: email,
      subject: `[Contact] ${subject} — from ${name}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#065f46;margin-bottom:16px">New contact message</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            <tr><td style="padding:8px;font-weight:600;color:#475569;width:100px">Name</td><td style="padding:8px;color:#0f172a">${name}</td></tr>
            <tr style="background:#f8fafc"><td style="padding:8px;font-weight:600;color:#475569">Email</td><td style="padding:8px"><a href="mailto:${email}" style="color:#065f46">${email}</a></td></tr>
            <tr><td style="padding:8px;font-weight:600;color:#475569">Subject</td><td style="padding:8px;color:#0f172a">${subject}</td></tr>
          </table>
          <div style="background:#f8fafc;border-radius:8px;padding:16px;border-left:4px solid #065f46">
            <p style="margin:0;color:#0f172a;line-height:1.6;white-space:pre-wrap">${message}</p>
          </div>
          <p style="margin-top:20px;font-size:12px;color:#94a3b8">
            Sent via Da'wahTube contact form · Reply directly to this email to respond to ${name}
          </p>
        </div>
      `,
    });

    // Send confirmation to the user
    await resend.emails.send({
      from: `Da'wahTube <noreply@${domain}>`,
      to: [email],
      subject: "We received your message — Da'wahTube",
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
          <div style="background:#065f46;padding:28px 40px">
            <span style="color:#fff;font-size:20px;font-weight:700">Da'wahTube</span>
          </div>
          <div style="padding:40px">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a">Assalamu alaikum, ${name}</h1>
            <p style="margin:0 0 12px;color:#64748b;font-size:15px;line-height:1.6">
              JazakAllahu Khayran for reaching out. We have received your message about
              <strong style="color:#0f172a">"${subject}"</strong> and will get back to you soon, in sha Allah.
            </p>
            <p style="margin:0 0 28px;color:#64748b;font-size:15px;line-height:1.6">
              We typically respond within 2–3 business days.
            </p>
            <p style="margin:0;color:#94a3b8;font-size:12px">
              If you did not send this message, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    return { ok: true };
  } catch (err) {
    console.error("[contact] Email error:", err);
    return { ok: false, error: "Failed to send message. Please try again." };
  }
}
