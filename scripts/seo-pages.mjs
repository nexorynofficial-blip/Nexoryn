// Runs after `vite build`. The site is a client-rendered app, so every URL used
// to be served the same empty <div id="root"> shell: fine for Google (which
// runs the JavaScript), but crawlers that don't (Bing's, social previews, most
// AI answer engines) saw no title, no description and no text for any page but
// the home page.
//
// This writes dist/<route>/index.html for each public page and every case
// study: the same shell, plus
//   - that page's own <title>, description, canonical and share tags
//   - a visually hidden block of real text and links for crawlers, sitting
//     OUTSIDE #root as a sibling (never inside it — React never reconciles
//     this subtree, so there is no hydration/duplication risk). App.jsx
//     removes it in a useEffect once the real app has mounted.
//   - for case studies, a second JSON-LD <script> describing that project
//
// It also writes dist/sitemap.xml. This used to be a vercel.json rewrite
// proxying live to the backend's /api/v1/sitemap.xml — that backend lives on
// a *.vercel.app domain, which Vercel gives a platform-level
// X-Robots-Tag: noindex on every response, added at the edge after the
// function runs. Writing the sitemap here instead puts it on the custom
// domain, which never gets that default.
//
// Project data (case-study detail + the project list the sitemap/nav use) is
// always fetched live from the API at build time — no bundled-data fallback.
// A prior version of this script silently fell back to a stale, thinner
// bundled project list if the API was unreachable; that is exactly the
// failure mode this build must not have, since it would silently regress
// every case-study page back to a one-paragraph shell and could silently
// under-report the sitemap. If the API can't be reached (after retries) or
// returns incomplete data, this script exits non-zero and the deploy fails,
// rather than shipping thin pages quietly. Each fetch gets 3 attempts with a
// 15s timeout and a short backoff between tries.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SITE = "https://www.nexoryn.tech";
const DIST = "dist";
const html = readFileSync(join(DIST, "index.html"), "utf8");

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function fail(message) {
  console.error(`\nseo-pages: BUILD FAILED — ${message}\n`);
  process.exit(1);
}

const PAGES = [
  { path: "", title: "Nexoryn - Where Automation Meets Ambition", h1: "Nexoryn: Where Automation Meets Ambition",
    desc: "Nexoryn builds workflow automation, AI agents, websites and brand design for growing businesses." },
  { path: "about", title: "About - Nexoryn", h1: "About Nexoryn",
    desc: "Meet the team behind Nexoryn and how we build automation, AI, web and design work for our clients." },
  { path: "services", title: "Services - Nexoryn", h1: "Nexoryn Services",
    desc: "Automation and AI (workflow automation, voice AI agents, LLM agents), web development, and brand and design services." },
  { path: "portfolio", title: "Portfolio - Nexoryn", h1: "Nexoryn Portfolio",
    desc: "Case studies of the automation, AI, web and design projects Nexoryn has delivered." },
  { path: "reviews", title: "Reviews - Nexoryn", h1: "Client Reviews",
    desc: "What Nexoryn's clients say about working with us." },
  { path: "contact", title: "Contact - Nexoryn", h1: "Contact Nexoryn",
    desc: "Get in touch with Nexoryn: team@nexoryn.tech or +92 302 3858945." },
  { path: "privacy-policy", title: "Privacy Policy - Nexoryn", h1: "Privacy Policy",
    desc: "How Nexoryn collects, uses and protects your information." },
  { path: "terms-of-service", title: "Terms of Service - Nexoryn", h1: "Terms of Service",
    desc: "The terms that apply when you use Nexoryn's website and services." },
  { path: "cookie-policy", title: "Cookie Policy - Nexoryn", h1: "Cookie Policy",
    desc: "How Nexoryn uses cookies and similar technologies." },
];

const SERVICES = [
  "Workflow Automation", "Voice AI Agents", "LLM Workflows & AI Agents", "Website Design & Development",
  "Web Applications", "E-Commerce Development", "CMS & Headless Builds", "Performance & SEO Optimization",
  "API & Third-Party Integrations", "Brand Identity & Logo Design", "Marketing & Social Media Design",
  "UI/UX & Product Design", "Print & Packaging Design", "Motion & Presentation Design",
];

