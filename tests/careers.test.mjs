import assert from "node:assert/strict";
import test from "node:test";
import * as fileType from "file-type";

import { loadSourceModule } from "./helpers.mjs";

const PDF_BYTES = Buffer.from("%PDF-1.7\n%%EOF");
const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// These small archives contain only synthetic text: notes.txt, or a Word document
// with the content-types entry needed to identify the DOCX format.
const GENERIC_ZIP_BYTES = Buffer.from(
  "UEsDBBQAAAAAAHldTF10R/I8MwAAADMAAAAJAAAAbm90ZXMudHh0VGhpcyBpcyBhIGdlbmVyaWMgemlwIGFyY2hpdmUsIG5vdCBhIFdvcmQgZG9jdW1lbnQuUEsBAhQDFAAAAAAAeV1MXXRH8jwzAAAAMwAAAAkAAAAAAAAAAAAAAIABAAAAAG5vdGVzLnR4dFBLBQYAAAAAAQABADcAAABaAAAAAAA=",
  "base64",
);
const DOCX_BYTES = Buffer.from(
  "UEsDBBQAAAAAAHldTF2Rp0i1AgEAAAIBAAATAAAAW0NvbnRlbnRfVHlwZXNdLnhtbDw/eG1sIHZlcnNpb249IjEuMCIgZW5jb2Rpbmc9IlVURi04Ij8+PFR5cGVzIHhtbG5zPSJodHRwOi8vc2NoZW1hcy5vcGVueG1sZm9ybWF0cy5vcmcvcGFja2FnZS8yMDA2L2NvbnRlbnQtdHlwZXMiPjxPdmVycmlkZSBQYXJ0TmFtZT0iL3dvcmQvZG9jdW1lbnQueG1sIiBDb250ZW50VHlwZT0iYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LndvcmRwcm9jZXNzaW5nbWwuZG9jdW1lbnQubWFpbit4bWwiLz48L1R5cGVzPlBLAwQUAAAAAAB5XUxd3qknwcMAAADDAAAAEQAAAHdvcmQvZG9jdW1lbnQueG1sPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48dzpkb2N1bWVudCB4bWxuczp3PSJodHRwOi8vc2NoZW1hcy5vcGVueG1sZm9ybWF0cy5vcmcvd29yZHByb2Nlc3NpbmdtbC8yMDA2L21haW4iPjx3OmJvZHk+PHc6cD48dzpyPjx3OnQ+VGVzdCByZXN1bWU8L3c6dD48L3c6cj48L3c6cD48L3c6Ym9keT48L3c6ZG9jdW1lbnQ+UEsBAhQDFAAAAAAAeV1MXZGnSLUCAQAAAgEAABMAAAAAAAAAAAAAAIABAAAAAFtDb250ZW50X1R5cGVzXS54bWxQSwECFAMUAAAAAAB5XUxd3qknwcMAAADDAAAAEQAAAAAAAAAAAAAAgAEzAQAAd29yZC9kb2N1bWVudC54bWxQSwUGAAAAAAIAAgCAAAAAJQIAAAAA",
  "base64",
);

async function loadCareersRoute(options = {}) {
  const messages = [];
  const loggedErrors = [];
  const smtp = {
    createTransport: () => ({
      sendMail: async (message) => {
        if (options.sendError) {
          throw new Error("Synthetic SMTP failure containing private-test-value");
        }
        messages.push(message);
      },
    }),
  };
  const env = {
    CAREERS_TO: "jobs@example.test",
    ...(options.smtpUnavailable ? {} : {
      SMTP_HOST: "smtp.example.test",
      SMTP_PORT: "587",
      SMTP_USER: "applications@example.test",
      SMTP_PASS: "test-only",
    }),
  };
  const route = loadSourceModule("src/app/api/careers/route.ts", {
    process: { env },
    console: { error: (...args) => loggedErrors.push(args.join(" ")) },
    require: (specifier) => {
      if (specifier === "nodemailer") return smtp;
      if (specifier === "file-type") return fileType;
      return undefined;
    },
  });

  return { route, messages, loggedErrors };
}

function makeApplication(options = {}) {
  const form = new FormData();
  const fields = {
    name: "Test Applicant",
    email: "applicant@example.test",
    phone: "555-0100",
    preferredLocation: "Mission Valley",
    message: "",
    website: "",
    ...options.fields,
  };
  for (const [name, value] of Object.entries(fields)) {
    form.set(name, value);
  }
  if (!options.omitResume) {
    form.set("resume", new File(
      [options.bytes ?? PDF_BYTES],
      options.filename ?? "resume.pdf",
      { type: options.mime ?? "application/pdf" },
    ));
  }
  return new Request("http://localhost/api/careers", { method: "POST", body: form });
}

test("required application fields and email are validated on the server", async (t) => {
  const cases = [
    ...["name", "email", "phone", "preferredLocation"].map((field) => ({
      label: `missing ${field}`,
      fields: { [field]: " " },
    })),
    { label: "invalid email", fields: { email: "invalid-email" } },
    { label: "unknown location", fields: { preferredLocation: "Unknown location" } },
  ];
  for (const entry of cases) {
    await t.test(entry.label, async () => {
      const { route, messages } = await loadCareersRoute();
      const response = await route.POST(makeApplication(entry));
      assert.equal(response.status, 400);
      assert.equal((await response.json()).ok, false);
      assert.equal(messages.length, 0);
    });
  }
});

