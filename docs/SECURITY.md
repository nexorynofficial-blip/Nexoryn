# Security

How the app defends itself, and the handful of things that live outside this
repository and have to be done by hand.

## Reporting

`public/.well-known/security.txt` points reporters at
`nexorynofficial@gmail.com`. It carries an `Expires` date — refresh it before
it lapses, or tooling will treat the file as invalid.

---

## Authentication

**Sessions.** Login issues a signed JWT in an httpOnly cookie scoped to
`/api/v1/admin`. The token is never returned in the response body: the panel
authenticates with the cookie, so a readable copy would only give an XSS
payload or a browser extension something to steal.

**Lifetime and revocation.** Tokens last 12 hours. Because a JWT is otherwise
valid until it expires no matter what happens to the account, every admin row
carries `sessionsValidFrom`; `authMiddleware` rejects any token issued before
it. Signing out and changing a password both push it forward, which is what
makes those actions end sessions on other devices.

**Verification is stateful on purpose.** `authMiddleware` re-reads the account
on every request rather than trusting the token's claims, so a role change or a
revoked session takes effect on the next request instead of whenever the
holder's token happens to lapse.

**Action passkey.** A second, static secret — separate from the login
password and not time-based, so no authenticator app is needed. Generated once
from *My Account* (`POST /account/passkey/setup`) and shown exactly one time;
only its bcrypt hash is stored, so it can never be displayed again, only
regenerated. It gates two things: approving or rejecting a finance request,
and changing the account password — a valid session cookie alone is not
enough for either. Regenerating a forgotten passkey needs the account
*password* rather than the passkey itself (see `verifyActionPasskey` and
`generatePasskey` in `src/services/passkey.ts`), since requiring the passkey
to replace a forgotten passkey would be a dead end. Attempts are rate-limited
per account (8 per 15 minutes) and wrong attempts are audited.

**Passwords.** bcrypt cost 12. At least 12 characters with a letter and a
number, screened against a small common-password list and against Have I Been
Pwned's corpus via its k-anonymity range API (only the first five characters of
the SHA-1 hash leave the server; the check fails open if HIBP is unreachable).

**Login timing.** A login for an address with no account runs a decoy bcrypt
comparison so it costs the same as a wrong password. Without that, "no such
user" returns measurably faster and account existence can be enumerated.

## Authorization

Two roles, enforced by `requireRole()` in `src/middleware/auth.ts`:

| Role | Access |
| --- | --- |
| `owner` | Everything, including the finance ledger, the admin directory, and contact submissions (customer PII) |
| `admin` | Content only — projects, services, reviews, team, FAQs, assets |

New accounts default to `admin` and must be promoted deliberately. The
migration that introduced this promoted every pre-existing account to `owner`,
so nobody lost access they already had.

The admin panel hides owner-only nav items, but that is cosmetic — the API is
what enforces the boundary.

## CSRF

The session cookie is `SameSite=None` in production, because the panel and the
API sit on different Vercel domains and the browser genuinely has to send it
cross-site. That means the browser will also attach it to a request some other
site triggered, and a form POST is a "simple request" that no CORS preflight
holds back — CORS stops the attacker *reading* the reply, not the write landing.

`requireTrustedOrigin` (`src/middleware/csrf.ts`) therefore checks `Origin`
(falling back to `Referer`) against the allowlist on every state-changing
request that carries the session cookie. Requests without the cookie skip the
check, since they have no ambient credential to abuse — that keeps Bearer-token
API clients working.

`express.urlencoded()` is deliberately not registered: nothing here is
submitted as a URL-encoded form, and accepting the format only widens this
surface.

## Rate limiting

`app.set("trust proxy", 1)` is required for any of this to work — Vercel
terminates TLS and proxies to the function, so without it every visitor keys to
the same bucket, which both shares one allowance among all attackers and lets a
single noisy client lock everyone out.

- **Login and contact** use `PrismaRateLimitStore`, which counts in Postgres so
  limits survive cold starts and hold across concurrent function instances. The
  increment is a single atomic `INSERT … ON CONFLICT` so concurrent requests
  can't both read the same count. It fails open — every route it guards needs
  the database anyway.
- **Global (120/min)** stays in memory: it runs on every request, where a
  database round-trip would cost more than the backstop is worth.

## Audit trail

`AuditLog` is append-only — nothing in the app updates or deletes a row. It
records logins (including failures), logouts, password changes, passkey changes,
every finance mutation, contact CSV exports, and asset deletions. Writes never
throw: a failed audit write must not turn a successful action into an error, so
it falls back to the platform log.