/* ── Live API, with retries ──────────────────────────────────────────── */

const RETRY_ATTEMPTS = 3;
const RETRY_TIMEOUT_MS = 15000;
const RETRY_BACKOFF_MS = [800, 2000]; // before attempt 2, before attempt 3

async function fetchJsonWithRetry(url) {
  let lastErr;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(RETRY_TIMEOUT_MS) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
      if (attempt < RETRY_ATTEMPTS) {
        const wait = RETRY_BACKOFF_MS[attempt - 1] ?? 3000;
        console.warn(`seo-pages: ${url} failed (attempt ${attempt}/${RETRY_ATTEMPTS}): ${err.message} — retrying in ${wait}ms`);
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }
  throw new Error(`${url} failed after ${RETRY_ATTEMPTS} attempts: ${lastErr?.message ?? lastErr}`);
}

/** Runs `fn` over `items` with at most `limit` in flight at once. */
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

const API = (process.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
if (!API) {
  fail(
    "VITE_API_BASE_URL is not set. Case-study pages and the sitemap are built from live project " +
      "data with no fallback — set it before running this script."
  );
}

let projectList;
try {
  const data = await fetchJsonWithRetry(`${API}/api/v1/projects?pageSize=50`);
  projectList = data?.items;
  if (!Array.isArray(projectList) || projectList.length === 0) throw new Error("response had no items[]");
} catch (err) {
  fail(`could not load the project list: ${err.message}`);
}

// Full detail per project (caseStudy content lives only on this endpoint).
let projects;
try {
  projects = await mapLimit(projectList, 4, async ({ slug }) => {
    const detail = await fetchJsonWithRetry(`${API}/api/v1/projects/${encodeURIComponent(slug)}`);
    if (!detail?.slug || !detail?.caseStudy) throw new Error(`"${slug}": incomplete detail response`);
    return detail;
  });
} catch (err) {
  fail(`could not load case-study detail: ${err.message}`);
}

/* ── Image resolution ────────────────────────────────────────────────── *
 * This script runs as plain Node after `vite build` finishes, so it has no
 * access to Vite's import.meta.glob-based resolution the browser app uses
 * (src/lib/assetUrl.js) to turn a project's "src/assets/foo.png"-style path
 * into its real, content-hashed build URL. This mirrors that resolution at
 * the filesystem level instead: list what Vite already emitted into
 * dist/assets/ and match by name stem — Vite names every file
 * "<original-stem>-<hash>.<ext>", flattened regardless of source subfolder. */
let assetFiles = [];
try {
  assetFiles = readdirSync(join(DIST, "assets"));
} catch {
  /* handled by the "every image must resolve" check below */
}

const assetIndex = new Map(); // "foo.png" -> "/assets/foo-HASH.webp"
for (const file of assetFiles) {
  const m = file.match(/^(.*)-[\w-]{6,12}(\.[a-z0-9]+)$/i);
  if (!m) continue;
  const [, stem, ext] = m;
  const key = `${stem}${ext}`;
  if (!assetIndex.has(key)) assetIndex.set(key, `/assets/${file}`);
  // Many originals were converted png/jpg -> webp; project data still names
  // the original extension (same aliasing assetUrl.js does in the browser).
  if (ext.toLowerCase() === ".webp") {
    for (const altExt of [".png", ".jpg", ".jpeg"]) {
      const alias = `${stem}${altExt}`;
      if (!assetIndex.has(alias)) assetIndex.set(alias, `/assets/${file}`);
    }
  }
}

/** @returns {string|null} a loadable absolute URL, or null if unresolvable. */
function resolveImage(value) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value; // Cloudinary / any external URL
  const basename = value.split("/").pop();
  const hit = assetIndex.get(basename);
  return hit ? `${SITE}${hit}` : null;
}

function imageRefs(project) {
  const cs = project.caseStudy;
  const shots = cs.gallery ?? cs.screenshots ?? [];
  return [
    { label: "photo", value: project.photo },
    ...shots.map((s, i) => ({ label: `gallery[${i}]`, value: s.src })),
  ];
}

