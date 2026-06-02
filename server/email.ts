import nodemailer from "nodemailer";
import { ENV } from "./_core/env";

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

// ---------------------------------------------------------------------------
// Nodemailer transporter (Gmail / any SMTP)
// ---------------------------------------------------------------------------
function createSmtpTransporter() {
  if (!ENV.smtpUser || !ENV.smtpPass) return null;

  const isSSL = ENV.smtpPort === 465;
  return nodemailer.createTransport({
    host: ENV.smtpHost,
    port: ENV.smtpPort,
    secure: isSSL,          // true = SSL (port 465), false = STARTTLS (port 587)
    requireTLS: !isSSL,     // force STARTTLS upgrade on port 587 (Outlook/Hotmail)
    auth: {
      user: ENV.smtpUser,
      pass: ENV.smtpPass,
    },
    tls: {
      rejectUnauthorized: false, // allow self-signed certs in dev
    },
  });
}

// ---------------------------------------------------------------------------
// Main send function — tries SMTP first, then Resend, then logs demo
// ---------------------------------------------------------------------------
export async function sendEmail({ to, subject, text, html }: SendEmailInput) {
  const fromAddress =
    ENV.emailFrom || (ENV.smtpUser ? `JobCV <${ENV.smtpUser}>` : "JobCV <no-reply@jobcv.app>");

  // --- 1. Try Nodemailer / SMTP ---
  const transporter = createSmtpTransporter();
  if (transporter) {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html: html ?? text.replace(/\n/g, "<br>"),
    });
    console.log("[Email] Sent via SMTP:", info.messageId);
    return { sent: true, messageId: info.messageId };
  }

  // --- 2. Try Resend (fallback) ---
  if (ENV.resendApiKey) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENV.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: fromAddress, to, subject, text }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(
        `Email failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
    }
    return { sent: true };
  }

  // --- 3. Neither configured — log demo ---
  console.log("[Email] No email transport configured. Demo email:", {
    to,
    subject,
    text,
  });
  return { sent: false, reason: "No email transport configured (set SMTP_USER + SMTP_PASS or RESEND_API_KEY)" };
}

// ---------------------------------------------------------------------------
// Application status notification
// ---------------------------------------------------------------------------
export async function sendApplicationStatusEmail({
  to,
  applicantName,
  jobTitle,
  company,
  status,
  hrName,
  hrEmail,
}: {
  to: string;
  applicantName: string;
  jobTitle: string;
  company: string;
  status: "accepted" | "rejected";
  hrName?: string | null;
  hrEmail?: string | null;
}) {
  const accepted = status === "accepted";

  const subject = accepted
    ? `Congratulations! Your application for ${jobTitle} has been accepted`
    : `Update on your application for ${jobTitle}`;

  let text: string;
  let html: string;

  if (accepted) {
    const contactLine =
      hrEmail
        ? `Please reach out to <strong>${hrName ?? "the HR team"}</strong> at <a href="mailto:${hrEmail}">${hrEmail}</a> to schedule your interview and discuss the next steps.`
        : `Please check your email or the job portal for further instructions from ${company}.`;

    const contactLineText =
      hrEmail
        ? `Please reach out to ${hrName ?? "the HR team"} at ${hrEmail} to schedule your interview and discuss the next steps.`
        : `Please check your email or the job portal for further instructions from ${company}.`;

    text = [
      `Hi ${applicantName},`,
      "",
      `Great news! ${company} has reviewed your application for the ${jobTitle} position and we are pleased to inform you that you have been accepted.`,
      "",
      `What's next:`,
      contactLineText,
      "",
      `We wish you the best of luck with your interview!`,
      "",
      "Thank you for using JobCV.",
    ].join("\n");

    html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="color:#16a34a;">🎉 Congratulations, ${applicantName}!</h2>
        <p><strong>${company}</strong> has reviewed your application for the <strong>${jobTitle}</strong> position and we are pleased to inform you that you have been <span style="color:#16a34a;font-weight:bold;">accepted</span>.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
        <h3 style="margin-bottom:8px;">What's next?</h3>
        <p>${contactLine}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
        <p style="color:#6b7280;font-size:13px;">We wish you the best of luck with your interview!</p>
        <p style="color:#6b7280;font-size:13px;">Thank you for using <strong>JobCV</strong>.</p>
      </div>
    `;
  } else {
    text = [
      `Hi ${applicantName},`,
      "",
      `${company} reviewed your application for ${jobTitle}, but it was not selected this time.`,
      "",
      `Don't be discouraged — keep exploring other opportunities on JobCV.`,
      "",
      "Thank you for using JobCV.",
    ].join("\n");

    html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="color:#374151;">Application Update</h2>
        <p>Hi <strong>${applicantName}</strong>,</p>
        <p><strong>${company}</strong> reviewed your application for <strong>${jobTitle}</strong>, but unfortunately it was not selected this time.</p>
        <p>Don't be discouraged — keep exploring other opportunities on <strong>JobCV</strong>!</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
        <p style="color:#6b7280;font-size:13px;">Thank you for using <strong>JobCV</strong>.</p>
      </div>
    `;
  }

  return sendEmail({ to, subject, text, html });
}
