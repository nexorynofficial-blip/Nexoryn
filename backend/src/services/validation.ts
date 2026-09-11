import { z } from "zod";

// Field sets copied verbatim from the frontend's `FORMS` array in
// src/pages/ContactPage.jsx — keep these in sync if that file's fields ever
// change. See docs/DATA-MODEL.md §4 for the full rationale per field.

export const contactFormSchemas = {
  question: z.object({
    name: z.string().trim().min(1, "Name is required").max(200),
    email: z.string().trim().email("Invalid email").max(320),
    phone: z.string().trim().max(50).optional().or(z.literal("")),
    country: z.string().trim().max(100).optional().or(z.literal("")),
    city: z.string().trim().max(100).optional().or(z.literal("")),
    message: z.string().trim().min(1, "Message is required").max(5000),
  }),

  consultation: z.object({
    name: z.string().trim().min(1, "Name is required").max(200),
    email: z.string().trim().email("Invalid email").max(320),
    company: z.string().trim().max(200).optional().or(z.literal("")),
    phone: z.string().trim().max(50).optional().or(z.literal("")),
    country: z.string().trim().max(100).optional().or(z.literal("")),
    city: z.string().trim().max(100).optional().or(z.literal("")),
    datetime: z.string().trim().min(1, "Preferred date & time is required").max(300),
    message: z.string().trim().max(5000).optional().or(z.literal("")),
  }),

  start: z.object({
    name: z.string().trim().min(1, "Name is required").max(200),
    email: z.string().trim().email("Invalid email").max(320),
    company: z.string().trim().min(1, "Company is required").max(200),
    phone: z.string().trim().max(50).optional().or(z.literal("")),
    country: z.string().trim().max(100).optional().or(z.literal("")),
    city: z.string().trim().max(100).optional().or(z.literal("")),
    projectType: z.enum(["Automation", "Web Development", "Graphic Design"], {
      errorMap: () => ({ message: "Select a project type" }),
    }),
    budget: z.enum(["Under $5K", "$5K – $15K", "$15K – $50K", "$50K+"], {
      errorMap: () => ({ message: "Select a budget range" }),
    }),
    details: z.string().trim().min(1, "Project details are required").max(5000),
  }),
} as const;

export type ContactFormId = keyof typeof contactFormSchemas;

export function isContactFormId(value: unknown): value is ContactFormId {
  return typeof value === "string" && value in contactFormSchemas;
}

/** Throws a ZodError (caught by the global error handler → 422) on failure. */
export function validateContactForm(formId: ContactFormId, values: unknown) {
  return contactFormSchemas[formId].parse(values);
}

// ── Project / case-study validation ─────────────────────────────────────

// Kept only as suggestions for the admin's industry text field (see
// admin/src/lib/constants.ts) — Project.industry is free text now, not an
// enum, so a project's industry no longer has to be one of these to save.
export const INDUSTRIES = [
  "Fintech",
  "E-Commerce",
  "Healthcare",
  "Real Estate",
  "Hospitality",
  "SaaS & Tech",
  "Logistics",
  "Education",
  "Retail",
  "Manufacturing",
  "Sports & Recruitment",
  "Nonprofit & Advocacy",
] as const;

export const SERVICES = ["Automation", "Web Development", "Brand & Graphic Design"] as const;

// ── Finance ledger ───────────────────────────────────────────────────────

// The three people who share the company equally — a third of every capital
// requirement and a third of every profit. Order matters only for display.
export const PARTNERS = ["Waseem Farooq", "Akbar Khan", "Abdul Ahad"] as const;

// The company itself. Not a partner: it never owes or is owed a share, it's
// the counterparty for personal withdrawals and their repayment.
export const COMPANY_ACTOR = "Nexoryn";

export const LEDGER_ACTORS = [...PARTNERS, COMPANY_ACTOR] as const;

// invested          — capital going INTO the company. Raises the company's
//                     total, and counts toward that partner's third of it.
// earned            — company revenue. Split three ways as profit share.
// personal_withdraw — a partner taking money out for personal use. Does NOT
//                     reduce the company's invested total (that number is
//                     what the partners put in, and it doesn't un-happen) —
//                     it becomes a debt that partner owes the company.
// debt_paid         — settling a debt. `paidTo` a partner squares up an
//                     investment imbalance; `paidTo` Nexoryn clears a
//                     personal withdrawal.
export const LEDGER_TYPES = ["invested", "earned", "personal_withdraw", "debt_paid"] as const;

export const investmentInputSchema = z
  .object({
    amount: z.number().positive(),
    date: z.coerce.date(),
    description: z.string().min(1).max(500),
    type: z.enum(LEDGER_TYPES),
    // `enteredBy` is deliberately absent: the route fills it from the logged-in
    // session so it can't be spoofed or mis-selected.
    actionBy: z.enum(LEDGER_ACTORS),
    paidTo: z.enum(LEDGER_ACTORS).optional(),
  })
  .refine((v) => v.type !== "debt_paid" || !!v.paidTo, {
    message: "Choose who is being repaid",
    path: ["paidTo"],
  })
  .refine((v) => v.type === "debt_paid" || !v.paidTo, {
    message: "paidTo only applies to a debt payment",
    path: ["paidTo"],
  })
  .refine((v) => v.type !== "debt_paid" || v.paidTo !== v.actionBy, {
    message: "A partner can't repay themselves",
    path: ["paidTo"],
  });

