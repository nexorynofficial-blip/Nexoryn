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

import { PROJECTS, getProjectBySlug as staticProjectBySlug } from "../data/projects";
import { SERVICE_CATEGORIES } from "../data/services";
import { REVIEWS } from "../data/reviews";
import { assetUrl } from "./assetUrl";

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

// Short: content is above the fold, and waiting on a cold backend is worse
// than showing the static copy immediately.
const TIMEOUT_MS = 4000;

async function apiGet(path) {
  if (!API_BASE) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // Offline, aborted, CORS, malformed JSON — all mean "use the fallback".
    return null;
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

export async function getProjects() {
  // pageSize covers the full catalogue; the grid paginates client-side.
  const data = await apiGet("/api/v1/projects?pageSize=50");
  if (!data?.items?.length) return PROJECTS;
  return data.items.map(withResolvedImages);
}

export async function getProjectBySlug(slug) {
  const data = await apiGet(`/api/v1/projects/${encodeURIComponent(slug)}`);
  if (!data?.slug) return staticProjectBySlug(slug);
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
