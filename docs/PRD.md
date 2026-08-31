# Product Requirements Document (PRD)
## Nexoryn Website Backend

**Status:** Draft — for review before technical design is finalized.
**Owner:** Nexoryn (nexorynofficial@gmail.com)
**Related docs:** [TRD.md](./TRD.md), [DATA-MODEL.md](./DATA-MODEL.md), [API-SPEC.md](./API-SPEC.md), [CURRENT-SITE-INVENTORY.md](./CURRENT-SITE-INVENTORY.md)

---

## 1. Background

Nexoryn's website (`nexoryn.ai`, repo: `Nexoryn`) is a marketing/portfolio
site for an agency offering three services: **Automation** (workflow/voice/AI
agents), **Web Development**, and **Brand & Graphic Design**. It is currently
a fully static React SPA with no backend:

- All content — 15 portfolio case studies, 3 service categories (each with
  2–3 sub-services), 20 client reviews, 3 team members, legal page text —
  is hardcoded inside `src/data/*.js` and `src/pages/*.jsx` files.
- The only "dynamic" feature is the Contact page, whose 3 forms submit
  directly from the browser to **EmailJS**, a third-party service that
  relays the form data as an email to `nexorynofficial@gmail.com`. Nothing
  is stored; there is no database, no server, and no record of who
  submitted what beyond that one inbox.
- There is no admin panel, no login, no user accounts, and no analytics.

This document defines the requirements for a **backend** that turns this
into a real, manageable system: content editable without a code deploy, and
form submissions that are captured, stored, and actionable.

## 2. Problem Statement

1. **Every content change requires a code change.** Adding a new case
   study, editing a review, updating a service's sub-service list, or fixing
   a typo in a project description all currently require editing a `.js`
   file, running a build, committing, and pushing to `main` for the
   auto-deploy to pick it up. Nexoryn is a small team (3 co-founders); none
   of this should require developer involvement or a Claude Code session.
2. **Contact form submissions have no persistence or ownership.** If
   EmailJS has an outage, silently drops a message, or the recipient's inbox
   is misconfigured, a lead is lost with zero trace. There is no list of
   past inquiries, no way to mark one as "handled," and no way to search or
   export them (e.g., into a spreadsheet or CRM).
3. **No visibility into site usage.** There's no way to know which service
   pages get traffic, which portfolio projects get clicked, or how many
   contact form submissions come in per week/month.
4. **Media/assets are bundled into the git repo.** Every project thumbnail,
   case-study screenshot, and team photo is a committed file in
   `src/assets/`, built into the JS bundle. There's no way to add/replace an
   image without a code change and a rebuild.

## 3. Goals

- **G1.** Move all currently-hardcoded content (projects/case studies,
  services, reviews, team members) into a database, editable through an
  admin interface, with the public site reading from an API instead of
  static imports.
- **G2.** Give the Contact page's 3 forms a real backend endpoint that
  validates, persists, and forwards submissions — decoupled from EmailJS as
  a single point of failure (EmailJS can remain as the *notification*
  channel, but the submission must survive even if it fails).
- **G3.** Provide a simple, password-protected admin area for the 3
  co-founders to manage all of the above without touching code.
- **G4.** Support image/file uploads for project photos, case-study
  screenshots, and team photos through the admin UI instead of git commits.
- **G5.** Preserve the current site's look, feel, performance, and all
  existing routes/URLs exactly — this is a backend addition, not a
  redesign. Every page listed in
  [CURRENT-SITE-INVENTORY.md](./CURRENT-SITE-INVENTORY.md) must keep working
  identically from a visitor's point of view.
- **G6.** Keep the Privacy Policy's existing commitments true, or update it
  honestly if the backend changes them (see §8, Compliance).

## 4. Non-Goals (explicitly out of scope for v1)

- No user accounts, sign-up, or login for **site visitors** — the public
  site remains anonymous/read-only, exactly as it is today.