## Finance integrity

- `enteredBy` always comes from the session, never the request body.
- `actionBy` comes from the body, so a row naming a *different* partner is a
  claim about that person's money and stays `pending` until they approve it.
  Only rows you attribute to yourself post immediately.
- Nobody can approve their own request, and nobody can both raise and clear one.
- Only whoever recorded an entry can delete it; anything else needs a
  correcting entry, so both sides of the fix stay visible. Deletions are audited.

## Headers

The API sets its own via helmet. The static site's headers live in
`vercel.json` and include a Content-Security-Policy, `X-Frame-Options: DENY`
(the admin panel is served from this domain and must not be framable),
nosniff, a Referrer-Policy and a Permissions-Policy.

> **The CSP's `connect-src` names the backend origin explicitly.** If the
> backend URL ever changes, update `vercel.json` in the same commit as
> `VITE_API_BASE_URL`, or the browser will block every API call.

**`frame-src` is `https:`, not `'none'`, because of one feature:** case study
pages can embed a client project's live deployed site in an iframe
(`LivePreviewEmbed` in `src/pages/CaseStudyPage.jsx`), and its URL —
`livePreviewUrl` — is a free-text field on the case study, set per project
from the admin panel. There is no fixed set of origins to allowlist; a new
case study can point at any client's domain at any time, and enumerating
known ones would silently re-break on the next project (this is what
happened: the CSP shipped as `'none'`, which blocks every embed, including
ones added afterward). Scoping this by route isn't possible with a single
static CSP header covering the whole SPA, so it applies site-wide — bounded
by the facts that (1) the URL is admin-entered, not visitor-supplied, and (2)
the iframe itself carries `sandbox="allow-scripts allow-same-origin
allow-forms allow-popups"` and a `strict-origin-when-cross-origin`
`referrerPolicy`, so an embedded page can't navigate the parent tab or drop
top-level popunders regardless of what this directive allows. `frame-ancestors
'none'` and `X-Frame-Options: DENY` are untouched — those guard whether other
sites can frame *this* one, which is a separate question from what this site
is allowed to frame.

`/cfokp`, `/cfokp/` and `/cfokp/*` all return `X-Robots-Tag: noindex, nofollow`.
All three patterns are needed — `/cfokp/:path*` alone does not match the bare
`/cfokp/` that people and crawlers actually land on. The admin panel is
deliberately served at `/cfokp`, not `/admin`, so the URL isn't guessable —
robots.txt does not list it either, for the same reason (see its comment).
This is obscurity on top of real auth, not a substitute for it.

## Dependencies

`npm audit` reports zero vulnerabilities across the root, `admin/` and
`backend/` packages. Two of those needed `overrides` in `backend/package.json`
rather than a straight upgrade:

- **`qs` → `^6.16.0`.** express 4 pins `qs ^6.13`, which sits inside the
  vulnerable range for GHSA-x5fp-wj9c-mxmx (array-limit bypass) and
  GHSA-4mjr-xmp4-gh2g (DoS). `qs` still parses every query string even though
  `express.urlencoded()` is no longer registered, so this is genuinely
  reachable. Short of moving to express 5, the override is the fix.
- **`deepmerge-ts` → `^8.0.0`.** Reached through the Prisma CLI's config
  loader. The alternative was a Prisma 6 → 7 major upgrade, which is a
  migration in its own right and not something to fold into a security pass.
  `prisma generate` is verified working with the override in place.

Lockfiles are committed for `backend/` and `admin/`, so builds are
reproducible — previously `backend/` had none and deploys fell back to
`npm install`.

---

## Manual steps — not enforceable from this repository

1. **Rotate the EmailJS keys.** The client-side EmailJS integration has been
   removed, but its service ID, template ID and public key were shipped in the
   production bundle and should be treated as public. Rotate or delete them in
   the EmailJS dashboard.
2. **Turn on Vercel Deployment Protection** for preview deployments. Previews
   otherwise expose the full admin panel, pointed at production data, on a URL
   with no access control.
3. **Confirm Neon enforces TLS** (`sslmode=require` in `DATABASE_URL`) and that
   point-in-time recovery is retained for as long as you would want to roll back.
4. **Rotate `JWT_SECRET`** if it has ever been shared or committed anywhere.
   Rotating it signs everyone out, which is the intended effect.
5. **Consider a CAPTCHA** (Cloudflare Turnstile) on the contact form if spam
   gets past the honeypot and rate limit. It needs an account and keys, so it
   is not wired up here.
