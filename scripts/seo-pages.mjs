// Runs after `vite build`. The site is a client-rendered app, so every URL used
// to be served the same empty <div id="root"> shell: fine for Google (which
// runs the JavaScript), but crawlers that don't (Bing's, social previews) saw
// no title, no description and no text for any page but the home page.
//
// This writes dist/<route>/index.html for each public page: the same shell, plus
//   - that page's own <title>, description, canonical and share tags
//   - a visually hidden block of real text and links for crawlers
// The block sits outside #root, so the app mounts exactly as before and nothing
// moves on screen. Case studies come from the live API at build time, falling
// back to the bundled project list if it can't be reached.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const SITE = "https://www.nexoryn.tech";
const DIST = "dist";
const html = readFileSync(join(DIST, "index.html"), "utf8");

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

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

async function loadProjects() {
  const api = (process.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
  if (api) {
    try {
      const res = await fetch(`${api}/api/v1/projects?pageSize=50`, { signal: AbortSignal.timeout(8000) });
      const data = await res.json();
      if (data?.items?.length) return data.items.map(({ slug, title, description }) => ({ slug, title, description }));
    } catch {
      /* fall through to the bundled list */
    }
  }
  const src = readFileSync("src/data/projects.js", "utf8");
  const out = [];
  const re = /slug:\s*"([^"]+)",\s*title:\s*"([^"]+)"[\s\S]*?description:\s*"([^"]+)"/g;
  for (let m; (m = re.exec(src)); ) out.push({ slug: m[1], title: m[2], description: m[3] });
  return out;
}

const projects = await loadProjects();
const projectLinks = projects.map((p) => `<li><a href="/portfolio/${esc(p.slug)}">${esc(p.title)}</a>: ${esc(p.description)}</li>`).join("");
const nav = PAGES.filter((p) => p.path).map((p) => `<a href="/${p.path}">${esc(p.h1)}</a>`).join(" ");

// Must match the hero intro paragraph in src/components/Hero.jsx.
const HERO_INTRO =
  "At Nexoryn, we build websites that convert and automation systems that eliminate the repetitive work slowing businesses down. We don't rely on templates or one-size-fits-all solutions.";

const HIDDEN ="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap";

function render(page) {
  const url = `${SITE}/${page.path}`;
  let extra = `<h1>${esc(page.h1)}</h1><p>${esc(page.desc)}</p>`;
  if (page.path === "" || page.path === "services")
    extra += `<h2>Services</h2><ul>${SERVICES.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`;
  if (page.path === "" || page.path === "portfolio")
    extra += `<h2>Case studies</h2><ul>${projectLinks}</ul>`;
  if (page.path === "contact") extra += `<p>Email: team@nexoryn.tech. Phone: +92 302 3858945.</p>`;
  extra += `<nav>${nav}</nav>`;

  // data-seo-fallback: the real React app strips this on mount (see App.jsx)
  // — it exists only for crawlers that don't run JavaScript. Left in place
  // for a JS-capable visitor, its links would be aria-hidden (so a screen
  // reader skips them) while still real <a> tags (so Tab still lands on
  // them) — hidden-but-focusable, which is its own accessibility bug.
  const block = `<div data-seo-fallback="true" aria-hidden="true" style="${HIDDEN}">${extra}</div>\n    `;

  // Home only: the hero's intro paragraph (the page's largest text, so its
  // "largest contentful paint"), rendered in the HTML beneath the static intro
  // plate. It is painted with the first frame instead of after the app has
  // downloaded and run; the Preloader removes it as the real hero mounts.
  // Inline styles, because the stylesheet may not have arrived when it first
  // paints. Set at 18px (the hero's desktop size) so it is never smaller than
  // the real paragraph that replaces it.
  const bootHero =
    page.path === ""
      ? `<div id="boot-hero" aria-hidden="true" style="position:absolute;top:0;left:0;right:0;padding:128px 16px 0;pointer-events:none"><p style="max-width:28rem;margin:0 auto;font:300 18px/1.625 Manrope,ui-sans-serif,system-ui,sans-serif;color:#cfcfcf;text-align:center">${esc(HERO_INTRO)}</p></div>\n    `
      : "";

  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${esc(page.desc)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(page.title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(page.desc)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(page.title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(page.desc)}$2`)
    .replace('<div id="root"></div>', `${bootHero}<div id="root"></div>\n    ${block}`);
}

function write(path, content) {
  const dir = path ? join(DIST, path) : DIST;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), content);
}

for (const page of PAGES) write(page.path, render(page));
for (const p of projects) {
  write(`portfolio/${p.slug}`, render({
    path: `portfolio/${p.slug}`,
    title: `${p.title} Case Study - Nexoryn`,
    h1: `${p.title} Case Study`,
    desc: p.description,
  }));
}
console.log(`seo-pages: wrote ${PAGES.length} pages + ${projects.length} case studies`);
