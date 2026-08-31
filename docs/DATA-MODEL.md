# Data Model
## Nexoryn Website Backend

Every shape below is derived directly from the current frontend source —
file and line references are given so you can verify against the live code
at any time. Field names in the proposed schema intentionally match the
existing JS object keys wherever possible, so the migration (TRD §8) is a
near-1:1 mechanical transform rather than a redesign.

---

## ⚠️ Naming inconsistency in the current source data (fix during migration)

The string used for the "graphic design" service differs **by entity** in
the actual current codebase — this isn't a typo in this document, it's
really inconsistent in `src/data/*.js` today:

| Entity | Field | Value used |
|---|---|---|
| `Project` | `service` | `"Brand & Graphic Design"` (`src/data/projects.js`) |
| `ServiceCategory` | `serviceName` | `"Graphic Design"` (`src/data/services.js`) |
| `Review` | `service` | `"Graphic Design"` (`src/data/reviews.js`) |
| `ContactSubmission` (`start` form) | `values.projectType` option | `"Graphic Design"` (`ContactPage.jsx`) |

**Decide one canonical string during migration** (this document uses
`"Brand & Graphic Design"` for `Project.service` below since that's what's
already live on the Portfolio page's service icon lookup, but recommend
standardizing everything to the shorter `"Graphic Design"` — it's the
majority form across the other three entities) and update whichever
frontend component still hardcodes the old string once the migration is
live, rather than making the backend silently alias both forms forever.

## 1. `Project`

Source: `src/data/projects.js` (`PROJECTS` array, 15 entries today).
Consumed by: `Portfolio.jsx` (homepage teaser), `PortfolioPage.jsx` (grid +
filter/search), `CaseStudyPage.jsx` (full detail via `getProjectBySlug`).

### Top-level fields (every project has these)

