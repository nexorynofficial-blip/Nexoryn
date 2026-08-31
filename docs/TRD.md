# Technical Requirements Document (TRD)
## Nexoryn Website Backend

**Related docs:** [PRD.md](./PRD.md), [DATA-MODEL.md](./DATA-MODEL.md), [API-SPEC.md](./API-SPEC.md), [CURRENT-SITE-INVENTORY.md](./CURRENT-SITE-INVENTORY.md)

---

## 1. Current Architecture (as of this writing)

```
Browser
  └─ React 19 SPA (Vite build, react-router-dom v7, BrowserRouter)
       ├─ All content hardcoded in src/data/*.js (projects, services, reviews)
       ├─ All images bundled as JS module imports from src/assets/
       ├─ Contact form → @emailjs/browser → EmailJS cloud service → Gmail inbox
       └─ No API calls of any kind. No backend. No database. No auth.

Deploy: git push to origin/main → auto-deploy (static hosting, e.g. Vercel/
        Netlify-style build of `vite build` output — no server runtime today)
```

Key libraries already in `package.json`: React 19, `react-router-dom` 7,
Tailwind CSS v4, Framer Motion, GSAP, Lenis (smooth scroll), Three.js
(WebGL shader background), `@emailjs/browser`. None of these have any
bearing on backend choice — they're all client-only.

## 2. Proposed Architecture

```
Browser (React SPA, unchanged look/feel)
  │
  │  fetch() → JSON REST API
  ▼
Backend API (new)
  ├─ Public routes  (no auth): projects, services, reviews, team, POST /contact
  ├─ Admin routes   (JWT auth): CRUD for all content + submissions inbox
  ├─ Database (PostgreSQL)
  ├─ Object storage (images: project photos, screenshots, team photos)
  └─ Outbound email (contact-form notifications)
```

### 2.1 Stack recommendation

| Layer | Recommendation | Why |
|---|---|---|
| Runtime | **Node.js (LTS) + TypeScript** | Same language as the frontend; the team can read/maintain both without a context switch. |
| Framework | **Express** for a small, simple REST API, or **NestJS** if the team wants more structure (DI, modules) as content types grow | Express is the lighter starting point given the modest scope (5 entity types); NestJS is the safer pick if more admin features are expected later. This TRD assumes **Express** for concreteness in API-SPEC.md, but either is compatible with the data model. |
| Database | **PostgreSQL** (managed: Railway, Render, Supabase, or Neon) | Relational data with clear entities (projects, case studies, sub-services, reviews) and a small team — Postgres is the boring, reliable default. Supabase specifically also bundles auth + storage if the team wants fewer moving parts (see §2.2). |
| ORM | **Prisma** | Type-safe schema-to-TypeScript, migrations built in, easy for a small team to read the schema and reason about it. |
| Object storage | **Cloudinary** or **AWS S3 + CloudFront**, or **Supabase Storage** if using Supabase | Needed so admins can upload images without a code deploy. Cloudinary is the fastest to integrate (built-in image transforms are a bonus for the case-study screenshot galleries). |
| Auth (admin only) | **JWT** issued on login, stored in an **httpOnly, secure cookie** scoped to the admin subdomain/path | See §7 — deliberately not `localStorage`, both for security (XSS token theft) and to avoid contradicting the current Privacy Policy's "no browser storage" claim on the *public* site (an httpOnly cookie scoped to `/admin` is also easier to describe honestly as "an operational cookie for staff login," not a visitor-tracking one). |
| Email | **Resend** or **SendGrid** (server-side) | See §5 — recommended replacement for client-side EmailJS now that a server exists to send from directly. |
| Hosting (backend) | **Railway** or **Render** (simplest managed Node hosting with a Postgres add-on in the same place) | Matches the team's existing low-ops preference (the frontend already deploys via a simple git-push flow). |

### 2.2 Lower-effort alternative worth naming

If the team wants to minimize how many separate services they operate,
**Supabase** (Postgres + Auth + Storage + auto-generated REST/GraphQL, all
one project) can replace the "Database + Object storage + Auth" rows above
with a single managed product, and a thin Express (or even serverless
functions) layer can sit in front of it just for the contact-form endpoint's
custom validation/email logic and any admin-only business rules Supabase's
generic REST layer doesn't express cleanly (e.g. the case-study nested JSON
shape). This trades some flexibility for meaningfully less infrastructure to
run. Recommended if the team has no existing backend-ops experience;
recommended *against* if they expect to outgrow it (heavier custom business
logic later).

## 3. API Design

- **Style:** REST, JSON request/response bodies, versioned under `/api/v1/`.
- **Full endpoint list, request/response shapes, and status codes:** see
  [API-SPEC.md](./API-SPEC.md).