- No payments, invoicing, or billing integration.
- No multi-tenant / multi-site support — this backend serves exactly one
  site (Nexoryn's own).
- No migration of the *design* of any page — visual/UX changes are not part
  of this backend project.
- No analytics/tracking pixels added to the **public-facing** site without a
  separate explicit decision — see §8, this directly affects the published
  Privacy Policy's current claims.
- No client-facing portal (e.g., project status dashboards for Nexoryn's own
  clients) — out of scope unless requested later.

## 5. Users / Stakeholders

| Role | Who | Needs |
|---|---|---|
| Site visitor / prospect | Anyone browsing nexoryn.ai | Fast, accurate content; a working contact form; no login required |
| Admin (content editor) | The 3 co-founders (Waseem Farooq, Abdul Ahad, Akbar Khan) | Add/edit/delete portfolio projects, services, reviews, team members; view and manage contact submissions; upload images — all without writing code |
| Developer (future) | Whoever maintains the codebase next | A documented API and data model that matches exactly what the frontend already expects, so the migration doesn't require frontend rewrites |

## 6. Functional Requirements

### 6.1 Public content API (replaces the static `src/data/*.js` files)
- **FR-1**: Serve the full list of portfolio projects, each with the shape
  currently in `src/data/projects.js` (see DATA-MODEL.md), filterable by
  `industry` and `service`, and searchable by title/industry/service — this
  must reproduce the exact filtering behavior of `PortfolioPage.jsx` and the
  `/portfolio?industry=X` deep link used by `Portfolio.jsx`'s homepage teaser
  cards.
- **FR-2**: Serve a single project's full case-study detail by `slug`
  (used by `/portfolio/:slug`, i.e. `CaseStudyPage.jsx`). Two case-study
  *shapes* must both be supported (see DATA-MODEL.md §2): the
  automation/web-dev shape (`overview.workflow`, `results`, `techStack`,
  `scalability`) and the graphic-design shape (`designProcess`,
  `keyFeatures`, `useCases`, `gallery`).
- **FR-3**: Serve the 3 service categories (Automation, Web Development,
  Brand & Graphic Design), each with its sub-services, "how we work," "what
  you get," and "platforms" lists, plus the separate `mobileSummary` block
  the mobile UI reads instead of the sub-service tabs.
- **FR-4**: Serve all reviews, each tagged with a `service` field
  (Automation / Web Development / Graphic Design) so the Reviews page filter
  can request them by category, defaulting to Automation.
- **FR-5**: Serve the 3 team members (name, role, photo) for the About page.
- **FR-6**: All public read endpoints must be fast enough that the current
  page-load feel (content available essentially immediately, no visible
  loading spinners on first paint) is not regressed — see TRD §6
  (performance budget).

### 6.2 Contact form submission
- **FR-7**: One endpoint accepts a submission for any of the 3 form types
  currently on the Contact page — **Ask a Question**, **Book a
  Consultation**, **Let's Start** — each with its own field set (see
  DATA-MODEL.md §4 for the exact per-form fields, taken directly from
  `ContactPage.jsx`'s `FORMS` array).
- **FR-8**: Every submission is validated server-side (required fields per
  form type, email format, reasonable length limits) and persisted to the
  database *before* any email is sent, so a submission is never lost purely
  because email delivery failed.
- **FR-9**: On successful persistence, an email notification is sent to
  `nexorynofficial@gmail.com` (see TRD §5 for whether this stays on EmailJS
  or moves server-side) with the same subject-line/body conventions
  currently in `src/lib/sendContactEmail.js` (e.g. `"{name} wants to book a
  consultation with you (from Nexoryn website)"`).
- **FR-10**: The endpoint must reject or flag obviously automated/spam
  submissions (see TRD §9, rate limiting + basic bot protection) — there is
  currently *zero* spam protection on the form.
- **FR-11**: The success/failure UX on the frontend (the existing "Message
  sent" confirmation state and the existing inline error message) must
  continue to work against the new endpoint with no visible behavior change.

### 6.3 Admin / CMS
- **FR-12**: A login-protected admin area (single shared admin role is
  acceptable for v1, given there are only 3 co-founders) to:
  - Create, edit, delete, and reorder portfolio projects and their full
    case-study content.
  - Create, edit, delete service categories and sub-services.
  - Create, edit, delete, and reorder reviews (name, location, service tag,
    text).
  - Create, edit, delete team members.
  - View, search, filter (by form type / read-unread / date), and export
    contact submissions.
  - Upload images (project thumbnails, case-study screenshots/gallery
    images, team photos) and have them served at a stable URL the content
    records can reference.
- **FR-13**: Admin actions that delete or overwrite content should ask for
  confirmation (mirroring how destructive actions are already treated
  throughout this project's own development conventions).

### 6.4 Legal / content pages
- **FR-14**: Privacy Policy, Terms of Service, and Cookie Policy content
  (currently hardcoded JSX in `src/pages/*.jsx` via `LegalPageShell.jsx`) may
  remain static, OR be moved into the CMS if the admins want to edit legal
  copy without a deploy — this is a nice-to-have, not required for v1.

## 7. Success Metrics

- 100% of current static content (15 projects, 3 services with their
  sub-services, 20 reviews, 3 team members) is migrated into the database
  with zero visible difference on the live site.
- Every contact form submission is retrievable from the admin panel, even
  in a scenario where the email-notification channel is deliberately broken
  (proves persistence is decoupled from email delivery).
- An admin can add a brand-new portfolio project end-to-end (all tabs:
  Overview, Results, Tech Stack, Scalability, plus photo) through the admin
  UI with no code change or redeploy, and it appears correctly on
  `/portfolio` and its own `/portfolio/:slug` page.
- Page-load performance (Largest Contentful Paint) on the homepage and a
  case-study page does not regress versus the current static build.

## 8. Compliance Note — Read Before Building

The site's current **[Privacy Policy](../src/pages/PrivacyPolicyPage.jsx)**
makes specific, currently-true claims that a backend can silently
invalidate if not handled deliberately:

- *"The Site does not run any analytics, advertising, or visitor-tracking
  scripts... The Site also does not use browser storage
  (localStorage/sessionStorage) or set any cookies of its own."* — If the
  admin login uses a browser cookie or `localStorage`/`sessionStorage` for a
  session token, that's technically scoped to `/admin`, not the public site,
  but the policy's current wording doesn't carve that out. **Update the
  Privacy Policy to describe the admin-side session mechanism** once it's
  decided (see TRD §7), even though it doesn't affect public visitors.
- *"Form submissions are delivered to us by email using EmailJS... Beyond
  EmailJS and our own hosting provider, we do not share your information
  with any other third party."* — Once submissions are stored in a database
  on a new hosting/DB provider, **that provider must be named in the Privacy
  Policy** (Section 5, "How Your Information Is Shared") alongside EmailJS.
- *"Data Retention... we delete or anonymize it once it's no longer
  needed."* — A real database with an admin list view makes it easy to
  actually honor the deletion-on-request right described in Section 8; make
  sure the admin panel includes a delete action for a submission, not just
  read/export.

**Do not treat this as legal advice** — it's a flag that engineering
decisions in this backend project directly touch claims already published
to visitors, so whoever finalizes the backend design should loop back and
update `PrivacyPolicyPage.jsx` (and possibly `CookiePolicyPage.jsx`) to
match reality before launch.

## 9. Constraints & Assumptions

- Frontend stays React + Vite + `react-router-dom`; this is a backend
  addition, not a framework migration (no Next.js/SSR migration implied by
  this PRD, though TRD discusses whether one is worth considering
  separately).
- Current deploy flow (push to `origin/main` → auto-deploy) should keep
  working for the frontend; the backend will need its own deploy pipeline.
- No existing user base to migrate (no accounts exist today).
- Small team, low traffic — the backend does not need to be designed for
  large-scale concurrency; it needs to be simple, reliable, and cheap to run
  and maintain by a small non-devops team.

## 10. Open Questions (need a decision before/while building)

1. Keep EmailJS as the notification channel, or replace it with server-side
   email (e.g., Resend/SendGrid) now that a real backend exists? (TRD §5
   recommends server-side, but this is Nexoryn's call.)
2. Should legal pages (Privacy/Terms/Cookie) move into the CMS, or stay
   hardcoded JSX? (FR-14, optional.)
3. Is a single shared admin login acceptable, or does each co-founder want
   their own account (still same permission level, just for audit-trail
   purposes — "who edited this")?
4. Any plan to eventually add visitor-facing accounts (e.g., a client
   portal)? If yes even as a "maybe later," the data model should reserve
   room for a `users` table distinct from `admin_users` now rather than
   retrofitting it.
