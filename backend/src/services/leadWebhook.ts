import { env } from "../config/env";
import type { ContactFormId } from "./validation";

// Maps this app's internal form id to the webhook's required `formType`.
// Only "start" differs — kept as "start" everywhere else in this codebase
// (routes, the Zod schema, the frontend's FORMS[].id) since renaming it would
// be exactly the kind of redesign this change is meant to avoid; translated
// to "project" only at the point this payload is built.
const FORM_TYPE: Record<ContactFormId, "question" | "consultation" | "project"> = {
  question: "question",
  consultation: "consultation",
  start: "project",
};

/** Never null, never undefined, in the payload — "" for anything empty. */
const str = (v: unknown): string => (typeof v === "string" ? v : "");

export type LeadWebhookPayload = Record<string, string> & { formType: string };

/**
 * Translates one already-validated contact submission into the exact JSON
 * shape the n8n webhook expects. `fields` is the output of
 * validateContactForm() — already required/trimmed/type-checked, so this
 * only renames keys, it doesn't re-validate.
 *
 * Field renames (left = this app's name, from src/pages/ContactPage.jsx and
 * the matching Zod schema in ./validation.ts; right = the webhook's name):
 *   consultation: datetime -> preferredDateTime, message -> notes
 *   start/project: budget -> budgetRange, details -> projectDetails
 * Everything else (name, email, phone, country, city, company, message,
 * projectType) already matches on both sides.
 */
export function buildLeadPayload(formId: ContactFormId, fields: Record<string, unknown>): LeadWebhookPayload {
  const formType = FORM_TYPE[formId];
  const base = {
    formType,
    name: str(fields.name),
    email: str(fields.email),
    phone: str(fields.phone),
    country: str(fields.country),
    city: str(fields.city),
  };

  if (formType === "question") {
    return { ...base, message: str(fields.message) };
  }
  if (formType === "consultation") {
    return {
      ...base,
      company: str(fields.company),
      preferredDateTime: str(fields.datetime),
      notes: str(fields.message),
    };
  }
  return {
    ...base,
    company: str(fields.company),
    projectType: str(fields.projectType),
    budgetRange: str(fields.budget),
    projectDetails: str(fields.details),
  };
}

/**
 * POSTs one lead to the n8n webhook. Throws on a network failure or a
 * non-2xx response — the contact route treats that as the request failing
 * (see routes/public/contact.ts), so the visitor sees the existing error
 * state and knows to retry, even though their submission is already saved.
 *
 * "ngrok-skip-browser-warning" bypasses ngrok's interstitial HTML warning
 * page on free tunnels, which would otherwise come back as a 200 of HTML
 * instead of reaching n8n. Harmless to send against a non-ngrok URL too.
 *
 * Never logs the payload itself (name/email/etc.) — only the HTTP outcome,
 * same as the rest of this route's error logging.
 */
export async function sendLeadWebhook(payload: LeadWebhookPayload): Promise<void> {
  if (!env.leadWebhookUrl) {
    console.warn("LEAD_WEBHOOK_URL is not set — skipping the lead webhook for this submission.");
    return;
  }

  const res = await fetch(env.leadWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`Lead webhook responded with HTTP ${res.status}`);
  }
}