- **Public endpoints** require no authentication and are safe to cache
  aggressively (content changes only when an admin edits something) — set
  `Cache-Control` headers accordingly (e.g. `max-age=60, stale-while-revalidate=300`)
  rather than hitting the database on every page view.
- **Admin endpoints** require a valid session (see §7) and are not cached.

## 4. Data Model

Full entity-by-entity schema: [DATA-MODEL.md](./DATA-MODEL.md). Summary of
entities:

| Entity | Purpose | Maps to (frontend) |
|---|---|---|
| `Project` | One portfolio item + its full case study (two shapes: standard / design) | `src/data/projects.js` → `PROJECTS[]` |
| `ServiceCategory` / `SubService` | The 3 services page categories and their sub-services | `src/data/services.js` → `SERVICE_CATEGORIES[]` |
| `Review` | Client testimonials | `src/data/reviews.js` → `REVIEWS[]` |
| `TeamMember` | About page team cards | `AboutPage.jsx` → `TEAM[]` |
| `ContactSubmission` | A single form submission (any of the 3 form types) | `ContactPage.jsx` → `FORMS[]` + `sendContactEmail.js` |
| `AdminUser` | Login for the admin panel | New — does not exist today |
| `Asset` | Uploaded image metadata (URL, alt text, which entity it belongs to) | New — replaces committed files in `src/assets/` |

## 5. Contact Form & Email Delivery

Current behavior (`src/lib/sendContactEmail.js`): the browser calls
`emailjs.send()` directly with a service ID, template ID, and public key —
all three currently sit in a `.env` file as `VITE_*` variables, which means
they are **bundled into the public JS and visible to anyone** (this is
inherent to any client-side EmailJS integration, not a bug, but worth
knowing). EmailJS builds one email using variables `to_email`, `subject`,
`from_name`, `reply_to`, `message`, with per-form-type subject lines and
intro sentences defined in that same file.

**Recommended change:** move this server-side.
1. Frontend calls `POST /api/v1/contact` with `{ formId, values }`.
2. Backend validates `values` against the field list for that `formId` (see
   DATA-MODEL.md §4 for the exact per-form-type required/optional fields).
3. Backend inserts a `ContactSubmission` row (status: `new`).
4. Backend sends the notification email itself via Resend/SendGrid, using
   the *same* subject-line and body-formatting conventions already written
   in `sendContactEmail.js` (`SUBJECTS`, `INTROS`, `FIELD_LABELS`,
   `LONGFORM_LABELS` — these can be ported near-verbatim into the backend).
5. If email sending fails, the submission is still saved (FR-8) — log the
   failure and let an admin see it flagged as "not yet emailed" in the admin
   inbox, with a manual "resend notification" action.

This also lets Nexoryn drop the `VITE_EMAILJS_*` env vars from the frontend
build entirely once the cutover is done (delete `.env`/`.env.example`'s
EmailJS section, remove `@emailjs/browser` from `package.json`).

## 6. Performance & Non-Functional Requirements

- **Public API response time:** p95 < 300ms for list/detail endpoints under
  normal (small-business-website) traffic — this is a low-traffic marketing
  site, not a high-scale product; the target exists mainly to keep the
  homepage/portfolio feeling as instant as the current static build.
- **Availability:** no formal SLA needed for v1; a managed host (Railway/
  Render) with automatic restarts is sufficient. The contact form's
  persistence-before-email design (§5) already protects the one truly
  business-critical path (not losing a lead) even during a backend blip, as
  long as the frontend shows a clear error and the visitor can retry or fall
  back to the existing direct email/phone links already on the Contact page.
- **Image delivery:** served through the object-storage provider's CDN
  (Cloudinary/CloudFront/Supabase Storage all provide this out of the box)
  — do not proxy image bytes through the Node API.
- **Browser compatibility / SEO:** unchanged — this is a backend project,
  the SPA's client-side-only rendering (no SSR) is unaffected. If SEO on
  content-heavy pages (portfolio, services) becomes a priority later, that's
  a separate, larger decision (migrating to Next.js/SSR) explicitly out of
  scope here — flagged for awareness, not required.

## 7. Auth & Security

- **Admin auth:** email + password login → server issues a JWT → set as an
  **httpOnly, `Secure`, `SameSite=Strict` cookie**. No admin session data in
  `localStorage`/`sessionStorage` (keeps the "no browser storage" claim in
  the current Privacy Policy accurate for anyone who isn't logging in as
  staff, and is simply the more secure default against XSS token theft
  regardless).
- **Password storage:** hash with **bcrypt** or **argon2**, never
  plaintext, never reversibly encrypted.
- **Rate limiting:** apply to `POST /api/v1/contact` and
  `POST /api/v1/admin/login` specifically — e.g. a sliding-window limiter
  (5 contact submissions / 10 minutes / IP, 10 login attempts / 15 minutes /
  IP) to blunt basic spam/brute-force. The current site has **zero**
  protection on the contact form today; this is a net-new requirement, not
  a regression to avoid.