const imageErrors = [];
const heroImageUrl = new Map(); // slug -> resolved hero photo URL
for (const project of projects) {
  for (const ref of imageRefs(project)) {
    const resolved = resolveImage(ref.value);
    if (!resolved) imageErrors.push(`${project.slug}: ${ref.label} ("${ref.value}") did not resolve to a built asset`);
    else if (ref.label === "photo") heroImageUrl.set(project.slug, resolved);
  }
}
if (imageErrors.length) {
  fail(`${imageErrors.length} image(s) failed to resolve:\n  ${imageErrors.join("\n  ")}`);
}

/* ── Case-study body ──────────────────────────────────────────────────── *
 * Mirrors CaseStudyPage.jsx's tab order as plain linear sections (including
 * the "Full Technical Breakdown" accordion, closed by default in the UI —
 * the same content a JS visitor can reach, just not paginated behind clicks).
 * Decorative-only fields (icon names) are left out; every piece of real text
 * is included, unmodified, straight from the API.
 *
 * Images inside this block get NO src attribute (alt/width/height only). The
 * block is always 1x1px/clip:rect-hidden — no sighted user, JS or no JS, ever
 * sees it rendered — but the browser's HTML preload scanner does not respect
 * that: it discovers <img src> in the raw markup and can start downloading it
 * before React has had a chance to remove the block, wasting bandwidth on
 * images nobody will see. Leaving src off avoids the request entirely while
 * keeping the alt text, which is the actual content signal a text-based
 * crawler cares about. The hero photo is included as real pixels only in the
 * JSON-LD `image` field below, which is fetched out-of-band by whatever
 * processes structured data, not by the page's own preload scanner. */
const list = (items) => `<ul>${items.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`;
const titledList = (items) =>
  `<ul>${items.map((i) => `<li><strong>${esc(i.title)}</strong>: ${esc(i.description)}</li>`).join("")}</ul>`;
const steps = (items) => `<ol>${items.map((s) => `<li>${esc(s.label)}</li>`).join("")}</ol>`;
const imageList = (shots) =>
  `<ul>${shots
    .map((s) => `<li><img alt="${esc(s.alt ?? "")}"${s.width ? ` width="${s.width}"` : ""}${s.height ? ` height="${s.height}"` : ""}></li>`)
    .join("")}</ul>`;

function caseStudyBody(project) {
  const cs = project.caseStudy;
  const isDesign = Boolean(cs.designProcess);
  const meta = [["Service", project.service], ["Industry", project.industry], ["Category", cs.category]].filter(
    ([, v]) => v
  );

  let body = `<p>${esc(cs.summary)}</p>`;
  body += `<dl>${meta.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>`;
  if (cs.techIcons?.length) body += `<p>Built with: ${cs.techIcons.map((t) => esc(t.name)).join(", ")}.</p>`;

  body += `<h2>Overview</h2><h3>The Problem</h3>${list(cs.overview.problem)}<h3>The Solution</h3>${list(cs.overview.solution)}`;

  if (isDesign) {
    const dp = cs.designProcess;
    body +=
      `<h2>Design Process</h2>` +
      `<h3>Input Requirements</h3>${list(dp.input)}` +
      `<h3>Workflow</h3>${steps(dp.workflow)}` +
      `<h3>Design Engine Processing</h3><p>${esc(dp.engine)}</p>` +
      `<h3>Refinements</h3><p>${esc(dp.refinements)}</p>` +
      `<h3>Quality Assurance</h3><p>${esc(dp.qa)}</p>` +
      `<h2>Key Features</h2>${titledList(cs.keyFeatures)}` +
      `<h2>Use Cases</h2>${titledList(cs.useCases)}` +
      `<h2>Customization &amp; Scalability</h2>${titledList(cs.scalability)}`;
  } else {
    body +=
      `<h3>Solution Workflow</h3>${steps(cs.overview.workflow)}` +
      `<h3>Full Technical Breakdown</h3>${cs.overview.breakdown
        .map((s) => `<h4>${esc(s.title)}</h4><p>${esc(s.description)}</p>`)
        .join("")}` +
      `<h2>Results</h2>` +
      `<h3>Key Features</h3>${titledList(cs.results.keyFeatures)}` +
      `<h3>Before</h3><p>${esc(cs.results.before)}</p>` +
      `<h3>After</h3><p>${esc(cs.results.after)}</p>` +
      `<h3>What This Proves</h3><p>${esc(cs.results.proof)}</p>` +
      `<h2>Tech Stack</h2>${Object.entries(cs.techStack)
        .map(
          ([group, tools]) =>
            `<h3>${esc(group)}</h3><ul>${tools
              .map((t) => `<li><strong>${esc(t.name)}</strong> — ${esc(t.role)}</li>`)
              .join("")}</ul>`
        )
        .join("")}` +
      `<h2>Scalability &amp; Flexibility</h2>${titledList(cs.scalability)}`;
  }

  const shots = cs.gallery ?? cs.screenshots;
  if (shots?.length) {
    body += `<h2>Gallery</h2>${imageList(shots)}`;
  } else if (typeof cs.livePreview === "string") {
    body += `<h2>Live Preview</h2><p>Live site: <a href="${esc(cs.livePreview)}">${esc(cs.livePreview)}</a></p>`;
  }

  return body;
}

