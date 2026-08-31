# API Specification
## Nexoryn Website Backend

Base URL (example): `https://api.nexoryn.ai/api/v1`
All bodies are JSON. All timestamps are ISO 8601 UTC. Auth: admin routes
require a valid session cookie (see TRD §7) — shown as 🔒 below.

---

## Public — Projects

### `GET /projects`
List projects for the Portfolio grid.

**Query params** (all optional):
| Param | Type | Notes |
|---|---|---|
| `industry` | string | Exact match against `Project.industry`; omit or `"All Projects"` for no filter (mirrors `PortfolioPage.jsx`'s `INDUSTRIES` list, first entry is the "no filter" option). |
| `service` | string | `Automation` \| `Web Development` \| `Brand & Graphic Design` (⚠️ see DATA-MODEL.md's naming-inconsistency callout — other entities use bare `"Graphic Design"`; pick one canonical string before building) |
| `q` | string | Case-insensitive substring match against `title`, `industry`, `service` — mirrors the current client-side search in `PortfolioPage.jsx`. |
| `featured` | boolean | If `true`, returns only `isFeatured` projects (used by the homepage teaser instead of the client hardcoding 5 slugs). |
| `page`, `pageSize` | integer | Pagination; current frontend paginates client-side in batches of 6 — server-side pagination is optional for v1 given only 15 projects exist, but include the params so it scales without an API change later. |

**Response `200`**
```json
{
  "items": [
    {
      "slug": "aurum-luxury-ecommerce-platform",
      "title": "Aurum Luxury E-Commerce Platform",
      "industry": "E-Commerce",
      "service": "Web Development",
      "description": "...",
      "tags": ["Next.js", "Stripe", "PostgreSQL"],
      "photo": "https://cdn.example.com/assets/aurum-thumb.png",
      "isFeatured": true
    }
  ],
  "total": 15
}
```
Note: list responses omit the full `caseStudy` object — only the detail
endpoint below returns it, to keep list payloads small.

### `GET /projects/:slug`
Full case-study detail for `CaseStudyPage.jsx`.

**Response `200`** — the full `Project` including `caseStudy` (shape per
DATA-MODEL.md §2, either the standard or design variant).
**Response `404`** — `{ "error": "Project not found" }` (matches the
frontend's existing "Project not found" fallback UI).

---

## Public — Services

### `GET /services`
Returns all `ServiceCategory` records with nested `subServices`, in display
order, for `ServicesPage.jsx`.

**Response `200`**
```json
{
  "items": [
    {
      "id": "automation",
      "serviceName": "Automation",
      "overviewIcon": "Zap",
      "overview": { "heading": "Automation", "body": "..." },
      "mobileSummary": { "description": "...", "howWeWork": [], "whatYouGet": [], "platforms": [] },
      "subServices": [
        { "id": "workflow-automation", "icon": "Workflow", "name": "Workflow Automation", "description": "...", "howWeWork": [], "whatYouGet": [], "platforms": [] }
      ]
    }
  ]
}
```

---

## Public — Reviews

### `GET /reviews`
**Query params:** `service` (optional — `Automation` \| `Web Development` \|
`Graphic Design`; omit for all). Mirrors `ReviewsPage.jsx`'s filter, which
defaults its own UI selection to `Automation` client-side — the API itself
should support returning all reviews unfiltered too.

**Response `200`**
```json
{
  "items": [
    { "id": "abu786110", "name": "abu786110", "location": "Canada", "service": "Graphic Design", "text": "..." }
  ]
}
```

---

## Public — Team

### `GET /team`
**Response `200`**
```json
{ "items": [ { "id": "...", "name": "Waseem Farooq", "role": "Co Founder", "photo": "https://cdn.../waseem.png" } ] }
```

---

## Public — Contact

### `POST /contact`
Replaces the direct-to-EmailJS call in `sendContactEmail.js`.

**Request body**
```json
{
  "formId": "consultation",
  "values": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "company": "Acme Inc",
    "phone": "+1 555 0100",
    "country": "United States",
    "city": "Austin",
    "datetime": "Tuesday afternoon, any time after 2pm CST",
    "message": "Would love to discuss automating our onboarding flow."
  }
}
```

- `formId` must be one of `question` \| `consultation` \| `start`.
- `values` is validated against the exact required/optional field set for
  that `formId` (DATA-MODEL.md §4) — extra unknown keys are ignored, missing
  required keys reject with `422`.

**Response `201`**
```json
{ "id": "a1b2c3...", "status": "received" }
```

**Response `422`** (validation failure)
```json
{ "error": "Validation failed", "fields": { "email": "Required", "company": "Required for this form type" } }
```

**Response `429`** (rate limited — see TRD §7)
```json
{ "error": "Too many requests, please try again later." }
```

Frontend behavior this must support unchanged: on `201` show the existing
"Message sent" success panel; on any error (`4xx`/`5xx`/network failure)
show the existing inline error message pointing the visitor at the direct
email/phone links already on the page.

---

## Admin — Auth

### `POST /admin/login`
**Request:** `{ "email": "...", "password": "..." }`
**Response `200`:** sets the httpOnly session cookie (TRD §7); body
`{ "email": "..." }`.
**Response `401`:** `{ "error": "Invalid credentials" }`.

### `POST /admin/logout` 🔒
Clears the session cookie. `204`.

### `GET /admin/me` 🔒
Returns the current admin's identity, for the admin UI to confirm session
validity on load. `200` `{ "email": "..." }` or `401` if not logged in.

---

## Admin — Projects 🔒

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/admin/projects` | Same as public list, but includes unpublished/draft projects if a `published` flag is added later (v1 can treat all projects as always-published). |
| `POST` | `/admin/projects` | Create a project. Body: full `Project` shape minus `slug` (server-generates from `title`, or accepts an admin-supplied slug — validate uniqueness). |
| `GET` | `/admin/projects/:id` | Fetch one for editing (by internal id, not slug, so slug can be edited without breaking the lookup). |
| `PUT` | `/admin/projects/:id` | Full update. |
| `PATCH` | `/admin/projects/:id/reorder` | Body `{ "featuredOrder": 2 }` or similar, for homepage teaser ordering. |
| `DELETE` | `/admin/projects/:id` | Delete. Return `409` with a clear message if you later add referential constraints (none expected for v1). |

**Validation to enforce server-side (not just in the admin form UI):**
- `service = "Automation"` or `"Web Development"` → `caseStudy` must match
  the standard shape (DATA-MODEL.md §2a) and must NOT include
  `designProcess`/`keyFeatures`/`useCases`.
- `service = "Brand & Graphic Design"` → `caseStudy` must match the design
  shape (§2b) and must include `gallery`.
- Standard-shape projects: exactly one of `screenshots` / `gallery` /
  `livePreview` may be set (§2c) — reject a payload setting more than one.
- All `icon` string fields must be valid `lucide-react` export names.

---

## Admin — Services 🔒

| Method | Path | Purpose |
|---|---|---|
| `GET` / `POST` | `/admin/services` | List / create a `ServiceCategory`. |
| `PUT` / `DELETE` | `/admin/services/:id` | Update / delete a category. |
| `POST` | `/admin/services/:categoryId/sub-services` | Add a sub-service. |
| `PUT` / `DELETE` | `/admin/sub-services/:id` | Update / delete a sub-service; include an `order` field in the update body for re-ordering. |

---

## Admin — Reviews 🔒

| Method | Path | Purpose |
|---|---|---|
| `GET` / `POST` | `/admin/reviews` | List (including a `service` filter for admin convenience) / create. |
| `PUT` / `DELETE` | `/admin/reviews/:id` | Update / delete. |

---

## Admin — Team 🔒

| Method | Path | Purpose |
|---|---|---|
| `GET` / `POST` | `/admin/team` | List / create. |
| `PUT` / `DELETE` | `/admin/team/:id` | Update / delete. |

---

## Admin — Contact Submissions 🔒

### `GET /admin/contact-submissions`
**Query params:** `status` (`new`\|`read`\|`handled`), `formId`, `from`/`to`
(date range), `page`/`pageSize`.
**Response `200`:** paginated list, newest first, including `emailedAt` so
the admin can spot ones that failed to notify.

### `GET /admin/contact-submissions/:id`
Full detail of one submission.

### `PATCH /admin/contact-submissions/:id`
Body: `{ "status": "handled" }` — mark as read/handled.

### `POST /admin/contact-submissions/:id/resend-email`
Manually retry the notification email for a submission where `emailedAt`
is `null` (i.e., the original send failed).

### `GET /admin/contact-submissions/export`
Returns a CSV of submissions matching the same filters as the list
endpoint, for the "export to spreadsheet" need called out in PRD §6.3.

---

## Admin — Assets 🔒

### `POST /admin/assets`
`multipart/form-data` upload. Body: the file + `altText`. Validate MIME
type (images only) and a max size (e.g. 10MB) server-side before accepting.
**Response `201`:** `{ "id": "...", "url": "https://cdn.../..." }` — the
returned `url` is what admin forms elsewhere (project photo, screenshots,
team photo) reference.

### `DELETE /admin/assets/:id`
Delete an uploaded asset. Server should warn (via a `409` + list of
referencing entities) rather than silently orphaning references if the
asset is still in use — mirrors this project's general "confirm before
destructive action" convention.

---

## Status Code Conventions

| Code | Meaning |
|---|---|
| `200` | Successful read/update |
| `201` | Successful create |
| `204` | Successful action with no body (logout, etc.) |
| `401` | Not authenticated (admin routes only) |
| `403` | Authenticated but not permitted (reserved for a future roles system — v1 has no distinct permission levels) |
| `404` | Resource not found |
| `409` | Conflict (e.g. duplicate slug, asset still referenced) |
| `422` | Validation failure — body includes a `fields` map of per-field errors |
| `429` | Rate limited |
| `500` | Unhandled server error — log to the error tracker (TRD §9), never leak internals in the response body |
