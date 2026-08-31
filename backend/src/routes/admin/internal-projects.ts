import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/errors";

const router = Router();
router.use(authMiddleware);

const internalProjectSchema = z.object({
  name: z.string().min(1),
  note: z.string().max(2000).optional(),
  serviceType: z.enum(["Automation", "Web Development", "Brand & Graphic Design"]),
  googleDriveLink: z.string().url(),
  status: z.enum(["active", "archived", "completed"]).default("active"),
});

// GET /api/v1/admin/internal-projects — visible to every logged-in admin (visibility: "team")
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const serviceType = typeof req.query.serviceType === "string" ? req.query.serviceType : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;

    const items = await prisma.internalProject.findMany({
      where: { ...(serviceType ? { serviceType } : {}), ...(status ? { status } : {}) },
      include: { uploader: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ items });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = internalProjectSchema.parse(req.body);
    const project = await prisma.internalProject.create({
      data: { ...input, uploadedBy: req.admin!.id },
    });
    res.status(201).json(project);
  }),
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const input = internalProjectSchema.partial().parse(req.body);
    const project = await prisma.internalProject
      .update({ where: { id: req.params.id }, data: input })
      .catch(() => null);
    if (!project) throw ApiError.notFound("Internal project not found");
    res.json(project);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.internalProject.delete({ where: { id: req.params.id } }).catch(() => {
      throw ApiError.notFound("Internal project not found");
    });
    res.status(204).send();
  }),
);

export default router;