test("resume validation rejects invalid uploads before sending mail", async (t) => {
  const cases = [
    { label: "missing resume", omitResume: true },
    { label: "empty resume", bytes: Buffer.alloc(0) },
    { label: "one-byte PDF", bytes: Buffer.from("%") },
    { label: "truncated PDF signature", bytes: Buffer.from("%PD") },
    { label: "PDF magic without version header", bytes: Buffer.from("%PDF") },
    { label: "truncated PDF version header", bytes: Buffer.from("%PDF-1.") },
    { label: "truncated ZIP signature", bytes: Buffer.from([0x50, 0x4b]), filename: "resume.docx", mime: DOCX_MIME },
    { label: "ZIP signature without archive data", bytes: Buffer.from([0x50, 0x4b, 0x03, 0x04]), filename: "resume.docx", mime: DOCX_MIME },
    { label: "oversized resume", bytes: Buffer.alloc(10 * 1024 * 1024 + 1) },
    { label: "legacy Word filename", filename: "resume.doc" },
    { label: "executable filename", filename: "resume.exe" },
    { label: "spoofed PDF MIME", bytes: Buffer.from("Plain text with a PDF MIME declaration") },
    { label: "generic ZIP renamed DOCX", bytes: GENERIC_ZIP_BYTES, filename: "resume.docx", mime: DOCX_MIME },
  ];
  for (const entry of cases) {
    await t.test(entry.label, async () => {
      const { route, messages } = await loadCareersRoute();
      const response = await route.POST(makeApplication(entry));
      assert.equal(response.status, 400);
      assert.equal((await response.json()).ok, false);
      assert.equal(messages.length, 0);
    });
  }
});

test("malformed application bodies return a validation error", async (t) => {
  for (const contentType of ["text/plain", "multipart/form-data; boundary=test-boundary"]) {
    await t.test(contentType, async () => {
      const { route, messages } = await loadCareersRoute();
      const response = await route.POST(new Request("http://localhost/api/careers", {
        method: "POST",
        headers: { "Content-Type": contentType },
        body: "not an application form",
      }));
      assert.equal(response.status, 400);
      assert.equal((await response.json()).message, "Please submit a valid application form.");
      assert.equal(messages.length, 0);
    });
  }
});

test("PDF and DOCX are recognized from their bytes instead of declared MIME", async (t) => {
  const cases = [
    { label: "PDF", mime: "application/octet-stream", expectedMime: "application/pdf" },
    { label: "DOCX", bytes: DOCX_BYTES, filename: "resume.docx", mime: "application/zip", expectedMime: DOCX_MIME },
  ];
  for (const entry of cases) {
    await t.test(entry.label, async () => {
      const { route, messages } = await loadCareersRoute();
      const response = await route.POST(makeApplication(entry));
      assert.equal(response.status, 200);
      assert.equal((await response.json()).ok, true);
      assert.equal(messages.length, 1);
      assert.equal(messages[0].to, "jobs@example.test");
      assert.equal(messages[0].attachments[0].contentType, entry.expectedMime);
    });
  }
});

test("application HTML escapes user-provided text", async () => {
  const { route, messages } = await loadCareersRoute();
  const response = await route.POST(makeApplication({
    fields: { name: "<script>alert('test')</script>", message: '<img src="x"> & notes' },
  }));
  assert.equal(response.status, 200);
  assert.equal(messages.length, 1);
  assert.ok(messages[0].html.includes("&lt;script&gt;alert(&#39;test&#39;)&lt;/script&gt;"));
  assert.ok(messages[0].html.includes("&lt;img src=&quot;x&quot;&gt; &amp; notes"));
  assert.ok(!messages[0].html.includes("<script>"));
  assert.ok(!messages[0].html.includes('<img src="x">'));
});

test("honeypot submissions never send mail", async () => {
  const { route, messages } = await loadCareersRoute();
  const response = await route.POST(makeApplication({ fields: { website: "https://example.test" } }));
  assert.equal(response.status, 200);
  assert.equal(messages.length, 0);
});

test("missing SMTP settings return a guest-facing message", async () => {
  const { route, messages, loggedErrors } = await loadCareersRoute({ smtpUnavailable: true });
  const response = await route.POST(makeApplication());
  const body = await response.json();
  assert.equal(response.status, 500);
  assert.equal(body.message, "Applications are temporarily unavailable. Please try again later.");
  assert.ok(!JSON.stringify(body).includes("SMTP_"));
  assert.equal(messages.length, 0);
  assert.equal(loggedErrors.length, 1);
});

test("SMTP failures retain a generic response and log", async () => {
  const { route, messages, loggedErrors } = await loadCareersRoute({ sendError: true });
  const response = await route.POST(makeApplication());
  const body = await response.json();
  assert.equal(response.status, 500);
  assert.equal(body.message, "We could not submit your application. Please try again.");
  assert.equal(messages.length, 0);
  assert.equal(loggedErrors.length, 1);
  assert.ok(!loggedErrors[0].includes("private-test-value"));
});
