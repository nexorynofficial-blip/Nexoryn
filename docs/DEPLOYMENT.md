# Deployment

Three pieces ship as **two Vercel projects**, both free, plus a free Neon
database:

| Piece | What it is | Where it goes |
|---|---|---|
| Marketing site | Vite SPA in `src/` | Vercel project #1 (existing — `nexoryn-delta.vercel.app`) |
| Admin panel | Vite SPA in `admin/` | **Same project as the site**, built into `dist/admin`, served at `/admin` |
| Backend API | Express + Prisma in `backend/` | Vercel project #2 (new), as Serverless Functions |
| Database | Postgres | Neon (free tier) |

The admin panel is *not* a separate deployment — `npm run build:all` builds
the site into `dist/` and the admin into `dist/admin/`, so project #1's one
build carries both, and the admin lives at `https://<your-site>.vercel.app/admin`.

The backend *is* a separate Vercel project, because it's a different kind of
app (an API, not a static site) and needs its own env vars, its own domain,
and its own build settings.

---

## Why two Vercel projects instead of one

Vercel supports serverless functions inside a single project's `/api`
folder, which would put frontend and backend under one domain. That's not
what's set up here — deploying the backend on its own keeps it fully
self-contained (its own `package.json`, its own dependency install, its own
Prisma generate step) rather than depending on Vercel correctly discovering
and installing a second project's dependencies from inside the first
project's build. Two projects is more moving parts to configure once, but
each part is simpler and more predictable to debug.

