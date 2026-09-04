import { Resend } from "resend";
import { env } from "../config/env";
import { ApiError } from "../utils/errors";
import type { ContactFormId } from "./validation";

// Ported near-verbatim from the frontend's src/lib/sendContactEmail.js — the
// actual notification emails Nexoryn receives should look identical after
// the contact form cuts over from client-side EmailJS to this server-side
// send, per docs/TRD.md §5.

const SUBJECTS: Record<ContactFormId, (name: string) => string> = {
  question: (name) => `${name} asked a question (from Nexoryn website)`,
  consultation: (name) => `${name} wants to book a consultation with you (from Nexoryn website)`,
  start: (name) => `${name} wants us to start working on a project (from Nexoryn website)`,
};

const INTROS: Record<ContactFormId, string> = {
  question: "New question submitted via the Nexoryn website.",
  consultation: "New consultation request submitted via the Nexoryn website.",
  start: "New project inquiry submitted via the Nexoryn website.",
};

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  phone: "Contact Number",
  country: "Country",
  city: "City",
  company: "Company",
  datetime: "Preferred Date & Time",
  projectType: "Project Type",
  budget: "Budget Range",
};

// These render as their own trailing paragraph instead of a "Label: value"
// line, matching the frontend's LONGFORM_LABELS.
const LONGFORM_LABELS: Record<string, string> = {
  message: "Message",
  notes: "Notes",
  details: "Project Details",
};

function buildBody(formId: ContactFormId, values: Record<string, unknown>): string {
  const lines = Object.entries(values)
    .filter(([key, val]) => val && !LONGFORM_LABELS[key])
    .map(([key, val]) => `${FIELD_LABELS[key] ?? key}: ${val}`);

  let body = `${INTROS[formId]}\n\n${lines.join("\n")}`;

  for (const [key, label] of Object.entries(LONGFORM_LABELS)) {
    if (values[key]) body += `\n\n${label}:\n${values[key]}`;
  }

  return body;
}

function toHtml(plainTextBody: string): string {
  const escaped = plainTextBody
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<!doctype html>
<html>
  <body style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #1a1a1a;">
    <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #ff7a1a; margin: 0 0 16px;">Nexoryn — Website Submission</h2>
      <pre style="white-space: pre-wrap; font-family: inherit; font-size: 14px; line-height: 1.6; background: #f7f7f7; padding: 16px; border-radius: 8px; border-left: 4px solid #ff7a1a;">${escaped}</pre>
    </div>
  </body>
</html>`;
}

let resendClient: Resend | null = null;
function getResend(): Resend {
  if (!env.resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  resendClient ??= new Resend(env.resendApiKey);
  return resendClient;
}

/** Sends the admin notification for one contact submission. Throws on
 * failure — callers (the contact route) must catch this and still keep the
 * already-persisted submission, per docs/PRD.md FR-8/FR-9. */
export async function sendContactNotification(
  formId: ContactFormId,
  fields: Record<string, unknown>,
  submissionId: string,
): Promise<void> {
  const name = (fields.name as string) || "Someone";
  const subject = SUBJECTS[formId](name);
  const body = buildBody(formId, fields) + `\n\n---\nSubmission ID: ${submissionId}`;

  const result = await getResend().emails.send({
    from: env.resendFromAddress,
    to: env.adminNotificationEmail,
    replyTo: (fields.email as string) || undefined,
    subject,
    text: body,
    html: toHtml(body),
  });

  if (result.error) {
    throw new Error(`Resend send failed: ${result.error.message}`);
  }
}

/** Emails a rendered finance report (HTML body) to one admin's own address. */
export async function sendFinanceReportEmail(
  recipientEmail: string,
  html: string,
  period: string,
): Promise<void> {
  const result = await getResend().emails.send({
    from: env.resendFromAddress,
    to: recipientEmail,
    subject: `Nexoryn Finance Report — ${period}`,
    html,
  });

  if (result.error) {
    // A provider rejection is not a bug in this server, and surfacing it as a
    // bare 500 ("internal server error") hides the one thing that would let
    // someone fix it — most often "you haven't verified a sending domain, so
    // you can only email your own address". Pass the real reason through with
    // a status that says whose problem it is.
    const status = Number((result.error as { statusCode?: number }).statusCode);
    throw new ApiError(
      status >= 400 && status < 500 ? 400 : 502,
      `Email provider rejected this: ${result.error.message}`,
    );
  }
}
