import { Router } from "express";
import { prisma } from "../../config/database";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// GET /api/v1/services — ServicesPage.jsx reads all 3 categories at once,
// each with its ordered sub-services.
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const categories = await prisma.serviceCategory.findMany({
      include: { subServices: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "asc" },
    });

    res.json({
      items: categories.map((c) => ({
        id: c.slug,
        serviceName: c.serviceName,
        overviewIcon: c.overviewIcon,
        gooeyId: c.gooeyId,
        overview: c.overview,
        mobileSummary: c.mobileSummary,
        subServices: c.subServices.map((s) => ({
          id: s.slug,
          icon: s.icon,
          name: s.name,
          description: s.description,
          howWeWork: s.howWeWork,
          whatYouGet: s.whatYouGet,
          platforms: s.platforms,
        })),
      })),
    });
  }),
);

export default router;
