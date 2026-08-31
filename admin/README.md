# Nexoryn Admin Dashboard

React + Vite admin panel for the backend in [`../backend`](../backend). Not
the marketing site — a separate, internal tool for managing content and
contact submissions.

## Setup

```bash
cd admin
bun install
cp .env.example .env   # point VITE_API_BASE_URL at your backend
bun run dev             # http://localhost:5174
```

The backend's CORS config already allows `http://localhost:5174` by
default (see `backend/src/config/env.ts`'s `ADMIN_URL`).

## Pages

- **Overview** — a welcome header, then (in priority order) your Finance
  position, recent contact submissions, and a smaller content-stats strip.
- **Projects** — full CRUD for portfolio case studies. The `caseStudy`
  field is a structured, tabbed editor (`components/CaseStudyEditor.tsx`)
  whose tabs exactly mirror the public site's case-study page
  (`BASE_TABS`/`DESIGN_TABS` in `src/pages/CaseStudyPage.jsx`) — picking a
  Service switches between the "standard" shape (Automation/Web
  Development) and the "design" shape (Brand & Graphic Design)
  automatically. Raw JSON is never exposed to the admin; see
  `docs/DATA-MODEL.md` §2 for the underlying field reference. The list page
  has a search box (title/slug/industry/service/tag).
- **Services** — categories + their sub-services
- **Reviews** — straightforward CRUD
- **Team** — CRUD with a role field that suggests presets (e.g.
  "Co-Founder/Admin") via a datalist, but still accepts any free text
- **FAQs** — CRUD, plus a one-click "Import from website" button that pulls
  in any of the site's hardcoded FAQs (`src/components/ui/FaqAccordion.jsx`)
  not yet in the database
- **Contact Inbox** — list/filter by status, view full submission, mark
  read/handled, resend a failed notification email, export CSV
- **Finance** — capital and profit are both split three ways between
  **Waseem Farooq, Akbar Khan and Abdul Ahad**. Everything on the page is
  derived from the ledger; nothing is typed in twice.
  - **Equal share** = total partner capital ÷ 3. Put in more than your third
    and the others owe you the difference; put in less and you owe them. The
    page shows the minimum set of payments that squares everyone up, and
    notes that investing the shortfall next round closes the gap too.
  - **Entry types**: `invested` (capital in — counts toward that partner's
    third), `earned` (company revenue — split three ways as profit share),
    `personal_withdraw` (money out for personal use), `debt_paid` (settling
    up — asks *who* is being repaid).
  - **A personal withdrawal never moves the company total.** That figure
    records what went in and taking money out later doesn't un-invest it, so
    a withdrawal becomes a debt owed back to Nexoryn instead. Only a
    `debt_paid` row aimed at Nexoryn clears it. Keeping the two apart is what
    stops the company total from drifting.
  - **Entered by** is filled from the logged-in session server-side and can't
    be set from the client. **Action by** stays selectable (whose money moved).
  - Each partner card shows Invested / Profit share / In debt / Net position
    plus the specific lines "X has to pay you N" and "you owe X N". The
    logged-in admin's own card is repeated at the top and on the Overview.
- **Internal Projects** — shared Google-Drive-linked project repository,
  with an optional free-text Note instead of tags

There's no standalone Assets page — images are uploaded/chosen inline via
the `AssetPicker` modal wherever a photo is needed (Project photo, Team
photo, gallery images).

## Known gaps

- No image cropping/resizing in the uploader — whatever you upload is
  what gets stored (Cloudinary can still transform it on delivery via
  `src/services/storage.ts`'s `getOptimizedImageUrl`, just not exposed in
  this UI yet).
- Sub-service and review "order" fields are plain number inputs, not
  drag-and-drop — fine for the current small counts (3-6 sub-services per
  category, 20 reviews), would need a real reorder UI if that grows a lot.
- The Finance partner list and the equal three-way split are fixed constants
  (`PARTNERS` in `src/lib/constants.ts` and `backend/src/services/validation.ts`),
  not database-driven. Adding a fourth partner or moving to uneven ownership
  percentages means editing both files.
- Only one admin account exists so far. The Finance page matches a partner to
  the logged-in admin by name, so Akbar and Abdul each need an account whose
  name matches their partner name exactly before "your position" resolves for
  them. There is no admin-account management screen yet.