// A ledger row is only counted once it is "approved" — see the Investment
// model's comment in prisma/schema.prisma for which rows have to wait.
export const APPROVAL_STATUSES = ["pending", "approved", "rejected"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const decisionInputSchema = z.object({
  note: z.string().trim().max(500).optional(),
  // Verified against AdminUser.actionPasskeyHash in the approve/reject routes
  // (see verifyActionPasskey in services/passkey.ts) before the decision is
  // applied — a valid session cookie alone is not enough to move the ledger.
  passkey: z.string().min(1, "Enter your passkey"),
});

// ── Admin account self-service ──────────────────────────────────────────

export const accountProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
});

/** Passwords that pass any rule-based check but are among the first things
 *  guessed. A full breached-password check runs separately against Have I Been
 *  Pwned (services/passwordBreach.ts); this catches the worst offenders without
 *  needing the network. */
const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "passw0rd",
  "12345678",
  "123456789",
  "1234567890",
  "qwertyuiop",
  "qwerty123",
  "letmein123",
  "welcome123",
  "admin123",
  "administrator",
  "iloveyou",
  "sunshine",
  "princess",
  "football",
  "baseball",
  "monkey123",
  "dragon123",
  "nexoryn",
  "nexoryn123",
  "nexoryn2025",
  "nexoryn2026",
]);

export const passwordFieldSchema = z
  .string()
  // 12, not 8. Length is what actually resists offline cracking; character-class
  // rules mostly push people toward predictable substitutions like "Passw0rd!".
  .min(12, "Use at least 12 characters")
  .max(200)
  .regex(/[a-zA-Z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number")
  .refine((v) => !COMMON_PASSWORDS.has(v.toLowerCase()), {
    message: "That password is too common — pick something less guessable",
  })
  .refine((v) => !/^(.)\1+$/.test(v), {
    message: "That password is too simple — pick something less guessable",
  });

export const accountPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordFieldSchema,
    // Same passkey gate as approving/rejecting a finance request — see
    // verifyActionPasskey in services/passkey.ts.
    passkey: z.string().min(1, "Enter your passkey"),
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    message: "New password must be different from the current one",
    path: ["newPassword"],
  });

// ── Action passkey ───────────────────────────────────────────────────────

/** Proves identity to (re)generate the action passkey when it's been
 *  forgotten — the account password, not the passkey itself, since needing
 *  the passkey to replace a forgotten passkey would be a dead end. */
export const passkeyRegenerateSchema = z.object({
  password: z.string().min(1, "Enter your password"),
});

const bulletList = z.array(z.string().min(1)).default([]);
const workflowStep = z.object({ icon: z.string().min(1), label: z.string().min(1) });
const titledDescription = z.object({ title: z.string().min(1), description: z.string().min(1) });
const galleryShot = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

const standardCaseStudySchema = z
  .object({
    category: z.string().min(1),
    techIcons: z.array(z.object({ name: z.string().min(1), icon: z.string().min(1) })),
    summary: z.string().min(1),
    overview: z.object({
      problem: bulletList,
      solution: bulletList,
      workflow: z.array(workflowStep),
      breakdown: z.array(titledDescription),
    }),
    results: z.object({
      keyFeatures: z.array(titledDescription),
      before: z.string().min(1),
      after: z.string().min(1),
      proof: z.string().min(1),
    }),
    techStack: z.record(
      z.string(),
      z.array(z.object({ name: z.string().min(1), role: z.string().min(1), icon: z.string().min(1) })),
    ),
    scalability: z.array(titledDescription),
    screenshots: z.array(galleryShot).optional(),
    gallery: z.array(galleryShot).optional(),
    livePreview: z.union([z.string().url(), z.literal(true)]).optional(),
  })
  .refine(
    (cs) => [cs.screenshots, cs.gallery, cs.livePreview].filter((v) => v !== undefined).length <= 1,
    { message: "Only one of screenshots / gallery / livePreview may be set" },
  );

const designCaseStudySchema = z.object({
  category: z.string().min(1),
  techIcons: z.array(z.object({ name: z.string().min(1), icon: z.string().min(1) })),
  summary: z.string().min(1),
  overview: z.object({
    problem: bulletList,
    solution: bulletList,
  }),
  designProcess: z.object({
    input: bulletList,
    workflow: z.array(workflowStep),
    engine: z.string().min(1),
    refinements: z.string().min(1),
    qa: z.string().min(1),
  }),
  keyFeatures: z.array(titledDescription),
  useCases: z.array(titledDescription),
  scalability: z.array(titledDescription),
  gallery: z.array(galleryShot).min(1, "Design case studies require at least one gallery image"),
});

export const projectInputSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase, hyphen-separated"),
    title: z.string().min(1).max(200),
    // Free text, not an enum — the admin form uses a text input (with the
    // list above as autocomplete suggestions only) so a project isn't
    // blocked on typing an industry that hasn't been seen before.
    industry: z.string().trim().min(1, "Industry is required").max(100),
    service: z.enum(SERVICES),
    description: z.string().min(1).max(1000),
    tags: z.array(z.string().min(1)).default([]),
    photoId: z.string().min(1),
    caseStudy: z.union([standardCaseStudySchema, designCaseStudySchema]),
    isFeatured: z.boolean().default(false),
    featuredOrder: z.number().int().optional(),
  })
  .refine(
    (p) => {
      const isDesign = "designProcess" in p.caseStudy;
      if (p.service === "Brand & Graphic Design") return isDesign;
      return !isDesign;
    },
    { message: "caseStudy shape must match `service` (design shape only for Brand & Graphic Design)" },
  );

export type ProjectInput = z.infer<typeof projectInputSchema>;