function caseStudyJsonLd(project) {
  const obj = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: `${project.title} Case Study`,
    description: project.description,
    image: heroImageUrl.get(project.slug),
    url: `${SITE}/portfolio/${project.slug}`,
    publisher: { "@id": `${SITE}/#organization` },
  };
  if (project.tags?.length) obj.keywords = project.tags.join(", ");
  return JSON.stringify(obj);
}

/* ── Page shell ───────────────────────────────────────────────────────── */

const projectLinks = projects
  .map((p) => `<li><a href="/portfolio/${esc(p.slug)}">${esc(p.title)}</a>: ${esc(p.description)}</li>`)
  .join("");
const nav = PAGES.filter((p) => p.path).map((p) => `<a href="/${p.path}">${esc(p.h1)}</a>`).join(" ");

// Must match the hero intro paragraph in src/components/Hero.jsx.
const HERO_INTRO =
  "At Nexoryn, we build websites that convert and automation systems that eliminate the repetitive work slowing businesses down. We don't rely on templates or one-size-fits-all solutions.";

const HIDDEN = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap";

function render({ path, title, h1, desc, bodyHtml, jsonLd }) {
  const url = `${SITE}/${path}`;
  let extra = `<h1>${esc(h1)}</h1>`;
  if (bodyHtml) {
    extra += bodyHtml;
  } else {
    extra += `<p>${esc(desc)}</p>`;
    if (path === "" || path === "services")
      extra += `<h2>Services</h2><ul>${SERVICES.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`;
    if (path === "" || path === "portfolio") extra += `<h2>Case studies</h2><ul>${projectLinks}</ul>`;
    if (path === "contact") extra += `<p>Email: team@nexoryn.tech. Phone: +92 302 3858945.</p>`;
  }
  extra += `<nav>${nav}</nav>`;

  // data-seo-fallback: the real React app strips this on mount (see App.jsx)
  // — it exists only for crawlers that don't run JavaScript. It is a sibling
  // of #root, never inside it, so React's render into #root never touches or
  // reconciles against this subtree.
  const block = `<div data-seo-fallback="true" aria-hidden="true" style="${HIDDEN}">${extra}</div>\n    `;

  // Home only: the hero's intro paragraph (the page's largest text, so its
  // "largest contentful paint"), rendered in the HTML beneath the static intro
  // plate. It is painted with the first frame instead of after the app has
  // downloaded and run; the Preloader removes it as the real hero mounts.
  const bootHero =
    path === ""
      ? `<div id="boot-hero" aria-hidden="true" style="position:absolute;top:0;left:0;right:0;padding:128px 16px 0;pointer-events:none"><p style="max-width:28rem;margin:0 auto;font:300 18px/1.625 Manrope,ui-sans-serif,system-ui,sans-serif;color:#cfcfcf;text-align:center">${esc(HERO_INTRO)}</p></div>\n    `
      : "";

  let out = html
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace('<div id="root"></div>', `${bootHero}<div id="root"></div>\n    ${block}`);

  if (jsonLd) out = out.replace("</head>", `  ${jsonLd}\n  </head>`);
  return out;
}

