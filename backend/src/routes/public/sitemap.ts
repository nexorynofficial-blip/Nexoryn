import { Router } from "express";
import { prisma } from "../../config/database";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

const SITE_URL = "https://www.nexoryn.tech";
const PAGES = [
  "",
  "about",
  "services",
  "portfolio",
  "reviews",
  "contact",
  "privacy-policy",
  "terms-of-service",
  "cookie-policy",
];

// GET /api/v1/sitemap.xml
// Served to crawlers at https://www.nexoryn.tech/sitemap.xml via a rewrite in
// the frontend's vercel.json, so projects added later (e.g. by the agent)
// appear without a redeploy.
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const projects = await prisma.project.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { createdAt: "desc" },
    });

    const urls = [
      ...PAGES.map((p) => `  <url><loc>${SITE_URL}/${p}</loc></url>`),
      ...projects.map(
        (p) =>
          `  <url><loc>${SITE_URL}/portfolio/${encodeURIComponent(p.slug)}</loc>` +
          `<lastmod>${p.updatedAt.toISOString()}</lastmod></url>`
      ),
    ];

    res
      .type("application/xml")
      .set("Cache-Control", "public, max-age=0, s-maxage=3600")
      .send(
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`
      );
  })
);

export default router;
