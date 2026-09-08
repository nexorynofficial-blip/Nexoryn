// Contact form submission.
//
// This used to call EmailJS straight from the browser, with the backend as an
// optional upgrade. That arrangement is gone: EmailJS needs its service ID,
// template ID and public key present in the client bundle, where anyone can
// read them — and they were, on the live site. With those three values an
// attacker can post to EmailJS's API directly, which skips this site entirely
// along with every protection on it: the rate limit, the honeypot, the
// server-side validation, and the database record.
//
// Everything now goes through the backend, which persists the submission
// *before* attempting to send anything (docs/PRD.md FR-8). That is strictly
// better for not losing a lead than the old fallback was: EmailJS failing
// dropped the enquiry entirely, whereas a failed notification here still
// leaves the lead sitting in the admin Contact Inbox.

export const CONTACT_EMAIL = "nexorynofficial@gmail.com";

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

/**
 * Posts one contact submission to the backend.
 *
 * @param {string} formId  - "question" | "consultation" | "start"
 * @param {object} values  - the form's own fields
 * @param {string} honeypot - the decoy field; real people leave it empty
 */
export async function sendContactEmail(formId, values, honeypot = "") {
  if (!API_BASE) {
    // Better to fail loudly in a deploy that forgot the variable than to look
    // like it sent and quietly drop the enquiry.
    throw new Error("Contact form is not configured. Please email us directly.");
  }

  const res = await fetch(`${API_BASE}/api/v1/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formId, values, honeypot }),
  });

  if (res.ok) return await res.json();

  // 4xx means the payload itself was rejected — surface the server's own
  // wording, which names the field at fault.
  if (res.status >= 400 && res.status < 500) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Please check the form and try again.");
  }

  throw new Error("Something went wrong sending your message. Please try again.");
}
