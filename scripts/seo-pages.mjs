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

const HIDDEN = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap";

function render(page) {
  const url = `${SITE}/${page.path}`;
  let extra = `<h1>${esc(page.h1)}</h1><p>${esc(page.desc)}</p>`;
  if (page.path === "" || page.path === "services")
    extra += `<h2>Services</h2><ul>${SERVICES.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`;
  if (page.path === "" || page.path === "portfolio")
    extra += `<h2>Case studies</h2><ul>${projectLinks}</ul>`;
  if (page.path === "contact") extra += `<p>Email: team@nexoryn.tech. Phone: +92 302 3858945.</p>`;
  extra += `<nav>${nav}</nav>`;

  const block = `<div aria-hidden="true" style="${HIDDEN}">${extra}</div>\n    `;
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${esc(page.desc)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(page.title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(page.desc)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(page.title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(page.desc)}$2`)
    .replace('<div id="root"></div>', `<div id="root"></div>\n    ${block}`);
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
