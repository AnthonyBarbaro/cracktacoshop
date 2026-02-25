import nodemailer from "nodemailer";
import { fileTypeFromBuffer } from "file-type";
import { NextResponse } from "next/server";

import { getCareersRecipientEmail } from "@/lib/careers-config";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function normalizeValue(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function replaceExt(name: string, newExt: ".pdf" | ".docx"): string {
  const base = name.replace(/\.(pdf|docx|doc|docm)$/i, "");
  return `${base}${newExt}`;
}

function makeSafeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9._-]/gi, "_")
    .replace(/_{2,}/g, "_")
    .slice(0, 120);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;width:180px;color:#444;font-weight:600;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;">
        ${escapeHtml(value)}
      </td>
    </tr>`;
}

function getOptionalFromAddress(smtpUser: string): string | undefined {
  const explicitFrom =
    process.env.CAREERS_FROM?.trim() || process.env.SMTP_FROM?.trim();

  if (explicitFrom) {
    return explicitFrom;
  }

  if (smtpUser.includes("@")) {
    return smtpUser;
  }

  return undefined;
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();

    const name = normalizeValue(form.get("name"));
    const email = normalizeValue(form.get("email"));
    const phone = normalizeValue(form.get("phone"));
    const preferredLocation = normalizeValue(form.get("preferredLocation"));
    const message = normalizeValue(form.get("message"));
    const website = normalizeValue(form.get("website"));
    const resume = form.get("resume");

    if (website) {
      return NextResponse.json({ ok: true });
    }

    if (!name || !email || !phone || !preferredLocation) {
      return NextResponse.json(
        { ok: false, message: "Please fill out all required fields." },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, message: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (!(resume instanceof File)) {
      return NextResponse.json(
        { ok: false, message: "Please attach your resume (PDF or DOCX)." },
        { status: 400 },
      );
    }

    if (resume.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, message: "Resume too large. Max file size is 10MB." },
        { status: 400 },
      );
    }

    const originalName = resume.name.toString();
    const lowerName = originalName.toLowerCase();

    if (/\.(doc|docm)$/i.test(lowerName)) {
      return NextResponse.json(
        { ok: false, message: "Legacy Word files are not allowed. Upload PDF or DOCX." },
        { status: 400 },
      );
    }

    if (/\.(exe|bat|cmd|sh|msi|com|scr|ps1|vbs|js|jar)$/i.test(lowerName)) {
      return NextResponse.json(
        { ok: false, message: "Executable files are not allowed. Upload PDF or DOCX." },
        { status: 400 },
      );
    }

    const resumeBuffer = Buffer.from(await resume.arrayBuffer());
    const sniffed = await fileTypeFromBuffer(resumeBuffer);
    const declaredMime = resume.type || "application/octet-stream";
    let resumeMime = sniffed?.mime ?? declaredMime;

    if (sniffed?.mime === "application/zip" && lowerName.endsWith(".docx")) {
      resumeMime =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }

    if (!ALLOWED_MIME.has(resumeMime)) {
      return NextResponse.json(
        { ok: false, message: "Unsupported resume file type. Allowed: PDF or DOCX." },
        { status: 400 },
      );
    }

    const sanitizedFileName = makeSafeFilename(
      replaceExt(lowerName, resumeMime === "application/pdf" ? ".pdf" : ".docx"),
    );

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT ?? 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Email is not configured yet. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.",
        },
        { status: 500 },
      );
    }

    const fromEmail = getOptionalFromAddress(smtpUser);
    const recipientEmail = getCareersRecipientEmail();

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const subject = `Careers Application - ${name} (${preferredLocation})`;
    const textBody = [
      "New careers application submitted:",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Preferred Location: ${preferredLocation}`,
      `Resume: ${sanitizedFileName}`,
      "",
      "Message:",
      message || "No message provided.",
    ].join("\n");

    const htmlBody = `
      <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;color:#0b0b0b;">
        <h2 style="margin:0 0 8px 0;">New Careers Application</h2>
        <table style="border-collapse:collapse;width:100%;font-size:14px;">
          <tbody>
            ${row("Name", name)}
            ${row("Email", email)}
            ${row("Phone", phone)}
            ${row("Preferred Location", preferredLocation)}
            ${row("Resume", sanitizedFileName)}
          </tbody>
        </table>
        <h3 style="margin:20px 0 8px 0;">Message</h3>
        <div style="white-space:pre-wrap;border:1px solid #eee;padding:12px;border-radius:8px;background:#fafafa;">
          ${escapeHtml(message || "No message provided.")}
        </div>
      </div>
    `;

    await transporter.sendMail({
      ...(fromEmail ? { from: fromEmail } : {}),
      to: recipientEmail,
      replyTo: email,
      subject,
      text: textBody,
      html: htmlBody,
      attachments: [
        {
          filename: sanitizedFileName,
          content: resumeBuffer,
          contentType: resumeMime,
        },
      ],
      headers: { "X-Mailer": "Crack Taco Careers Form" },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Careers API error", error);

    return NextResponse.json(
      { ok: false, message: "We could not submit your application. Please try again." },
      { status: 500 },
    );
  }
}