function write(path, content) {
  const dir = path ? join(DIST, path) : DIST;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), content);
}

function sitemap() {
  const urls = [
    ...PAGES.map((p) => `  <url><loc>${SITE}/${p.path}</loc></url>`),
    ...projects.map((p) => {
      const lastmod = p.updatedAt ? `<lastmod>${new Date(p.updatedAt).toISOString()}</lastmod>` : "";
      return `  <url><loc>${SITE}/portfolio/${esc(p.slug)}</loc>${lastmod}</url>`;
    }),
  ];
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`
  );
}

/* ── Build-time assertions ───────────────────────────────────────────────
 * Checked against what was actually written, not against the source data —
 * this catches bugs in the template code above too, not just upstream data
 * problems. Every failure is collected before exiting so one run reports
 * everything wrong at once. */
const pageErrors = [];

function assertCaseStudyPage(project, writtenHtml) {
  const isDesign = Boolean(project.caseStudy.designProcess);
  const mustContain = [
    `<h1>${esc(project.title)} Case Study</h1>`,
    "<h2>Overview</h2>",
    "<h3>The Problem</h3>",
    "<h3>The Solution</h3>",
    ...(isDesign
      ? ["<h2>Design Process</h2>", "<h2>Key Features</h2>", "<h2>Use Cases</h2>"]
      : ["<h3>Solution Workflow</h3>", "<h3>Full Technical Breakdown</h3>", "<h2>Results</h2>", "<h2>Tech Stack</h2>"]),
  ];
  for (const needle of mustContain) {
    if (!writtenHtml.includes(needle)) pageErrors.push(`${project.slug}: missing expected heading ${needle}`);
  }

  const ldMatch = writtenHtml.match(/<script type="application\/ld\+json" id="case-study-jsonld">([\s\S]*?)<\/script>/);
  if (!ldMatch) {
    pageErrors.push(`${project.slug}: case-study JSON-LD script not found`);
  } else {
    try {
      JSON.parse(ldMatch[1]);
    } catch (err) {
      pageErrors.push(`${project.slug}: case-study JSON-LD does not parse: ${err.message}`);
    }
  }
}

for (const page of PAGES) write(page.path, render(page));

for (const project of projects) {
  const bodyHtml = caseStudyBody(project);
  const jsonLd = `<script type="application/ld+json" id="case-study-jsonld">${caseStudyJsonLd(project)}</script>`;
  const out = render({
    path: `portfolio/${project.slug}`,
    title: `${project.title} Case Study - Nexoryn`,
    h1: `${project.title} Case Study`,
    desc: project.description,
    bodyHtml,
    jsonLd,
  });
  write(`portfolio/${project.slug}`, out);
  assertCaseStudyPage(project, out);
}

const sitemapXml = sitemap();
const sitemapUrlCount = (sitemapXml.match(/<loc>/g) ?? []).length;
const expectedUrlCount = PAGES.length + projects.length;
if (sitemapUrlCount !== expectedUrlCount) {
  pageErrors.push(`sitemap has ${sitemapUrlCount} URLs, expected ${expectedUrlCount}`);
}
if (sitemapXml.includes("/cfokp")) {
  pageErrors.push("sitemap contains a /cfokp URL — the admin panel must never be published there");
}

if (pageErrors.length) {
  fail(`${pageErrors.length} check(s) failed:\n  ${pageErrors.join("\n  ")}`);
}

writeFileSync(join(DIST, "sitemap.xml"), sitemapXml);
console.log(
  `seo-pages: wrote ${PAGES.length} pages + ${projects.length} case studies + sitemap.xml (${sitemapUrlCount} urls) — all checks passed`
);