| Field | Type | Required | Notes |
|---|---|---|---|
| `slug` | string, unique | yes | URL segment for `/portfolio/:slug`. e.g. `"aurum-luxury-ecommerce-platform"`. Immutable once published (external links depend on it). |
| `title` | string | yes | Display name, e.g. `"Aurum Luxury E-Commerce Platform"`. |
| `industry` | enum string | yes | One of: `Fintech, E-Commerce, Healthcare, Real Estate, Hospitality, SaaS & Tech, Logistics, Education, Retail, Manufacturing, Sports & Recruitment, Nonprofit & Advocacy` (this list is `PortfolioPage.jsx`'s `INDUSTRIES` filter — keep it as a managed lookup table, not a free-text field, so the filter UI stays populated correctly). |
| `service` | enum string | yes | One of: `Automation`, `Web Development`, `Brand & Graphic Design`. Drives which icon shows (`SERVICE_ICON` map in `PortfolioPage.jsx`) and which case-study tab set applies (§2). |
| `description` | text | yes | Short card summary shown on the portfolio grid (2–3 sentences). |
| `tags` | string[] | yes | Short chips shown on the card, e.g. `["Automation", "n8n", "Ollama"]`. Free text, no fixed vocabulary today. |
| `photo` | image reference (see `Asset`, §6) | yes | Card thumbnail + case-study sidebar image. |
| `caseStudy` | JSON object (see §2) | yes | Everything the case-study detail page renders. |

### Optional homepage-featured flag

`Portfolio.jsx` currently hardcodes a fixed list of 5 slugs
(`FEATURED_SLUGS`) to show 3 Automation + 2 Web Development projects on the
homepage teaser. Recommend replacing that hardcoded list with a
**boolean `isFeatured` field + an `featuredOrder` integer** on `Project`, so
an admin can control the homepage teaser from the CMS instead of a code
edit. Keep the same business rule (3 Automation + 2 Web Development) as a
*validation* the admin UI enforces when marking projects featured, unless
the business wants to change that mix later.

---

## 2. `Project.caseStudy` — two distinct shapes

The frontend (`CaseStudyPage.jsx`) branches its entire tab structure on
whether `caseStudy.designProcess` exists. **This is a real, load-bearing
distinction — do not collapse it into one generic shape**, or the frontend
tab logic (`tabsForCaseStudy()`, `isDesignCaseStudy`) breaks.

### 2a. Standard shape (Automation & Web Development projects — 8 of 15 today)

Tabs rendered: **Overview, Results, Tech Stack, Scalability & Flexibility**,
plus one of **Screenshots** / **Gallery** / **Live Preview** depending on
which optional field is present (see §2c).

```
caseStudy: {
  category: string                    // badge text, e.g. "AI Automation"
  techIcons: [{ name: string, icon: string }]   // icon = lucide-react icon name
  summary: text                       // sidebar paragraph

  overview: {
    problem: string[]                 // bullet list, "The Problem"
    solution: string[]                // bullet list, "The Solution"
    workflow: [{ icon: string, label: string }]  // horizontal step diagram (desktop only)
    breakdown: [{ title: string, description: text }]  // "Full Technical Breakdown" accordion
  }

  results: {
    keyFeatures: [{ title: string, description: text }]
    before: text
    after: text
    proof: text                       // "What This Proves"
  }

  techStack: {
    [groupName: string]: [            // e.g. "Frontend", "Backend", "Infrastructure"
      { name: string, role: string, icon: string }
    ]
  }

  scalability: [{ title: string, description: text }]

  // exactly one of the following three (see §2c):
  screenshots?: [{ src: image, alt: string, width: number, height: number }]
  gallery?: [{ src: image, alt: string, width: number, height: number }]
  livePreview?: string | true         // string = deployed URL, true = "coming soon" placeholder
}
```

### 2b. Design shape (Graphic Design projects — 7 of 15 today)

Tabs rendered: **Overview, Design Process, Key Features, Use Cases,
Customization & Scalability, Gallery** (fixed set, no Tech Stack, no
technical breakdown — graphic-design projects have no backend/stack to
show).

```
caseStudy: {
  category: string
  techIcons: [{ name: string, icon: string }]
  summary: text

  overview: {
    problem: string[]
    solution: string[]
    // NOTE: no `workflow`, no `breakdown` in this shape
  }

  designProcess: {
    input: string[]                   // "Input Requirements" bullets
    workflow: [{ icon: string, label: string }]   // reuses the same step-diagram component
    engine: text                      // "Design Engine Processing" paragraph
    refinements: text
    qa: text                          // "Quality Assurance" paragraph
  }

  keyFeatures: [{ title: string, description: text }]
  useCases: [{ title: string, description: text }]
  scalability: [{ title: string, description: text }]  // rendered under heading "Customization & Scalability"
  gallery: [{ src: image, alt: string, width: number, height: number }]  // required for this shape
}
```

### 2c. Which trailing tab a *standard*-shape project gets

`tabsForCaseStudy()` in `CaseStudyPage.jsx` picks exactly one, checked in
this order — **enforce this as a mutually-exclusive choice in the admin UI**
(radio button: "Screenshots" / "Gallery" / "Live Preview" / "None yet"),
not three optional fields an admin could accidentally fill in together:

1. `gallery` present → tab labeled **"Gallery"**
2. else `screenshots` present → tab labeled **"Screenshots"**
3. else `livePreview` present → tab labeled **"Live Preview"**
4. else → no 5th tab at all

`livePreview` itself is either the **literal boolean `true`** (renders a
"Live Preview Coming Soon" placeholder — used for projects with no
deployment yet) or a **URL string** (renders the interactive iframe embed on
desktop, and a "click here to open it" notice card on mobile). Model this
as a nullable `livePreviewUrl: string | null` **plus** a separate
`hasLivePreviewTab: boolean` if you want "coming soon" to be explicit rather
than inferring "no URL yet but flagged" — either works; just don't conflate
"no live preview tab at all" with "tab exists but says coming soon," since
those are visibly different states on the page today.

### 2d. `icon` fields are string names, not components

Every `icon:` field above (in `techIcons`, `overview.workflow`,
`techStack.*[].icon`, `designProcess.workflow`) is currently a **React
component reference** imported from `lucide-react` (e.g. `Workflow`,
`Brain`, `ShoppingBag`). The backend must store the **icon's string name**
(e.g. `"Workflow"`) and the frontend must map that name back to the actual
`lucide-react` component at render time (a simple lookup object, same
pattern `ServiceBox.jsx` already uses for `overviewIcon: "Zap"` in
`services.js` — see §3). Validate icon names server-side against the actual
set of exported `lucide-react` icon names so an admin can't save a typo that
silently renders nothing.

---

## 3. `ServiceCategory` / `SubService`

Source: `src/data/services.js` (`SERVICE_CATEGORIES` array, 3 entries,
confirmed ids: `automation`, `web-development`, `graphic-design`;
`serviceName` values: `"Automation"`, `"Web Development"`, `"Graphic
Design"` — note the naming inconsistency callout above).

```
ServiceCategory: {
  id: string (unique slug, e.g. "automation")
  gooeyId: string                     // DOM id used by a decorative filter effect — keep as opaque string
  serviceName: string                 // "Automation"
  overviewIcon: string                // lucide-react icon name, e.g. "Zap"
  overview: { heading: string, body: text }

  mobileSummary: {                    // shown instead of subServices tabs on mobile
    description: text
    howWeWork: string[]
    whatYouGet: string[]
    platforms: string[]
  }

  subServices: [SubService]
}

SubService: {
  id: string (unique within its category)
  icon: string                        // lucide-react icon name
  name: string                        // "Workflow Automation"
  description: text
  howWeWork: string[]
  whatYouGet: string[]
  platforms: string[]
}
```

Order matters (`subServices` render left-to-right as tabs) — persist an
explicit `order` integer rather than relying on insertion order once this
is in a database.

---

## 4. `ContactSubmission`

Source: `ContactPage.jsx` (`FORMS` array — the exact field list per form
type) + `src/lib/sendContactEmail.js` (subject/body formatting rules).

### Shared envelope

```
ContactSubmission: {
  id: uuid
  formId: enum("question" | "consultation" | "start")
  status: enum("new" | "read" | "handled")   // new field for admin workflow — doesn't exist today
  createdAt: timestamp
  emailedAt: timestamp | null          // null if the notification email hasn't sent yet — see TRD §5
  fields: JSON                         // the per-form-type payload below
}
```

### Per-`formId` field sets (exactly as defined in `ContactPage.jsx`)

**`question`** ("Ask a Question"):

| Field | Type | Required |
|---|---|---|
| `name` | string | yes |
| `email` | string (email format) | yes |
| `phone` | string | no |
| `country` | string | no |
| `city` | string | no |
| `message` | text | yes |

**`consultation`** ("Book a Consultation"):

| Field | Type | Required |
|---|---|---|
| `name` | string | yes |
| `email` | string (email format) | yes |
| `company` | string | no |
| `phone` | string | no |
| `country` | string | no |
| `city` | string | no |
| `datetime` | string (free-text preferred date/time — not a parsed datetime in the current UI) | yes |
| `message` | text (labeled "Notes") | no |

**`start`** ("Let's Start"):

| Field | Type | Required |
|---|---|---|
| `name` | string | yes |
| `email` | string (email format) | yes |
| `company` | string | yes |
| `phone` | string | no |
| `country` | string | no |
| `city` | string | no |
| `projectType` | enum("Automation" \| "Web Development" \| "Graphic Design") | yes |
| `budget` | enum("Under $5K" \| "$5K – $15K" \| "$15K – $50K" \| "$50K+") | yes |
| `details` | text (labeled "Project Details") | yes |

Validate exactly this required/optional split server-side per `formId` —
do not just require "at least name+email+message" generically, since e.g.
`start` requires `company`, `projectType`, and `budget` that the other two
forms don't have at all.

### Email formatting to preserve

`sendContactEmail.js` builds the notification email as:
- `subject`: from `SUBJECTS[formId](name)`, e.g.
  `"${name} wants to book a consultation with you (from Nexoryn website)"`.
- `body`: an intro line from `INTROS[formId]`, then every non-longform field
  as `"Label: value"` lines (labels from `FIELD_LABELS`), then any
  longform fields (`message`/`notes`/`details`, from `LONGFORM_LABELS`) each
  as their own trailing `"Label:\n<value>"` paragraph.

Port this formatting logic server-side verbatim so the actual emails
Nexoryn receives don't change in appearance during the migration.

---

## 5. `TeamMember`

Source: `AboutPage.jsx` (`TEAM` array, 3 entries today: Waseem Farooq,
Abdul Ahad, Akbar Khan — all currently "Co Founder").

```
TeamMember: {
  id: uuid
  name: string
  role: string
  photo: image reference (Asset)
  order: integer            // display order on the About page grid
}
```

---

## 6. `Review`

Source: `src/data/reviews.js` (`REVIEWS` array, 20 entries today).

```
Review: {
  id: string (currently a slug-like handle, e.g. "abu786110" — keep as
       provided, or switch to a uuid + keep the handle as a separate
       `displayId` if these came from an external platform like Fiverr/
       Upwork and the handle has meaning)
  name: string
  location: string           // country, e.g. "Canada"
  service: enum("Automation" | "Web Development" | "Graphic Design")
  text: text
  order: integer             // display order
}
```

**Data-quality note:** the `service` field on all 20 existing reviews was
assigned by the *frontend AI assistant* inferring it from each review's
wording during a prior session — about half had clear content clues (e.g.
"Window banner" → Graphic Design), the other half were generic
5-star text with no service-specific language and were manually distributed
to keep the filter usable. **Confirm/correct these 20 rows against Nexoryn's
actual records during the data migration (TRD §8, step 2)** rather than
carrying the inferred values forward as ground truth.

---

## 7. `AdminUser` (new — does not exist today)

```
AdminUser: {
  id: uuid
  email: string, unique
  passwordHash: string       // bcrypt/argon2, never plaintext
  createdAt: timestamp
  lastLoginAt: timestamp | null
}
```

v1 needs no roles/permissions table — every admin user has full access
(PRD §10, open question #3: revisit only if per-founder audit trails become
important).

---

## 8. `Asset` (new — replaces committed files in `src/assets/`)

```
Asset: {
  id: uuid
  url: string                // CDN URL from the object-storage provider
  altText: string
  width: integer | null
  height: integer | null
  uploadedAt: timestamp
  uploadedBy: AdminUser.id
}
```

Every `photo`, `screenshots[].src`, `gallery[].src` field elsewhere in this
document is a reference to an `Asset.id` (or simply its resolved `url` if
the API denormalizes on read, which is simpler for the frontend and
recommended given the small content volume).

---

## 9. Entity-Relationship Summary

```
Project 1───1 caseStudy (embedded JSON, not a separate table — see note)
ServiceCategory 1───N SubService
Review          (standalone)
TeamMember      (standalone)
ContactSubmission (standalone)
AdminUser       (standalone)
Asset           N───1 referenced by Project / TeamMember / (screenshots/gallery arrays)
```

**Modeling note on `caseStudy`:** given its deeply nested, per-project-type
varying shape (§2a vs §2b), storing it as a single **JSONB column** on the
`projects` table (Postgres has first-class JSONB support) is simpler and
more faithful to the current frontend than fully normalizing every nested
array (`breakdown`, `techStack` groups, `scalability` items, etc.) into
their own tables. Normalize only if the admin UI needs to query/filter
*inside* that nested content (e.g. "find all projects using React in their
tech stack") — nothing in the current frontend does that, so JSONB is the
pragmatic choice for v1. `SubService`, by contrast, is worth its own table
since sub-services are a genuinely repeating, independently-orderable list
per category.
