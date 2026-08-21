import emailjs from "@emailjs/browser";

// EmailJS lets a static site (no backend here) deliver form submissions as
// real email — sign up at emailjs.com, connect nexorynofficial@gmail.com as
// the "service", create one template with the variables used below, and
// drop the three IDs into a .env file. See .env.example for the exact keys.
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const CONTACT_EMAIL = "nexorynofficial@gmail.com";

const SUBJECTS = {
  question: (name) => `${name} asked a question (from Nexoryn website)`,
  consultation: (name) =>
    `${name} wants to book a consultation with you (from Nexoryn website)`,
  start: (name) =>
    `${name} wants us to start working on a project (from Nexoryn website)`,
};

const INTROS = {
  question: "New question submitted via the Nexoryn website.",
  consultation: "New consultation request submitted via the Nexoryn website.",
  start: "New project inquiry submitted via the Nexoryn website.",
};

const FIELD_LABELS = {
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
// line, since they can run to several sentences.
const LONGFORM_LABELS = {
  message: "Message",
  notes: "Notes",
  details: "Project Details",
};

function buildBody(formId, values) {
  const lines = Object.entries(values)
    .filter(([key, val]) => val && !LONGFORM_LABELS[key])
    .map(([key, val]) => `${FIELD_LABELS[key] ?? key}: ${val}`);

  let body = `${INTROS[formId]}\n\n${lines.join("\n")}`;

  for (const [key, label] of Object.entries(LONGFORM_LABELS)) {
    if (values[key]) body += `\n\n${label}:\n${values[key]}`;
  }

  return body;
}

export async function sendContactEmail(formId, values) {
  const name = values.name || "Someone";

  return emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      to_email: CONTACT_EMAIL,
      subject: SUBJECTS[formId](name),
      from_name: name,
      reply_to: values.email || "",
      message: buildBody(formId, values),
    },
    { publicKey: PUBLIC_KEY },
  );
}
