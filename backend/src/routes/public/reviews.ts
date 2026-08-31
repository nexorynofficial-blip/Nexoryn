import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/database";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

const querySchema = z.object({
  service: z.enum(["Automation", "Web Development", "Graphic Design"]).optional(),
});

// GET /api/v1/reviews?service=Automation
// ReviewsPage.jsx defaults its own UI selection to "Automation" client-side
// — this endpoint supports both a filtered and an unfiltered call.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { service } = querySchema.parse(req.query);

    const reviews = await prisma.review.findMany({
      where: service ? { service } : undefined,
      orderBy: { order: "asc" },
    });

    res.json({
      items: reviews.map((r) => ({
        id: r.displayId,
        name: r.name,
        location: r.location,
        service: r.service,
        text: r.text,
      })),
    });
  }),
);

export default router;
