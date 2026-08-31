import type { LedgerActor, LedgerType, Partner } from "../types";

// The three equal partners. Mirrors PARTNERS in
// backend/src/services/validation.ts — keep both in sync.
export const PARTNERS: Partner[] = ["Waseem Farooq", "Akbar Khan", "Abdul Ahad"];

// The company itself: not a partner, but a valid counterparty for a personal
// withdrawal being repaid.
export const COMPANY_ACTOR = "Nexoryn" as const;

export const LEDGER_ACTORS: LedgerActor[] = [...PARTNERS, COMPANY_ACTOR];

export const LEDGER_TYPE_LABELS: Record<LedgerType, string> = {
  invested: "Invested",
  earned: "Earned",
  personal_withdraw: "Personal withdraw",
  debt_paid: "Debt paid",
};

export const LEDGER_TYPE_HINTS: Record<LedgerType, string> = {
  invested: "Capital going into the company. Counts toward this partner's third.",
  earned: "Company revenue. Split three ways as profit share.",
  personal_withdraw:
    "Money taken out for personal use. The company total stays put — this becomes a debt owed back to Nexoryn.",
  debt_paid: "Settling up. Pay a partner to close a capital gap, or Nexoryn to clear a withdrawal.",
};

export const LEDGER_TYPES = Object.keys(LEDGER_TYPE_LABELS) as LedgerType[];

export const TEAM_ROLE_PRESETS = [
  "Co-Founder/Admin",
  "Co-Founder",
  "Founder",
  "Admin",
  "Team Member",
];

export const INDUSTRIES = [
  "Fintech", "E-Commerce", "Healthcare", "Real Estate", "Hospitality", "SaaS & Tech",
  "Logistics", "Education", "Retail", "Manufacturing", "Sports & Recruitment", "Nonprofit & Advocacy",
];

export const SERVICES = ["Automation", "Web Development", "Brand & Graphic Design"] as const;

// Mirrors FAQ_ITEMS in src/components/ui/FaqAccordion.jsx on the live site —
// used by the "Import site FAQs" button so admins can bring the existing
// public FAQs into the manageable database instead of retyping them.
export const WEBSITE_FAQS = [
  {
    question: "What services does Nexoryn offer?",
    answer:
      "We build workflow automation, AI agents, custom websites and web apps, and brand/graphic design, all tailored to how your business actually runs, not off-the-shelf templates.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "It really depends on the project details. A small automation build can be delivered in about a week, while a larger website or platform can take anywhere from 3 to 6 weeks depending on the scope. We'll give you a clear timeline after the first consultation.",
  },
  {
    question: "Do you work with small businesses?",
    answer:
      "Yes. Most of our clients are lean teams that want enterprise-grade systems without enterprise headcount. We scope every project to fit your size and budget.",
  },
  {
    question: "How does the automation process work?",
    answer:
      "We map your current workflow, identify the highest-leverage tasks to automate first, build and test the system with your team, then deploy and iterate until it runs reliably in the background.",
  },
  {
    question: "What's included in a free consultation?",
    answer:
      "A 30-minute call to understand your goals, walk through your current tools and pain points, and outline what we'd automate or build first, with no obligation to move forward.",
  },
];
