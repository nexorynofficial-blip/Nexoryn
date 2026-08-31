# Deployment

Three pieces ship together:

| Piece | What it is | Where it goes |
|---|---|---|
| Marketing site | Vite SPA in `src/` | Static host (Vercel / Netlify / Cloudflare Pages) |
| Admin panel | Vite SPA in `admin/` | **Same host**, built into `dist/admin`, served at `<site>/admin` |
| Backend API | Express + Prisma in `backend/` | Any Docker host (Render / Railway / Fly.io) + a Postgres database |

The admin panel is *not* a separate deployment. `npm run build:all` builds the
site into `dist/` and the admin into `dist/admin/`, so one static deploy
carries both and the admin lives at `https://yoursite.com/admin`.

---

## 1. Frontend + admin

```bash
npm run build:all      # or: bun run build:all
```

Output is a single `dist/` directory. Config for the two common hosts is
already committed:

- **Vercel** — `vercel.json` (build command, output dir, rewrites)
- **Netlify / Cloudflare Pages** — `public/_redirects`

Both do the same two things: rewrite `/admin/*` to `/admin/index.html` and
everything else to `/index.html`, so client-side routing works on a hard
refresh. The `/admin` rewrite has to come *first* — otherwise the catch-all
would swallow it and serve the marketing shell.

### Environment variable

Set one variable in the host's dashboard:

```
VITE_API_BASE_URL = https://your-backend-url
```

Leave it unset and the site runs entirely on the bundled static content in
`src/data/` — exactly how it behaved before the backend existed. That is the
safe default, not a broken state.

---

## 2. Backend

`backend/Dockerfile` builds a production image (multi-stage: TypeScript
compiled, dev dependencies pruned, runs as a non-root user). On boot it runs
`prisma migrate deploy` before starting, so a fresh database is set up
automatically and an existing one only gets the migrations it is missing.

### Render (blueprint included)

`backend/render.yaml` declares the web service **and** a Postgres database.
In Render: **New → Blueprint**, point it at the repo. Everything marked
`sync: false` in that file has to be filled in by hand — those are secrets and
are deliberately not committed.

### Any other Docker host

```bash
cd backend
docker build -t nexoryn-backend .
docker run -p 3001:3001 --env-file .env nexoryn-backend
```

### Required environment variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `JWT_SECRET` | yes | Signs the admin session cookie. `openssl rand -base64 48` |
| `FRONTEND_URL` / `FRONTEND_PROD_URL` | yes | Exact origin of the deployed site — scheme + host, **no trailing slash**. CORS and the session cookie both depend on this being right. |
| `RESEND_API_KEY`, `RESEND_FROM_ADDRESS`, `ADMIN_NOTIFICATION_EMAIL` | for email | Without these the API still **stores** every contact submission; it just records the send failure on the row. |
| `CLOUDINARY_*` | for uploads | Only needed once someone uploads a new image through the admin panel. Existing content resolves against the frontend bundle (see below). |
| `ADMIN_URL` / `ADMIN_PROD_URL` | no | Only for a standalone admin deployment or local dev. In production the admin is served from the frontend origin, so it is already covered by `FRONTEND_URL`. |

### First deploy: seed the database

```bash
cd backend
DATABASE_URL="<production url>" bun run extract:frontend-data
DATABASE_URL="<production url>" \
  SEED_ADMIN_EMAIL="you@example.com" \
  SEED_ADMIN_PASSWORD="<a real password>" \
  SEED_ADMIN_NAME="Waseem Farooq" \
  bun run db:seed
```

`SEED_ADMIN_NAME` should match one of the three Finance partners exactly, or
that account's "your position" card on the Finance page won't resolve.

Add the other admins with:

```bash
DATABASE_URL="<production url>" \
  bun scripts/create-admin.mjs "Akbar Khan" akbar@example.com "<password>"
```

---

## How images work

This is the part worth understanding before changing anything.

The 42 images in `src/assets/` are imported by `src/data/*.js`, so Vite
bundles and content-hashes them at build time. The database, however, stores
each Asset's `url` as the *source path* the extraction script found —
`src/assets/project-aurum-thumb.png` — which is not a URL a browser can load.

`src/lib/assetUrl.js` bridges the two. It builds a map from source path to
the hashed build URL using `import.meta.glob`, so an API response naming
`src/assets/foo.png` resolves to the real bundled asset. Anything that is
already an absolute URL (a Cloudinary upload made through the admin panel)
passes straight through untouched.

The practical consequence: **the site reads content from the API today without
any image having to be re-uploaded to a CDN.** Cloudinary only becomes
necessary for images added *after* this point, through the admin panel.

---

## How the fallback works

`src/lib/content.js` is the site's single content source. Every getter tries
the API first and returns the bundled static data if the API is unreachable,
slow (4s timeout), or returns nothing usable. `src/hooks/useContent.js` paints
the static copy immediately and swaps in the API response when it lands — so
there is no spinner, no layout shift, and a backend outage degrades to "the
site shows slightly stale content" rather than a blank page.

The contact form behaves the same way: it posts to the backend, and falls back
to the original client-side EmailJS path if the backend cannot be reached. A
4xx from the backend is surfaced to the user rather than retried, since the
server already judged that payload invalid.

---

## Known gaps

- **No DELETE route for contact submissions.** The inbox can filter and mark
  read/handled, but spam can't be removed through the UI yet.
- **Docker image is unverified locally.** No Docker daemon was available on the
  development machine. The TypeScript build and the compiled `dist/server.js`
  were both verified to run and serve real requests; the container layers
  around them have not been executed.
- **No `package-lock.json` in `backend/`.** The repo is developed with bun, so
  the Dockerfile falls back from `npm ci` to `npm install`. Commit a lockfile
  if you want fully reproducible image builds.
