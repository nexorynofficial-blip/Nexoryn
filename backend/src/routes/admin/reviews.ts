import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/errors";

const router = Router();
router.use(authMiddleware);

const reviewSchema = z.object({
  displayId: z.string().min(1),
  name: z.string().min(1),
  location: z.string().min(1),
  service: z.enum(["Automation", "Web Development", "Graphic Design"]),
  text: z.string().min(1),
  order: z.number().int().default(0),
  isFeatured: z.boolean().default(false),
});

// GET /api/v1/admin/reviews?service=...
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const service = typeof req.query.service === "string" ? req.query.service : undefined;
    const items = await prisma.review.findMany({
      where: service ? { service } : undefined,
      orderBy: { order: "asc" },
    });
    res.json({ items });
  }),
);

// POST /api/v1/admin/reviews
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = reviewSchema.parse(req.body);
    const review = await prisma.review.create({ data: input });
    res.status(201).json(review);
  }),
);

// PUT /api/v1/admin/reviews/:id
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const input = reviewSchema.partial().parse(req.body);
    const review = await prisma.review
      .update({ where: { id: req.params.id }, data: input })
      .catch(() => null);
    if (!review) throw ApiError.notFound("Review not found");
    res.json(review);
  }),
);

// DELETE /api/v1/admin/reviews/:id
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.review.delete({ where: { id: req.params.id } }).catch(() => {
      throw ApiError.notFound("Review not found");
    });
    res.status(204).send();
  }),
);

export default router;
