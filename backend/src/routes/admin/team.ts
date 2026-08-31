import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/errors";

const router = Router();
router.use(authMiddleware);

const teamMemberSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  photoId: z.string().min(1).nullable().optional(),
  order: z.number().int().default(0),
});

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const items = await prisma.teamMember.findMany({
      include: { photo: true },
      orderBy: { order: "asc" },
    });
    res.json({ items });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = teamMemberSchema.parse(req.body);
    const member = await prisma.teamMember.create({ data: input });
    res.status(201).json(member);
  }),
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const input = teamMemberSchema.partial().parse(req.body);
    const member = await prisma.teamMember
      .update({ where: { id: req.params.id }, data: input })
      .catch(() => null);
    if (!member) throw ApiError.notFound("Team member not found");
    res.json(member);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.teamMember.delete({ where: { id: req.params.id } }).catch(() => {
      throw ApiError.notFound("Team member not found");
    });
    res.status(204).send();
  }),
);

export default router;