- **Bot protection on contact form:** add a honeypot field (a hidden input
  real users never fill in; bots often do) as a zero-cost first layer;
  consider Cloudflare Turnstile or hCaptcha if spam becomes a real problem
  post-launch. Don't over-build this before there's evidence of spam volume.
- **Input validation:** validate every request body server-side (e.g. with
  `zod`) against the exact field/type list in DATA-MODEL.md §4 — never trust
  the frontend's own `required` attributes as the source of truth.
- **CORS:** restrict the API to the production frontend origin (and
  localhost during development); admin routes additionally require the auth
  cookie, so CORS alone is not the security boundary for those.
- **Secrets:** database URL, JWT signing secret, email-provider API key,
  object-storage credentials all live in the backend host's environment
  variables (Railway/Render secrets), never committed, never prefixed
  `VITE_` (that prefix is what makes Vite inline a value into the public
  bundle — the opposite of what a secret needs).
- **Least privilege on uploads:** validate file type/size server-side before
  accepting an image upload (e.g. image MIME types only, reasonable max
  size) — don't rely on the admin UI's `<input accept="image/*">` as
  enforcement.

## 8. Migration Plan (static JS → database)

1. Stand up the backend + database schema (DATA-MODEL.md) in a staging
   environment.
2. Write one-time seed scripts that read the existing `src/data/projects.js`,
   `src/data/services.js`, `src/data/reviews.js`, and the `TEAM` array in
   `AboutPage.jsx`, and insert equivalent rows — this is a mechanical,
   scriptable transform since the target schema is modeled directly on
   these files' existing shapes (see DATA-MODEL.md's "maps to" notes).
3. Upload every currently-committed image referenced by those files
   (`src/assets/project-*.png`, `case-study-screenshots/*.png`, team photos)
   to the chosen object-storage provider, and record the resulting URLs
   against the seeded rows.
4. Build the public API endpoints (API-SPEC.md) and point a feature-branch
   frontend at them via `fetch`, replacing the static `import` statements in
   `Portfolio.jsx`, `PortfolioPage.jsx`, `CaseStudyPage.jsx`,
   `ServicesPage.jsx`, `ReviewsPage.jsx`, `AboutPage.jsx` with data fetched
   at mount (or route-load) time instead.
5. Verify pixel-for-pixel parity against the current live site for every
   page in [CURRENT-SITE-INVENTORY.md](./CURRENT-SITE-INVENTORY.md) before
   cutting over.
6. Cut the Contact form over to the new `/api/v1/contact` endpoint (§5).
7. Once verified, remove the now-dead static data files and the
   `@emailjs/browser` dependency, and update the Privacy Policy per PRD §8.

## 9. Observability

- **Error tracking:** a lightweight service (e.g. Sentry free tier) on the
  backend to catch unhandled exceptions, especially around email delivery
  and file uploads.
- **Logging:** structured request logs (method, path, status, latency) are
  sufficient for this scale — no need for a dedicated log aggregation
  platform unless traffic grows significantly.
- **Admin visibility:** the admin panel's contact-submission list *is* the
  primary "observability" surface the business actually cares about day to
  day — prioritize that being reliable and easy to search over generic
  infra dashboards.

## 10. Testing Strategy

- Unit tests for validation logic (per-form-type required fields) and for
  the two case-study shape branches (standard vs. design) since the
  frontend already hard-branches on `caseStudy.designProcess` presence —
  the API must never return a shape the frontend doesn't recognize.
- Integration tests for each endpoint against a test database (seed → call
  → assert response shape matches API-SPEC.md exactly, since the frontend
  will be written against that exact contract).
- A migration-parity test: run the seed script, then assert the resulting
  API responses deep-equal the current static `PROJECTS`/`SERVICE_CATEGORIES`/
  `REVIEWS` arrays (minus the swapped-out asset URLs) — this is the cheapest
  way to catch a missed field during migration.

## 11. CI/CD

- Backend: lint + typecheck + test on every push; deploy to staging on merge
  to a `develop`/`staging` branch; deploy to production on merge to `main`
  (mirroring the frontend's existing "push to `main` auto-deploys" habit the
  team is already used to).
- Database migrations run as an explicit CI/CD step (Prisma
  `migrate deploy`) before the new backend version starts serving traffic.

## 12. Explicitly Deferred (not needed for v1, revisit later if asked)

- Server-side rendering / SEO overhaul of the frontend.
- Multi-admin roles/permissions beyond "logged in or not."
- Client-facing accounts/portal.
- Real-time features (websockets, live dashboards).
- Full-text search beyond the simple substring match the portfolio search
  already does today.
