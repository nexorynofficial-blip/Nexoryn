import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../middleware/auth";
import { projectInputSchema } from "../../services/validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/errors";

const router = Router();
router.use(authMiddleware);

// GET /api/v1/admin/projects
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const projects = await prisma.project.findMany({
      include: { photo: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ items: projects });
  }),
);

// GET /api/v1/admin/projects/:id — by internal id, not slug, so slug can be
// edited without breaking the edit-form lookup.
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { photo: true },
    });
    if (!project) throw ApiError.notFound("Project not found");
    res.json(project);
  }),
);

// POST /api/v1/admin/projects
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = projectInputSchema.parse(req.body);

    const existing = await prisma.project.findUnique({ where: { slug: input.slug } });
    if (existing) throw ApiError.conflict("A project with this slug already exists", { slug: "Already in use" });

    const project = await prisma.project.create({
      data: { ...input, createdBy: req.admin!.id },
      include: { photo: true },
    });

    res.status(201).json(project);
  }),
);

// PUT /api/v1/admin/projects/:id
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const input = projectInputSchema.parse(req.body);

    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!existing) throw ApiError.notFound("Project not found");

    if (input.slug !== existing.slug) {
      const slugTaken = await prisma.project.findUnique({ where: { slug: input.slug } });
      if (slugTaken) throw ApiError.conflict("A project with this slug already exists", { slug: "Already in use" });
    }

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: input,
      include: { photo: true },
    });

    res.json(project);
  }),
);

// PATCH /api/v1/admin/projects/:id/reorder — homepage-featured ordering only.
const reorderSchema = z.object({
  isFeatured: z.boolean().optional(),
  featuredOrder: z.number().int().nullable().optional(),
});

router.patch(
  "/:id/reorder",
  asyncHandler(async (req, res) => {
    const input = reorderSchema.parse(req.body);
    const project = await prisma.project.update({ where: { id: req.params.id }, data: input });
    res.json(project);
  }),
);

// DELETE /api/v1/admin/projects/:id
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!existing) throw ApiError.notFound("Project not found");
    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }),
);

export default router;
