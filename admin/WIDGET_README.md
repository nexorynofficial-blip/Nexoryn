# Floating AI Assistant Widget

Drop-in React component for the Nexoryn Dashboard's **New Project**
page. Renders the floating circular button, and fills in the real
form's fields for the admin to review — it never saves or publishes
anything itself.

## Why this lives inside ProjectForm.tsx, not the generic layout

Earlier versions of this widget assumed a separate backend would
drive a headless browser to fill the form from outside. That's gone.
Per `PORTFOLIO_FORM_REFERENCE.md`, the real form has no stable
`id`/`name`/`data-testid` attributes to target externally (§7.3), and
there's no draft state to save to anyway (§4) — so the only robust
way to "fill in the fields" is for this widget to call directly into
`ProjectForm.tsx`'s own React state, from inside the same component
tree. That means it must be rendered **inside `ProjectForm.tsx`**,
not just somewhere in the dashboard's outer layout.

## Integration

1. Copy `FloatingAgentWidget.tsx` into `admin/src/components/`.
2. Copy `assets/nexoryn-logo.png` (256×256, already sized for a
   button icon — not `assets/nexoryn-logo-original.png`, a 13MB
   reference file, not for shipping) into `admin/public/` as
   `admin/public/nexoryn-logo.png`. Vite serves anything in `public/`
   at the root path, matching the component's `/nexoryn-logo.png`.
3. In `ProjectForm.tsx`, render it and wire `onAutofill` to your own
   state setters. **The setter names below are illustrative** —
   swap in whatever this file's actual state variables are called:

   ```tsx
   import FloatingAgentWidget, { type AutofillPayload } from "@/components/FloatingAgentWidget";

   function handleAutofill(data: AutofillPayload) {
     setTitle(data.title);
     setIndustry(data.industry);
     setService(data.service);
     setDescription(data.description);
     setTags(data.tags);

     // Case study content: however this component currently applies
     // a full case-study object (e.g. the CaseStudyEditor's onChange
     // prop, or a single setCaseStudy(...) call) — feed it
     // `data.caseStudy` there. It's shaped exactly like
     // standardCaseStudySchema / designCaseStudySchema minus
     // gallery/photoId (see PORTFOLIO_FORM_REFERENCE.md §4.2),
     // which is why the images are handled separately below.
     setCaseStudy((prev) => ({ ...prev, ...data.caseStudy }));

     // Images: data.uploadedAssets are already-created Asset rows
     // (the widget uploaded them via POST /api/v1/admin/assets
     // itself — nothing left to upload here). Apply them the same
     // way a manual "+Add photo" click would:
     if (data.service === "Web Development") {
       if (data.uploadedAssets[0]) setPhoto(data.uploadedAssets[0]);
     } else if (data.uploadedAssets.length > 0) {
       setMediaItems((prev) => [
         ...prev,
         ...data.uploadedAssets.map((asset) => ({ asset, alt: asset.altText })),
       ]);
       // Leave thumbnailId alone if unset — per this component's own
       // existing behavior, the first image added already defaults
       // to being the thumbnail (PORTFOLIO_FORM_REFERENCE.md §5.2).
       // The admin can change it with the star toggle either way.
     }
   }

   // Inside the component's JSX, alongside the rest of the form:
   <FloatingAgentWidget
     backendApiBaseUrl={import.meta.env.VITE_NEXORYN_AGENT_URL}
     onAutofill={handleAutofill}
   />
   ```

4. Set `VITE_NEXORYN_AGENT_URL` in `admin/.env` to wherever the
   Python backend is running (e.g. `http://localhost:8000` in dev).
   This is a Vite app, so the env var must be prefixed `VITE_` and
   read via `import.meta.env`, not `process.env`.

No `dashboardApiBaseUrl` prop is needed in the normal case — the
widget's image uploads go to a relative `/api/v1/admin/assets`,
which already resolves correctly since the widget runs inside the
same app, on the same origin, with the admin's session cookie sent
automatically. Only pass it if the admin app and its API are ever
served from different origins.

## What it does / doesn't do

- Calls the Python backend's `POST /extract` (the **only** network
  call that costs anything — one Anthropic API call per click) to
  turn the summary into structured data shaped like the real
  project schema.
- Uploads each selected image directly to the dashboard's own
  `POST /api/v1/admin/assets`, using the browser's existing session
  — no credentials stored anywhere in this widget or the backend.
- Calls `onAutofill` with everything assembled. From there, it's
  ordinary React state in `ProjectForm.tsx` — visible, editable, and
  entirely under the admin's control.
- **Never calls `POST`/`PUT /api/v1/admin/projects`.** There is no
  code path in this widget, or in the Python backend, that creates
  or saves a project. That capability simply doesn't exist here —
  the admin always clicks Save Project themselves, in the dashboard's
  own UI, after reviewing. (There's no draft state to fall back to
  either — see `PORTFOLIO_FORM_REFERENCE.md` §4 — so this is the only
  place a safety checkpoint can live.)
- Ships with plain inline styles so it works with zero CSS setup.
  Restyle freely — nothing about the styling is load-bearing.

## Not included here

Zero dependencies beyond React. Assumes it's dropped into an existing
Vite + React + TypeScript app (which `admin/` already is).
