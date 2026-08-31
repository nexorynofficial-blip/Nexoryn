# Current Site Inventory

A full map of every route, page, and content source in the live site today
(as of this writing), so a backend migration can be checked off
page-by-page against PRD §7 (success metrics: "zero visible difference").

## Routes (`src/App.jsx`)

| Route | Page component | Backed by |
|---|---|---|
| `/` | `Home.jsx` | `Hero`, `Problems`, `Solutions`, `Services` (home teaser), `Portfolio` (home teaser), `Reviews` (home teaser), `CTASection`, `Footer` — all static copy + `src/data/*.js` |
| `/about` | `AboutPage.jsx` | Static copy (mission/vision) + `TEAM` array (3 members) + `AboutGlobe` (decorative, no data) |
| `/services` | `ServicesPage.jsx` | `SERVICE_CATEGORIES` from `src/data/services.js`; supports `?category=<id>` deep link that scrolls to and highlights one category |
| `/portfolio` | `PortfolioPage.jsx` | `PROJECTS` from `src/data/projects.js`; supports `?industry=<name>` deep link |
| `/portfolio/:slug` | `CaseStudyPage.jsx` | One `Project.caseStudy` via `getProjectBySlug(slug)` |
| `/reviews` | `ReviewsPage.jsx` | `REVIEWS` from `src/data/reviews.js`, filterable by `service`, defaults to `Automation` |
| `/contact` | `ContactPage.jsx` | `FaqAccordion` (static FAQ copy) + 3 forms → `sendContactEmail.js` → EmailJS |
| `/privacy-policy` | `PrivacyPolicyPage.jsx` | Static legal copy (see PRD §8 for why this matters to the backend design) |
| `/terms-of-service` | `TermsOfServicePage.jsx` | Static legal copy |
| `/cookie-policy` | `CookiePolicyPage.jsx` | Static legal copy |

Global chrome on every route: `Navbar` (fixed), `Footer` (site-wide links +
`ContactShortcuts` call/WhatsApp buttons), `SiteBackground` (WebGL shader,
no data dependency), `ScrollToTop` (Lenis-aware scroll reset per navigation).

## Content sources today (all static, all in the repo)

| Source file | Entity | Count today |
|---|---|---|
| `src/data/projects.js` | Portfolio projects + case studies | 15 |
| `src/data/services.js` | Service categories + sub-services | 3 categories |
| `src/data/reviews.js` | Client reviews | 20 |
| `src/pages/AboutPage.jsx` (`TEAM` const) | Team members | 3 |
| `src/pages/ContactPage.jsx` (`FORMS` const) | Contact form field definitions | 3 form types |
| `src/components/ui/FaqAccordion.jsx` (`FAQ_ITEMS` const) | Contact page FAQ | 5 items |
| `src/data/projects.js` industries used | Portfolio industry filter values | 12 fixed values (see `PortfolioPage.jsx` `INDUSTRIES`) |

## Portfolio project inventory (all 15, by slug)

**Automation (5):**
1. `ai-customer-support-chatbot` — E-Commerce
2. `personalized-cold-email-outreach` — SaaS & Tech
3. `intelligent-content-repurposing-approval-workflow` — SaaS & Tech
4. `nexoryn-executive-intelligence-platform` — SaaS & Tech
5. `ai-candidate-screening-pipeline` — SaaS & Tech

**Web Development (3):**
6. `aurum-luxury-ecommerce-platform` — E-Commerce (has `livePreview` URL)
7. `analytics-hub-saas-dashboard-platform` — SaaS & Tech (has `livePreview` URL)
8. `citizenlink-real-estate-platform` — Real Estate (has `livePreview` URL)

**Brand & Graphic Design (7):**
9. `restaurant-standee-design-system` — Hospitality
10. `wellness-product-marketing-flyer-system` — Healthcare
11. `sports-recruitment-billboard-design-system` — Sports & Recruitment
12. `novelty-candy-product-packaging-design-system` — Retail
13. `coffee-shop-brand-identity-logo-system` — Hospitality
14. `social-activism-poster-generation-system` — Nonprofit & Advocacy
15. `luxury-fashion-standee-design-system` — Retail

**Homepage-featured set today** (hardcoded as `FEATURED_SLUGS` in
`Portfolio.jsx`, exactly 5 — see DATA-MODEL.md §1 for the recommended
`isFeatured`/`featuredOrder` replacement): `ai-customer-support-chatbot`,
`personalized-cold-email-outreach`,
`intelligent-content-repurposing-approval-workflow`,
`aurum-luxury-ecommerce-platform`, `analytics-hub-saas-dashboard-platform`
(3 Automation + 2 Web Development, per the mobile teaser's own rule).

## Third-party integrations in use today

| Service | Used for | Where |
|---|---|---|
| EmailJS | Contact form → email delivery | `src/lib/sendContactEmail.js`, env vars `VITE_EMAILJS_SERVICE_ID/TEMPLATE_ID/PUBLIC_KEY` |
| Google Fonts | Archivo Black, Anton, Chakra Petch, Unbounded, Manrope, Montserrat | `index.html` `<link>` |
| Self-hosted fonts | TachyonW00-Regular (hero/footer wordmark), WinnerSans-CondBold (currently unused in markup) | `public/fonts/`, `src/index.css` `@font-face` |
| Gmail compose deep link | "Prefer email?" link on Contact page | `ContactPage.jsx`, opens `mail.google.com/mail/?view=cm...` |
| `tel:` link | Phone number, dials on mobile / copies on desktop | `ContactPage.jsx` `PhoneLink` |
| Social profile links | Footer | Facebook, Instagram, Threads, LinkedIn (see `Footer.jsx` `COLUMNS`) |
| WhatsApp | `ContactShortcuts` button in the footer | `src/components/ui/ContactShortcuts.jsx` |

No analytics, no ads, no tracking pixels, no cookies, no `localStorage`/
`sessionStorage` usage anywhere in the current codebase — this is the exact
claim the Privacy Policy makes today (see PRD §8 for what a backend changes
about that).

## What a backend migration must NOT change

- Every route path above, verbatim (external links/bookmarks depend on
  them, especially `/portfolio/:slug` for each project).
- The `?category=` and `?industry=` deep-link query params on
  `/services` and `/portfolio`.
- The visual output of every page — this is a data-source swap, not a
  redesign (PRD §4, non-goals).
- The Contact form's client-visible behavior: which fields appear per form
  type, validation messages, the success/error states.
