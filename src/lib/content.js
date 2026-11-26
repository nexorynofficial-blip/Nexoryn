// The site's single source of content.
//
// Every page reads through here instead of importing src/data/*.js directly.
// Each getter tries the backend first and falls back to the committed static
// data if the API is unreachable, slow, or returns nothing usable.
//
// Why the fallback exists: this is a marketing site. A backend hiccup should
// never turn the portfolio into an empty page — the static data is already in
// the bundle, so serving it costs nothing and is always correct-ish. The API
// is what makes the admin panel's edits show up; the static copy is the floor.
//
// Set VITE_API_BASE_URL to point at the backend. Leave it unset and the site
// runs purely on static data, exactly as it did before the backend existed.

// The light list only: the long case-study content is a separate module that
// is loaded on demand (see getProjectBySlug below), so it is not part of the
// bundle every visitor downloads.
import { PROJECTS } from "../data/projects";
import { SERVICE_CATEGORIES } from "../data/services";
import { REVIEWS } from "../data/reviews";
import { assetUrl } from "./assetUrl";

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

// Short: content is above the fold, and waiting on a cold backend is worse
// than showing the static copy immediately. This is correct for every getter
// below except getProjectBySlug: for everything else, timing out falls back
// to a complete, equivalent static list, so a visitor never sees anything
// wrong — just slightly stale. For a project added after the last deploy
// (no static copy exists for it at all), timing out instead falls through to
// "Project not found" — a real project incorrectly reported as missing, not
// a cosmetic delay. A Vercel backend cold start or a slow connection can
// easily take longer than 4s on a first request, so this was firing for
// real. getProjectBySlug asks apiGet for more time and one retry; every
// other getter keeps this original budget unchanged.
const TIMEOUT_MS = 4000;

/**
 * @param {string} path
 * @param {{timeoutMs?: number, retries?: number}} [opts] retries only applies
 *   to a timeout/network/transient-5xx failure — a real 404 means the record
 *   doesn't exist and is returned immediately, retrying won't change that.
 */
async function apiGet(path, { timeoutMs = TIMEOUT_MS, retries = 0 } = {}) {
  if (!API_BASE) return null;
  for (let attempt = 0; ; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
      clearTimeout(timer);
      if (res.status === 404) return null;
      if (res.ok) return await res.json();
    } catch {
      // Offline, aborted, CORS, malformed JSON — all retried the same way.
    }
    if (attempt >= retries) return null;
  }
}

/** Rewrites every image field on an API payload into a loadable URL. */
function withResolvedImages(project) {
  if (!project) return project;
  const cs = project.caseStudy;
  const mapShots = (list) =>
    Array.isArray(list) ? list.map((s) => ({ ...s, src: assetUrl(s.src) })) : list;

  return {
    ...project,
    photo: assetUrl(project.photo),
    ...(cs
      ? {
          caseStudy: {
            ...cs,
            ...(cs.screenshots ? { screenshots: mapShots(cs.screenshots) } : {}),
            ...(cs.gallery ? { gallery: mapShots(cs.gallery) } : {}),
          },
        }
      : {}),
  };
}

// ── Projects ────────────────────────────────────────────────────────────

const PROJECTS_CACHE_KEY = "nx:projects:v1";
let projectsInFlight = null;

/**
 * The last project list the API returned, kept in localStorage. Projects added
 * from the admin panel are not in the bundled static list, so without this the
 * portfolio first paints without them and they pop in a second or more later
 * (longer on a cold backend). With it, every visit after the first paints the
 * full, current list immediately and the API only refreshes it.
 */
let peeked;
export function peekProjects() {
  if (peeked !== undefined) return peeked;
  try {
    const raw = localStorage.getItem(PROJECTS_CACHE_KEY);
    const list = raw ? JSON.parse(raw) : null;
    peeked = Array.isArray(list) && list.length ? list : null;
    return peeked;
  } catch {
    return (peeked = null);
  }
}

export function getProjects() {
  // Home and the portfolio page both ask; share one request.
  if (!projectsInFlight) {
    projectsInFlight = (async () => {
      // pageSize covers the full catalogue; the grid paginates client-side.
      const data = await apiGet("/api/v1/projects?pageSize=50");
      if (!data?.items?.length) return PROJECTS;
      const items = data.items.map(withResolvedImages);
      // Projects maintained in code only (flagged codeOnly) join the API list.
      for (const p of PROJECTS) {
        if (p.codeOnly && !items.some((i) => i.slug === p.slug)) items.push(p);
      }
      try {
        localStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(items));
      } catch {
        /* storage full or blocked: just skip caching */
      }
      return items;
    })().finally(() => {
      // Allow a fresh fetch on the next navigation, not a stale forever-promise.
      setTimeout(() => { projectsInFlight = null; }, 5000);
    });
  }
  return projectsInFlight;
}

export async function getProjectBySlug(slug) {
  // The one getter with no real fallback for a miss (see TIMEOUT_MS comment
  // above) — worth a longer budget and a retry before giving up, since
  // giving up here means "Project not found" for a project that exists.
  const data = await apiGet(`/api/v1/projects/${encodeURIComponent(slug)}`, { timeoutMs: 9000, retries: 1 });
  if (!data?.slug) {
    const { getProjectBySlug: staticProjectBySlug } = await import("../data/projectsFull");
    return staticProjectBySlug(slug);
  }
  return withResolvedImages(data);
}

// ── Services ────────────────────────────────────────────────────────────

export async function getServices() {
  const data = await apiGet("/api/v1/services");
  if (!data?.items?.length) return SERVICE_CATEGORIES;
  // The API already keys each category by its slug as `id` and nests
  // `subServices`, matching the static shape exactly.
  return data.items;
}

// ── Reviews ─────────────────────────────────────────────────────────────

export async function getReviews() {
  const data = await apiGet("/api/v1/reviews");
  if (!data?.items?.length) return REVIEWS;
  return data.items;
}

// ── Team ────────────────────────────────────────────────────────────────

export async function getTeam() {
  const data = await apiGet("/api/v1/team");
  if (!data?.items?.length) return null; // caller keeps its own static list
  return data.items.map((m) => ({ ...m, photo: assetUrl(m.photo) }));
}

// ── FAQs ────────────────────────────────────────────────────────────────

export async function getFaqs() {
  const data = await apiGet("/api/v1/faqs");
  if (!data?.items?.length) return null; // caller keeps its own static list
  return data.items;
}
