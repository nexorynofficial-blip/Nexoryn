import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../middleware/auth";
import { isValidIconName } from "../../utils/icons";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/errors";

const router = Router();
router.use(authMiddleware);

const iconField = z.string().refine(isValidIconName, { message: "Unknown icon name" });

const categorySchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  serviceName: z.string().min(1),
  overviewIcon: iconField,
  gooeyId: z.string().min(1),
  overview: z.object({ heading: z.string().min(1), body: z.string().min(1) }),
  mobileSummary: z.object({
    description: z.string().min(1),
    howWeWork: z.array(z.string().min(1)),
    whatYouGet: z.array(z.string().min(1)),
    platforms: z.array(z.string().min(1)),
  }),
});

const subServiceSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  icon: iconField,
  name: z.string().min(1),
  description: z.string().min(1),
  howWeWork: z.array(z.string().min(1)),
  whatYouGet: z.array(z.string().min(1)),
  platforms: z.array(z.string().min(1)),
  order: z.number().int(),
});

// GET /api/v1/admin/services
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const items = await prisma.serviceCategory.findMany({
      include: { subServices: { orderBy: { order: "asc" } } },
    });
    res.json({ items });
  }),
);

// POST /api/v1/admin/services
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = categorySchema.parse(req.body);
    const category = await prisma.serviceCategory.create({ data: input });
    res.status(201).json(category);
  }),
);

// PUT /api/v1/admin/services/:id
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const input = categorySchema.parse(req.body);
    const category = await prisma.serviceCategory
      .update({ where: { id: req.params.id }, data: input })
      .catch(() => null);
    if (!category) throw ApiError.notFound("Service category not found");
    res.json(category);
  }),
);

// DELETE /api/v1/admin/services/:id
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.serviceCategory.delete({ where: { id: req.params.id } }).catch(() => {
      throw ApiError.notFound("Service category not found");
    });
    res.status(204).send();
  }),
);

// POST /api/v1/admin/services/:categoryId/sub-services
router.post(
  "/:categoryId/sub-services",
  asyncHandler(async (req, res) => {
    const input = subServiceSchema.parse(req.body);
    const category = await prisma.serviceCategory.findUnique({ where: { id: req.params.categoryId } });
    if (!category) throw ApiError.notFound("Service category not found");

    const subService = await prisma.subService.create({
      data: { ...input, categoryId: req.params.categoryId },
    });
    res.status(201).json(subService);
  }),
);

// PUT /api/v1/admin/sub-services/:id — mounted separately, see app.ts
export const subServiceRouter = Router();
subServiceRouter.use(authMiddleware);

subServiceRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const input = subServiceSchema.partial().parse(req.body);
    const subService = await prisma.subService
      .update({ where: { id: req.params.id }, data: input })
      .catch(() => null);
    if (!subService) throw ApiError.notFound("Sub-service not found");
    res.json(subService);
  }),
);

subServiceRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.subService.delete({ where: { id: req.params.id } }).catch(() => {
      throw ApiError.notFound("Sub-service not found");
    });
    res.status(204).send();
  }),
);

export default router;