The trade-off: since the two projects have different domains, the browser
sees this as a cross-origin request, so CORS and cookie settings matter (see
`backend/src/config/env.ts`'s `allowedOrigins()`). That's already handled —
it's the exact code that made `/api/v1/*` calls in local development
(`:5173` → `:3001`) work.

---

## Why Neon instead of Vercel Postgres or a database on the backend host

Neon isn't chosen for a technical reason specific to this app — Prisma talks
to any Postgres identically. It's chosen because it's free, generous, and
what you already know. The one thing that *does* matter regardless of which
Postgres you pick: **use the pooled connection string**, not the direct one.

A serverless function can have several instances running at once, each
holding its own Prisma Client (see `backend/api/index.ts`'s comment on this).
Neon's pooled endpoint (PgBouncer) is built for exactly that — many short-lived
connections — while the direct endpoint has a low connection ceiling that
real traffic can hit. Neon's dashboard shows both; the pooled one is what
goes into `DATABASE_URL`.

---

## Step 1 — Create the Neon database

1. **neon.tech** → sign up → **New Project**
2. In the project dashboard, find **Connection Details**. Switch the toggle to
   **Pooled connection** (sometimes labeled "Connect via PgBouncer")
3. Copy that connection string — it looks like:
   ```
   postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require
   ```
   The `-pooler` in the hostname is what confirms you copied the pooled one.

---

## Step 2 — Load your content into Neon

```bash
cd "backend"

# paste the pooled connection string from Step 1
export DB="postgresql://...paste-here...?sslmode=require"

DATABASE_URL="$DB" bun run extract:frontend-data

DATABASE_URL="$DB" \
  SEED_ADMIN_EMAIL="waseemfarooq6462@gmail.com" \
  SEED_ADMIN_PASSWORD="PickARealPassword" \
  SEED_ADMIN_NAME="Waseem Farooq" \
  bun run db:seed
```

Expect: `16 projects seeded / 3 service categories / 20 reviews / 3 team members`.

Add the other two admins:

```bash
DATABASE_URL="$DB" bun scripts/create-admin.mjs "Akbar Khan" akbar.khan@nexoryn.ai "PickARealPassword1"
DATABASE_URL="$DB" bun scripts/create-admin.mjs "Abdul Ahad" abdul.ahad@nexoryn.ai "PickARealPassword2"
```

Names must match `PARTNERS` in `backend/src/services/validation.ts` exactly,
or that account's Finance "your position" card won't resolve.

---

## Step 3 — Deploy the backend to Vercel

1. **vercel.com** → **Add New → Project** → import the same GitHub repo again
2. When asked for the **Root Directory**, set it to `backend`
3. Framework Preset: **Other** (there's no frontend framework here — it's an
   API-only project). Leave Build/Output settings alone; `backend/vercel.json`
   already sets the install and build commands.
4. Before deploying, add these **Environment Variables**:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | the pooled Neon string from Step 1 |
   | `JWT_SECRET` | output of `openssl rand -base64 48` |
   | `JWT_EXPIRES_IN` | `7d` |
   | `FRONTEND_URL` | `https://nexoryn-delta.vercel.app` — no trailing slash |
   | `FRONTEND_PROD_URL` | your final custom domain once you have one, else leave blank |
   | `NODE_ENV` | `production` |

   Leave `RESEND_*`, `CLOUDINARY_*`, `ADMIN_URL`/`ADMIN_PROD_URL` blank for now.

5. **Deploy**. First deploy takes a minute or two.
6. Copy the URL Vercel gives this project, e.g. `https://nexoryn-backend.vercel.app`
7. **Check it worked**: open `<that-url>/health` — expect:
   ```json
   {"status":"ok","timestamp":"..."}
   ```

⚠️ `FRONTEND_URL` has to match your live site's origin **exactly** — scheme,
host, no trailing slash. Get it wrong and admin login will fail silently
(the browser refuses the session cookie without any obvious error message).

### Why `npm install`, not `bun install`, for this project specifically

`backend/vercel.json` pins `installCommand` to `npm install` even though this
repo is developed with bun and ships a `bun.lock`. That's deliberate: while
building this project, `bunx prisma generate` twice failed to correctly
fetch/install Prisma's query engine binaries on this machine (the same class
of bug fixed differently by a `bun pm cache rm` earlier in this project's
history) — where the identical command via plain Node worked immediately.
Given that history, forcing npm for this one build step removes a known
source of flakiness rather than hoping the bug doesn't reproduce on Vercel's
build machines too.

---

## Step 4 — Connect the frontend

1. Open your **frontend** project on Vercel (`nexoryn-delta`)
2. **Settings → Environment Variables** → **Add New**:
   - Name: `VITE_API_BASE_URL`
   - Value: your Step 3 URL, e.g. `https://nexoryn-backend.vercel.app`
   - Environment: **Production** (and Preview, if you want preview deploys to hit the live backend too)
3. **Deployments** → latest one → **⋯ → Redeploy**

---

## Step 5 — Check it end to end

1. Visit your site → browse Portfolio. Should look identical — it's now
   reading from the API instead of the bundled static copy.
2. Visit `<your-site>/admin` → log in with the Waseem account from Step 2 →
   you should land on Overview with real Finance numbers.
3. Submit the actual contact form on the live site → open **Contact Inbox**
   in the admin → the submission should appear there.

If step 3 shows up in the inbox, the whole chain — frontend → backend →
Neon → admin — is working.

---

## Optional, do later — real email

Contact-form emails currently still go through the original client-side
EmailJS path (nothing is broken without this). To move it server-side:

1. Sign up at **resend.com**, verify your domain
2. In the backend's Vercel project → **Settings → Environment Variables**, add:
   - `RESEND_API_KEY`
   - `RESEND_FROM_ADDRESS` (e.g. `Nexoryn <noreply@nexoryn.ai>`)
   - `ADMIN_NOTIFICATION_EMAIL`
3. Redeploy the backend project for the new env vars to take effect

---

## How images work

The 42 images in `src/assets/` are imported by `src/data/*.js`, so Vite
bundles and content-hashes them at build time. The database, however, stores
each Asset's `url` as the *source path* the extraction script found —
`src/assets/project-aurum-thumb.png` — which is not a URL a browser can load.

`src/lib/assetUrl.js` bridges the two. It builds a map from source path to
the hashed build URL using `import.meta.glob`, so an API response naming
`src/assets/foo.png` resolves to the real bundled asset. Anything already an
absolute URL (a Cloudinary upload made through the admin panel) passes
through untouched.

The practical consequence: **the site reads content from the API today
without any image having to be re-uploaded to a CDN.** Cloudinary only
becomes necessary for images added *after* this point, through the admin
panel.

---

## How the fallback works

`src/lib/content.js` is the site's single content source. Every getter tries
the API first and returns the bundled static data if the API is
unreachable, slow (4s timeout), or returns nothing usable.
`src/hooks/useContent.js` paints the static copy immediately and swaps in
the API response when it lands — no spinner, no layout shift, and a backend
outage degrades to "the site shows slightly stale content" rather than a
blank page.

The contact form behaves the same way: it posts to the backend, and falls
back to the original client-side EmailJS path if the backend can't be
reached. A 4xx from the backend is surfaced to the user rather than
retried, since the server already judged that payload invalid.

---

## Known gaps

- **No DELETE route for contact submissions.** The inbox can filter and mark
  read/handled, but spam can't be removed through the UI yet.
- **Serverless cold starts.** The first request after a period of no traffic
  takes a bit longer while a new function instance spins up — normally well
  under a second for this app, nothing like the 30-60s sleep a free
  always-on host would impose, but not literally zero either.
- **`express-rate-limit`'s default store is in-memory**, which means rate
  limits are enforced per function instance, not globally — acceptable for
  this app's actual traffic level, but worth knowing if abuse ever becomes a
  real concern (the fix is a shared store like Upstash Redis).
- **No `package-lock.json` in `backend/`.** The repo is developed with bun,
  so both the Vercel build and the alternative Dockerfile fall back from
  `npm ci` to `npm install`. Commit a lockfile if you want fully
  reproducible builds.

---

## Alternative: a persistent server instead of serverless

`backend/Dockerfile` and `backend/render.yaml` are kept for later, in case
serverless ever stops being the right fit (a background job, a long-running
connection, hitting a serverless limit a persistent process doesn't have).
They build the same `createApp()` Express app as a normal `.listen()`
server. Neon works identically either way — nothing about the database
changes if the API server moves.
