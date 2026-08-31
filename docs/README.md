# Nexoryn Backend Planning Docs

This folder is the reference set for designing and building a backend for the
Nexoryn marketing website. It was written by reverse-engineering the current
frontend codebase (React + Vite, currently 100% static, no backend at all)
end to end — every page, form, data file, and integration was inspected so
these documents describe what actually exists today, not an assumption.

Read them in this order:

1. **[PRD.md](./PRD.md)** — Product Requirements Document. What problem the
   backend solves, who it's for, what it must do, what it explicitly won't
   do. Read this first to agree on scope before looking at any technical
   design.
2. **[TRD.md](./TRD.md)** — Technical Requirements Document. Proposed
   architecture, stack choice, deployment topology, security, migration plan
   from the current static-JS content files to a real database, and the
   non-functional requirements (performance, auth, observability).
3. **[DATA-MODEL.md](./DATA-MODEL.md)** — Every entity the backend needs to
   store, field by field, derived directly from the shapes already used in
   `src/data/*.js` and the props each page component consumes. Includes the
   two distinct case-study schemas (automation/web-dev vs. graphic-design
   projects) the frontend already branches on.
4. **[API-SPEC.md](./API-SPEC.md)** — Concrete REST endpoints (public +
   admin), request/response bodies, status codes, and validation rules.
5. **[CURRENT-SITE-INVENTORY.md](./CURRENT-SITE-INVENTORY.md)** — A full
   map of every route, page, section, and content source in the live site
   today, so nothing gets missed when it's ported to a backend-driven CMS.

## One-paragraph summary of "what exists today"

The site is a single Vite + React 19 SPA (`react-router-dom`, client-side
routing only, no SSR) with **zero backend** — every piece of content
(15 portfolio case studies, 3 service categories with sub-services, 20
reviews, 3 team members, legal pages) lives hardcoded in `.js`/`.jsx` files
inside the repo, and the *only* dynamic behavior is the Contact page's 3
forms, which are submitted client-side straight to **EmailJS** (a third-party
relay) with no server, no database, and no record kept of a submission
anywhere except in the recipient's inbox. Building a backend means: (a)
moving that hardcoded content into a real database behind an admin-editable
CMS, and (b) giving the contact forms an actual server to land on, so
submissions are persisted, queryable, and not solely dependent on one
third-party relay staying up.
